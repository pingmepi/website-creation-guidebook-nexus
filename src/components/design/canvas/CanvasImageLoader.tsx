
import { useEffect, useRef } from "react";
import { fabric } from "fabric";

interface CanvasImageLoaderProps {
  canvas: fabric.Canvas | null;
  initialImage?: string;
  onImageLoaded?: () => void;
}

export const useCanvasImageLoader = ({
  canvas,
  initialImage,
  onImageLoaded
}: CanvasImageLoaderProps) => {
  const lastProcessedImageRef = useRef<string | null>(null);
  const initialImageLoadedRef = useRef(false);
  const updateInProgressRef = useRef(false);
  const isGeneratingDataURLRef = useRef(false);

  useEffect(() => {
    if (isGeneratingDataURLRef.current || !canvas || !initialImage || updateInProgressRef.current) return;
    
    if (lastProcessedImageRef.current === initialImage) {
      console.log("Skipping duplicate image processing");
      return;
    }

    if (initialImageLoadedRef.current && initialImage.startsWith('data:image/png;base64,')) {
      console.log("Skipping canvas-generated image update");
      return;
    }

    console.log("Processing initial image");
    lastProcessedImageRef.current = initialImage;
    updateInProgressRef.current = true;

    try {
      // Remove placeholder text if it exists
      const objects = canvas.getObjects();
      const placeholderText = objects.find((obj: fabric.Object) =>
        obj.type === 'text' &&
        (obj.id === "placeholderText" || obj.text === 'upload your design')
      );
      if (placeholderText) {
        canvas.remove(placeholderText);
      }

      // Clear existing images
      const existingImages = objects.filter((obj: fabric.Object) => obj.type === 'image');
      if (existingImages.length > 0) {
        console.log(`Removing ${existingImages.length} existing images`);
        existingImages.forEach((img: fabric.Object) => canvas.remove(img));
      }

      // Load the image
      fabric.Image.fromURL(
        initialImage,
        (img: fabric.Object) => {
          try {
            if (!img || !img.width || !img.height) {
              console.error("Loaded image is invalid");
              updateInProgressRef.current = false;
              return;
            }

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
              id: "initialImage"
            });

            canvas.add(img);
            canvas.renderAll();
            initialImageLoadedRef.current = true;
            
            if (onImageLoaded) {
              onImageLoaded();
            }
          } catch (error) {
            console.error("Error processing image:", error);
          } finally {
            updateInProgressRef.current = false;
          }
        },
        { crossOrigin: 'anonymous' }
      );
    } catch (error) {
      console.error("Error in initialImage effect:", error);
      updateInProgressRef.current = false;
    }
  }, [canvas, initialImage, onImageLoaded]);

  return {
    isProcessingImage: updateInProgressRef.current
  };
};
