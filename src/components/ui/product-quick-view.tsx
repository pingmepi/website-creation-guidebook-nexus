import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [selectedSize, setSelectedSize] = useState("M");
  
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
            
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground text-sm">
                Premium quality t-shirt made from 100% cotton. Comfortable fit with excellent durability and softness.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Size</h4>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                </SelectContent>
              </Select>
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