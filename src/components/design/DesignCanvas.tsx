
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Circle,
  Image,
  Palette,
  Pencil,
  Square,
  Text as TextIcon,
  Bold,
  Italic,
  Underline,
  ArrowDown,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DesignCanvasProps {
  tshirtColor: string;
  onDesignChange?: (dataURL: string) => void;
}

const DesignCanvas = ({ tshirtColor, onDesignChange }: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(20);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Calculate dimensions based on the t-shirt mockup
    const containerWidth = canvasContainerRef.current?.clientWidth || 300;
    const canvasSize = Math.min(containerWidth, 300); // Max width of design area

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: canvasSize,
      height: canvasSize,
      backgroundColor: "#f0f0f0", // Light gray background for design area
    });

    setCanvas(fabricCanvas);

    // Add guides to show printable area boundaries
    const createGuide = (coords: { x1: number; y1: number; x2: number; y2: number }) => {
      return new fabric.Line([coords.x1, coords.y1, coords.x2, coords.y2], {
        stroke: "#aaaaaa",
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
      });
    };

    // Add dashed rectangle for safety area
    const safetyAreaRect = new fabric.Rect({
      width: canvasSize - 20,
      height: canvasSize - 20,
      left: 10,
      top: 10,
      stroke: "#5cb85c", // green for safety area
      strokeDashArray: [5, 5],
      fill: "transparent",
      selectable: false,
      evented: false,
    });
    fabricCanvas.add(safetyAreaRect);

    // Add placeholder text
    const placeholderText = new fabric.Text("upload your design", {
      left: canvasSize / 2,
      top: canvasSize / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Arial',
      fontSize: 20,
      fill: '#999999',
      selectable: false,
      evented: false,
    });
    fabricCanvas.add(placeholderText);

    // Add color change listener to update selected objects
    fabricCanvas.on('selection:created', updateSelectedObjectColor);
    fabricCanvas.on('selection:updated', updateSelectedObjectColor);

    // Cleanup on component unmount
    return () => {
      fabricCanvas.off('selection:created', updateSelectedObjectColor);
      fabricCanvas.off('selection:updated', updateSelectedObjectColor);
      fabricCanvas.dispose();
    };
  }, []);

  // Function to update color of selected objects when color changes
  const updateSelectedObjectColor = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === 'i-text' || activeObject.type === 'text') {
        (activeObject as fabric.Text).set('fill', currentColor);
      } else {
        activeObject.set('fill', currentColor);
      }
      canvas.renderAll();
      
      // Update design preview
      if (onDesignChange) {
        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });
        onDesignChange(dataURL);
      }
    }
  };

  // Update canvas when the t-shirt color changes
  useEffect(() => {
    if (!canvas) return;
    canvas.renderAll();
  }, [tshirtColor, canvas]);

  // Update selected object when color changes
  useEffect(() => {
    if (!canvas) return;
    updateSelectedObjectColor();
  }, [currentColor, canvas]);

  // Notify parent when design changes
  useEffect(() => {
    if (!canvas) return;

    const updateDesign = () => {
      if (canvas && onDesignChange) {
        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2, // Higher resolution
        });
        onDesignChange(dataURL);
      }
    };

    // Listen for canvas changes
    canvas.on("object:modified", updateDesign);
    canvas.on("object:added", updateDesign);
    canvas.on("object:removed", updateDesign);

    return () => {
      canvas.off("object:modified", updateDesign);
      canvas.off("object:added", updateDesign);
      canvas.off("object:removed", updateDesign);
    };
  }, [canvas, onDesignChange]);

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
  };

  const handleDeleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgData = event.target?.result as string;
        setUploadedImage(imgData);
        
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
        </TabsContent>
        
        <TabsContent value="shapes" className="py-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddCircle}>
              <Circle size={16} className="mr-2" /> Circle
            </Button>
            <Button variant="outline" onClick={handleAddSquare}>
              <Square size={16} className="mr-2" /> Square
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="py-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </TabsContent>

        <TabsContent value="drawing" className="py-4">
          <p className="text-sm text-muted-foreground">Drawing tools coming soon</p>
        </TabsContent>
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
        <Button variant="outline" className="ml-auto" onClick={handleDeleteSelected}>
          Delete Selected
        </Button>
      </div>

      <div className="mt-6 relative flex justify-center">
        <div 
          ref={canvasContainerRef}
          className="canvas-container relative border border-gray-300 shadow-md mb-4"
        >
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};

export default DesignCanvas;
