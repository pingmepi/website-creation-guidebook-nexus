import { useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas } from "fabric";
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
  const canvasRef = useRef<FabricCanvas | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(2);

  const handleCanvasReady = useCallback((canvas: FabricCanvas) => {
    console.log("Canvas ready in ModernCanvasManager");
    canvasRef.current = canvas;
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
        canvas={canvasRef.current}
        isDrawingMode={isDrawingMode}
        onDrawingModeChange={handleDrawingModeChange}
        brushSize={brushSize}
        onBrushSizeChange={handleBrushSizeChange}
      />
    </div>
  );
};