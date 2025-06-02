
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load dashboard pages
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const Profile = lazy(() => import("@/pages/dashboard/Profile"));
const SavedDesigns = lazy(() => import("@/pages/dashboard/SavedDesigns"));
const OrderHistory = lazy(() => import("@/pages/dashboard/OrderHistory"));
const Settings = lazy(() => import("@/pages/dashboard/Settings"));

const DashboardRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="designs" element={<SavedDesigns />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
};

export default DashboardRoutes;
