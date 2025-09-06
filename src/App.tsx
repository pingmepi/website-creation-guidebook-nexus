import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { CartProvider } from "@/contexts/CartContext";
import MainLayout from "@/layouts/MainLayout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Design from "./pages/Design";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TestPreview from "./pages/TestPreview";
import DashboardRoutes from "./routes/DashboardRoutes";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/auth/AuthCallback";

import ShippingPolicy from "./pages/policies/ShippingPolicy";
import ReturnRefundPolicy from "./pages/policies/ReturnRefundPolicy";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsConditions from "./pages/policies/TermsConditions";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <CartProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Index />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="design" element={<Design />} />
                  <Route path="test-preview" element={<TestPreview />} />
                  <Route path="about" element={<About />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="shipping-policy" element={<ShippingPolicy />} />
                  <Route path="return-refund-policy" element={<ReturnRefundPolicy />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms-conditions" element={<TermsConditions />} />
                  <Route path="dashboard/*" element={<DashboardRoutes />} />
                  <Route path="auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
