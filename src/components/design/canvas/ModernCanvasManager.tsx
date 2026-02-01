import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { CanvasToolbar } from "./CanvasToolbar";
import { KonvaCanvasHandle } from "./KonvaCanvas";

// Dynamically import KonvaCanvas to avoid SSR issues
const KonvaCanvas = dynamic(
  () => import("./KonvaCanvas").then((mod) => mod.KonvaCanvas),
  { ssr: false }
);

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

  const canvasRef = useRef<KonvaCanvasHandle>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(2);

  const handleDesignChange = useCallback((dataURL: string) => {
    // console.log("Design changed, notifying parent");
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

  // Toolbar Handlers
  const handleAddText = (text: string, color: string) => {
    canvasRef.current?.addText(text, color);
  };

  const handleAddRect = (color: string) => {
    canvasRef.current?.addRect(color);
  };

  const handleAddCircle = (color: string) => {
    canvasRef.current?.addCircle(color);
  };

  const handleDelete = () => {
    canvasRef.current?.deleteSelected();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  const handleUpdateColor = (color: string) => {
    canvasRef.current?.updateSelectedColor(color);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth } = containerRef.current;
        // Maintain 3:4 aspect ratio or similar, or adapt to container
        // Let's go with a fixed aspect ratio suitable for t-shirt design (e.g., 3:4 or 1:1)
        // or just fill width.
        const width = offsetWidth;
        const height = offsetWidth * 1.2; // 4:5 aspect ratio
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas */}
      <div className="flex justify-center w-full" ref={containerRef}>
        <KonvaCanvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#f8f9fa"
          initialImage={initialImage}
          onDesignChange={handleDesignChange}
          isDrawingMode={isDrawingMode}
          brushSize={brushSize}
        />
      </div>

      {/* Toolbar */}
      <CanvasToolbar
        isDrawingMode={isDrawingMode}
        onDrawingModeChange={handleDrawingModeChange}
        brushSize={brushSize}
        onBrushSizeChange={handleBrushSizeChange}
        onAddText={handleAddText}
        onAddRect={handleAddRect}
        onAddCircle={handleAddCircle}
        onDelete={handleDelete}
        onClear={handleClear}
        onUpdateColor={handleUpdateColor}
      />
    </div>
  );
};