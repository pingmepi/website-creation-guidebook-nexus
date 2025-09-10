import { useState, useCallback } from "react";
import { fabric } from "fabric";
import { SimplifiedCanvas } from "./SimplifiedCanvas";
import { CanvasToolbar } from "./CanvasToolbar";

interface ModernCanvasManagerProps {
  tshirtColor: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

export const ModernCanvasManager = ({
  tshirtColor,
  initialImage,
  onDesignChange
}: ModernCanvasManagerProps) => {
  // Store canvas in state so Toolbar re-renders when ready
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(2);

  const handleCanvasReady = useCallback((canvasInstance: fabric.Canvas) => {
    console.log("Canvas ready in ModernCanvasManager");
    setCanvas(canvasInstance);
  }, []);

  const handleDesignChange = useCallback((dataURL: string) => {
    console.log("Design changed, notifying parent");
    if (onDesignChange) {
      onDesignChange(dataURL);
    }
  }, [onDesignChange]);

  const handleDrawingModeChange = useCallback((mode: boolean) => {
    setIsDrawingMode(mode);
  }, []);

  const handleBrushSizeChange = useCallback((size: number) => {
    setBrushSize(size);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas */}
      <div className="flex justify-center">
        <SimplifiedCanvas
          width={300}
          height={300}
          backgroundColor="#f8f9fa"
          onCanvasReady={handleCanvasReady}
          onDesignChange={handleDesignChange}
          initialImage={initialImage}
          isDrawingMode={isDrawingMode}
          brushSize={brushSize}
        />
      </div>

      {/* Toolbar */}
      <CanvasToolbar
        canvas={canvas}
        isDrawingMode={isDrawingMode}
        onDrawingModeChange={handleDrawingModeChange}
        brushSize={brushSize}
        onBrushSizeChange={handleBrushSizeChange}
      />
    </div>
  );
};