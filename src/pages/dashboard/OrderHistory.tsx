
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// This is a placeholder component since we don't have actual order history yet
const OrderHistory = () => {
  return (
    <DashboardLayout title="Order History">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Orders</h2>
          <Button variant="outline" asChild>
            <Link to="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
        
        {/* Empty state for now - will be populated with real order data later */}
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
          <p className="mt-1 text-gray-500">After you place an order, it will appear here</p>
          <Button className="mt-6" asChild>
            <Link to="/shop">Browse Collection</Link>
          </Button>
        </div>

        {/* This will be uncommented and populated with real data once we have orders
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>{order.items} items</TableCell>
                <TableCell>${order.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        */}
      </div>
    </DashboardLayout>
  );
};

export default OrderHistory;
