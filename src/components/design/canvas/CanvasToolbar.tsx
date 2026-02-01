import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface CanvasToolbarProps {
  isDrawingMode: boolean;
  onDrawingModeChange: (mode: boolean) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onAddText: (text: string, color: string) => void;
  onAddRect: (color: string) => void;
  onAddCircle: (color: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onUpdateColor: (color: string) => void;
}

export const CanvasToolbar = ({
  isDrawingMode,
  onDrawingModeChange,
  brushSize,
  onBrushSizeChange,
  onAddText,
  onAddRect,
  onAddCircle,
  onDelete,
  onClear,
  onUpdateColor
}: CanvasToolbarProps) => {
  const [textInput, setTextInput] = useState("Sample Text");
  const [selectedColor, setSelectedColor] = useState("#000000");

  const handleAddText = () => {
    onAddText(textInput, selectedColor);
  };

  const handleAddRectangle = () => {
    onAddRect(selectedColor);
  };

  const handleAddCircle = () => {
    onAddCircle(selectedColor);
  };

  const handleUpdateColor = () => {
    onUpdateColor(selectedColor);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Drawing Tools */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isDrawingMode ? "default" : "outline"}
          size="sm"
          onClick={() => onDrawingModeChange(!isDrawingMode)}
        >
          {isDrawingMode ? "Exit Draw" : "Draw"}
        </Button>

        <Button variant="outline" size="sm" onClick={handleAddText}>
          Add Text
        </Button>

        <Button variant="outline" size="sm" onClick={handleAddRectangle}>
          Rectangle
        </Button>

        <Button variant="outline" size="sm" onClick={handleAddCircle}>
          Circle
        </Button>

        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>

        <Button variant="secondary" size="sm" onClick={onClear}>
          Clear All
        </Button>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Color:</label>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-8 h-8 rounded border"
        />
        <Button variant="outline" size="sm" onClick={handleUpdateColor}>
          Apply Color
        </Button>
      </div>

      {/* Text Input */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Text:</label>
        <Input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter text..."
          className="flex-1"
        />
      </div>

      {/* Brush Size for Drawing */}
      {isDrawingMode && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Brush Size:</label>
          <Slider
            value={[brushSize]}
            onValueChange={(values) => onBrushSizeChange(values[0])}
            max={20}
            min={1}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-gray-500">{brushSize}px</span>
        </div>
      )}
    </div>
  );
};