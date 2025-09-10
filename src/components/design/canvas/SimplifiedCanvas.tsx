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

  // Initialize canvas once (strict-mode safe)
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

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
      });
      canvas.add(safetyArea);

      // Initialize drawing brush
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = "#000000";
        canvas.freeDrawingBrush.width = brushSize;
      }

      fabricCanvasRef.current = canvas;
      setIsInitialized(true);
      onCanvasReady(canvas);

      // Handle canvas changes with debouncing
      let timeoutId: number;
      const handleChange = () => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          const cv = fabricCanvasRef.current;
          if (onDesignChange && cv && (cv as any).contextContainer) {
            const dataURL = cv.toDataURL({
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
      canvas.on('object:added', (e) => {
        // Don't trigger for safety area
        if (e.target?.name !== 'safetyArea') {
          handleChange();
        }
      });
      canvas.on('object:removed', handleChange);
      canvas.on('path:created', handleChange);

      return () => {
        clearTimeout(timeoutId);
        try { canvas.dispose(); } catch {}
        // Reset refs/state so re-mount (React StrictMode) re-initializes cleanly
        fabricCanvasRef.current = null;
        setIsInitialized(false);
      };
    } catch (error) {
      console.error("Error initializing canvas:", error);
    }
  }, [width, height, backgroundColor, onCanvasReady, onDesignChange, brushSize]);

  // Handle drawing mode changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = isDrawingMode;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [isDrawingMode, brushSize]);

  // Load initial image (robust with preloading to avoid fromURL errors)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !initialImage || initialImage === lastImageRef.current) return;

    console.log("Loading initial image:", initialImage);
    lastImageRef.current = initialImage;

    // Remove placeholder text if exists
    const objects = canvas.getObjects();
    const placeholderText = objects.find(obj => obj.name === "placeholderText");
    if (placeholderText) {
      canvas.remove(placeholderText);
    }

    // Preload image to handle errors explicitly and set crossOrigin
    const imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';
    imgEl.onload = () => {
      try {
        const cv = fabricCanvasRef.current;
        if (!cv) return; // canvas disposed/unmounted
        const img = new fabric.Image(imgEl);

        // Scale image to fit canvas
        const scale = Math.min(
          (width - 40) / ((img.width as number) || 1),
          (height - 40) / ((img.height as number) || 1)
        );

        img.set({
          left: width / 2,
          top: height / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          name: "mainImage"
        });

        cv.add(img);
        cv.bringToFront(img);

        // Keep safety area at back
        const safetyArea = cv.getObjects().find(obj => (obj as any).name === "safetyArea");
        if (safetyArea) {
          cv.sendToBack(safetyArea);
        }

        // Guard to ensure fabric still has a context container
        if ((cv as any).contextContainer) {
          cv.renderAll();
        }

        // Trigger design change
        if (onDesignChange && (cv as any).contextContainer) {
          const dataURL = cv.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 2,
          });
          onDesignChange(dataURL);
        }
      } catch (error) {
        console.error("Error processing loaded image:", error);
      }
    };
    imgEl.onerror = () => {
      const cv = fabricCanvasRef.current;
      console.error("Error loading image element:", initialImage);
      if (!cv) return;
      // Add placeholder text on error
      const errorText = new fabric.Text("Failed to load image", {
        left: width / 2,
        top: height / 2,
        originX: 'center',
        originY: 'center',
        fontFamily: 'Arial',
        fontSize: 16,
        fill: '#999999',
        selectable: false,
        evented: false,
        name: "placeholderText",
      });
      cv.add(errorText);
      if ((cv as any).contextContainer) {
        cv.renderAll();
      }
    };
    imgEl.src = initialImage;
  }, [initialImage, width, height, onDesignChange, isInitialized]);

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
    });
    canvas.add(placeholderText);
    canvas.renderAll();
  }, [width, height, initialImage]);

  return <canvas ref={canvasRef} className="border border-gray-200 rounded-lg" />;
};
