
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fabric } from "fabric";
import { ArrowDown, Bold, Italic, Underline } from "lucide-react";

interface TextOperationsProps {
  text: string;
  setText: (text: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  isBold: boolean;
  setIsBold: (bold: boolean) => void;
  isItalic: boolean;
  setIsItalic: (italic: boolean) => void;
  isUnderline: boolean;
  setIsUnderline: (underline: boolean) => void;
  currentColor: string;
  addObject: (obj: fabric.Object) => void;
}

const TextOperations = ({
  text,
  setText,
  fontSize,
  setFontSize,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  isUnderline,
  setIsUnderline,
  currentColor,
  addObject
}: TextOperationsProps) => {
  const handleAddText = () => {
    if (!text.trim()) return;
    
    const fabricText = new fabric.Text(text, {
      left: 50,
      top: 50,
      fontFamily: "Arial",
      fontSize,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      underline: isUnderline,
      fill: currentColor,
      id: `text_${Date.now()}`
    });
    
    addObject(fabricText);
    setText("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          className="flex-grow"
        />
        <Button onClick={handleAddText}>Add Text</Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min={8}
            max={72}
            className="w-20"
          />
          <ArrowDown size={16} />
        </div>
        <div className="flex gap-2">
          <Button
            variant={isBold ? "default" : "outline"}
            size="icon"
            onClick={() => setIsBold(!isBold)}
          >
            <Bold size={16} />
          </Button>
          <Button
            variant={isItalic ? "default" : "outline"}
            size="icon"
            onClick={() => setIsItalic(!isItalic)}
          >
            <Italic size={16} />
          </Button>
          <Button
            variant={isUnderline ? "default" : "outline"}
            size="icon"
            onClick={() => setIsUnderline(!isUnderline)}
          >
            <Underline size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextOperations;
