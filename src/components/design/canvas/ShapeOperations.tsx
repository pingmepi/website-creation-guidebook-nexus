
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
    addObject(circle);
  };

  const handleAddSquare = () => {
    const square = new fabric.Rect({
      width: 60,
      height: 60,
      fill: currentColor,
      left: 100,
      top: 100,
      id: `square_${Date.now()}`
    });
    addObject(square);
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
