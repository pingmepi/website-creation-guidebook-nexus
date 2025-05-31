
import CanvasContainer from "./CanvasContainer";
import { useCanvasCore } from "./CanvasCore";
import { useCanvasEventHandlers } from "./CanvasEventHandlers";
import { useCanvasImageLoader } from "./CanvasImageLoader";
import { useCanvasObjectManager } from "./CanvasObjectManager";

interface CanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  initialImage?: string;
  onDesignChange?: (dataURL: string) => void;
}

const Canvas = ({
  width = 300,
  height = 300,
  backgroundColor = "#f0f0f0",
  initialImage,
  onDesignChange
}: CanvasProps) => {
  
  // Initialize canvas core
  const { canvasRef, canvas } = useCanvasCore({
    width,
    height,
    backgroundColor,
    onCanvasReady: () => {
      console.log("Canvas ready");
    }
  });

  // Set up event handlers
  const { handleCanvasChange } = useCanvasEventHandlers({
    canvas,
    onDesignChange
  });

  // Handle image loading
  useCanvasImageLoader({
    canvas,
    initialImage,
    onImageLoaded: handleCanvasChange
  });

  // Object management
  const { addObject, updateActiveObject, deleteActiveObject } = useCanvasObjectManager({
    canvas,
    onDesignChange: handleCanvasChange
  });

  return {
    canvasRef,
    canvas,
    addObject,
    updateActiveObject,
    deleteActiveObject,
  };
};

export default Canvas;
