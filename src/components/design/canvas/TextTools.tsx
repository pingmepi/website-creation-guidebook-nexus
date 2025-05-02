
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowDown, Bold, Italic, Underline } from "lucide-react";

interface TextToolsProps {
  text: string;
  setText: (text: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  isBold: boolean;
  setIsBold: (isBold: boolean) => void;
  isItalic: boolean;
  setIsItalic: (isItalic: boolean) => void;
  isUnderline: boolean;
  setIsUnderline: (isUnderline: boolean) => void;
  onAddText: () => void;
}

const TextTools = ({
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
  onAddText,
}: TextToolsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
          className="flex-grow"
        />
        <Button onClick={onAddText}>Add Text</Button>
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

export default TextTools;
