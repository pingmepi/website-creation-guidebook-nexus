import { RazorpayProvider } from "@/lib/payments/providers/razorpayProvider";
import { PaymentProvider } from "@/lib/payments/provider";

export const paymentProvider: PaymentProvider = new RazorpayProvider();
