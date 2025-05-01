
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, ShoppingBag, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useUser();
  const [designCount, setDesignCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      // Fetch design count
      const fetchDesignCount = async () => {
        try {
          const { count, error } = await supabase
            .from("designs")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", user.id);
          
          if (error) throw error;
          setDesignCount(count || 0);
        } catch (error) {
          console.error("Error fetching design count:", error);
        }
      };
      
      fetchDesignCount();
    }
  }, [user]);
  
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Welcome back, {user?.name || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Manage your account, view your designs, and check your order history from here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Designs</CardTitle>
              <Layers className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{designCount}</div>
              <p className="text-xs text-gray-500">Saved custom designs</p>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link to="/dashboard/designs">View Designs</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderCount}</div>
              <p className="text-xs text-gray-500">Completed orders</p>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link to="/dashboard/orders">Order History</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Create New Design</CardTitle>
              <Palette className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-4">Start creating your custom t-shirt now</p>
              <Button className="w-full" asChild>
                <Link to="/design">Design a Shirt</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
