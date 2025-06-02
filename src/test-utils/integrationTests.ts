
import { cartTestScenarios } from "./cartTestScenarios";
import { checkoutTestScenarios } from "./checkoutTestScenarios";
import { testScenarios } from "./testScenarios";

// Integration tests that run all test scenarios
export const integrationTests = {
  // Run all tests in sequence
  runAllTests: async () => {
    console.log("🚀 Starting comprehensive integration tests...");
    
    const testSuites = [
      {
        name: "Basic Functionality",
        runner: testScenarios.runAllTests
      },
      {
        name: "Cart Functionality", 
        runner: cartTestScenarios.runAllCartTests
      },
      {
        name: "Checkout Functionality",
        runner: checkoutTestScenarios.runAllCheckoutTests
      }
    ];

    const results = [];
    
    for (const suite of testSuites) {
      console.log(`\n📋 Running ${suite.name} tests...`);
      try {
        const result = await suite.runner();
        results.push({ suite: suite.name, passed: result });
      } catch (error) {
        console.error(`❌ Error in ${suite.name}:`, error);
        results.push({ suite: suite.name, passed: false });
      }
    }

    // Summary
    console.log("\n📊 INTEGRATION TEST SUMMARY");
    console.log("=" * 50);
    
    results.forEach(result => {
      const status = result.passed ? "✅ PASSED" : "❌ FAILED";
      console.log(`${result.suite}: ${status}`);
    });

    const passedSuites = results.filter(r => r.passed).length;
    const totalSuites = results.length;
    
    console.log(`\nOverall: ${passedSuites}/${totalSuites} test suites passed`);
    
    if (passedSuites === totalSuites) {
      console.log("🎉 ALL INTEGRATION TESTS PASSED!");
    } else {
      console.log("⚠️ Some integration tests failed. Check logs above.");
    }

    return passedSuites === totalSuites;
  },

  // Performance monitoring
  monitorPerformance: () => {
    console.log("⚡ Starting performance monitoring...");
    
    // Monitor DOM mutations
    const observer = new MutationObserver((mutations) => {
      const mutationCount = mutations.length;
      if (mutationCount > 10) {
        console.warn(`⚠️ High DOM mutation count: ${mutationCount}`);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Monitor memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log("💾 Memory usage:", {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + " MB",
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + " MB",
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + " MB"
      });
    }

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      console.log("🌐 Network request:", args[0]);
      return originalFetch.apply(this, args);
    };

    return () => {
      observer.disconnect();
      window.fetch = originalFetch;
    };
  }
};

// Auto-run tests after 2 seconds if in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    console.log("🤖 Auto-running tests in development mode...");
    integrationTests.runAllTests();
  }, 2000);
}

// Export for manual testing in browser console
(window as any).integrationTests = integrationTests;
