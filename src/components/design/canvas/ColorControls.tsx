
import { Palette, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColorControlsProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onDeleteSelected: () => void;
}

const ColorControls = ({ 
  currentColor, 
  onColorChange, 
  onDeleteSelected 
}: ColorControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="color-picker" className="flex items-center gap-2">
        <Palette size={16} />
        <span>Color:</span>
      </label>
      <input
        id="color-picker"
        type="color"
        value={currentColor}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-10 h-10 rounded-md cursor-pointer"
      />
      <Button 
        variant="outline" 
        className="ml-auto flex items-center gap-1" 
        onClick={onDeleteSelected}
      >
        <Trash2 size={16} />
        Delete
      </Button>
    </div>
  );
};

export default ColorControls;
