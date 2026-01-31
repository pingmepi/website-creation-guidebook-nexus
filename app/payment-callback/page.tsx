'use client';

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function PaymentCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

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

        router.replace(`/payment-success?${params.toString()}`);
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Processing payment response...</p>
            </div>
        </div>
    );
}

export default function PaymentCallback() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading...</p>
                </div>
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    );
}
