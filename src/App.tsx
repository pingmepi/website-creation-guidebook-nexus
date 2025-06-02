
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import MainLayout from "@/layouts/MainLayout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Design from "./pages/Design";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import DashboardRoutes from "./routes/DashboardRoutes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                <Route path="shop" element={<Shop />} />
                <Route path="design" element={<Design />} />
                <Route path="about" element={<About />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="dashboard/*" element={<DashboardRoutes />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
