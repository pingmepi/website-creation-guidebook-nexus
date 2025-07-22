
import { useRef } from "react";
import { fabric } from "fabric";

interface CanvasObjectManagerProps {
  canvas: fabric.Canvas | null;
  onDesignChange?: () => void;
}

export const useCanvasObjectManager = ({
  canvas,
  onDesignChange
}: CanvasObjectManagerProps) => {
  const updateInProgressRef = useRef(false);

  // Add object to canvas helper
  const addObject = (obj: fabric.Object) => {
    if (!canvas || updateInProgressRef.current) return;
    
    try {
      updateInProgressRef.current = true;
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.renderAll();
      
      if (onDesignChange) {
        onDesignChange();
      }
    } catch (error) {
      console.error("Error adding object to canvas:", error);
    } finally {
      updateInProgressRef.current = false;
    }
  };

  // Helper methods for object manipulation
  const updateActiveObject = (property: string, value: unknown) => {
    if (!canvas || updateInProgressRef.current) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      try {
        updateInProgressRef.current = true;
        activeObject.set({ [property]: value });
        canvas.renderAll();
        
        if (onDesignChange) {
          onDesignChange();
        }
      } catch (error) {
        console.error(`Error updating ${property}:`, error);
      } finally {
        updateInProgressRef.current = false;
      }
    }
  };
  
  const deleteActiveObject = () => {
    if (!canvas || updateInProgressRef.current) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.id !== "safetyArea") {
      try {
        updateInProgressRef.current = true;
        canvas.remove(activeObject);
        canvas.renderAll();
        
        if (onDesignChange) {
          onDesignChange();
        }
      } catch (error) {
        console.error("Error deleting object:", error);
      } finally {
        updateInProgressRef.current = false;
      }
    }
  };

  return {
    addObject,
    updateActiveObject,
    deleteActiveObject
  };
};
