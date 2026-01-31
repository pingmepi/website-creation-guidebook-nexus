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
            const dataURL = canvas.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 2,
            });
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
    if (!canvas || !initialImage || initialImage === lastImageRef.current) return;

    console.log("Loading initial image:", initialImage);
    lastImageRef.current = initialImage;

    // Remove placeholder text if exists
    const objects = canvas.getObjects();
    const placeholderText = objects.find(obj => (obj as any).name === "placeholderText");
    if (placeholderText) {
      canvas.remove(placeholderText);
    }

    // Load and add the image
    fabric.Image.fromURL(initialImage, (img) => {
      if (!canvas) return;

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

      canvas.renderAll();

      // Trigger design change
      if (onDesignChange) {
        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });
        onDesignChange(dataURL);
      }
    }, { crossOrigin: 'anonymous' });
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
