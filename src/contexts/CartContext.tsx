'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from './UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/toast';
import { tshirtImages } from '../assets';
import { Answer } from '@/components/design/QuestionFlow';

interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  selected_color?: string;
  selected_size?: string;
  product?: {
    name: string;
    price: string;
    image: string;
  };
}

interface CustomDesign {
  id: string;
  design_name: string;
  design_image: string;
  tshirt_color: string;
  base_price: number;
  theme_name?: string;
  answers: Answer[] | null;
  design_data: Record<string, unknown>;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  customDesigns: CustomDesign[];
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  addCustomDesignToCart: (customDesign: Omit<CustomDesign, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  removeCustomDesign: (designId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Add try-catch for useUser hook to handle race conditions
  let user: { id: string } | null = null;
  let isAuthenticated = false;

  try {
    const userContext = useUser();
    user = userContext.user;
    isAuthenticated = userContext.isAuthenticated;
  } catch (error) {
    console.warn('CartProvider: UserContext not ready yet, using defaults');
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customDesigns, setCustomDesigns] = useState<CustomDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockProducts = useMemo(() => [
    { id: "1", name: "Classic White Tee", price: "₹2,070", image: tshirtImages.mockup1 },
    { id: "2", name: "Urban Black Design", price: "₹2,490", image: tshirtImages.mockup2 },
    { id: "3", name: "Summer Collection", price: "₹2,240", image: tshirtImages.mockup3 },
    { id: "4", name: "Vintage Edition", price: "₹2,740", image: tshirtImages.mockup4 },
    { id: "5", name: "Modern Minimalist", price: "₹2,320", image: tshirtImages.mockup5 },
    { id: "6", name: "Artist Series", price: "₹2,900", image: tshirtImages.mockup6 },
    { id: "7", name: "Classic Blue Tee", price: "₹2,070", image: tshirtImages.mockup1 },
    { id: "8", name: "Urban Gray Design", price: "₹2,490", image: tshirtImages.mockup2 },
    { id: "9", name: "Winter Collection", price: "₹2,240", image: tshirtImages.mockup3 }
  ], []);

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔄 Fetching cart items for user:", user.id);

      const { data, error } = await supabase
        .from('cart_items')
        .select('id, user_id, product_id, variant_id, quantity, created_at, updated_at, selected_color, selected_size')
        .eq('user_id', user.id as any)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const itemsWithProducts = (data as any[] || []).map(item => {
        const product = mockProducts.find(p => p.id === item.product_id);
        return {
          ...item,
          product
        };
      }) || [];

      console.log("📦 Cart items fetched:", itemsWithProducts);
      setCartItems(itemsWithProducts);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, mockProducts]);

