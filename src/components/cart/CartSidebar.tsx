'use client';




import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export const CartSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Safely access cart context with error handling
  let cartItems: any[] = [];
  let customDesigns: any[] = [];
  let cartCount = 0;
  let updateQuantity = async (_itemId: string, _quantity: number) => { };
  let removeFromCart = async (_itemId: string) => { };
  let removeCustomDesign = async (_designId: string) => { };

  try {
    const cartContext = useCart();
    cartItems = cartContext.cartItems || [];
    customDesigns = cartContext.customDesigns || [];
    cartCount = cartContext.cartCount || 0;
    updateQuantity = cartContext.updateQuantity;
    removeFromCart = cartContext.removeFromCart;
    removeCustomDesign = cartContext.removeCustomDesign;
  } catch (error) {
    console.warn('Cart context not available yet:', error);
  }

  const calculateSubtotal = () => {
    const cartItemsTotal = cartItems.reduce((total, item) => {
      const price = parseFloat(item.product?.price?.replace('₹', '').replace(',', '') || '0');
      return total + (price * item.quantity);
    }, 0);

    const customDesignsTotal = customDesigns.reduce((total, design) => {
      return total + design.base_price;
    }, 0);

    return (cartItemsTotal + customDesignsTotal).toFixed(2);
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    console.log("🔄 Updating cart quantity:", { itemId, newQuantity });
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveCustomDesign = async (designId: string) => {
    console.log("🗑️ Removing custom design:", designId);
    await removeCustomDesign(designId);
  };

  const handleRemoveItem = async (itemId: string) => {
    console.log("🗑️ Removing cart item:", itemId);
    await removeFromCart(itemId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="cart-sidebar-trigger">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              data-testid="cart-count"
            >
              {cartCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg" data-testid="cart-sidebar">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {cartItems.length === 0 && customDesigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingCart className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">Your cart is empty</p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Products</h3>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-20 w-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product?.name}</h4>
                        <p className="text-sm text-gray-500">{item.product?.price}</p>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            className="ml-auto p-1 hover:bg-red-50 text-red-500 rounded"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cartItems.length > 0 && customDesigns.length > 0 && <Separator />}

              {customDesigns.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Custom Designs</h3>
                  {customDesigns.map((design) => (
                    <div key={design.id} className="flex gap-4">
                      <div className="h-20 w-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={design.design_image}
                          alt={design.design_name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-sm line-clamp-2">{design.design_name}</h4>
                        <p className="text-xs text-muted-foreground mb-1">Theme: {design.theme_name || 'Custom'}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div
                            className="w-3 h-3 rounded-full border border-gray-200"
                            style={{ backgroundColor: design.tshirt_color }}
                          />
                          {design.tshirt_color}
                        </div>
                        <p className="text-sm font-medium mt-1">₹{design.base_price}</p>

                        <div className="flex justify-end mt-2">
                          <button
                            className="p-1 hover:bg-red-50 text-red-500 rounded flex items-center gap-1 text-xs"
                            onClick={() => removeCustomDesign(design.id)}
                          >
                            <Trash className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {cartCount > 0 && (
          <div className="pt-4 border-t space-y-4">
            <Button className="w-full bg-black hover:bg-gray-800 text-white" asChild>
              <Link href="/cart">View Cart</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
