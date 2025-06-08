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
  const { addCustomDesignToCart } = useCart();
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

      // Add custom design to cart
      const customDesign = {
        design_name: designName || "Custom Design",
        design_image: designImage,
        tshirt_color: tshirtColor,
        base_price: 2499, // Updated to INR pricing
        theme_name: answers.find(a => a.question?.includes("theme"))?.answer || "Custom",
        answers: answers,
        design_data: {} // Canvas data would be added here in real implementation
      };

      await addCustomDesignToCart(customDesign);
      
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
