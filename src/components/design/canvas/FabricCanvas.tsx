
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

interface FabricCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  onCanvasReady: (canvas: fabric.Canvas) => void;
  onDesignChange?: (dataURL: string) => void;
  initialImage?: string;
}

const FabricCanvas = ({
  width = 300,
  height = 300,
  backgroundColor = "#f0f0f0",
  onCanvasReady,
  onDesignChange,
  initialImage,
}: FabricCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create new canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
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

    // Setup event listeners for canvas changes
    const updateDesignCallback = () => {
      if (fabricCanvas && onDesignChange) {
        const dataURL = fabricCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2, // Higher resolution
        });
        onDesignChange(dataURL);
      }
    };

    fabricCanvas.on('object:modified', updateDesignCallback);
    fabricCanvas.on('object:added', updateDesignCallback);
    fabricCanvas.on('object:removed', updateDesignCallback);

    // Force render all objects
    fabricCanvas.renderAll();

    // Notify parent component that canvas is ready
    onCanvasReady(fabricCanvas);
    setCanvasInitialized(true);

    // Cleanup on component unmount - Fix for the removeChild error
    return () => {
      // Remove event listeners first
      fabricCanvas.off('object:modified', updateDesignCallback);
      fabricCanvas.off('object:added', updateDesignCallback);
      fabricCanvas.off('object:removed', updateDesignCallback);
      
      // Safe dispose method to prevent the removeChild error
      try {
        if (fabricCanvas) {
          // Clear all objects from canvas before disposal
          fabricCanvas.getObjects().forEach((obj) => {
            fabricCanvas.remove(obj);
          });
          fabricCanvas.clear();
          fabricCanvas.dispose();
        }
      } catch (error) {
        console.error("Error during canvas disposal:", error);
      }
    };
  }, []);

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

  return <canvas ref={canvasRef} />;
};

export default FabricCanvas;
