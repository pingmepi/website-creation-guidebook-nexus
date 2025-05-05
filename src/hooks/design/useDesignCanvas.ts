
import { useState, useRef, useCallback, useEffect } from "react";
import { fabric } from "fabric";

export const useDesignCanvas = (
  initialImage?: string,
  onDesignChange?: (dataURL: string) => void
) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [text, setText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(20);
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(2);
  
  // Refs to track state
  const updateInProgressRef = useRef(false);
  const onDesignChangeRef = useRef(onDesignChange);
  
  // Update reference when callback changes
  useEffect(() => {
    onDesignChangeRef.current = onDesignChange;
  }, [onDesignChange]);
  
  // Notify parent of canvas changes
  const notifyDesignChange = useCallback(() => {
    if (!canvas || updateInProgressRef.current) return;
    
    updateInProgressRef.current = true;
    
    setTimeout(() => {
      try {
        if (canvas && onDesignChangeRef.current) {
          const dataURL = canvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 2,
          });
          onDesignChangeRef.current(dataURL);
        }
      } catch (error) {
        console.error("Error generating data URL:", error);
      } finally {
        updateInProgressRef.current = false;
      }
    }, 100);
  }, [canvas]);
  
  // Set canvas reference when ready
  const handleCanvasReady = useCallback((fabricCanvas: fabric.Canvas) => {
    setCanvas(fabricCanvas);
  }, []);
  
  // Handle adding text to canvas
  const handleAddText = useCallback(() => {
    if (!canvas || !text.trim() || updateInProgressRef.current) return;
    
    try {
      updateInProgressRef.current = true;
      
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
      
      canvas.add(fabricText);
      canvas.setActiveObject(fabricText);
      canvas.renderAll();
      setText("");
      
      notifyDesignChange();
    } catch (error) {
      console.error("Error adding text:", error);
    } finally {
      updateInProgressRef.current = false;
    }
  }, [canvas, text, fontSize, isBold, isItalic, isUnderline, currentColor, notifyDesignChange]);
  
  // Handle adding shapes to canvas
  const handleAddCircle = useCallback(() => {
    if (!canvas || updateInProgressRef.current) return;
    
    try {
      updateInProgressRef.current = true;
      
      const circle = new fabric.Circle({
        radius: 30,
        fill: currentColor,
        left: 100,
        top: 100,
        id: `circle_${Date.now()}`
      });
      
      canvas.add(circle);
      canvas.setActiveObject(circle);
      canvas.renderAll();
      
      notifyDesignChange();
    } catch (error) {
      console.error("Error adding circle:", error);
    } finally {
      updateInProgressRef.current = false;
    }
  }, [canvas, currentColor, notifyDesignChange]);
  
  const handleAddSquare = useCallback(() => {
    if (!canvas || updateInProgressRef.current) return;
    
    try {
      updateInProgressRef.current = true;
      
      const square = new fabric.Rect({
        width: 60,
        height: 60,
        fill: currentColor,
        left: 100,
        top: 100,
        id: `square_${Date.now()}`
      });
      
      canvas.add(square);
      canvas.setActiveObject(square);
      canvas.renderAll();
      
      notifyDesignChange();
    } catch (error) {
      console.error("Error adding square:", error);
    } finally {
      updateInProgressRef.current = false;
    }
  }, [canvas, currentColor, notifyDesignChange]);
  
  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas || updateInProgressRef.current) return;
    
    try {
      updateInProgressRef.current = true;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        
        const imgData = event.target.result as string;
        
        // Remove placeholder text if it exists
        const objects = canvas.getObjects();
        const placeholderText = objects.find((obj: any) =>
          obj.type === 'text' &&
          (obj.id === "placeholderText" || obj.text === 'upload your design')
        );
        if (placeholderText) {
          canvas.remove(placeholderText);
        }
        
        // Load the new image
        fabric.Image.fromURL(
          imgData,
          (img: any) => {
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
              
              notifyDesignChange();
            } catch (imgError) {
              console.error("Error processing uploaded image:", imgError);
            } finally {
              updateInProgressRef.current = false;
            }
          }
        );
      };
      reader.onerror = () => {
        updateInProgressRef.current = false;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling file upload:", error);
      updateInProgressRef.current = false;
    }
  }, [canvas, notifyDesignChange]);
  
  // Handle deleting selected objects
  const handleDeleteSelected = useCallback(() => {
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
        canvas.remove(activeObject);
        canvas.renderAll();
        
        notifyDesignChange();
      }
    } catch (error) {
      console.error("Error deleting object:", error);
    } finally {
      updateInProgressRef.current = false;
    }
  }, [canvas, notifyDesignChange]);
  
  // Update drawing mode when it changes
  useEffect(() => {
    if (!canvas) return;
    
    canvas.isDrawingMode = isDrawingMode;
    
    if (isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = currentColor;
    }
    
    canvas.renderAll();
  }, [canvas, isDrawingMode, brushSize, currentColor]);
  
  // Update color of selected objects when color changes
  useEffect(() => {
    if (!canvas || updateInProgressRef.current) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      try {
        updateInProgressRef.current = true;
        
        if (activeObject.type === 'i-text' || activeObject.type === 'text') {
          activeObject.set('fill', currentColor);
        } else if (activeObject.type !== 'image') {
          // Don't change color of images
          activeObject.set('fill', currentColor);
        }
        
        canvas.renderAll();
        notifyDesignChange();
      } catch (error) {
        console.error("Error updating object color:", error);
      } finally {
        updateInProgressRef.current = false;
      }
    }
  }, [canvas, currentColor, notifyDesignChange]);
  
  return {
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
  };
};
