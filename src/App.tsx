
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Providers
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/UserContext";

// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Layouts
import MainLayout from "@/layouts/MainLayout";

// Routes
import dashboardRoutes from "@/routes/DashboardRoutes";

// Lazy-loaded page components
const Index = lazy(() => import("@/pages/Index"));
const Shop = lazy(() => import("@/pages/Shop"));
const Design = lazy(() => import("@/pages/Design"));
const About = lazy(() => import("@/pages/About"));
const Cart = lazy(() => import("@/pages/Cart"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Create a new query client instance
const queryClient = new QueryClient();

// Loading fallback for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse text-gray-500">Loading...</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        {/* Toast notifications */}
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Main Routes with MainLayout */}
              <Route path="/" element={<MainLayout><Index /></MainLayout>} />
              <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
              <Route path="/design" element={<MainLayout><Design /></MainLayout>} />
              <Route path="/about" element={<MainLayout><About /></MainLayout>} />
              <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />

              {/* Dashboard Routes */}
              {dashboardRoutes}

              {/* Catch-all route for 404 */}
              <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
