
import { lazy } from "react";
import { Route } from "react-router-dom";

// Lazy load dashboard pages
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const Profile = lazy(() => import("@/pages/dashboard/Profile"));
const SavedDesigns = lazy(() => import("@/pages/dashboard/SavedDesigns"));
const OrderHistory = lazy(() => import("@/pages/dashboard/OrderHistory"));
const Settings = lazy(() => import("@/pages/dashboard/Settings"));

// Export the dashboard routes as an array
const dashboardRoutes = [
  <Route key="dashboard" path="/dashboard" element={<Dashboard />} />,
  <Route key="profile" path="/dashboard/profile" element={<Profile />} />,
  <Route key="designs" path="/dashboard/designs" element={<SavedDesigns />} />,
  <Route key="orders" path="/dashboard/orders" element={<OrderHistory />} />,
  <Route key="settings" path="/dashboard/settings" element={<Settings />} />
];

export default dashboardRoutes;
