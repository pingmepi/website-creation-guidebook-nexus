
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smartphone, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentTimer from "./PaymentTimer";
import { usePaymentRetry } from "@/hooks/usePaymentRetry";
import { getErrorMessage, isRetryableError } from "@/utils/phonePeErrorCodes";

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("UPI");
  const [paymentTimeout, setPaymentTimeout] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const { executeWithRetry, isRetrying, canRetry, reset } = usePaymentRetry({
    maxRetries: 3,
    retryDelay: 2000
  });

  const handlePhonePePayment = async () => {
    setIsProcessing(true);
    setLastError(null);
    reset();
    
    try {
      await executeWithRetry(
        async () => {
          const { data, error } = await supabase.functions.invoke('initiate-phonepe-payment', {
            body: {
              orderId,
              amount: Math.round(amount * 100), // Convert to paise
              currency: 'INR',
              paymentMethod: selectedPaymentMethod,
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
        },
        (error) => {
          const errorCode = (error as any)?.details?.code || (error as any)?.code || "UNKNOWN_ERROR";
          setLastError(getErrorMessage(errorCode));
          return isRetryableError(errorCode);
        }
      );

    } catch (error) {
      console.error("PhonePe payment error:", error);
      
      const errorCode = (error as any)?.details?.code || "UNKNOWN_ERROR";
      const userFriendlyMessage = getErrorMessage(errorCode);
      
      setLastError(userFriendlyMessage);
      toast.error(userFriendlyMessage);
      
      setIsProcessing(false);
    }
  };

  const handlePaymentTimeout = () => {
    setPaymentTimeout(true);
    setIsProcessing(false);
    toast.error("Payment session expired. Please try again.");
  };

  const handleRetry = () => {
    setPaymentTimeout(false);
    setLastError(null);
    handlePhonePePayment();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
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
            
            {!isProcessing && !paymentTimeout && (
              <PaymentTimer 
                duration={300} // 5 minutes
                onTimeout={handlePaymentTimeout}
              />
            )}

            {paymentTimeout && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Payment Session Expired</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Your payment session has expired. Please start a new payment.
                </p>
              </div>
            )}

            {lastError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Payment Error</span>
                </div>
                <p className="text-sm text-red-700 mt-1">{lastError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!paymentTimeout && (
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onMethodChange={setSelectedPaymentMethod}
          />
        )}

        <Card>
          <CardContent className="p-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Secure Payment</span>
              </div>
              <p className="text-sm text-blue-700">
                You will be redirected to PhonePe to complete your payment securely.
                Supports UPI, Cards, Net Banking & Wallets.
              </p>
            </div>

            <div className="space-y-2 mt-4">
              {paymentTimeout || lastError ? (
                <Button 
                  onClick={handleRetry}
                  disabled={isProcessing || isRetrying}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Retry Payment"
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handlePhonePePayment}
                  disabled={isProcessing || isRetrying}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing || isRetrying ? "Redirecting to PhonePe..." : `Pay ₹${amount.toFixed(2)} with PhonePe`}
                </Button>
              )}
              
              <Button 
                onClick={onCancel}
                variant="outline"
                className="w-full"
                disabled={isProcessing || isRetrying}
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
