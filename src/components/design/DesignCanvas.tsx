import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Image, Palette, Pencil, Square, Text as TextIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fabric } from "fabric";

// Import our components
import TextTools from "./canvas/TextTools";
import ShapeTools from "./canvas/ShapeTools";
import ImageTools from "./canvas/ImageTools";
import DrawingTools from "./canvas/DrawingTools";
import ColorControls from "./canvas/ColorControls";
import FabricCanvas from "./canvas/FabricCanvas";
import ToolTab from "./canvas/ToolTab";
import CanvasContainer from "./canvas/CanvasContainer";

interface DesignCanvasProps {
  tshirtColor: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

const DesignCanvas = ({ 
  tshirtColor, 
  initialImage, 
  onDesignChange 
}: DesignCanvasProps) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  
  // State for text editing
  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(20);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  
  // State for uploaded image
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(2);
  
  // Refs to track state
  const canvasInitializedRef = useRef(false);
  const updateInProgressRef = useRef(false);
  const lastProcessedImageRef = useRef<string | null>(null);
  const initialImageLoadedRef = useRef(false);
  const isGeneratingDataURLRef = useRef(false);
  
  // Create a stable reference to the onDesignChange callback
  const onDesignChangeRef = useRef(onDesignChange);
  
  const handleAddText = () => {
    // Simple validation - avoid excessive checks that might cause issues
    if (!canvas || !text.trim() || updateInProgressRef.current) return;

    try {
      console.log("Adding text element");
      updateInProgressRef.current = true;

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
        id: `text_${Date.now()}` // Add unique ID
      });

      // Add the text to canvas
      canvas.add(fabricText);
      canvas.setActiveObject(fabricText);
      canvas.renderAll();
      setText("");

      // Generate data URL directly instead of calling updateDesign
      setTimeout(() => {
        try {
          if (canvas && onDesignChangeRef.current) {
            // Set flag to prevent loops
            isGeneratingDataURLRef.current = true;

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
      console.error("Error adding text:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleAddCircle = () => {
    // Simple validation - avoid excessive checks that might cause issues
    if (!canvas || updateInProgressRef.current) return;

    try {
      console.log("Adding circle element");
      updateInProgressRef.current = true;

      // Create the circle
      const circle = new fabric.Circle({
        radius: 30,
        fill: currentColor,
        left: 100,
        top: 100,
        id: `circle_${Date.now()}` // Add unique ID
      });

      // Add the circle to canvas
      canvas.add(circle);
      canvas.setActiveObject(circle);
      canvas.renderAll();

      // Generate data URL directly instead of calling updateDesign
      setTimeout(() => {
        try {
          if (canvas && onDesignChangeRef.current) {
            // Set flag to prevent loops
            isGeneratingDataURLRef.current = true;

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
      console.error("Error adding circle:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleAddSquare = () => {
    // Simple validation - avoid excessive checks that might cause issues
    if (!canvas || updateInProgressRef.current) return;

    try {
      console.log("Adding square element");
      updateInProgressRef.current = true;

      // Create the square
      const square = new fabric.Rect({
        width: 60,
        height: 60,
        fill: currentColor,
        left: 100,
        top: 100,
        id: `square_${Date.now()}` // Add unique ID
      });

      // Add the square to canvas
      canvas.add(square);
      canvas.setActiveObject(square);
      canvas.renderAll();

      // Generate data URL directly instead of calling updateDesign
      setTimeout(() => {
        try {
          if (canvas && onDesignChangeRef.current) {
            // Set flag to prevent loops
            isGeneratingDataURLRef.current = true;

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
      console.error("Error adding square:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleDeleteSelected = () => {
    // Simple validation - avoid excessive checks that might cause issues
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
        console.log(`Deleting object: ${activeObject.type} (id: ${activeObject.id})`);
        canvas.remove(activeObject);
        canvas.renderAll();

        // Generate data URL directly instead of calling updateDesign
        setTimeout(() => {
          try {
            if (canvas && onDesignChangeRef.current) {
              // Set flag to prevent loops
              isGeneratingDataURLRef.current = true;

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
          const placeholderText = objects.find((obj: any) =>
            obj.type === 'text' &&
            (obj.id === "placeholderText" || (obj as any).text === 'upload your design')
          );
          if (placeholderText) {
            canvas.remove(placeholderText);
          }

          // Remove existing images
          const existingImages = objects.filter((obj: any) => obj.type === 'image');
          if (existingImages.length > 0) {
            console.log(`Removing ${existingImages.length} existing images`);
            existingImages.forEach((img: any) => canvas.remove(img));
          }

          // Now add the new image
          try {
            fabric.Image.fromURL(imgData, (img: any) => {
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
                  id: "uploadedImage" // Add an ID to identify this object
                });

                // Final check that canvas is still valid before adding the image
                if (canvas && canvas.getContext) {
                  canvas.add(img);
                  canvas.setActiveObject(img);
                  canvas.renderAll();
                  console.log("Uploaded image added to canvas");

                  // Generate data URL directly instead of calling updateDesign
                  setTimeout(() => {
                    try {
                      if (onDesignChangeRef.current && canvas) {
                        // Set flag to prevent loops
                        isGeneratingDataURLRef.current = true;

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

  // Function to toggle drawing mode
  const handleToggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };
  
  // Function to handle brush size changes
  const handleBrushSizeChange = (values: number[]) => {
    if (values.length > 0) {
      setBrushSize(values[0]);
    }
  };
  
  // Function to clear canvas (except safety rectangle)
  const handleClearCanvas = () => {
    if (!canvas) return;
    
    canvas.getObjects().forEach(obj => {
      if (obj.stroke !== "#5cb85c") { // Keep only the safety area rectangle
        canvas.remove(obj);
      }
    });
    
    canvas.renderAll();
  };

  return (
    <div className="w-full" ref={canvasContainerRef}>
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

        <ToolTab value="text">
          <TextTools
            text={text}
            setText={setText}
            fontSize={fontSize}
            setFontSize={setFontSize}
            isBold={isBold}
            setIsBold={setIsBold}
            isItalic={isItalic}
            setIsItalic={setIsItalic}
            isUnderline={isUnderline}
            setIsUnderline={setIsUnderline}
            onAddText={handleAddText}
          />
        </ToolTab>
        
        <ToolTab value="shapes">
          <ShapeTools
            onAddCircle={handleAddCircle}
            onAddSquare={handleAddSquare}
          />
        </ToolTab>
        
        <ToolTab value="image">
          <ImageTools onImageUpload={handleImageUpload} />
        </ToolTab>

        <ToolTab value="drawing">
          <DrawingTools 
            isDrawingMode={isDrawingMode}
            onToggleDrawingMode={handleToggleDrawingMode}
            brushSize={brushSize}
            onBrushSizeChange={handleBrushSizeChange}
            onClearCanvas={handleClearCanvas}
          />
        </ToolTab>
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

      <CanvasContainer>
        <FabricCanvas
          initialImage={initialImage}
          onDesignChange={onDesignChange}
          isDrawingMode={isDrawingMode}
          brushSize={brushSize}
          onCanvasReady={setCanvas}
        />
      </CanvasContainer>
    </div>
  );
};

export default DesignCanvas;
