import { shouldBlockPaymentRoute } from "@/lib/paymentFlowRoutes";

export const paymentFlowRouteTests = {
  testBlocksCartWhenDisabled: () => {
    const blocked = shouldBlockPaymentRoute("/cart", false);
    if (!blocked) {
      console.error("❌ Expected /cart to be blocked when payment flows are disabled");
      return false;
    }
    return true;
  },

  testBlocksCheckoutSubrouteWhenDisabled: () => {
    const blocked = shouldBlockPaymentRoute("/checkout/review", false);
    if (!blocked) {
      console.error("❌ Expected /checkout/* to be blocked when payment flows are disabled");
      return false;
    }
    return true;
  },

  testAllowsCartWhenEnabled: () => {
    const blocked = shouldBlockPaymentRoute("/cart", true);
    if (blocked) {
      console.error("❌ Expected /cart to be accessible when payment flows are enabled");
      return false;
    }
    return true;
  },

  runAllPaymentFlowRouteTests: () => {
    console.log("🧪 Running payment flow route tests...");
    const results = [
      paymentFlowRouteTests.testBlocksCartWhenDisabled(),
      paymentFlowRouteTests.testBlocksCheckoutSubrouteWhenDisabled(),
      paymentFlowRouteTests.testAllowsCartWhenEnabled(),
    ];

    const passed = results.filter(Boolean).length;
    const total = results.length;
    console.log(`📊 Payment flow route tests: ${passed}/${total} passed`);
    return passed === total;
  },
};

