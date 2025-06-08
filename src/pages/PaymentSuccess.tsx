
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const transactionId = searchParams.get('transactionId');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (transactionId) {
      verifyPayment();
    } else {
      setPaymentStatus('failed');
      setIsVerifying(false);
    }
  }, [transactionId]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      
      const { data, error } = await supabase.functions.invoke('verify-phonepe-payment', {
        body: { transactionId }
      });

      if (error) throw error;

      if (data.success) {
        setPaymentStatus('success');
        toast.success("Payment successful!");
        
        // Fetch order details
        if (orderId) {
          const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
          
          setOrderDetails(order);
        }
      } else {
        setPaymentStatus('failed');
        toast.error(data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      toast.error("Failed to verify payment");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
    if (paymentStatus === 'success') {
      navigate('/dashboard/orders');
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isVerifying && <Loader2 className="h-12 w-12 animate-spin text-blue-600" />}
              {!isVerifying && paymentStatus === 'success' && (
                <CheckCircle className="h-12 w-12 text-green-600" />
              )}
              {!isVerifying && paymentStatus === 'failed' && (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
            <CardTitle>
              {isVerifying && "Verifying Payment..."}
              {!isVerifying && paymentStatus === 'success' && "Payment Successful!"}
              {!isVerifying && paymentStatus === 'failed' && "Payment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVerifying && (
              <p className="text-center text-gray-600">
                Please wait while we verify your payment...
              </p>
            )}
            
            {!isVerifying && paymentStatus === 'success' && (
              <div className="text-center space-y-4">
                <p className="text-green-600">
                  Your order has been placed successfully!
                </p>
                {orderDetails && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-green-800">
                      Order Number: {orderDetails.order_number}
                    </p>
                    <p className="text-sm text-green-800">
                      Amount: ₹{orderDetails.total_amount}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  You will receive an email confirmation shortly.
                </p>
              </div>
            )}
            
            {!isVerifying && paymentStatus === 'failed' && (
              <div className="text-center space-y-4">
                <p className="text-red-600">
                  There was an issue with your payment.
                </p>
                <p className="text-sm text-gray-600">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleContinue}
              className="w-full"
              disabled={isVerifying}
            >
              {paymentStatus === 'success' ? 'View Orders' : 'Back to Cart'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
