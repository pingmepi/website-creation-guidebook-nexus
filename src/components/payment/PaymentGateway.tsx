
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentGatewayProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentGateway = ({
  orderId,
  amount,
  onSuccess,
  onCancel
}: PaymentGatewayProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePhonePePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Call PhonePe payment initiation function
      const { data, error } = await supabase.functions.invoke('initiate-phonepe-payment', {
        body: {
          orderId,
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          redirectUrl: `${window.location.origin}/payment-success`,
          callbackUrl: `${window.location.origin}/payment-callback`
        }
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        // Redirect to PhonePe payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Failed to get payment URL");
      }

    } catch (error) {
      console.error("PhonePe payment error:", error);
      
      if (error.message?.includes("PhonePe configuration missing")) {
        toast.error("Payment service is not configured. Please contact support.");
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
      
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              PhonePe Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Order ID: {orderId}</p>
              <p className="text-2xl font-bold">₹{amount.toFixed(2)}</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">PhonePe Payment</span>
              </div>
              <p className="text-sm text-blue-700">
                You will be redirected to PhonePe to complete your payment securely.
                Supports UPI, Cards, Net Banking & Wallets.
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handlePhonePePayment}
                disabled={isProcessing}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? "Redirecting to PhonePe..." : "Pay with PhonePe"}
              </Button>
              
              <Button 
                onClick={onCancel}
                variant="outline"
                className="w-full"
                disabled={isProcessing}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentGateway;
