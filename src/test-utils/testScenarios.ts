
import { ErrorLogger } from "@/services/ErrorLogger";
import { createMockTheme, createMockAnswers, createMockUser } from "./mockData";

// Test scenarios that can be run manually to validate functionality
export const testScenarios = {
  // Test error logging
  testErrorLogging: () => {
    console.log("🧪 Testing Error Logging...");
    
    const testError = new Error("Test error message");
    ErrorLogger.log(testError, "TestContext", { testData: "test" });
    
    const logs = ErrorLogger.getLogs();
    if (logs.length === 0) {
      console.error("❌ Error logging failed - no logs found");
      return false;
    }
    
    if (logs[0].context !== "TestContext") {
      console.error("❌ Error logging failed - wrong context");
      return false;
    }
    
    console.log("✅ Error logging test passed");
    ErrorLogger.clearLogs();
    return true;
  },

  // Test mock data creation
  testMockData: () => {
    console.log("🧪 Testing Mock Data Creation...");
    
    try {
      const theme = createMockTheme();
      const answers = createMockAnswers();
      const user = createMockUser();
      
      if (!theme.id || !theme.name) {
        console.error("❌ Mock theme creation failed");
        return false;
      }
      
      if (answers.length === 0) {
        console.error("❌ Mock answers creation failed");
        return false;
      }
      
      if (!user.id || !user.email) {
        console.error("❌ Mock user creation failed");
        return false;
      }
      
      console.log("✅ Mock data creation test passed");
      return true;
    } catch (error) {
      console.error("❌ Mock data creation test failed:", error);
      return false;
    }
  },

  // Test design flow state validation
  testDesignFlowValidation: () => {
    console.log("🧪 Testing Design Flow Validation...");
    
    try {
      const theme = createMockTheme();
      const answers = createMockAnswers();
      
      // Validate theme has required properties
      const requiredThemeProps = ['id', 'name', 'description'];
      for (const prop of requiredThemeProps) {
        if (!(prop in theme)) {
          console.error(`❌ Theme missing required property: ${prop}`);
          return false;
        }
      }
      
      // Validate answers have required structure
      for (const answer of answers) {
        if (!answer.question || !answer.answer) {
          console.error("❌ Answer missing required properties");
          return false;
        }
      }
      
      console.log("✅ Design flow validation test passed");
      return true;
    } catch (error) {
      console.error("❌ Design flow validation test failed:", error);
      return false;
    }
  },

  // Run all tests
  runAllTests: () => {
    console.log("🚀 Running all test scenarios...");
    
    const results = [
      testScenarios.testErrorLogging(),
      testScenarios.testMockData(),
      testScenarios.testDesignFlowValidation()
    ];
    
    const passed = results.filter(Boolean).length;
    const total = results.length;
    
    console.log(`📊 Test Results: ${passed}/${total} passed`);
    
    if (passed === total) {
      console.log("✅ All tests passed!");
      return true;
    } else {
      console.log("❌ Some tests failed");
      return false;
    }
  }
};

// Export for manual testing in browser console
(window as any).testScenarios = testScenarios;
