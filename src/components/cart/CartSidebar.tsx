
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export const CartSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Safely access cart context with error handling
  let cartItems = [];
  let customDesigns = [];
  let cartCount = 0;
  let updateQuantity = async (_itemId: string, _quantity: number) => {};
  let removeFromCart = async (_itemId: string) => {};
  let removeCustomDesign = async (_designId: string) => {};
  
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
        <Button variant="outline" size="sm" className="relative" data-testid="cart-sidebar-trigger">
          <ShoppingCart className="h-4 w-4" />
          {cartCount > 0 && (
            <span 
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
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

        <div className="mt-6 flex-1 overflow-y-auto">
          {cartItems.length === 0 && customDesigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">Your cart is empty</p>
              <Button asChild className="mt-4" onClick={() => setIsOpen(false)}>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 py-4" data-testid={`cart-item-${item.id}`}>
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </h3>
                      <p className="text-sm text-gray-500">{item.product?.price}</p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            className="px-2 py-1 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            data-testid={`decrease-quantity-${item.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1 text-sm" data-testid={`quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <button
                            className="px-2 py-1"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            data-testid={`increase-quantity-${item.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          className="text-red-500 hover:text-red-700 p-1"
                          onClick={() => handleRemoveItem(item.id)}
                          data-testid={`remove-item-${item.id}`}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Custom Design Items */}
                {customDesigns.map((design) => (
                  <div key={design.id} className="flex items-start space-x-4 py-4" data-testid={`custom-design-${design.id}`}>
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-gray-50">
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

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {design.design_name}
                      </h3>
                      <p className="text-sm text-gray-500">Custom Design</p>
                      <div className="flex items-center mt-1">
                        <div 
                          className="w-3 h-3 rounded-full border mr-2" 
                          style={{ backgroundColor: design.tshirt_color }}
                        />
                        <span className="text-xs text-gray-500">T-shirt color</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">₹{design.base_price.toFixed(2)}</p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500">Quantity: 1</span>

                        <button
                          className="text-red-500 hover:text-red-700 p-1"
                          onClick={() => handleRemoveCustomDesign(design.id)}
                          data-testid={`remove-custom-design-${design.id}`}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">₹{calculateSubtotal()}</span>
                </div>

                <div className="space-y-2">
                  <Button asChild className="w-full" onClick={() => setIsOpen(false)} data-testid="view-cart-button">
                    <Link to="/cart">View Cart</Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                    <Link to="/shop" className="w-full">Continue Shopping</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
