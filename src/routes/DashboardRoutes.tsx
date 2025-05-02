import { lazy } from "react";
import { Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

// Lazy load dashboard pages
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const Profile = lazy(() => import("@/pages/dashboard/Profile"));
const SavedDesigns = lazy(() => import("@/pages/dashboard/SavedDesigns"));
const OrderHistory = lazy(() => import("@/pages/dashboard/OrderHistory"));
const Settings = lazy(() => import("@/pages/dashboard/Settings"));

// Export the dashboard routes as an array
const dashboardRoutes = [
  <Route key="dashboard" path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />,
  <Route key="profile" path="/dashboard/profile" element={<MainLayout><Profile /></MainLayout>} />,
  <Route key="designs" path="/dashboard/designs" element={<MainLayout><SavedDesigns /></MainLayout>} />,
  <Route key="orders" path="/dashboard/orders" element={<MainLayout><OrderHistory /></MainLayout>} />,
  <Route key="settings" path="/dashboard/settings" element={<MainLayout><Settings /></MainLayout>} />
];

export default dashboardRoutes;
