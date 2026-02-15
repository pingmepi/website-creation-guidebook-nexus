'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
    ORDER_STATUS_BADGE_CLASS,
    ORDER_STATUS_LABELS,
    normalizeOrderStatus,
    type OrderStatus,
} from "@/lib/orderStatus";

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    status: OrderStatus | string;
    created_at: string;
    shipping_address: Record<string, unknown>;
    order_items?: OrderItem[];
}

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export default function OrderHistory() {
    const { user } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = useCallback(async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("orders")
                .select(`
          *,
          order_items (*)
        `)
                .eq("user_id", user.id as any)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setOrders((data as any[] || []).map(order => ({
                ...order,
                shipping_address: (order.shipping_address as Record<string, unknown>) || {}
            })));
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const getStatusClass = (status: string) => {
        const normalized = normalizeOrderStatus(status);
        if (normalized === "unknown") {
            return "bg-gray-100 text-gray-800";
        }
        return ORDER_STATUS_BADGE_CLASS[normalized];
    };

    const getStatusText = (status: string) => {
        const normalized = normalizeOrderStatus(status);
        if (normalized === "unknown") {
            return status.charAt(0).toUpperCase() + status.slice(1);
        }
        return ORDER_STATUS_LABELS[normalized];
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Orders</h2>
                <Button variant="outline" asChild>
                    <Link href="/shop">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Link>
                </Button>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-gray-50">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                    <p className="mt-1 text-gray-500">After you place an order, it will appear here</p>
                    <Button className="mt-6" asChild>
                        <Link href="/shop">Browse Collection</Link>
                    </Button>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                        <TableCell className="font-medium">{order.order_number}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{order.order_items?.length || 0} items</TableCell>
                                        <TableCell>₹{order.total_amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusClass(order.status)}>
                                                {getStatusText(order.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Order Details - {selectedOrder.order_number}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                                    ×
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium">Order Date</h4>
                                    <p className="text-sm text-gray-600">
                                        {new Date(selectedOrder.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Status</h4>
                                    <Badge className={getStatusClass(selectedOrder.status)}>
                                        {getStatusText(selectedOrder.status)}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Shipping Address</h4>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    <p>{String(selectedOrder.shipping_address.name || '')}</p>
                                    <p>{String(selectedOrder.shipping_address.street_address || '')}</p>
                                    <p>
                                        {String(selectedOrder.shipping_address.city || '')}, {String(selectedOrder.shipping_address.state || '')} {String(selectedOrder.shipping_address.postal_code || '')}
                                    </p>
                                    <p>{String(selectedOrder.shipping_address.country || '')}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Order Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.order_items?.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center py-2 border-b">
                                            <div>
                                                <p className="font-medium">Product #{item.product_id}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">₹{item.total_price.toFixed(2)}</p>
                                                <p className="text-sm text-gray-600">₹{item.unit_price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center font-medium text-lg">
                                    <span>Total Amount</span>
                                    <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
