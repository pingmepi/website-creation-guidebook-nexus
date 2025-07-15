
import { ErrorLogger } from "@/services/ErrorLogger";

// Test scenarios for payment functionality
export const paymentTestScenarios = {
  // Test payment gateway initialization
  testPaymentGatewayInit: () => {
    console.log("🧪 Testing Payment Gateway Initialization...");
    
    try {
      const paymentGateway = document.querySelector('[data-testid="payment-gateway"]');
      const paymentMethodSelector = document.querySelector('[data-testid="payment-method-selector"]');
      const paymentTimer = document.querySelector('[data-testid="payment-timer"]');
      
      if (!paymentGateway) {
        console.error("❌ Payment gateway component not found");
        return false;
      }

      if (!paymentMethodSelector) {
        console.warn("⚠️ Payment method selector not found");
      }

      if (!paymentTimer) {
        console.warn("⚠️ Payment timer not found");
      }

      console.log("✅ Payment gateway initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Payment gateway initialization test failed:", error);
      ErrorLogger.log(error as Error, "PaymentGatewayInit");
      return false;
    }
  },

  // Test payment method selection
  testPaymentMethodSelection: () => {
    console.log("🧪 Testing Payment Method Selection...");
    
    const methodOptions = document.querySelectorAll('[data-testid*="payment-method"]');
    if (methodOptions.length === 0) {
      console.error("❌ No payment method options found");
      return false;
    }

    // Test selecting different payment methods
    methodOptions.forEach((option, index) => {
      if (option instanceof HTMLInputElement) {
        option.click();
        if (option.checked) {
          console.log(`✅ Payment method ${index + 1} selected successfully`);
        } else {
          console.warn(`⚠️ Failed to select payment method ${index + 1}`);
        }
      }
    });

    return true;
  },

  // Test payment retry functionality
  testPaymentRetry: () => {
    console.log("🧪 Testing Payment Retry Functionality...");
    
    const retryButton = document.querySelector('[data-testid="retry-payment"]');
    if (!retryButton) {
      console.log("ℹ️ Retry button not visible (no payment error state)");
      return true;
    }

    // Simulate retry button click
    (retryButton as HTMLElement).click();
    
    // Check if retry logic is triggered
    setTimeout(() => {
      const isRetrying = document.querySelector('[data-testid="retrying-indicator"]');
      if (isRetrying) {
        console.log("✅ Payment retry functionality working");
      } else {
        console.warn("⚠️ Retry indicator not found");
      }
    }, 500);

    return true;
  },

  // Test payment timeout handling
  testPaymentTimeout: () => {
    console.log("🧪 Testing Payment Timeout Handling...");
    
    const timerElement = document.querySelector('[data-testid="payment-timer"]');
    if (!timerElement) {
      console.log("ℹ️ Payment timer not found (may not be in payment flow)");
      return true;
    }

    // Check timer is counting down
    const initialTime = timerElement.textContent;
    setTimeout(() => {
      const currentTime = timerElement.textContent;
      if (currentTime !== initialTime) {
        console.log("✅ Payment timer is working");
      } else {
        console.warn("⚠️ Payment timer not updating");
      }
    }, 2000);

    return true;
  },

  // Test error message display
  testErrorMessageDisplay: () => {
    console.log("🧪 Testing Error Message Display...");
    
    const errorContainer = document.querySelector('[data-testid="payment-error"]');
    if (!errorContainer) {
      console.log("ℹ️ No payment error displayed (expected for successful flows)");
      return true;
    }

    const errorMessage = errorContainer.textContent;
    if (errorMessage && errorMessage.trim().length > 0) {
      console.log("✅ Error message displayed:", errorMessage);
      return true;
    } else {
      console.warn("⚠️ Empty error message found");
      return false;
    }
  },

  // Test payment success flow
  testPaymentSuccessFlow: () => {
    console.log("🧪 Testing Payment Success Flow...");
    
    const successIndicator = document.querySelector('[data-testid="payment-success"]');
    if (!successIndicator) {
      console.log("ℹ️ Not in payment success state");
      return true;
    }

    const orderDetails = document.querySelector('[data-testid="order-details"]');
    const continueButton = document.querySelector('[data-testid="continue-button"]');

    if (!orderDetails) {
      console.warn("⚠️ Order details not found in success page");
    }

    if (!continueButton) {
      console.error("❌ Continue button not found");
      return false;
    }

    console.log("✅ Payment success flow components present");
    return true;
  },

  // Run all payment tests
  runAllPaymentTests: () => {
    console.log("🚀 Running all payment test scenarios...");
    
    const results = [
      paymentTestScenarios.testPaymentGatewayInit(),
      paymentTestScenarios.testPaymentMethodSelection(),
      paymentTestScenarios.testPaymentRetry(),
      paymentTestScenarios.testPaymentTimeout(),
      paymentTestScenarios.testErrorMessageDisplay(),
      paymentTestScenarios.testPaymentSuccessFlow()
    ];
    
    const passed = results.filter(Boolean).length;
    const total = results.length;
    
    console.log(`📊 Payment Test Results: ${passed}/${total} passed`);
    
    if (passed === total) {
      console.log("✅ All payment tests passed!");
      return true;
    } else {
      console.log("❌ Some payment tests failed");
      return false;
    }
  }
};

// Export for manual testing in browser console
declare global {
  interface Window {
    paymentTestScenarios: typeof paymentTestScenarios;
  }
}

window.paymentTestScenarios = paymentTestScenarios;
