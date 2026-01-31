import { useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface CanvasToolbarProps {
  canvas: fabric.Canvas | null;
  isDrawingMode: boolean;
  onDrawingModeChange: (mode: boolean) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
}

export const CanvasToolbar = ({
  canvas,
  isDrawingMode,
  onDrawingModeChange,
  brushSize,
  onBrushSizeChange,
}: CanvasToolbarProps) => {
  const [textInput, setTextInput] = useState("Sample Text");
  const [selectedColor, setSelectedColor] = useState("#000000");

  const addText = () => {
    if (!canvas) return;

    const fabricText = new fabric.Text(textInput, {
      left: 150,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: selectedColor,
      name: "userText"
    } as any);

    canvas.add(fabricText as any);
    canvas.setActiveObject(fabricText as any);
    canvas.renderAll();
  };

  const addRectangle = () => {
    if (!canvas) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: selectedColor,
      width: 80,
      height: 60,
      name: "userShape"
    } as any);

    canvas.add(rect as any);
    canvas.setActiveObject(rect as any);
    canvas.renderAll();
  };

  const addCircle = () => {
    if (!canvas) return;

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      fill: selectedColor,
      radius: 40,
      name: "userShape"
    } as any);

    canvas.add(circle as any);
    canvas.setActiveObject(circle as any);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.name !== "safetyArea" && activeObject.name !== "mainImage") {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.name !== "safetyArea" && obj.name !== "mainImage") {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  };

  const updateSelectedColor = () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.name !== "safetyArea" && activeObject.name !== "mainImage") {
      activeObject.set('fill', selectedColor);
      canvas.renderAll();
    }
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

        <Button variant="outline" size="sm" onClick={addText}>
          Add Text
        </Button>

        <Button variant="outline" size="sm" onClick={addRectangle}>
          Rectangle
        </Button>

        <Button variant="outline" size="sm" onClick={addCircle}>
          Circle
        </Button>

        <Button variant="destructive" size="sm" onClick={deleteSelected}>
          Delete
        </Button>

        <Button variant="secondary" size="sm" onClick={clearCanvas}>
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
        <Button variant="outline" size="sm" onClick={updateSelectedColor}>
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