
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Palette, Pencil, Square, Text as TextIcon } from "lucide-react";

// Import our components
import TextTools from "./canvas/TextTools";
import ShapeTools from "./canvas/ShapeTools";
import ImageTools from "./canvas/ImageTools";
import DrawingTools from "./canvas/DrawingTools";
import ColorControls from "./canvas/ColorControls";
import FabricCanvas from "./canvas/FabricCanvas";
import ToolTab from "./canvas/ToolTab";
import CanvasContainer from "./canvas/CanvasContainer";

interface DesignCanvasProps {
  tshirtColor: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

const DesignCanvas = ({ tshirtColor, initialImage, onDesignChange }: DesignCanvasProps) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(20);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const initialImageRef = useRef<string | undefined>(initialImage);
  
  // Drawing tool states
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(3);
  
  // Update the ref when initialImage changes
  useEffect(() => {
    initialImageRef.current = initialImage;
  }, [initialImage]);
  
  const handleAddText = () => {
    if (!canvas || !text.trim()) return;

    const fabricText = new fabric.Text(text, {
      left: 50,
      top: 50,
      fontFamily: "Arial",
      fontSize,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      underline: isUnderline,
      fill: currentColor,
    });

    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
    canvas.renderAll();
    setText("");
  };

  const handleAddCircle = () => {
    if (!canvas) return;
    const circle = new fabric.Circle({
      radius: 30,
      fill: currentColor,
      left: 100,
      top: 100,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.renderAll();
  };

  const handleAddSquare = () => {
    if (!canvas) return;
    const square = new fabric.Rect({
      width: 60,
      height: 60,
      fill: currentColor,
      left: 100,
      top: 100,
    });
    canvas.add(square);
    canvas.setActiveObject(square);
    canvas.renderAll();
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgData = event.target?.result as string;
        
        fabric.Image.fromURL(imgData, (img) => {
          // Scale image to fit within the canvas
          const canvasWidth = canvas.width || 300;
          const canvasHeight = canvas.height || 300;
          
          const scaleFactor = Math.min(
            (canvasWidth - 40) / img.width!,
            (canvasHeight - 40) / img.height!
          );
          
          img.scale(scaleFactor);
          img.set({
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: 'center',
            originY: 'center'
          });
          
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to toggle drawing mode
  const handleToggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };
  
  // Function to handle brush size changes
  const handleBrushSizeChange = (values: number[]) => {
    if (values.length > 0) {
      setBrushSize(values[0]);
    }
  };
  
  // Function to clear canvas (except safety rectangle)
  const handleClearCanvas = () => {
    if (!canvas) return;
    
    canvas.getObjects().forEach(obj => {
      if (obj.stroke !== "#5cb85c") { // Keep only the safety area rectangle
        canvas.remove(obj);
      }
    });
    
    canvas.renderAll();
  };

  // Function to update color of selected objects when color changes
  useEffect(() => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'i-text' || activeObject.type === 'text') {
        (activeObject as fabric.Text).set('fill', currentColor);
      } else {
        activeObject.set('fill', currentColor);
      }
      canvas.renderAll();
    }
  }, [currentColor, canvas]);

  // Calculate canvas size based on container width
  const getCanvasSize = () => {
    if (!canvasContainerRef.current) return 300;
    const containerWidth = canvasContainerRef.current.clientWidth || 300;
    return Math.min(containerWidth, 300); // Max width of design area
  };

  // Pass the design changes directly to the parent component
  const handleDesignChange = (dataURL: string) => {
    console.log("Design changed, notifying parent");
    if (onDesignChange) {
      onDesignChange(dataURL);
    }
  };

  return (
    <div className="w-full" ref={canvasContainerRef}>
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
        
        <ToolTab value="text">
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
        </ToolTab>
        
        <ToolTab value="shapes">
          <ShapeTools
            onAddCircle={handleAddCircle}
            onAddSquare={handleAddSquare}
          />
        </ToolTab>
        
        <ToolTab value="image">
          <ImageTools onImageUpload={handleImageUpload} />
        </ToolTab>

        <ToolTab value="drawing">
          <DrawingTools 
            isDrawingMode={isDrawingMode}
            onToggleDrawingMode={handleToggleDrawingMode}
            brushSize={brushSize}
            onBrushSizeChange={handleBrushSizeChange}
            onClearCanvas={handleClearCanvas}
          />
        </ToolTab>
      </Tabs>
      
      <div className="mt-4">
        <ColorControls 
          currentColor={currentColor}
          onColorChange={setCurrentColor}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>

      <CanvasContainer>
        <FabricCanvas
          width={getCanvasSize()}
          height={getCanvasSize()}
          backgroundColor="#f0f0f0"
          onCanvasReady={setCanvas}
          onDesignChange={handleDesignChange}
          initialImage={initialImage}
          isDrawingMode={isDrawingMode}
          brushSize={brushSize}
        />
      </CanvasContainer>
    </div>
  );
};

export default DesignCanvas;
