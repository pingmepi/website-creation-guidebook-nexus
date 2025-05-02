
import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Image, Palette, Pencil, Square, Text as TextIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fabric } from "fabric";

// Import our components
import TextTools from "./canvas/TextTools";
import ShapeTools from "./canvas/ShapeTools";
import ImageTools from "./canvas/ImageTools";
import DrawingTools from "./canvas/DrawingTools";
import FabricCanvas from "./canvas/FabricCanvas";
import ToolTab from "./canvas/ToolTab";
import CanvasContainer from "./canvas/CanvasContainer";
import ShapeOperations from "./canvas/ShapeOperations";

interface DesignCanvasProps {
  tshirtColor: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

const DesignCanvas = ({ 
  tshirtColor, 
  initialImage, 
  onDesignChange 
}: DesignCanvasProps) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  
  // State for text editing
  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(20);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  
  // State for uploaded image
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(2);
  
  // Refs to track state
  const updateInProgressRef = useRef(false);
  const onDesignChangeRef = useRef(onDesignChange);
  
  // Create stable reference to callback
  useState(() => {
    onDesignChangeRef.current = onDesignChange;
  });
  
  const handleAddText = () => {
    if (!canvas || !text.trim() || updateInProgressRef.current) return;

    try {
      console.log("Adding text element");
      updateInProgressRef.current = true;

      // Create the text
      const fabricText = new fabric.Text(text, {
        left: 50,
        top: 50,
        fontFamily: "Arial",
        fontSize,
        fontWeight: isBold ? "bold" : "normal",
        fontStyle: isItalic ? "italic" : "normal",
        underline: isUnderline,
        fill: currentColor,
        id: `text_${Date.now()}` // Add unique ID
      });

      // Add the text to canvas
      canvas.add(fabricText);
      canvas.setActiveObject(fabricText);
      canvas.renderAll();
      setText("");
      
      updateInProgressRef.current = false;
    } catch (error) {
      console.error("Error adding text:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleAddCircle = () => {
    if (!canvas || updateInProgressRef.current) return;

    try {
      updateInProgressRef.current = true;

      // Create the circle
      const circle = new fabric.Circle({
        radius: 30,
        fill: currentColor,
        left: 100,
        top: 100,
        id: `circle_${Date.now()}`
      });

      // Add the circle to canvas
      canvas.add(circle);
      canvas.setActiveObject(circle);
      canvas.renderAll();
      
      updateInProgressRef.current = false;
    } catch (error) {
      console.error("Error adding circle:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleAddSquare = () => {
    if (!canvas || updateInProgressRef.current) return;

    try {
      updateInProgressRef.current = true;

      // Create the square
      const square = new fabric.Rect({
        width: 60,
        height: 60,
        fill: currentColor,
        left: 100,
        top: 100,
        id: `square_${Date.now()}`
      });

      // Add the square to canvas
      canvas.add(square);
      canvas.setActiveObject(square);
      canvas.renderAll();
      
      updateInProgressRef.current = false;
    } catch (error) {
      console.error("Error adding square:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleDeleteSelected = () => {
    if (!canvas || updateInProgressRef.current) return;

    try {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        // Don't allow deleting safety area
        if (activeObject.id === "safetyArea") {
          console.warn("Cannot delete safety area");
          return;
        }

        updateInProgressRef.current = true;
        console.log(`Deleting object: ${activeObject.type} (id: ${activeObject.id})`);
        canvas.remove(activeObject);
        canvas.renderAll();
        
        updateInProgressRef.current = false;
      }
    } catch (error) {
      console.error("Error deleting object:", error);
      updateInProgressRef.current = false;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas || updateInProgressRef.current) return;

    console.log("Processing uploaded image");
    updateInProgressRef.current = true;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imgData = event.target?.result as string;
          setUploadedImage(imgData);

          // Remove placeholder text if it exists
          const objects = canvas.getObjects();
          const placeholderText = objects.find((obj: any) =>
            obj.type === 'text' &&
            (obj.id === "placeholderText" || (obj as any).text === 'upload your design')
          );
          if (placeholderText) {
            canvas.remove(placeholderText);
          }

          // Now add the new image
          fabric.Image.fromURL(imgData, (img: any) => {
            try {
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
                originY: 'center',
                id: "uploadedImage"
              });

              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();
              console.log("Uploaded image added to canvas");
            } catch (imgError) {
              console.error("Error processing uploaded image:", imgError);
            } finally {
              updateInProgressRef.current = false;
            }
          });
        } catch (error) {
          console.error("Error processing image data:", error);
          updateInProgressRef.current = false;
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        updateInProgressRef.current = false;
      };
      reader.readAsDataURL(file);
    } catch (fileError) {
      console.error("Error handling file upload:", fileError);
      updateInProgressRef.current = false;
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
  
  // Track the design changes from the canvas
  const handleDesignUpdate = (dataURL: string) => {
    console.log("Design updated in DesignCanvas component");
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
          <ShapeOperations
            currentColor={currentColor}
            addObject={(obj) => {
              if (canvas) {
                canvas.add(obj);
                canvas.setActiveObject(obj);
                canvas.renderAll();
              }
            }}
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

      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="color-picker" className="flex items-center gap-2">
          <Palette size={16} />
          <span>Color:</span>
        </label>
        <input
          id="color-picker"
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="w-10 h-10 rounded-md cursor-pointer"
        />
        <Button
          variant="outline"
          className="ml-auto flex items-center gap-1"
          onClick={handleDeleteSelected}
        >
          <Trash2 size={16} />
          Delete
        </Button>
      </div>

      <CanvasContainer>
        <FabricCanvas
          initialImage={initialImage}
          onDesignChange={handleDesignUpdate}
          isDrawingMode={isDrawingMode}
          brushSize={brushSize}
          onCanvasReady={setCanvas}
        />
      </CanvasContainer>
    </div>
  );
};

export default DesignCanvas;
