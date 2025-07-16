import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Circle,
  Image,
  Palette,
  Pencil,
  Square,
  Text as TextIcon,
  Bold,
  Italic,
  Underline,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DesignCanvasProps {
  tshirtColor: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

const DesignCanvas = ({ tshirtColor, initialImage, onDesignChange }: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(20);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [isProcessingInitialImage, setIsProcessingInitialImage] = useState<boolean>(false);

  // Refs to track state
  const canvasInitializedRef = useRef(false);
  const updateInProgressRef = useRef(false);
  const lastProcessedImageRef = useRef<string | null>(null);
  const safetyAreaManagedRef = useRef(false); // Track if we've already managed safety areas

  // Create a stable reference to the onDesignChange callback
  const onDesignChangeRef = useRef(onDesignChange);
  useEffect(() => {
    onDesignChangeRef.current = onDesignChange;
  }, [onDesignChange]);

  // Reference to the safety area object
  const safetyAreaRef = useRef<fabric.Object | null>(null);

  // Improved function to ensure a single safety area exists
  const ensureSingleSafetyArea = (targetCanvas: fabric.Canvas) => {
    if (!targetCanvas || !targetCanvas.getContext) {
      console.error("Cannot manage safety area: Invalid canvas");
      return false;
    }

    // If we're already in the middle of updating, don't try to manage safety areas
    if (updateInProgressRef.current) {
      return false;
    }
    
    // Set flag to prevent recursive updates
    updateInProgressRef.current = true;
    safetyAreaManagedRef.current = true;
    
    try {
      // First, remove ALL existing safety areas
      const objects = targetCanvas.getObjects();
      const safetyAreas = objects.filter((obj: fabric.Object) => obj.id === "safetyArea");

      if (safetyAreas.length > 1) {
        console.log(`Removing ${safetyAreas.length - 1} duplicate safety areas`);
        // Keep only the first safety area and remove others
        for (let i = 1; i < safetyAreas.length; i++) {
          targetCanvas.remove(safetyAreas[i]);
        }
        // Use the first safety area as our reference
        safetyAreaRef.current = safetyAreas[0];
        targetCanvas.sendToBack(safetyAreas[0]);
        targetCanvas.renderAll();
        return true;
      } else if (safetyAreas.length === 1) {
        // We already have exactly one safety area, just make sure it's at the back
        safetyAreaRef.current = safetyAreas[0];
        targetCanvas.sendToBack(safetyAreas[0]);
        return true;
      }

      // If we get here, we need to create a new safety area
      const canvasSize = targetCanvas.width || 300;
      const safetyAreaRect = new fabric.Rect({
        width: canvasSize - 20,
        height: canvasSize - 20,
        left: 10,
        top: 10,
        stroke: "#5cb85c",
        strokeDashArray: [5, 5],
        fill: "transparent",
        selectable: false,
        evented: false,
        id: "safetyArea",
      });

      // Add it to the canvas and send to back
      targetCanvas.add(safetyAreaRect);
      targetCanvas.sendToBack(safetyAreaRect);
      targetCanvas.renderAll();

      // Store a reference to the safety area
      safetyAreaRef.current = safetyAreaRect;

      return true;
    } catch (error) {
      console.error("Error managing safety area:", error);
      return false;
    } finally {
      // Reset flags when we're done
      updateInProgressRef.current = false;
    }
  };

  // Add a periodic safety check with debouncing
  useEffect(() => {
    if (!canvas) return;

    let timeoutId: number | null = null;

    // Debounced function to check safety areas
    const debouncedSafetyCheck = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        if (!updateInProgressRef.current) {
          const objects = canvas.getObjects();
          const safetyAreas = objects.filter((obj: fabric.Object) => obj.id === "safetyArea");

          if (safetyAreas.length !== 1) {
            console.log(`Found ${safetyAreas.length} safety areas, fixing...`);
            ensureSingleSafetyArea(canvas);
          }
        }
      }, 500); // 500ms debounce
    };

    // Set up event listeners with proper debouncing
    const safetyAreaCheck = () => {
      if (!updateInProgressRef.current && !safetyAreaManagedRef.current) {
        debouncedSafetyCheck();
      }
      // Reset managed flag
      safetyAreaManagedRef.current = false;
    };

    canvas.on('object:added', safetyAreaCheck);
    canvas.on('object:modified', safetyAreaCheck);
    canvas.on('object:removed', safetyAreaCheck);
    canvas.on('selection:created', safetyAreaCheck);
    canvas.on('selection:updated', safetyAreaCheck);

    // Initial safety check
    ensureSingleSafetyArea(canvas);

    // Cleanup
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      canvas.off('object:added', safetyAreaCheck);
      canvas.off('object:modified', safetyAreaCheck);
      canvas.off('object:removed', safetyAreaCheck);
      canvas.off('selection:created', safetyAreaCheck);
      canvas.off('selection:updated', safetyAreaCheck);
    };
  }, [canvas]);

  // Initialize canvas once on mount - with no dependencies to ensure it only runs once
  useEffect(() => {
    if (canvasInitializedRef.current || !canvasRef.current) return;

    // Capture the current canvas element reference at the start of the effect
    const currentCanvasElement = canvasRef.current;

    console.log("Initializing canvas");
    canvasInitializedRef.current = true;

    try {
      // Calculate dimensions
      const containerWidth = canvasContainerRef.current?.clientWidth || 300;
      const canvasSize = Math.min(containerWidth, 300);

      // Create canvas with error handling
      let fabricCanvas: fabric.Canvas | null = null;
      try {
        // Make sure the canvas element is ready before initializing fabric
        if (!canvasRef.current) {
          throw new Error("Canvas element is not available");
        }

        // Ensure the canvas has proper dimensions
        canvasRef.current.width = canvasSize;
        canvasRef.current.height = canvasSize;

        // Initialize the fabric canvas with explicit context
        fabricCanvas = new fabric.Canvas(canvasRef.current, {
          width: canvasSize,
          height: canvasSize,
          backgroundColor: "#f0f0f0",
        });

        if (!fabricCanvas || !fabricCanvas.getContext) {
          throw new Error("Failed to initialize canvas properly");
        }
      } catch (canvasError) {
        console.error("Error creating fabric canvas:", canvasError);
        canvasInitializedRef.current = false;
        return;
      }

      // Add the initial safety area
      console.log("Adding initial safety area to canvas");
      ensureSingleSafetyArea(fabricCanvas);

      // Add placeholder text (will be removed if initialImage is provided in a separate effect)
      try {
        const placeholderText = new fabric.Text("upload your design", {
          left: canvasSize / 2,
          top: canvasSize / 2,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Arial',
          fontSize: 20,
          fill: '#999999',
          selectable: false,
          evented: false,
          id: "placeholderText",
        });
        fabricCanvas.add(placeholderText);
      } catch (textError) {
        console.error("Error adding placeholder text:", textError);
        // Continue even if placeholder text fails
      }

      try {
        fabricCanvas.renderAll();
      } catch (renderError) {
        console.error("Error rendering canvas:", renderError);
        // Continue even if initial render fails
      }

      // Improved event handler for notifying parent of changes
      const notifyDesignChange = () => {
        if (updateInProgressRef.current) return;
        
        updateInProgressRef.current = true;
        
        setTimeout(() => {
          try {
            if (onDesignChangeRef.current && fabricCanvas && fabricCanvas.getContext) {
              const dataURL = fabricCanvas.toDataURL({
                format: "png",
                quality: 1,
                multiplier: 2,
              });
              onDesignChangeRef.current(dataURL);
            }
          } catch (dataURLError) {
            console.error("Error generating data URL:", dataURLError);
          } finally {
            updateInProgressRef.current = false;
          }
        }, 100);
      };

      // Improved object modification handler
      const handleObjectModified = () => {
        if (!updateInProgressRef.current) {
          console.log("Object modified event triggered");
          
          // Ensure a single safety area exists, then notify
          if (ensureSingleSafetyArea(fabricCanvas)) {
            notifyDesignChange();
          }
        }
      };

      // Improved object addition handler with safety area protection
      const handleObjectAdded = (e: { target?: fabric.Object }) => {
        if (updateInProgressRef.current) return;
        
        // Don't do anything special for safety areas to avoid loops
        if (e.target && e.target.id === "safetyArea") {
          safetyAreaRef.current = e.target;
          return;
        }
        
        console.log("Object added event triggered");
        
        // Ensure a single safety area exists, then notify
        if (ensureSingleSafetyArea(fabricCanvas)) {
          notifyDesignChange();
        }
      };

      // Improved object removal handler
      const handleObjectRemoved = (e: { target?: fabric.Object }) => {
        if (updateInProgressRef.current) return;
        
        // If the safety area was removed, make a new one
        if (e.target && e.target.id === "safetyArea") {
          safetyAreaRef.current = null;
          console.log("Safety area was removed, creating a new one");
        }
        
        console.log("Object removed event triggered");
        
        // Ensure a single safety area exists, then notify
        if (ensureSingleSafetyArea(fabricCanvas)) {
          notifyDesignChange();
        }
      };

      // Set up improved event handlers
      fabricCanvas.on('object:modified', handleObjectModified);
      fabricCanvas.on('object:added', handleObjectAdded);
      fabricCanvas.on('object:removed', handleObjectRemoved);

      // Set the canvas state after all event handlers are set up
      setCanvas(fabricCanvas);

      // Cleanup function to properly dispose of the canvas
      return () => {

        try {
          if (fabricCanvas) {
            // Remove all event listeners first
            fabricCanvas.off('object:modified', handleObjectModified);
            fabricCanvas.off('object:added', handleObjectAdded);
            fabricCanvas.off('object:removed', handleObjectRemoved);

            // Clear all objects first to prevent memory leaks
            fabricCanvas.clear();

            // Dispose of the canvas
            fabricCanvas.dispose();

            // Clear the canvas element
            if (currentCanvasElement) {
              const ctx = currentCanvasElement.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, currentCanvasElement.width, currentCanvasElement.height);
              }
            }
          }
        } catch (disposeError) {
          console.error("Error disposing canvas:", disposeError);
        } finally {
          // Reset state
          canvasInitializedRef.current = false;
          setCanvas(null);
        }
      };
    } catch (error) {
      console.error("Error initializing canvas:", error);
      canvasInitializedRef.current = false;
    }
  }, []); // Empty dependency array to ensure it only runs once on mount

  // Track if we're currently generating a data URL to avoid loops
  const isGeneratingDataURLRef = useRef(false);
  // Track if initial image has been loaded
  const initialImageLoadedRef = useRef(false);

  // Load the initial image if provided - only run when initialImage changes from external source
  useEffect(() => {
    // Skip if we're generating a data URL (to avoid loops) or if no canvas/image
    if (isGeneratingDataURLRef.current || !canvas || !initialImage || updateInProgressRef.current) return;

    // Skip if we've already processed this exact image
    if (lastProcessedImageRef.current === initialImage) {
      console.log("Skipping duplicate image processing");
      return;
    }

    // Skip if this is not the first load and the image is from our own canvas
    if (initialImageLoadedRef.current && initialImage.startsWith('data:image/png;base64,')) {
      console.log("Skipping canvas-generated image update");
      return;
    }

    console.log("Processing initial image");
    lastProcessedImageRef.current = initialImage;
    updateInProgressRef.current = true;
    setIsLoadingImage(true);
    setIsProcessingInitialImage(true);

    try {
      // Remove placeholder text if it exists
      const objects = canvas.getObjects();
      const placeholderText = objects.find((obj: fabric.Object) =>
        obj.type === 'text' &&
        (obj.id === "placeholderText" || obj.text === 'upload your design')
      );
      if (placeholderText) {
        canvas.remove(placeholderText);
      }

      // Only clear existing images if this is an AI-generated design (not user uploaded)
      // Keep user-uploaded images to preserve design layers
      const existingImages = objects.filter((obj: any) =>
        obj.type === 'image' && obj.id === 'aiGeneratedImage'
      );
      existingImages.forEach((img: any) => canvas.remove(img));

      // Load the image with proper error handling
      fabric.Image.fromURL(
        initialImage,
        (img: fabric.Object) => {
          try {
            // Scale image to fit within the canvas
            const canvasWidth = canvas.width || 300;
            const canvasHeight = canvas.height || 300;

            const scaleFactor = Math.min(
              (canvasWidth - 40) / img.width!,
              (canvasHeight - 40) / img.height!
            );

            img.scale(scaleFactor);
            img.set({
              left: canvasWidth / 2,
              top: canvasHeight / 2,
              originX: 'center',
              originY: 'center',
              id: "aiGeneratedImage"
            });

            canvas.add(img);
            canvas.setActiveObject(img);

            // Ensure a single safety area exists - with flag to avoid duplicates
            safetyAreaManagedRef.current = true;
            ensureSingleSafetyArea(canvas);

            canvas.renderAll();
            initialImageLoadedRef.current = true;

            // Update the design data URL
            setTimeout(() => {
              if (onDesignChangeRef.current && canvas && canvas.getContext) {
                isGeneratingDataURLRef.current = true;

                const dataURL = canvas.toDataURL({
                  format: "png",
                  quality: 1,
                  multiplier: 2,
                });
                onDesignChangeRef.current(dataURL);
                setTimeout(() => {
                  isGeneratingDataURLRef.current = false;
                }, 100);
              }
              setIsLoadingImage(false);
              setIsProcessingInitialImage(false);
              updateInProgressRef.current = false;
            }, 200);
          } catch (imgError) {
            console.error("Error processing image:", imgError);
            setIsLoadingImage(false);
            setIsProcessingInitialImage(false);
            updateInProgressRef.current = false;
          }
        },
      );
    } catch (error) {
      console.error("Error in image processing:", error);
      setIsLoadingImage(false);
      setIsProcessingInitialImage(false);
      updateInProgressRef.current = false;
    }
  }, [initialImage, canvas]);

  // Function to update color of selected objects when color changes
  useEffect(() => {
    if (!canvas || updateInProgressRef.current) return;

    // Store the current color to avoid closure issues
    const color = currentColor;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      try {
        updateInProgressRef.current = true;

        if (activeObject.type === 'i-text' || activeObject.type === 'text') {
          activeObject.set({ fill: color });
        } else if (activeObject.type !== 'image') {
          // Don't change color of images
          activeObject.set('fill', color);
        }

        // Set the safety area managed flag to prevent duplication
        safetyAreaManagedRef.current = true;
        
        canvas.renderAll();

        // Generate data URL with safety check
        setTimeout(() => {
          try {
            if (onDesignChangeRef.current && canvas) {
              // Set flag to prevent loops
              isGeneratingDataURLRef.current = true;

              // Ensure safety area is in place
              ensureSingleSafetyArea(canvas);

              const dataURL = canvas.toDataURL({
                format: "png",
                quality: 1,
                multiplier: 2,
              });

              onDesignChangeRef.current(dataURL);

              // Reset flag after a short delay
              setTimeout(() => {
                isGeneratingDataURLRef.current = false;
              }, 100);
            }
          } catch (dataURLError) {
            console.error("Error generating data URL:", dataURLError);
            isGeneratingDataURLRef.current = false;
          } finally {
            updateInProgressRef.current = false;
          }
        }, 100);
      } catch (error) {
        console.error("Error updating object color:", error);
        updateInProgressRef.current = false;
      }
    }
  }, [currentColor, canvas]);

  // Action handlers with safety area protection
  const handleAddText = () => {
    if (!canvas || !text.trim() || updateInProgressRef.current) return;

    try {
      console.log("Adding text element");
      updateInProgressRef.current = true;
      safetyAreaManagedRef.current = true;

      // Create the text
      const fabricText = new fabric.Text(text, {
        left: 50,
        top: 50,
        fontFamily: "Arial",
        fontSize,
        fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
        underline: isUnderline,
        fill: currentColor,
        id: `text_${Date.now()}`
      });

      // Add the text to canvas
      canvas.add(fabricText);
      canvas.setActiveObject(fabricText);

      // Ensure a single safety area exists
      ensureSingleSafetyArea(canvas);

      canvas.renderAll();
      setText("");

      // Generate data URL with safety check
      setTimeout(() => {
        try {
          if (canvas && onDesignChangeRef.current) {
            isGeneratingDataURLRef.current = true;

            const dataURL = canvas.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 2,
            });

            onDesignChangeRef.current(dataURL);

            setTimeout(() => {
              isGeneratingDataURLRef.current = false;
            }, 100);
          }
        } catch (dataURLError) {
          console.error("Error generating data URL:", dataURLError);
          isGeneratingDataURLRef.current = false;
        } finally {
          updateInProgressRef.current = false;
        }
      }, 100);
    } catch (error) {
      console.error("Error adding text:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleAddCircle = () => {
    if (!canvas || updateInProgressRef.current) return;

    try {
      console.log("Adding circle element");
      updateInProgressRef.current = true;
      safetyAreaManagedRef.current = true;

      // Create the circle
      const circle = new fabric.Circle({
        radius: 30,
        fill: currentColor,
        left: 100,
        top: 100,
        id: `circle_${Date.now()}`
      });

      // Add the circle to canvas
      canvas.add(circle);
      canvas.setActiveObject(circle);

      // Ensure a single safety area exists
      ensureSingleSafetyArea(canvas);

      canvas.renderAll();

      // Generate data URL with safety check
      setTimeout(() => {
        try {
          if (canvas && onDesignChangeRef.current) {
            isGeneratingDataURLRef.current = true;

            const dataURL = canvas.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 2,
            });

            onDesignChangeRef.current(dataURL);

            setTimeout(() => {
              isGeneratingDataURLRef.current = false;
            }, 100);
          }
        } catch (dataURLError) {
          console.error("Error generating data URL:", dataURLError);
          isGeneratingDataURLRef.current = false;
        } finally {
          updateInProgressRef.current = false;
        }
      }, 100);
    } catch (error) {
      console.error("Error adding circle:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleAddSquare = () => {
    if (!canvas || updateInProgressRef.current) return;

    try {
      console.log("Adding square element");
      updateInProgressRef.current = true;
      safetyAreaManagedRef.current = true;

      // Create the square
      const square = new fabric.Rect({
        width: 60,
        height: 60,
        fill: currentColor,
        left: 100,
        top: 100,
        id: `square_${Date.now()}`
      });

      // Add the square to canvas
      canvas.add(square);
      canvas.setActiveObject(square);

      // Ensure a single safety area exists
      ensureSingleSafetyArea(canvas);

      canvas.renderAll();

      // Generate data URL with safety check
      setTimeout(() => {
        try {
          if (canvas && onDesignChangeRef.current) {
            isGeneratingDataURLRef.current = true;

            const dataURL = canvas.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 2,
            });

            onDesignChangeRef.current(dataURL);

            setTimeout(() => {
              isGeneratingDataURLRef.current = false;
            }, 100);
          }
        } catch (dataURLError) {
          console.error("Error generating data URL:", dataURLError);
          isGeneratingDataURLRef.current = false;
        } finally {
          updateInProgressRef.current = false;
        }
      }, 100);
    } catch (error) {
      console.error("Error adding square:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleDeleteSelected = () => {
    if (!canvas || updateInProgressRef.current) return;

    try {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        // Don't allow deleting safety area
        if (activeObject.id === "safetyArea") {
          console.warn("Cannot delete safety area");
          return;
        }

        updateInProgressRef.current = true;
        safetyAreaManagedRef.current = true;
        
        console.log(`Deleting object: ${activeObject.type} (id: ${activeObject.id})`);
        canvas.remove(activeObject);

        // Ensure a single safety area exists after deletion
        ensureSingleSafetyArea(canvas);

        canvas.renderAll();

        // Generate data URL with safety check
        setTimeout(() => {
          try {
            if (canvas && onDesignChangeRef.current) {
              isGeneratingDataURLRef.current = true;

              const dataURL = canvas.toDataURL({
                format: "png",
                quality: 1,
                multiplier: 2,
              });

              onDesignChangeRef.current(dataURL);

              setTimeout(() => {
                isGeneratingDataURLRef.current = false;
              }, 100);
            }
          } catch (dataURLError) {
            console.error("Error generating data URL:", dataURLError);
            isGeneratingDataURLRef.current = false;
          } finally {
            updateInProgressRef.current = false;
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error deleting object:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas || !canvas.getContext || updateInProgressRef.current) return;

    console.log("Processing uploaded image");
    updateInProgressRef.current = true;
    safetyAreaManagedRef.current = true;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Check if canvas is still valid
          if (!canvas || !canvas.getContext) {
            console.error("Canvas is no longer valid during image data processing");
            updateInProgressRef.current = false;
            return;
          }

          const imgData = event.target?.result as string;
          setUploadedImage(imgData);

          // Remove placeholder text if it exists
          const objects = canvas.getObjects();
          const placeholderText = objects.find((obj: fabric.Object) =>
            obj.type === 'text' &&
            (obj.id === "placeholderText" || obj.text === 'upload your design')
          );
          if (placeholderText) {
            canvas.remove(placeholderText);
          }

          // Don't remove any existing images - user uploads should be additive
          // This allows users to layer images on top of the AI-generated design

          // Now add the new image
          try {
            fabric.Image.fromURL(
              imgData,
              (img: fabric.Object) => {
              try {
                // Check if canvas is still valid
                if (!canvas || !canvas.getContext) {
                  console.error("Canvas is no longer valid during image processing");
                  updateInProgressRef.current = false;
                  return;
                }

                // Scale image to fit within the canvas
                const canvasWidth = canvas.width || 300;
                const canvasHeight = canvas.height || 300;

                const scaleFactor = Math.min(
                  (canvasWidth - 40) / img.width!,
                  (canvasHeight - 40) / img.height!
                );

                img.scale(scaleFactor);
                img.set({
                  left: canvasWidth / 2,
                  top: canvasHeight / 2,
                  originX: 'center',
                  originY: 'center',
                  id: "uploadedImage"
                });

                // Final check that canvas is still valid before adding the image
                if (canvas && canvas.getContext) {
                  canvas.add(img);
                  canvas.setActiveObject(img);

                  // Ensure a single safety area exists
                  ensureSingleSafetyArea(canvas);

                  canvas.renderAll();
                  console.log("Uploaded image added to canvas");

                  // Generate data URL with safety check
                  setTimeout(() => {
                    try {
                      if (onDesignChangeRef.current && canvas && canvas.getContext) {
                        isGeneratingDataURLRef.current = true;

                        const dataURL = canvas.toDataURL({
                          format: "png",
                          quality: 1,
                          multiplier: 2,
                        });

                        onDesignChangeRef.current(dataURL);

                        setTimeout(() => {
                          isGeneratingDataURLRef.current = false;
                        }, 100);
                      }
                    } catch (dataURLError) {
                      console.error("Error generating data URL:", dataURLError);
                      isGeneratingDataURLRef.current = false;
                    } finally {
                      updateInProgressRef.current = false;
                    }
                  }, 200);
                } else {
                  console.error("Canvas became invalid before adding image");
                  updateInProgressRef.current = false;
                }
              } catch (imgError) {
                console.error("Error processing uploaded image:", imgError);
                updateInProgressRef.current = false;
              }
            });
          } catch (imgLoadError) {
            console.error("Error loading image from data URL:", imgLoadError);
            updateInProgressRef.current = false;
          }
        } catch (dataError) {
          console.error("Error reading image data:", dataError);
          updateInProgressRef.current = false;
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        updateInProgressRef.current = false;
      };
      reader.readAsDataURL(file);
    } catch (fileError) {
      console.error("Error handling file upload:", fileError);
      updateInProgressRef.current = false;
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="text">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="text" className="flex gap-2 items-center">
            <TextIcon size={16} />
            Text
          </TabsTrigger>
          <TabsTrigger value="shapes" className="flex gap-2 items-center">
            <Square size={16} />
            Shapes
          </TabsTrigger>
          <TabsTrigger value="image" className="flex gap-2 items-center">
            <Image size={16} />
            Image
          </TabsTrigger>
          <TabsTrigger value="drawing" className="flex gap-2 items-center">
            <Pencil size={16} />
            Draw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text"
              className="flex-grow"
            />
            <Button onClick={handleAddText}>Add Text</Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min={8}
                max={72}
                className="w-20"
              />
              <ArrowDown size={16} />
            </div>
            <div className="flex gap-2">
              <Button
                variant={isBold ? "default" : "outline"}
                size="icon"
                onClick={() => setIsBold(!isBold)}
              >
                <Bold size={16} />
              </Button>
              <Button
                variant={isItalic ? "default" : "outline"}
                size="icon"
                onClick={() => setIsItalic(!isItalic)}
              >
                <Italic size={16} />
              </Button>
              <Button
                variant={isUnderline ? "default" : "outline"}
                size="icon"
                onClick={() => setIsUnderline(!isUnderline)}
              >
                <Underline size={16} />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shapes" className="py-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddCircle}>
              <Circle size={16} className="mr-2" /> Circle
            </Button>
            <Button variant="outline" onClick={handleAddSquare}>
              <Square size={16} className="mr-2" /> Square
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="image" className="py-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </TabsContent>

        <TabsContent value="drawing" className="py-4">
          <p className="text-sm text-muted-foreground">Drawing tools coming soon</p>
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="color-picker" className="flex items-center gap-2">
          <Palette size={16} />
          <span>Color:</span>
        </label>
        <input
          id="color-picker"
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="w-10 h-10 rounded-md cursor-pointer"
        />
        <Button
          variant="outline"
          className="ml-auto flex items-center gap-1"
          onClick={handleDeleteSelected}
        >
          <Trash2 size={16} />
          Delete
        </Button>
      </div>

      <div className="mt-6 relative flex justify-center">
        <div
          ref={canvasContainerRef}
          className="canvas-container relative border border-gray-300 shadow-md mb-4"
        >
          <canvas ref={canvasRef} />
          {isProcessingInitialImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-blue-800 text-sm font-medium">Processing design...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;
