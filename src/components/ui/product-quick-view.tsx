import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ReactNode, useState } from "react";

interface ProductQuickViewProps {
  children: ReactNode;
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
    colorOptions?: string[];
  };
  onAddToCart: () => void;
}

export const ProductQuickView = ({ children, product, onAddToCart }: ProductQuickViewProps) => {
  const [selectedColor, setSelectedColor] = useState(product.colorOptions?.[0] || "#FFFFFF");
  
  const getColorName = (color: string) => {
    const colorNames: Record<string, string> = {
      "#FFFFFF": "White",
      "#000000": "Black", 
      "#DC2626": "Red",
      "#0000FF": "Blue",
      "#8A898C": "Grey"
    };
    return colorNames[color] || "Color";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-2xl font-bold text-primary mt-2">{product.price}</p>
            </div>
            
            <Button 
              onClick={onAddToCart}
              className="w-full flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};