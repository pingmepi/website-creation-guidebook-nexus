import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/integrations/supabase/client";
import { Answer } from "./QuestionFlow";

interface PlaceOrderButtonProps {
  designImage?: string;
  tshirtColor: string;
  selectedSize?: string;
  designName: string;
  answers: Answer[];
  onSaveDesign?: () => void;
}

const PlaceOrderButton = ({
  designImage,
  tshirtColor,
  selectedSize = "M",
  designName,
  answers,
  onSaveDesign
}: PlaceOrderButtonProps) => {
  const { isAuthenticated } = useUser();
  const { addCustomDesignToCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!designImage) {
      toast.error("Please create a design first");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please login to place an order");
      return;
    }

    setIsProcessing(true);

    try {
      // First save the design
      if (onSaveDesign) {
        await onSaveDesign();
      }

      // Add to cart as custom design
      const customDesign = {
        design_name: designName || "Custom Design",
        design_image: designImage,
        tshirt_color: tshirtColor,
        selected_size: selectedSize,
        base_price: 2499, // Updated to INR pricing
        theme_name: answers.find(a => a.question.includes("theme"))?.answer || "Custom",
        answers: answers,
        design_data: {} // Canvas data would be added here in real implementation
      };

      await addCustomDesignToCart(customDesign);

      toast.success("Design added to cart! Redirecting to checkout...");

      // Navigate to checkout
      setTimeout(() => {
        router.push("/checkout");
      }, 1500);

    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={handlePlaceOrder}
        disabled={isProcessing || !designImage}
        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        <CreditCard className="h-5 w-5" />
        {isProcessing ? "Processing..." : "Place Order"}
      </Button>
    </div>
  );
};

export default PlaceOrderButton;
