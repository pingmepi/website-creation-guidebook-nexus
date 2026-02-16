import { PaymentProvider } from "@/lib/payments/provider";

const createMockProvider = (shouldFail = false): PaymentProvider => ({
  async createIntent() {
    if (shouldFail) throw new Error("intent_failed");
    return { paymentUrl: "https://example.test/pay/123" };
  },
  async verify() {
    if (shouldFail) throw new Error("verify_failed");
    return { success: true, message: "ok" };
  },
  async webhook() {
    if (shouldFail) throw new Error("webhook_failed");
  },
});

export const paymentProviderContractTests = {
  testCreateIntentSuccess: async () => {
    const provider = createMockProvider(false);
    const result = await provider.createIntent({
      orderId: "order_1",
      amount: 1000,
      currency: "INR",
      paymentMethod: "UPI",
      redirectUrl: "https://example.test/success",
      callbackUrl: "https://example.test/callback",
    });

    if (!result.paymentUrl) {
      console.error("❌ Expected paymentUrl from createIntent");
      return false;
    }
    return true;
  },

  testVerifySuccess: async () => {
    const provider = createMockProvider(false);
    const result = await provider.verify({ transactionId: "txn_1" });
    if (!result.success) {
      console.error("❌ Expected verify success response");
      return false;
    }
    return true;
  },

  testFailurePath: async () => {
    const provider = createMockProvider(true);
    try {
      await provider.createIntent({
        orderId: "order_1",
        amount: 1000,
        currency: "INR",
        paymentMethod: "UPI",
        redirectUrl: "https://example.test/success",
        callbackUrl: "https://example.test/callback",
      });
      console.error("❌ Expected createIntent failure path to throw");
      return false;
    } catch {
      return true;
    }
  },

  runAllPaymentProviderContractTests: async () => {
    console.log("🧪 Running payment provider contract tests...");
    const results = await Promise.all([
      paymentProviderContractTests.testCreateIntentSuccess(),
      paymentProviderContractTests.testVerifySuccess(),
      paymentProviderContractTests.testFailurePath(),
    ]);

    const passed = results.filter(Boolean).length;
    const total = results.length;
    console.log(`📊 Payment provider contract tests: ${passed}/${total} passed`);
    return passed === total;
  },
};

