
import { Button } from "@/components/ui/button";
import { Circle, Square } from "lucide-react";

interface ShapeToolsProps {
  onAddCircle: () => void;
  onAddSquare: () => void;
}

const ShapeTools = ({ onAddCircle, onAddSquare }: ShapeToolsProps) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onAddCircle}>
        <Circle size={16} className="mr-2" /> Circle
      </Button>
      <Button variant="outline" onClick={onAddSquare}>
        <Square size={16} className="mr-2" /> Square
      </Button>
    </div>
  );
};

export default ShapeTools;
