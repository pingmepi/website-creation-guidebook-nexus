import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { tshirtImages } from '../../assets';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  created_at: string;
  updated_at: string;
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
  answers: any[];
  design_data: any;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  customDesigns: CustomDesign[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  addCustomDesignToCart: (customDesign: Omit<CustomDesign, 'id'>) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
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
  const { user, isAuthenticated } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customDesigns, setCustomDesigns] = useState<CustomDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!user) {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔄 Fetching cart items for user:", user.id);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Attach product data from mock products
      const itemsWithProducts = data?.map(item => {
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
  };

  const fetchCustomDesigns = async () => {
    if (!user) {
      setCustomDesigns([]);
      return;
    }

    try {
      console.log("🔄 Fetching custom designs for user:", user.id);
      
      const { data, error } = await supabase
        .from('custom_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("🎨 Custom designs fetched:", data);
      setCustomDesigns(data || []);
    } catch (error) {
      console.error('Error fetching custom designs:', error);
    }
  };

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
  }, [user, isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      setIsLoading(true);
      console.log("🛒 Adding to cart:", { productId, quantity, userId: user.id });
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        // Update quantity - optimistic update first
        const newQuantity = existingItem.quantity + quantity;
        console.log("📈 Updating existing item quantity:", { itemId: existingItem.id, newQuantity });
        
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
          })
          .eq('id', existingItem.id);

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
        // Add new item - optimistic update first
        console.log("➕ Adding new item to cart");
        
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          })
          .select()
          .single();

        if (error) throw error;
        
        // Add to local state immediately
        if (data) {
          const product = mockProducts.find(p => p.id === productId);
          const newItem = { ...data, product };
          console.log("✅ New item added to cart:", newItem);
          setCartItems(items => [newItem, ...items]);
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
      
      const { data, error } = await supabase
        .from('custom_designs')
        .insert({
          user_id: user.id,
          ...customDesign
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        console.log("✅ Custom design added:", data);
        setCustomDesigns(designs => [data, ...designs]);
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
        .eq('id', itemId);

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
        })
        .eq('id', itemId);

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

  const clearCart = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log("🧹 Clearing cart for user:", user.id);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

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
        updateQuantity,
        clearCart,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
