import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ReactNode } from "react";

interface ImagePopupProps {
  children: ReactNode;
  image: string;
  alt: string;
}

export const ImagePopup = ({ children, image, alt }: ImagePopupProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] p-0">
        <div className="relative">
          <img 
            src={image} 
            alt={alt}
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};