
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import CanvasContainer from "./CanvasContainer";

interface CanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

const Canvas = ({
  width = 300,
  height = 300,
  backgroundColor = "#f0f0f0",
  initialImage,
  onDesignChange
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const updateInProgressRef = useRef(false);
  const isGeneratingDataURLRef = useRef(false);
  const lastProcessedImageRef = useRef<string | null>(null);
  const initialImageLoadedRef = useRef(false);
  const onDesignChangeRef = useRef(onDesignChange);
  
  // Create a stable reference to the onDesignChange callback
  useEffect(() => {
    onDesignChangeRef.current = onDesignChange;
  }, [onDesignChange]);
  
  // Initialize canvas once on mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    console.log("Initializing canvas");
    
    try {
      // Calculate dimensions
      const canvasSize = Math.min(width, height);

      // Create canvas with error handling
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasSize,
        height: canvasSize,
        backgroundColor,
      });

      // Add safety area
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
      fabricCanvas.add(safetyAreaRect);

      // Add placeholder text
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
      
      // Set up event handlers
      fabricCanvas.on('object:modified', handleCanvasChange);
      fabricCanvas.on('object:added', handleCanvasChange);
      fabricCanvas.on('object:removed', handleCanvasChange);
      
      fabricCanvas.renderAll();
      setCanvas(fabricCanvas);
      
      // Cleanup function
      return () => {
        try {
          fabricCanvas.off();
          fabricCanvas.dispose();
        } catch (error) {
          console.error("Error disposing canvas:", error);
        }
      };
    } catch (error) {
      console.error("Error initializing canvas:", error);
    }
  }, [width, height, backgroundColor]);

  // Function to handle canvas changes
  const handleCanvasChange = () => {
    if (!updateInProgressRef.current && canvas) {
      updateInProgressRef.current = true;
      
      setTimeout(() => {
        try {
          if (onDesignChangeRef.current && canvas) {
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
        } catch (error) {
          console.error("Error generating data URL:", error);
          isGeneratingDataURLRef.current = false;
        } finally {
          updateInProgressRef.current = false;
        }
      }, 100);
    }
  };

  // Load the initial image if provided
  useEffect(() => {
    if (isGeneratingDataURLRef.current || !canvas || !initialImage || updateInProgressRef.current) return;
    
    if (lastProcessedImageRef.current === initialImage) {
      console.log("Skipping duplicate image processing");
      return;
    }

    if (initialImageLoadedRef.current && initialImage.startsWith('data:image/png;base64,')) {
      console.log("Skipping canvas-generated image update");
      return;
    }

    console.log("Processing initial image");
    lastProcessedImageRef.current = initialImage;
    updateInProgressRef.current = true;

    try {
      // Remove placeholder text if it exists
      const objects = canvas.getObjects();
      const placeholderText = objects.find((obj: any) =>
        obj.type === 'text' &&
        (obj.id === "placeholderText" || (obj as any).text === 'upload your design')
      );
      if (placeholderText) {
        canvas.remove(placeholderText);
      }

      // Clear existing images
      const existingImages = objects.filter((obj: any) => obj.type === 'image');
      if (existingImages.length > 0) {
        console.log(`Removing ${existingImages.length} existing images`);
        existingImages.forEach((img: any) => canvas.remove(img));
      }

      // Load the image
      fabric.Image.fromURL(
        initialImage,
        (img: any) => {
          try {
            if (!img || !img.width || !img.height) {
              console.error("Loaded image is invalid");
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
              id: "initialImage"
            });

            canvas.add(img);
            canvas.renderAll();
            initialImageLoadedRef.current = true;
            handleCanvasChange();
          } catch (error) {
            console.error("Error processing image:", error);
          } finally {
            updateInProgressRef.current = false;
          }
        },
        { crossOrigin: 'anonymous' }
      );
    } catch (error) {
      console.error("Error in initialImage effect:", error);
      updateInProgressRef.current = false;
    }
  }, [canvas, initialImage]);

  // Add object to canvas helper
  const addObject = (obj: fabric.Object) => {
    if (!canvas || updateInProgressRef.current) return;
    
    try {
      updateInProgressRef.current = true;
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      handleCanvasChange();
    } catch (error) {
      console.error("Error adding object to canvas:", error);
    } finally {
      updateInProgressRef.current = false;
    }
  };

  // Helper methods for object manipulation
  const updateActiveObject = (property: string, value: any) => {
    if (!canvas || updateInProgressRef.current) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      try {
        updateInProgressRef.current = true;
        activeObject.set(property as any, value);
        canvas.renderAll();
        handleCanvasChange();
      } catch (error) {
        console.error(`Error updating ${property}:`, error);
      } finally {
        updateInProgressRef.current = false;
      }
    }
  };
  
  const deleteActiveObject = () => {
    if (!canvas || updateInProgressRef.current) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.id !== "safetyArea") {
      try {
        updateInProgressRef.current = true;
        canvas.remove(activeObject);
        canvas.renderAll();
        handleCanvasChange();
      } catch (error) {
        console.error("Error deleting object:", error);
      } finally {
        updateInProgressRef.current = false;
      }
    }
  };

  return {
    canvasRef,
    canvas,
    addObject,
    updateActiveObject,
    deleteActiveObject,
  };
};

export default Canvas;
