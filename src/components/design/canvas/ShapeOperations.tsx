
import React from "react";
import { Button } from "@/components/ui/button";
import { fabric } from "fabric";
import { Circle, Square } from "lucide-react";

interface ShapeOperationsProps {
  currentColor: string;
  addObject: (obj: fabric.Object) => void;
}

const ShapeOperations = ({ currentColor, addObject }: ShapeOperationsProps) => {
  const handleAddCircle = () => {
    const circle = new fabric.Circle({
      radius: 30,
      fill: currentColor,
      left: 100,
      top: 100,
      id: `circle_${Date.now()}`
    });
    addObject(circle as any);
  };

  const handleAddSquare = () => {
    const square = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: '#000000',
      strokeWidth: 2,
      width: 100,
      height: 100,
      id: `square_${Date.now()}`
    } as any);
    addObject(square as any);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleAddCircle}>
        <Circle size={16} className="mr-2" /> Circle
      </Button>
      <Button variant="outline" onClick={handleAddSquare}>
        <Square size={16} className="mr-2" /> Square
      </Button>
    </div>
  );
};

export default ShapeOperations;
