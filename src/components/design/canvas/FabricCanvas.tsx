
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
  
  // Track if design has actual content beyond placeholder
  const [hasContent, setHasContent] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

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
      const contentObjects = objects.filter(obj => obj.stroke !== "#5cb85c" && 
        (obj.type !== 'text' || (obj as fabric.Text).text !== 'upload your design'));
        
      setHasContent(contentObjects.length > 0);
      
      // Debounce the actual design change notification
      if (debounceTimeout) {
        window.clearTimeout(debounceTimeout);
      }
      
      debounceTimeout = window.setTimeout(() => {
        if (fabricCanvas && onDesignChange && pendingChangesRef.current) {
          const dataURL = fabricCanvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 2, // Higher resolution
          });
          onDesignChange(dataURL);
          pendingChangesRef.current = false;
        }
      }, 500); // Wait 500ms after last change before triggering onDesignChange
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
  }, []);

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

  // Load the initial image if provided
  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas || !canvasInitialized || !initialImage) return;

    console.log("Loading initial image into canvas:", initialImage);

    // Clear placeholder text if it exists
    const objects = fabricCanvas.getObjects();
    const placeholderText = objects.find(obj => 
      obj.type === 'text' && 
      (obj as fabric.Text).text === 'upload your design'
    );
    
    if (placeholderText) {
      fabricCanvas.remove(placeholderText);
    }

    // Clear existing objects except safety area rectangle
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.stroke !== "#5cb85c") { // Keep only the safety area rectangle
        fabricCanvas.remove(obj);
      }
    });

    fabric.Image.fromURL(initialImage, (img) => {
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
        originY: 'center'
      });
      
      fabricCanvas.add(img);
      fabricCanvas.setActiveObject(img);
      fabricCanvas.renderAll();
      
      // Mark that we have content
      setHasContent(true);
      
      // Notify parent of design change
      if (onDesignChange) {
        const dataURL = fabricCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });
        onDesignChange(dataURL);
      }
    }, { crossOrigin: 'anonymous' });
  }, [initialImage, canvasInitialized]);

  // Function to save design explicitly
  const saveDesign = () => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas || !onDesignChange || !hasContent) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    
    onDesignChange(dataURL);
    pendingChangesRef.current = false;
  };

  return <canvas ref={canvasRef} />;
};

export default FabricCanvas;
