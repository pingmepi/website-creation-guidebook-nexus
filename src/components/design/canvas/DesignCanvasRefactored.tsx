
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Pencil, Square, Text as TextIcon } from "lucide-react";
import { useDesignCanvas } from "@/hooks/design/useDesignCanvas";
import FabricCanvas from "./FabricCanvas";
import TextTools from "./TextTools";
import ShapeTools from "./ShapeTools";
import ImageTools from "./ImageTools";
import DrawingTools from "./DrawingTools";
import ColorControls from "./ColorControls";

interface DesignCanvasProps {
  tshirtColor: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

const DesignCanvasRefactored = ({ 
  tshirtColor, 
  initialImage, 
  onDesignChange 
}: DesignCanvasProps) => {
  const {
    canvas,
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
    setCurrentColor,
    isDrawingMode,
    setIsDrawingMode,
    brushSize,
    setBrushSize,
    handleAddText,
    handleAddCircle,
    handleAddSquare,
    handleImageUpload,
    handleDeleteSelected,
    handleCanvasReady
  } = useDesignCanvas(initialImage, onDesignChange);
  
  const handleToggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };
  
  const handleBrushSizeChange = (newValue: number[]) => {
    setBrushSize(newValue[0]);
  };
  
  const handleClearCanvas = () => {
    // Not implemented yet
    console.log("Clear canvas requested");
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="text">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="text" className="flex gap-2 items-center">
            <TextIcon size={16} />
            Text
          </TabsTrigger>
          <TabsTrigger value="shapes" className="flex gap-2 items-center">
            <Square size={16} />
            Shapes
          </TabsTrigger>
          <TabsTrigger value="image" className="flex gap-2 items-center">
            <Image size={16} />
            Image
          </TabsTrigger>
          <TabsTrigger value="drawing" className="flex gap-2 items-center">
            <Pencil size={16} />
            Draw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4 py-4">
          <TextTools
            text={text}
            setText={setText}
            fontSize={fontSize}
            setFontSize={setFontSize}
            isBold={isBold}
            setIsBold={setIsBold}
            isItalic={isItalic}
            setIsItalic={setIsItalic}
            isUnderline={isUnderline}
            setIsUnderline={setIsUnderline}
            onAddText={handleAddText}
          />
        </TabsContent>

        <TabsContent value="shapes" className="py-4">
          <ShapeTools
            onAddCircle={handleAddCircle}
            onAddSquare={handleAddSquare}
          />
        </TabsContent>

        <TabsContent value="image" className="py-4">
          <ImageTools 
            onImageUpload={handleImageUpload} 
          />
        </TabsContent>

        <TabsContent value="drawing" className="py-4">
          <DrawingTools
            isDrawingMode={isDrawingMode}
            onToggleDrawingMode={handleToggleDrawingMode}
            brushSize={brushSize}
            onBrushSizeChange={handleBrushSizeChange}
            onClearCanvas={handleClearCanvas}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <ColorControls
          currentColor={currentColor}
          onColorChange={setCurrentColor}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>

      <div className="mt-6 flex justify-center">
        <FabricCanvas
          width={300}
          height={300}
          backgroundColor="#f0f0f0"
          onCanvasReady={handleCanvasReady}
          onDesignChange={onDesignChange}
          initialImage={initialImage}
          isDrawingMode={isDrawingMode}
          brushSize={brushSize}
        />
      </div>
    </div>
  );
};

export default DesignCanvasRefactored;
