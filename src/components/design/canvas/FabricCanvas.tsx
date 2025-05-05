import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

interface FabricCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  onCanvasReady: (canvas: fabric.Canvas) => void;
  onDesignChange?: (dataURL: string) => void;
  initialImage?: string;
  isDrawingMode?: boolean;
  brushSize?: number;
}

const FabricCanvas = ({
  width = 300,
  height = 300,
  backgroundColor = "#f0f0f0",
  onCanvasReady,
  onDesignChange,
  initialImage,
  isDrawingMode = false,
  brushSize = 2,
}: FabricCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const pendingChangesRef = useRef(false);
  const lastInitialImageRef = useRef<string | undefined>(initialImage);
  const onDesignChangeRef = useRef(onDesignChange);
  const safetyAreaManagedRef = useRef(false); // Track if we've already managed safety areas
  const updateInProgressRef = useRef(false); // Track if an update is in progress
  
  // Track if design has actual content beyond placeholder
  const [hasContent, setHasContent] = useState(false);
  
  // Update reference when callback changes
  useEffect(() => {
    onDesignChangeRef.current = onDesignChange;
  }, [onDesignChange]);
  
  // Improved function to ensure a single safety area exists
  const ensureSingleSafetyArea = (fabricCanvas: fabric.Canvas) => {
    if (updateInProgressRef.current || safetyAreaManagedRef.current) {
      return false;
    }
    
    updateInProgressRef.current = true;
    safetyAreaManagedRef.current = true;
    
    try {
      // Find all safety areas
      const objects = fabricCanvas.getObjects();
      const safetyAreas = objects.filter(obj => 
        obj.id === "safetyArea"
      );
      
      if (safetyAreas.length > 1) {
        console.log(`Found ${safetyAreas.length} safety areas, removing duplicates`);
        
        // Keep only the first one and remove others
        for (let i = 1; i < safetyAreas.length; i++) {
          fabricCanvas.remove(safetyAreas[i]);
        }
        
        // Make sure it's at the back
        fabricCanvas.sendToBack(safetyAreas[0]);
        return true;
      } else if (safetyAreas.length === 1) {
        // We already have exactly one safety area, just make sure it's at the back
        fabricCanvas.sendToBack(safetyAreas[0]);
        return true;
      }
      
      // If no safety area exists, create one
      const safetyAreaRect = new fabric.Rect({
        width: width - 20,
        height: height - 20,
        left: 10,
        top: 10,
        stroke: "#5cb85c", // green for safety area
        strokeDashArray: [5, 5],
        fill: "transparent",
        selectable: false,
        evented: false,
        id: "safetyArea",
      });
      
      fabricCanvas.add(safetyAreaRect);
      fabricCanvas.sendToBack(safetyAreaRect);
      
      return true;
    } catch (error) {
      console.error("Error managing safety area:", error);
      return false;
    } finally {
      updateInProgressRef.current = false;
    }
  };
  
  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    console.log("Initializing FabricCanvas component");

    // Create new canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = fabricCanvas;

    // Add dashed rectangle for safety area
    ensureSingleSafetyArea(fabricCanvas);

    // Add placeholder text if no initial image
    if (!initialImage) {
      const placeholderText = new fabric.Text("upload your design", {
        left: width / 2,
        top: height / 2,
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
    }

    // Debounced update function to prevent too many updates
    let debounceTimeout: number | null = null;
    
    const safeUpdateDesign = () => {
      // Skip if update is already in progress
      if (updateInProgressRef.current) return;
      
      // Mark that there are pending changes
      pendingChangesRef.current = true;
      
      // Update content state if we have objects beyond the safety rectangle
      const objects = fabricCanvas.getObjects();
      const contentObjects = objects.filter(obj => 
        obj.id !== "safetyArea" && 
        obj.id !== "placeholderText"
      );
        
      setHasContent(contentObjects.length > 0);
      
      // Debounce the actual design change notification
      if (debounceTimeout) {
        window.clearTimeout(debounceTimeout);
      }
      
      debounceTimeout = window.setTimeout(() => {
        if (fabricCanvas && onDesignChangeRef.current && pendingChangesRef.current) {
          updateInProgressRef.current = true;
          
          // Ensure a single safety area exists
          ensureSingleSafetyArea(fabricCanvas);
          
          const dataURL = fabricCanvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 2,
          });
          
          onDesignChangeRef.current(dataURL);
          pendingChangesRef.current = false;
          
          console.log("Design change triggered from FabricCanvas");
          
          // Reset flags
          setTimeout(() => {
            updateInProgressRef.current = false;
            safetyAreaManagedRef.current = false;
          }, 100);
        }
      }, 300);
    };

    // Set up object event handlers with improved safety
    const handleObjectModified = () => {
      if (!updateInProgressRef.current) {
        safeUpdateDesign();
      }
    };
    
    const handleObjectAdded = (e: any) => {
      // Don't trigger update for safety area to avoid loops
      if (e.target && e.target.id === "safetyArea") {
        return;
      }
      
      if (!updateInProgressRef.current) {
        safeUpdateDesign();
      }
    };
    
    const handleObjectRemoved = (e: any) => {
      // If safety area was removed, recreate it
      if (e.target && e.target.id === "safetyArea") {
        safetyAreaManagedRef.current = false;
        setTimeout(() => ensureSingleSafetyArea(fabricCanvas), 0);
        return;
      }
      
      if (!updateInProgressRef.current) {
        safeUpdateDesign();
      }
    };
    
    // Add proper handlers for selection
    const handleSelectionCreated = () => {
      // Fix safety area visibility on selection
      if (!updateInProgressRef.current) {
        setTimeout(() => {
          ensureSingleSafetyArea(fabricCanvas);
        }, 0);
      }
    };

    fabricCanvas.on('object:modified', handleObjectModified);
    fabricCanvas.on('object:added', handleObjectAdded);
    fabricCanvas.on('object:removed', handleObjectRemoved);
    fabricCanvas.on('path:created', handleObjectModified);
    fabricCanvas.on('selection:created', handleSelectionCreated);
    fabricCanvas.on('selection:updated', handleSelectionCreated);

    // Add periodic checker for safety area
    const intervalId = setInterval(() => {
      if (!updateInProgressRef.current && !safetyAreaManagedRef.current) {
        const objects = fabricCanvas.getObjects();
        const safetyAreas = objects.filter(obj => obj.id === "safetyArea");
        
        if (safetyAreas.length !== 1) {
          console.log(`Found ${safetyAreas.length} safety areas during interval check, fixing...`);
          ensureSingleSafetyArea(fabricCanvas);
        }
      }
    }, 2000);

    // Force render all objects
    fabricCanvas.renderAll();

    // Notify parent component that canvas is ready
    onCanvasReady(fabricCanvas);
    setCanvasInitialized(true);
    lastInitialImageRef.current = initialImage;

    // Cleanup on component unmount
    return () => {
      if (debounceTimeout) {
        window.clearTimeout(debounceTimeout);
      }
      
      clearInterval(intervalId);
      
      // Remove event listeners first
      if (fabricCanvas) {
        fabricCanvas.off('object:modified', handleObjectModified);
        fabricCanvas.off('object:added', handleObjectAdded);
        fabricCanvas.off('object:removed', handleObjectRemoved);
        fabricCanvas.off('path:created', handleObjectModified);
        fabricCanvas.off('selection:created', handleSelectionCreated);
        fabricCanvas.off('selection:updated', handleSelectionCreated);
        
        // Safe dispose method to prevent the removeChild error
        try {
          // Clear all objects from canvas before disposal to prevent errors
          fabricCanvas.getObjects().forEach((obj) => {
            fabricCanvas.remove(obj);
          });
          
          // These steps help prevent the "removeChild" error by ensuring
          // we're not removing DOM elements that are already gone
          fabricCanvas.clear();
          fabricCanvas.dispose();
          
          // Clear the ref to avoid accessing disposed canvas
          fabricCanvasRef.current = null;
        } catch (error) {
          console.error("Error during canvas disposal:", error);
        }
      }
    };
  }, [width, height, backgroundColor]);

  // Handle drawing mode changes
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas || !canvasInitialized) return;
    
    fabricCanvas.isDrawingMode = isDrawingMode;
    
    if (isDrawingMode && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = brushSize;
      fabricCanvas.freeDrawingBrush.color = "#000000";
    }
  }, [isDrawingMode, brushSize, canvasInitialized]);

  // Load the initial image if provided and different from last one
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas || !canvasInitialized) return;
    
    // Only load image if it's different from the last one we processed
    // This prevents the image from being reloaded on every render
    if (initialImage && initialImage !== lastInitialImageRef.current) {
      console.log("Loading new initial image in FabricCanvas");
      lastInitialImageRef.current = initialImage;
      
      // Set update flags to prevent duplicate safety areas
      updateInProgressRef.current = true;
      safetyAreaManagedRef.current = true;

      // Clear placeholder text if it exists
      const objects = fabricCanvas.getObjects();
      const placeholderText = objects.find(obj => obj.id === "placeholderText");
      
      if (placeholderText) {
        fabricCanvas.remove(placeholderText);
      }

      // Clear existing objects except safety area rectangle
      objects.forEach(obj => {
        if (obj.id !== "safetyArea") { // Keep only the safety area rectangle
          fabricCanvas.remove(obj);
        }
      });

      // Load the new image if provided
      try {
        fabric.Image.fromURL(initialImage, (img) => {
          try {
            // Scale image to fit within the canvas
            const canvasWidth = fabricCanvas.width || 300;
            const canvasHeight = fabricCanvas.height || 300;
            
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
              id: "uploadedImage" // Add id for identification
            });
            
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            
            // Ensure a single safety area exists
            ensureSingleSafetyArea(fabricCanvas);
            
            fabricCanvas.renderAll();
            
            // Mark that we have content
            setHasContent(true);
            
            // Notify parent of design change
            if (onDesignChangeRef.current) {
              console.log("Notifying parent of design change after image load");
              const dataURL = fabricCanvas.toDataURL({
                format: "png",
                quality: 1,
                multiplier: 2,
              });
              onDesignChangeRef.current(dataURL);
            }
            
            // Reset flags after a delay
            setTimeout(() => {
              updateInProgressRef.current = false;
              safetyAreaManagedRef.current = false;
            }, 200);
            
          } catch (error) {
            console.error("Error loading initial image:", error);
            updateInProgressRef.current = false;
            safetyAreaManagedRef.current = false;
          }
        }, { crossOrigin: 'anonymous' });
      } catch (error) {
        console.error("Error creating fabric Image from URL:", error);
        updateInProgressRef.current = false;
        safetyAreaManagedRef.current = false;
      }
    }
  }, [initialImage, canvasInitialized]);

  return <canvas ref={canvasRef} />;
};

export default FabricCanvas;
