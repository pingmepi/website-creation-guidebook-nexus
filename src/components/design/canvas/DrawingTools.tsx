
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface DrawingToolsProps {
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  brushSize: number;
  onBrushSizeChange: (value: number[]) => void;
  onClearCanvas: () => void;
}

const DrawingTools = ({
  isDrawingMode,
  onToggleDrawingMode,
  brushSize,
  onBrushSizeChange,
  onClearCanvas
}: DrawingToolsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button 
          variant={isDrawingMode ? "default" : "outline"}
          onClick={onToggleDrawingMode}
          className="flex items-center gap-2"
        >
          <Pencil size={16} />
          {isDrawingMode ? "Drawing Mode On" : "Start Drawing"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onClearCanvas}
          className="flex items-center gap-2"
        >
          <Eraser size={16} />
          Clear Drawing
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Brush Size: {brushSize}px</span>
        </div>
        <Slider
          value={[brushSize]}
          min={1}
          max={20}
          step={1}
          onValueChange={onBrushSizeChange}
          disabled={!isDrawingMode}
        />
      </div>
    </div>
  );
};

export default DrawingTools;
