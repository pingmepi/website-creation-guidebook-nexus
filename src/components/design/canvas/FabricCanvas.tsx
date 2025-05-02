
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
  
  // Track if design has actual content beyond placeholder
  const [hasContent, setHasContent] = useState(false);
  
  // Update reference when callback changes
  useEffect(() => {
    onDesignChangeRef.current = onDesignChange;
  }, [onDesignChange]);
  
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
      id: "safetyArea", // Add id for identification
    });
    fabricCanvas.add(safetyAreaRect);

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
        id: "placeholderText", // Add id for identification
      });
      fabricCanvas.add(placeholderText);
    }

    // Setup debounced design update function
    let debounceTimeout: number | null = null;
    
    const updateDesignCallback = () => {
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
          const dataURL = fabricCanvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 2, // Higher resolution
          });
          onDesignChangeRef.current(dataURL);
          pendingChangesRef.current = false;
          console.log("Design change triggered from FabricCanvas");
        }
      }, 300); // Wait 300ms after last change before triggering onDesignChange
    };

    fabricCanvas.on('object:modified', updateDesignCallback);
    fabricCanvas.on('object:added', updateDesignCallback);
    fabricCanvas.on('object:removed', updateDesignCallback);
    fabricCanvas.on('path:created', updateDesignCallback);

    // Force render all objects
    fabricCanvas.renderAll();

    // Notify parent component that canvas is ready
    onCanvasReady(fabricCanvas);
    setCanvasInitialized(true);
    lastInitialImageRef.current = initialImage;

    // Cleanup on component unmount - Fix for the removeChild error
    return () => {
      if (debounceTimeout) {
        window.clearTimeout(debounceTimeout);
      }
      
      // Remove event listeners first
      if (fabricCanvas) {
        fabricCanvas.off('object:modified', updateDesignCallback);
        fabricCanvas.off('object:added', updateDesignCallback);
        fabricCanvas.off('object:removed', updateDesignCallback);
        fabricCanvas.off('path:created', updateDesignCallback);
        
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
          } catch (error) {
            console.error("Error loading initial image:", error);
          }
        }, { crossOrigin: 'anonymous' });
      } catch (error) {
        console.error("Error creating fabric Image from URL:", error);
      }
    }
  }, [initialImage, canvasInitialized]);

  return <canvas ref={canvasRef} />;
};

export default FabricCanvas;
