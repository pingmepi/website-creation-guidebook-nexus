import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";

interface SimplifiedCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  onCanvasReady: (canvas: fabric.Canvas) => void;
  onDesignChange?: (dataURL: string) => void;
  initialImage?: string;
  isDrawingMode?: boolean;
  brushSize?: number;
}

export const SimplifiedCanvas = ({
  width = 300,
  height = 300,
  backgroundColor = "#f0f0f0",
  onCanvasReady,
  onDesignChange,
  initialImage,
  isDrawingMode = false,
  brushSize = 2,
}: SimplifiedCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastImageRef = useRef<string>("");
  const lastPushedImageRef = useRef<string>("");

  // Initialize canvas once
  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    console.log("Initializing SimplifiedCanvas");

    try {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor,
      });

      // Add safety area (dashed border)
      const safetyArea = new fabric.Rect({
        width: width - 20,
        height: height - 20,
        left: 10,
        top: 10,
        stroke: "#5cb85c",
        strokeDashArray: [5, 5],
        fill: "transparent",
        selectable: false,
        evented: false,
        name: "safetyArea",
      } as any);
      canvas.add(safetyArea);

      // Initialize drawing brush
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = "#000000";
        canvas.freeDrawingBrush.width = brushSize;
      }

      fabricCanvasRef.current = canvas as any;
      setIsInitialized(true);
      onCanvasReady(canvas as any);

      // Handle canvas changes with debouncing
      let timeoutId: number;
      const handleChange = () => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          if (onDesignChange && canvas) {
            // Get all design objects (excluding safety area)
            const designObjects = canvas.getObjects().filter(
              (obj: any) => obj.name !== 'safetyArea' && obj.name !== 'placeholderText'
            );

            // If no design objects, don't export
            if (designObjects.length === 0) {
              return;
            }

            // Save current background
            const originalBg = canvas.backgroundColor;

            // Temporarily hide safety area and set transparent background
            const safetyArea = canvas.getObjects().find((obj: any) => obj.name === 'safetyArea');
            const placeholderText = canvas.getObjects().find((obj: any) => obj.name === 'placeholderText');

            if (safetyArea) (safetyArea as any).visible = false;
            if (placeholderText) (placeholderText as any).visible = false;
            canvas.backgroundColor = 'transparent';
            canvas.renderAll();

            // Export with transparent background
            const dataURL = canvas.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 2,
            });

            // Restore original state
            if (safetyArea) (safetyArea as any).visible = true;
            if (placeholderText) (placeholderText as any).visible = true;
            canvas.backgroundColor = originalBg;
            canvas.renderAll();

            lastPushedImageRef.current = dataURL;
            onDesignChange(dataURL);
          }
        }, 300);
      };

      // Add event listeners
      canvas.on('object:modified', handleChange);
      canvas.on('object:added', (e: any) => {
        // Don't trigger for safety area
        if (e.target?.name !== 'safetyArea') {
          handleChange();
        }
      });
      canvas.on('object:removed', handleChange);
      canvas.on('path:created', handleChange);

      return () => {
        clearTimeout(timeoutId);
        canvas.dispose();
      };
    } catch (error) {
      console.error("Error initializing canvas:", error);
    }
  }, [width, height, backgroundColor, onCanvasReady, onDesignChange, brushSize, isInitialized]);

  // Handle drawing mode changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = isDrawingMode;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [isDrawingMode, brushSize]);

  // Load initial image
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !initialImage) return;

    // Prevent loop if image is the same as last loaded or last pushed
    if (initialImage === lastImageRef.current || initialImage === lastPushedImageRef.current) return;

    console.log("Loading initial image into canvas");
    lastImageRef.current = initialImage;

    // Remove placeholder text and previous main image if they exist
    const objects = canvas.getObjects();
    const placeholderText = objects.find(obj => (obj as any).name === "placeholderText");
    if (placeholderText) {
      canvas.remove(placeholderText);
    }

    const previousImage = objects.find(obj => (obj as any).name === "mainImage");
    if (previousImage) {
      canvas.remove(previousImage);
    }

    // Load and add the image
    try {
      fabric.Image.fromURL(initialImage, (img) => {
        if (!canvas || !img) {
          console.error("Failed to load image or canvas disposed:", initialImage.substring(0, 30) + "...");
          return;
        }

        try {
          // Scale image to fit canvas
          const scale = Math.min(
            (width - 40) / (img.width || 1),
            (height - 40) / (img.height || 1)
          );

          img.set({
            left: width / 2,
            top: height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            name: "mainImage"
          } as any);

          canvas.add(img as any);
          canvas.bringToFront(img as any);

          // Keep safety area at back
          const safetyArea = canvas.getObjects().find(obj => (obj as any).name === "safetyArea");
          if (safetyArea) {
            canvas.sendToBack(safetyArea);
          }

          if (canvas && (canvas as any).contextContainer) {
            canvas.renderAll();
          }
        } catch (innerError) {
          console.error("Error processing loaded image:", innerError);
        }
      }, { crossOrigin: 'anonymous' });
    } catch (outerError) {
      console.error("Error calling fabric.Image.fromURL:", outerError);
    }
  }, [initialImage, width, height, onDesignChange]);

  // Add placeholder text if no initial image
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || initialImage) return;

    const placeholderText = new fabric.Text("Upload your design", {
      left: width / 2,
      top: height / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#999999',
      selectable: false,
      evented: false,
      name: "placeholderText",
    } as any);
    canvas.add(placeholderText as any);
    canvas.renderAll();
  }, [width, height, initialImage]);

  return <canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />;
};
