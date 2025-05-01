
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

interface TshirtCardProps {
  id: number;
  name: string;
  price: string;
  image: string;
  colorOptions?: string[];
}

const TshirtCard = ({ id, name, price, image, colorOptions = ["#FFFFFF", "#000000", "#0000FF"] }: TshirtCardProps) => {
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated, user } = useUser();
  
  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to add items to your cart");
      return;
    }
    
    try {
      setIsAdding(true);
      
      // Check if item already exists in cart
      const { data: existingItems, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", id.toString());
        
      if (fetchError) throw fetchError;
      
      if (existingItems && existingItems.length > 0) {
        // Update quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ 
            quantity: existingItems[0].quantity + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingItems[0].id);
          
        if (updateError) throw updateError;
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: id.toString(),
            quantity: 1
          });
          
        if (insertError) throw insertError;
      }
      
      toast.success("Added to cart", {
        description: `${name} in ${selectedColor} added to your cart`
      });
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden group">
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
            className="opacity-90 flex items-center gap-1"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            <ShoppingCart size={16} />
            <span>{isAdding ? "Adding..." : "Add to cart"}</span>
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
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TshirtCard;