  const fetchCustomDesigns = useCallback(async () => {
    if (!user) {
      setCustomDesigns([]);
      return;
    }

    try {
      console.log("🔄 Fetching custom designs for user:", user.id);

      const { data, error } = await supabase
        .from('custom_designs')
        .select('id, design_name, design_image, tshirt_color, base_price, theme_name, answers, design_data, created_at')
        .eq('user_id', user.id as any)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("🎨 Custom designs fetched:", data);

      // Type cast the data to match our interface
      const typedData: CustomDesign[] = (data as any[] || []).map(item => ({
        ...item,
        design_data: (item.design_data as Record<string, unknown>) || {},
        answers: Array.isArray(item.answers) ? item.answers :
          typeof item.answers === 'string' ? JSON.parse(item.answers) : []
      }));

      setCustomDesigns(typedData);
    } catch (error) {
      console.error('Error fetching custom designs:', error);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCartItems();
      fetchCustomDesigns();

      // Set up real-time subscription
      console.log("📡 Setting up cart real-time subscription");
      const channel = supabase
        .channel('cart-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('📱 Cart realtime update:', payload);
            fetchCartItems();
          }
        )
        .subscribe();

      return () => {
        console.log("📡 Cleaning up cart real-time subscription");
        supabase.removeChannel(channel);
      };
    } else {
      console.log("🔒 User not authenticated, clearing cart items and custom designs");
      setCartItems([]);
      setCustomDesigns([]);
    }
  }, [user, isAuthenticated, fetchCartItems, fetchCustomDesigns]);

  const addToCart = async (variantId: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      setIsLoading(true);
      console.log("🛒 Adding to cart:", { variantId, quantity, userId: user.id });

      // Check stock before adding
      const { data: hasStock, error: stockError } = await supabase.rpc('check_variant_stock', {
        variant_uuid: variantId,
        requested_quantity: quantity
      });

      if (stockError) {
        console.error("Error checking stock:", stockError);
        toast.error("Unable to check stock availability");
        return;
      }

      if (!hasStock) {
        toast.error("This item is currently out of stock");
        return;
      }

      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.variant_id === variantId);

      if (existingItem) {
        // Update quantity - check stock for new total first
        const newQuantity = existingItem.quantity + quantity;
        console.log("📈 Updating existing item quantity:", { itemId: existingItem.id, newQuantity });

        // Check stock for new total quantity
        const { data: hasStockForNew } = await supabase.rpc('check_variant_stock', {
          variant_uuid: variantId,
          requested_quantity: newQuantity
        });

        if (!hasStockForNew) {
          toast.error("Not enough stock available for requested quantity");
          return;
        }

        // Optimistic update
        setCartItems(items =>
          items.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        );

        const { error } = await supabase
          .from('cart_items')
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', existingItem.id as any);

        if (error) {
          // Revert optimistic update on error
          setCartItems(items =>
            items.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: existingItem.quantity }
                : item
            )
          );
          throw error;
        }
      } else {
        // Get variant details for the cart item
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('product_id, color_hex')
          .eq('id', variantId as any)
          .single();

        if (variantError) throw variantError;

        // Add new item
        console.log("➕ Adding new item to cart");

        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            variant_id: variantId,
            product_id: (variant as any).product_id,
            selected_color: (variant as any).color_hex,
            quantity
          } as any)
          .select('id, user_id, product_id, variant_id, quantity, created_at, updated_at, selected_color, selected_size')
          .single();

        if (error) throw error;

        // Add to local state immediately
        if (data) {
          console.log("✅ New item added to cart:", data);
          setCartItems(items => [data as any, ...items]);
        }
      }

      toast.success('Item added to cart');
      console.log("🎉 Cart updated successfully");
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
      // Refresh cart to ensure consistency
      fetchCartItems();
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomDesignToCart = async (customDesign: Omit<CustomDesign, 'id'>) => {
    if (!user) {
      toast.error('Please log in to add custom designs to cart');
      return;
    }

    try {
      setIsLoading(true);
      console.log("🎨 Adding custom design to cart:", customDesign);

      const clean = (v: string) => v.replace(/<[^>]*>/g, '').trim();
      const { data, error } = await supabase
        .from('custom_designs')
        .insert({
          user_id: user.id,
          design_image: customDesign.design_image,
          answers: JSON.stringify((customDesign.answers || []).map(a => ({
            question: clean(String(a?.question || '')),
            answer: clean(String(a?.answer || '')),
          }))) as any,
          base_price: customDesign.base_price,
          design_data: JSON.stringify(customDesign.design_data) as any,
          design_name: clean(customDesign.design_name),
          theme_name: customDesign.theme_name ? clean(customDesign.theme_name) : undefined,
          tshirt_color: clean(customDesign.tshirt_color)
        } as any)
        .select('id, design_name, design_image, tshirt_color, base_price, theme_name, answers, design_data, created_at')
        .single();

      if (error) throw error;

      if (data) {
        console.log("✅ Custom design added:", data);

        // Type cast the returned data to match our interface
        const typedData: CustomDesign = {
          ...(data as any),
          design_data: ((data as any).design_data as Record<string, unknown>) || {},
          answers: Array.isArray((data as any).answers) ? (data as any).answers :
            typeof (data as any).answers === 'string' ? JSON.parse((data as any).answers) : []
        };

        setCustomDesigns(designs => [typedData, ...designs]);
      }

      toast.success('Custom design added to cart');
    } catch (error) {
      console.error('Error adding custom design to cart:', error);
      toast.error('Failed to add custom design to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log("🗑️ Removing from cart:", itemId);

      // Optimistic update - remove from local state immediately
      const originalItems = [...cartItems];
      setCartItems(items => items.filter(item => item.id !== itemId));

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId as any);

      if (error) {
        // Revert on error
        setCartItems(originalItems);
        throw error;
      }

      toast.success('Item removed from cart');
      console.log("✅ Item removed successfully");
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    try {
      setIsLoading(true);
      console.log("🔄 Updating quantity:", { itemId, quantity });

      // Optimistic update
      const originalItems = [...cartItems];
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', itemId as any);

      if (error) {
        // Revert on error
        setCartItems(originalItems);
        throw error;
      }

      console.log("✅ Quantity updated successfully");
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const removeCustomDesign = async (designId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log("🗑️ Removing custom design:", designId);

      // Optimistic update - remove from local state immediately
      const originalDesigns = [...customDesigns];
      setCustomDesigns(designs => designs.filter(design => design.id !== designId));

      const { error } = await supabase
        .from('custom_designs')
        .delete()
        .eq('id', designId as any);

      if (error) {
        // Revert on error
        setCustomDesigns(originalDesigns);
        throw error;
      }

      toast.success('Custom design removed from cart');
      console.log("✅ Custom design removed successfully");
    } catch (error) {
      console.error('Error removing custom design:', error);
      toast.error('Failed to remove custom design');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log("🧹 Clearing cart for user:", user.id);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id as any);

      if (error) throw error;

      setCartItems([]);
      toast.success('Cart cleared');
      console.log("✅ Cart cleared successfully");
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0) + customDesigns.length;

  // Add logging for cart count changes
  useEffect(() => {
    console.log("📊 Cart count updated:", cartCount);
  }, [cartCount]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        customDesigns,
        addToCart,
        addCustomDesignToCart,
        removeFromCart,
        removeCustomDesign,
        updateQuantity,
        clearCart,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
