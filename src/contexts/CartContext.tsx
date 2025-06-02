
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockProducts = [
    { id: "1", name: "Classic White Tee", price: "$24.99", image: "/assets/images/tshirt/mockup-1.webp" },
    { id: "2", name: "Urban Black Design", price: "$29.99", image: "/assets/images/tshirt/mockup-2.webp" },
    { id: "3", name: "Summer Collection", price: "$26.99", image: "/assets/images/tshirt/mockup-3.webp" },
    { id: "4", name: "Vintage Edition", price: "$32.99", image: "/assets/images/tshirt/mockup-4.webp" },
    { id: "5", name: "Modern Minimalist", price: "$27.99", image: "/assets/images/tshirt/mockup-5.webp" },
    { id: "6", name: "Artist Series", price: "$34.99", image: "/assets/images/tshirt/mockup-6.webp" },
    { id: "7", name: "Classic Blue Tee", price: "$24.99", image: "/assets/images/tshirt/mockup-1.webp" },
    { id: "8", name: "Urban Gray Design", price: "$29.99", image: "/assets/images/tshirt/mockup-2.webp" },
    { id: "9", name: "Winter Collection", price: "$26.99", image: "/assets/images/tshirt/mockup-3.webp" }
  ];

  const refreshCart = async () => {
    if (!user || !isAuthenticated) {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

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

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to add items to your cart");
      return;
    }

    try {
      const { data: existingItems, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (fetchError) throw fetchError;

      if (existingItems && existingItems.length > 0) {
        await updateQuantity(existingItems[0].id, existingItems[0].quantity + quantity);
      } else {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          });

        if (insertError) throw insertError;
        await refreshCart();
      }

      const product = mockProducts.find(p => p.id === productId);
      toast.success("Added to cart", {
        description: `${product?.name} added to your cart`
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error("Error updating cart item:", error);
      toast.error("Failed to update cart");
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing cart item:", error);
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setCartItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();

      const channel = supabase
        .channel('cart-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            refreshCart();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setCartItems([]);
    }
  }, [user, isAuthenticated]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
