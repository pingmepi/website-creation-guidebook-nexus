
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";

interface TshirtCardProps {
  id: number;
  name: string;
  price: string;
  image: string;
  colorOptions?: string[];
}

const TshirtCard = ({ id, name, price, image, colorOptions = ["#FFFFFF", "#000000", "#DC2626"] }: TshirtCardProps) => {
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { isAuthenticated } = useUser();
  const { addToCart } = useCart();
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      console.log("🔒 User not authenticated for cart action");
      return;
    }
    
    try {
      console.log("🛒 Adding item to cart:", { id, name });
      setIsAdding(true);
      await addToCart(id.toString());
      
      // Show success state briefly
      setJustAdded(true);
      console.log("✅ Item added to cart successfully");
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error("❌ Failed to add item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const getButtonContent = () => {
    if (isAdding) return { icon: ShoppingCart, text: "Adding..." };
    if (justAdded) return { icon: Check, text: "Added!" };
    return { icon: ShoppingCart, text: "Add to cart" };
  };

  const buttonContent = getButtonContent();

  // Color name mapping for better UX
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
    <Card className="overflow-hidden group" data-testid={`tshirt-card-${id}`}>
      <div className="relative pb-[125%] overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2 justify-center">
          <Button variant="secondary" size="sm" className="opacity-90 flex items-center gap-1">
            <Eye size={16} />
            <span>Quick view</span>
          </Button>
          <Button 
            size="sm" 
            className={`opacity-90 flex items-center gap-1 transition-colors ${
              justAdded ? 'bg-green-600 hover:bg-green-700' : ''
            }`}
            onClick={handleAddToCart}
            disabled={isAdding || !isAuthenticated}
            data-testid="add-to-cart-button"
          >
            <buttonContent.icon size={16} />
            <span>{buttonContent.text}</span>
          </Button>
        </div>
      </div>
      <CardContent className="pt-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium hover:text-blue-600 transition-colors">{name}</h3>
        </Link>
        <p className="text-lg font-medium mt-1">{price}</p>
        <div className="flex gap-2 mt-3">
          {colorOptions.map((color) => (
            <button
              key={color}
              className={`w-5 h-5 rounded-full border ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-label={`Select ${getColorName(color)} color`}
              title={getColorName(color)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TshirtCard;
