import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Trash, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Cart = () => {
  const { isAuthenticated } = useUser();
  const { 
    cartItems, 
    customDesigns, 
    updateQuantity, 
    removeFromCart, 
    isLoading 
  } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setIsUpdating(true);
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setIsUpdating(true);
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateSubtotal = () => {
    const cartItemsTotal = cartItems.reduce((total, item) => {
      const price = parseFloat(item.product?.price?.replace('₹', '') || '0');
      return total + (price * item.quantity);
    }, 0);
    
    const customDesignsTotal = customDesigns.reduce((total, design) => {
      return total + design.base_price;
    }, 0);
    
    return (cartItemsTotal + customDesignsTotal).toFixed(2);
  };

  const totalItemCount = cartItems.length + customDesigns.length;

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
        ) : totalItemCount === 0 ? (
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
                  <h2 className="text-lg font-semibold mb-4">Cart Items ({totalItemCount})</h2>

                  <div className="space-y-4">
                    {/* Regular Cart Items */}
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
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="px-4 py-1">{item.quantity}</span>
                                <button
                                  className="px-2 py-1 disabled:opacity-50"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center"
                                disabled={isUpdating}
                                onClick={() => handleRemoveItem(item.id)}
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

                    {/* Custom Design Items */}
                    {customDesigns.map(design => (
                      <div key={design.id}>
                        <div className="flex items-start py-2">
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                            {design.design_image ? (
                              <img
                                src={design.design_image}
                                alt={design.design_name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                No Preview
                              </div>
                            )}
                          </div>

                          <div className="ml-4 flex-1 flex flex-col">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{design.design_name}</h3>
                                <p className="text-sm text-gray-500">Custom Design</p>
                                <div className="flex items-center mt-1">
                                  <div 
                                    className="w-3 h-3 rounded-full border mr-2" 
                                    style={{ backgroundColor: design.tshirt_color }}
                                  />
                                  <span className="text-xs text-gray-500">T-shirt color</span>
                                </div>
                              </div>
                              <p className="ml-4 font-medium text-gray-900">₹{design.base_price.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-gray-500">Quantity: 1</span>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center"
                                disabled={isUpdating}
                                onClick={() => {
                                  // Custom designs will need a different remove handler
                                  toast.info("Custom design removal not yet implemented");
                                }}
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
                      <p className="font-medium">₹{calculateSubtotal()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Shipping</p>
                      <p className="font-medium">Free</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <p className="font-semibold">Total</p>
                      <p className="font-semibold">₹{calculateSubtotal()}</p>
                    </div>

                    <Button className="w-full" size="lg" asChild>
                      <Link to="/checkout">Proceed to Checkout</Link>
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
