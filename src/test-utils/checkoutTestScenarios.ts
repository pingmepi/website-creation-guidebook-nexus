
import { ErrorLogger } from "@/services/ErrorLogger";

// Test scenarios for checkout functionality
export const checkoutTestScenarios = {
  // Test address form validation
  testAddressValidation: () => {
    console.log("🧪 Testing Address Validation...");
    
    try {
      const nameInput = document.querySelector('[data-testid="address-name"]') as HTMLInputElement;
      const streetInput = document.querySelector('[data-testid="address-street"]') as HTMLInputElement;
      
      if (!nameInput || !streetInput) {
        console.error("❌ Address form inputs not found");
        return false;
      }

      // Test empty validation
      nameInput.value = '';
      streetInput.value = '';
      
      const submitButton = document.querySelector('[data-testid="place-order-button"]');
      if (submitButton) {
        (submitButton as HTMLElement).click();
        
        // Check for validation messages
        setTimeout(() => {
          const errorMessages = document.querySelectorAll('[data-testid*="error"]');
          if (errorMessages.length === 0) {
            console.warn("⚠️ No validation errors shown for empty fields");
          } else {
            console.log("✅ Address validation working");
          }
        }, 500);
      }
      
      return true;
    } catch (error) {
      console.error("❌ Address validation test failed:", error);
      return false;
    }
  },

  // Test saved addresses
  testSavedAddresses: () => {
    console.log("🧪 Testing Saved Addresses...");
    
    const savedAddressRadios = document.querySelectorAll('[data-testid*="saved-address"]');
    if (savedAddressRadios.length === 0) {
      console.log("ℹ️ No saved addresses found (expected for new users)");
      return true;
    }

    // Test selecting saved address
    const firstAddress = savedAddressRadios[0] as HTMLInputElement;
    firstAddress.click();

    if (firstAddress.checked) {
      console.log("✅ Saved address selection working");
      return true;
    } else {
      console.error("❌ Failed to select saved address");
      return false;
    }
  },

  // Test order placement
  testOrderPlacement: () => {
    console.log("🧪 Testing Order Placement...");
    
    try {
      const placeOrderButton = document.querySelector('[data-testid="place-order-button"]');
      if (!placeOrderButton) {
        console.error("❌ Place order button not found");
        return false;
      }

      // Check if button is disabled when cart is empty
      const isDisabled = (placeOrderButton as HTMLButtonElement).disabled;
      console.log(`📋 Place order button disabled: ${isDisabled}`);

      console.log("✅ Order placement test setup complete");
      return true;
    } catch (error) {
      console.error("❌ Order placement test failed:", error);
      return false;
    }
  },

  // Test order summary
  testOrderSummary: () => {
    console.log("🧪 Testing Order Summary...");
    
    const summaryItems = document.querySelectorAll('[data-testid="order-summary-item"]');
    const totalElement = document.querySelector('[data-testid="order-total"]');
    
    if (summaryItems.length === 0) {
      console.log("ℹ️ No items in order summary (cart may be empty)");
      return true;
    }

    if (!totalElement) {
      console.error("❌ Order total not found");
      return false;
    }

    console.log(`📋 Found ${summaryItems.length} items in order summary`);
    console.log("✅ Order summary test passed");
    return true;
  },

  // Run all checkout tests
  runAllCheckoutTests: () => {
    console.log("🚀 Running all checkout test scenarios...");
    
    const results = [
      checkoutTestScenarios.testAddressValidation(),
      checkoutTestScenarios.testSavedAddresses(),
      checkoutTestScenarios.testOrderPlacement(),
      checkoutTestScenarios.testOrderSummary()
    ];
    
    const passed = results.filter(Boolean).length;
    const total = results.length;
    
    console.log(`📊 Checkout Test Results: ${passed}/${total} passed`);
    
    if (passed === total) {
      console.log("✅ All checkout tests passed!");
      return true;
    } else {
      console.log("❌ Some checkout tests failed");
      return false;
    }
  }
};

// Export for manual testing in browser console
(window as any).checkoutTestScenarios = checkoutTestScenarios;
