import React, { useRef, useState, useCallback } from "react";
import FabricCanvas from "./FabricCanvas";
import { fabric } from "fabric";

interface CanvasManagerProps {
  tshirtColor: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

const CanvasManager = ({ tshirtColor, initialImage, onDesignChange }: CanvasManagerProps) => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushSize, setBrushSize] = useState(2);

  const handleCanvasReady = useCallback((canvas: fabric.Canvas) => {
    canvasRef.current = canvas;
  }, []);

  const handleDesignChange = useCallback((dataURL: string) => {
    if (onDesignChange) {
      onDesignChange(dataURL);
    }
  }, [onDesignChange]);

  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const objects = canvasRef.current.getObjects();
      // Keep only the safety area
      objects.forEach(obj => {
        if ((obj as any).id !== "safetyArea") {
          canvasRef.current?.remove(obj);
        }
      });
      canvasRef.current.renderAll();
    }
  };

  const addText = (text: string) => {
    if (canvasRef.current) {
      const fabricText = new fabric.Text(text, {
        left: 150,
        top: 150,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: '#000000'
      });
      canvasRef.current.add(fabricText as any);
      canvasRef.current.setActiveObject(fabricText as any);
    }
  };

  const addShape = (type: 'rectangle' | 'circle') => {
    if (!canvasRef.current) return;

    let shape: any;
    if (type === 'rectangle') {
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        fill: '#000000',
        width: 100,
        height: 100,
      });
    } else {
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        fill: '#000000',
        radius: 50,
      });
    }

    canvasRef.current.add(shape as any);
    canvasRef.current.setActiveObject(shape as any);
  };

  const deleteSelected = () => {
    if (canvasRef.current) {
      const activeObject = canvasRef.current.getActiveObject();
      if (activeObject && (activeObject as any).id !== "safetyArea") {
        canvasRef.current.remove(activeObject as any);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas Tools */}
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
        <button
          onClick={toggleDrawingMode}
          className={`px-3 py-1 rounded text-sm ${isDrawingMode ? 'bg-blue-500 text-white' : 'bg-white border'
            }`}
        >
          {isDrawingMode ? 'Exit Draw' : 'Draw'}
        </button>

        <button
          onClick={() => addText('Sample Text')}
          className="px-3 py-1 rounded text-sm bg-white border"
        >
          Add Text
        </button>

        <button
          onClick={() => addShape('rectangle')}
          className="px-3 py-1 rounded text-sm bg-white border"
        >
          Rectangle
        </button>

        <button
          onClick={() => addShape('circle')}
          className="px-3 py-1 rounded text-sm bg-white border"
        >
          Circle
        </button>

        <button
          onClick={deleteSelected}
          className="px-3 py-1 rounded text-sm bg-red-500 text-white"
        >
          Delete
        </button>

        <button
          onClick={clearCanvas}
          className="px-3 py-1 rounded text-sm bg-gray-500 text-white"
        >
          Clear
        </button>

        {isDrawingMode && (
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="ml-2"
          />
        )}
      </div>

      {/* Canvas Component */}
      <div className="border rounded-md p-2 bg-white">
        <FabricCanvas
          onCanvasReady={handleCanvasReady}
          onDesignChange={handleDesignChange}
          initialImage={initialImage}
          isDrawingMode={isDrawingMode}
          brushSize={brushSize}
        />
      </div>
    </div>
  );
};

export default CanvasManager;
