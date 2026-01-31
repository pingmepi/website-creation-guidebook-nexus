import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

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
        <VisuallyHidden.Root>
          <DialogTitle>{alt}</DialogTitle>
        </VisuallyHidden.Root>
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