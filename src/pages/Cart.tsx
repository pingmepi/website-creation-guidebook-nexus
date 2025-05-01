
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { tshirtImages } from "../../assets";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    name: string;
    price: string;
    image: string;
  };
}

const Cart = () => {
  const { user, isAuthenticated } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const mockProducts = [
    { id: "1", name: "Classic White Tee", price: "$24.99", image: tshirtImages.mockup1 },
    { id: "2", name: "Urban Black Design", price: "$29.99", image: tshirtImages.mockup2 },
    { id: "3", name: "Summer Collection", price: "$26.99", image: tshirtImages.mockup3 },
    { id: "4", name: "Vintage Edition", price: "$32.99", image: tshirtImages.mockup4 },
    { id: "5", name: "Modern Minimalist", price: "$27.99", image: tshirtImages.mockup5 },
    { id: "6", name: "Artist Series", price: "$34.99", image: tshirtImages.mockup6 },
    { id: "7", name: "Classic Blue Tee", price: "$24.99", image: tshirtImages.mockup1 },
    { id: "8", name: "Urban Gray Design", price: "$29.99", image: tshirtImages.mockup2 },
    { id: "9", name: "Winter Collection", price: "$26.99", image: tshirtImages.mockup3 }
  ];

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Attach product data from the mock products array
      const itemsWithProducts = data?.map(item => {
        const product = mockProducts.find(p => p.id === item.product_id);
        return {
          ...item,
          product
        };
      }) || [];

      setCartItems(itemsWithProducts);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast.error("Failed to load cart items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartItems();

      // Set up subscription for cart updates
      const channel = supabase
        .channel('cart-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchCartItems(); // Refresh the cart
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq("id", itemId);

      if (error) throw error;

      // Update cart items locally
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error("Error updating cart item:", error);
      toast.error("Failed to update cart");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      // Remove from local state
      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing cart item:", error);
      toast.error("Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product?.price?.replace('$', '') || '0');
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Shopping Cart</h1>

          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading your cart...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">You're not logged in</h3>
              <p className="mt-1 text-gray-500">
                Please log in to view your cart and checkout.
              </p>
              <div className="mt-6">
                <Button onClick={() => window.location.href = "/"}>
                  Return to Home
                </Button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-gray-500">
                Looks like you haven't added any products to your cart yet.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Cart Items ({cartItems.length})</h2>

                    <div className="space-y-4">
                      {cartItems.map(item => (
                        <div key={item.id}>
                          <div className="flex items-start py-2">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.product?.image}
                                alt={item.product?.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>

                            <div className="ml-4 flex-1 flex flex-col">
                              <div className="flex justify-between">
                                <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                                <p className="ml-4 font-medium text-gray-900">{item.product?.price}</p>
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center border rounded-md">
                                  <button
                                    className="px-2 py-1 disabled:opacity-50"
                                    disabled={isUpdating || item.quantity <= 1}
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="px-4 py-1">{item.quantity}</span>
                                  <button
                                    className="px-2 py-1 disabled:opacity-50"
                                    disabled={isUpdating}
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  className="text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center"
                                  disabled={isUpdating}
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <Separator className="my-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="md:col-span-1">
                <Card className="sticky top-4">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <p className="text-gray-600">Subtotal</p>
                        <p className="font-medium">${calculateSubtotal()}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-600">Shipping</p>
                        <p className="font-medium">Free</p>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <p className="font-semibold">Total</p>
                        <p className="font-semibold">${calculateSubtotal()}</p>
                      </div>

                      <Button className="w-full" size="lg">
                        Proceed to Checkout
                      </Button>

                      <div className="text-center">
                        <Link to="/shop" className="text-blue-600 hover:text-blue-800 text-sm">
                          Continue shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default Cart;
