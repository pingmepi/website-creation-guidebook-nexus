
import { useEffect, useRef } from "react";
import { fabric } from "fabric";

interface CanvasEventHandlersProps {
  canvas: fabric.Canvas | null;
  onDesignChange?: (dataURL: string) => void;
}

export const useCanvasEventHandlers = ({
  canvas,
  onDesignChange
}: CanvasEventHandlersProps) => {
  const updateInProgressRef = useRef(false);
  const isGeneratingDataURLRef = useRef(false);
  const onDesignChangeRef = useRef(onDesignChange);
  
  // Update reference when callback changes
  useEffect(() => {
    onDesignChangeRef.current = onDesignChange;
  }, [onDesignChange]);

  // Function to handle canvas changes
  const handleCanvasChange = () => {
    if (!updateInProgressRef.current && canvas) {
      updateInProgressRef.current = true;
      
      setTimeout(() => {
        try {
          if (onDesignChangeRef.current && canvas) {
            isGeneratingDataURLRef.current = true;
            
            const dataURL = canvas.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 2,
            });
            
            onDesignChangeRef.current(dataURL);
            
            setTimeout(() => {
              isGeneratingDataURLRef.current = false;
            }, 100);
          }
        } catch (error) {
          console.error("Error generating data URL:", error);
          isGeneratingDataURLRef.current = false;
        } finally {
          updateInProgressRef.current = false;
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (!canvas) return;

    canvas.on('object:modified', handleCanvasChange);
    canvas.on('object:added', handleCanvasChange);
    canvas.on('object:removed', handleCanvasChange);

    return () => {
      try {
        canvas.off('object:modified', handleCanvasChange);
        canvas.off('object:added', handleCanvasChange);
        canvas.off('object:removed', handleCanvasChange);
      } catch (error) {
        console.error("Error removing event listeners:", error);
      }
    };
  }, [canvas]);

  return {
    handleCanvasChange,
    updateInProgressRef,
    isGeneratingDataURLRef
  };
};
