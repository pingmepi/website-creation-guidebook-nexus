import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart } from "lucide-react";
import { ReactNode, useState } from "react";
import { useProductVariants } from "@/hooks/useProductVariants";
import { toast } from "@/hooks/use-toast";

interface ProductQuickViewProps {
  children: ReactNode;
  product: {
    id: string;
    name: string;
    price: string;
    image: string;
    colorOptions?: string[];
  };
  onAddToCart: (variantId: string, quantity?: number) => void;
}

export const ProductQuickView = ({ children, product, onAddToCart }: ProductQuickViewProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        {isOpen && (
          <ProductQuickViewContent
            product={product}
            onAddToCart={(variantId, quantity) => {
              onAddToCart(variantId, quantity);
              setIsOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

const ProductQuickViewContent = ({ product, onAddToCart }: Omit<ProductQuickViewProps, "children">) => {
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { sizes, colors, loading, selectedSize, setSelectedSize, checkStock } = useProductVariants(product.id);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }

    const selectedVariant = colors.find(color =>
      selectedColor ? color.color_hex === selectedColor : color.variant_id
    );

    if (!selectedVariant) {
      toast({
        title: "Product not available",
        description: "Selected size/color combination is not available",
        variant: "destructive"
      });
      return;
    }

    // Check stock before adding to cart
    const hasStock = await checkStock(selectedVariant.variant_id, quantity);
    if (!hasStock) {
      toast({
        title: "Out of stock",
        description: "This item is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    onAddToCart(selectedVariant.variant_id, quantity);
  };

  return (
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
          <Select value={selectedSize} onValueChange={setSelectedSize} disabled={loading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loading ? "Loading sizes..." : "Select size"} />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem
                  key={size.size}
                  value={size.size}
                  disabled={size.available_stock === 0}
                >
                  {size.size} {size.available_stock === 0 ? "(Out of Stock)" : `(${size.available_stock} available)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSize && colors.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Color</h4>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem
                    key={color.variant_id}
                    value={color.color_hex}
                    disabled={color.stock_quantity === 0}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.color_hex }}
                      />
                      {color.color_name} ({color.stock_quantity} available)
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <h4 className="font-medium mb-2">Quantity</h4>
          <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full flex items-center gap-2"
          disabled={!selectedSize || loading}
        >
          <ShoppingCart size={20} />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};