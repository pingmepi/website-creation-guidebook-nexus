'use client';

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast";
import { usePaymentRetry } from "@/hooks/usePaymentRetry";
import { getErrorMessage } from "@/utils/phonePeErrorCodes";

interface OrderDetails {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    updated_at: string;
    order_number: string;
    shipping_address?: Record<string, unknown>;
    payment_method?: string;
    payment_status?: string;
}

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isVerifying, setIsVerifying] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const { executeWithRetry, isRetrying } = usePaymentRetry({
        maxRetries: 3,
        retryDelay: 2000
    });

    const transactionId = searchParams.get('transactionId');
    const orderId = searchParams.get('orderId');

    const verifyPayment = useCallback(async () => {
        try {
            setIsVerifying(true);
            setErrorMessage("");

            await executeWithRetry(async () => {
                const { data, error } = await supabase.functions.invoke('verify-phonepe-payment', {
                    body: { transactionId }
                });

                if (error) throw error;

                if (data.success) {
                    setPaymentStatus('success');
                    toast.success("Payment successful!");

                    // Fetch order details
                    if (orderId) {
                        const { data: order, error: orderError } = await supabase
                            .from('orders')
                            .select('id, user_id, total_amount, status, created_at, updated_at, order_number, shipping_address, payment_method, payment_status')
                            .eq('id', orderId as any)
                            .single();

                        if (!orderError && order) {
                            setOrderDetails({
                                ...(order as any),
                                shipping_address: (order as any).shipping_address || {}
                            });
                        }
                    }
                } else {
                    setPaymentStatus('failed');
                    const userFriendlyMessage = getErrorMessage(data.errorCode || "UNKNOWN_ERROR");
                    setErrorMessage(data.message || userFriendlyMessage);
                    toast.error(userFriendlyMessage);
                }
            });
        } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentStatus('failed');
            const errorCode = (error as any)?.details?.errorCode || "VERIFICATION_ERROR";
            const userFriendlyMessage = getErrorMessage(errorCode);
            setErrorMessage(userFriendlyMessage);
            toast.error("Failed to verify payment");
        } finally {
            setIsVerifying(false);
        }
    }, [transactionId, orderId, executeWithRetry]);

    useEffect(() => {
        if (transactionId) {
            verifyPayment();
        } else {
            setPaymentStatus('failed');
            setErrorMessage("Invalid payment session. No transaction ID found.");
            setIsVerifying(false);
        }
    }, [transactionId, verifyPayment]);

    const handleContinue = () => {
        if (paymentStatus === 'success') {
            router.push('/dashboard/orders');
        } else {
            router.push('/cart');
        }
    };

    const handleRetryVerification = () => {
        verifyPayment();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            {(isVerifying || isRetrying) && <Loader2 className="h-12 w-12 animate-spin text-blue-600" />}
                            {!isVerifying && !isRetrying && paymentStatus === 'success' && (
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            )}
                            {!isVerifying && !isRetrying && paymentStatus === 'failed' && (
                                <XCircle className="h-12 w-12 text-red-600" />
                            )}
                        </div>
                        <CardTitle>
                            {(isVerifying || isRetrying) && "Verifying Payment..."}
                            {!isVerifying && !isRetrying && paymentStatus === 'success' && "Payment Successful!"}
                            {!isVerifying && !isRetrying && paymentStatus === 'failed' && "Payment Failed"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(isVerifying || isRetrying) && (
                            <p className="text-center text-gray-600">
                                {isRetrying ? "Retrying verification..." : "Please wait while we verify your payment..."}
                            </p>
                        )}

                        {!isVerifying && !isRetrying && paymentStatus === 'success' && (
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

                        {!isVerifying && !isRetrying && paymentStatus === 'failed' && (
                            <div className="text-center space-y-4">
                                <p className="text-red-600">
                                    {errorMessage || "There was an issue with your payment."}
                                </p>

                                <div className="space-y-2">
                                    <Button
                                        onClick={handleRetryVerification}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Retry Verification
                                    </Button>

                                    <p className="text-sm text-gray-600">
                                        If the issue persists, please contact support with transaction ID: {transactionId}
                                    </p>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleContinue}
                            className="w-full"
                            disabled={isVerifying || isRetrying}
                        >
                            {paymentStatus === 'success' ? 'View Orders' : 'Back to Cart'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}
