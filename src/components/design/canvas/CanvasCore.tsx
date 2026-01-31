
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

interface CanvasCoreProps {
  width: number;
  height: number;
  backgroundColor: string;
  onCanvasReady: (canvas: fabric.Canvas) => void;
}

export const useCanvasCore = ({
  width,
  height,
  backgroundColor,
  onCanvasReady
}: CanvasCoreProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    console.log("Initializing canvas core");

    try {
      const canvasSize = Math.min(width, height);

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

      fabricCanvas.renderAll();
      setCanvas(fabricCanvas as any);
      setIsInitialized(true);
      onCanvasReady(fabricCanvas as any);

    } catch (error) {
      console.error("Error initializing canvas:", error);
    }
  }, [width, height, backgroundColor, isInitialized, onCanvasReady]);

  return { canvasRef, canvas, isInitialized };
};
