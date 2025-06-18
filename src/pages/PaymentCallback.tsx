
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract parameters from PhonePe callback
    const transactionId = searchParams.get('transactionId');
    const providerReferenceId = searchParams.get('providerReferenceId');
    const orderId = searchParams.get('orderId');

    // Redirect to payment success page with transaction details
    const params = new URLSearchParams();
    if (transactionId) params.set('transactionId', transactionId);
    if (providerReferenceId) params.set('providerReferenceId', providerReferenceId);
    if (orderId) params.set('orderId', orderId);

    navigate(`/payment-success?${params.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Processing payment response...</p>
      </div>
    </div>
  );
};

export default PaymentCallback;
