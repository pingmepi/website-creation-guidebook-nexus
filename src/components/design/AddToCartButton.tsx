
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface AddToCartButtonProps {
  designImage?: string;
  tshirtColor: string;
  designName: string;
  answers: any[];
  onSaveDesign?: () => void;
}

const AddToCartButton = ({
  designImage,
  tshirtColor,
  designName,
  answers,
  onSaveDesign
}: AddToCartButtonProps) => {
  const { isAuthenticated } = useUser();
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddToCart = async () => {
    if (!designImage) {
      toast.error("Please create a design first");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsProcessing(true);

    try {
      // First save the design
      if (onSaveDesign) {
        await onSaveDesign();
      }

      // For now, add a custom design product to cart
      // This would need to be enhanced to handle custom designs properly
      await addToCart("custom-design", 1);
      
      toast.success("Design added to cart!");

    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleAddToCart}
      disabled={isProcessing || !designImage}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
    >
      <ShoppingCart className="h-4 w-4" />
      {isProcessing ? "Adding..." : "Add to Cart"}
    </Button>
  );
};

export default AddToCartButton;
