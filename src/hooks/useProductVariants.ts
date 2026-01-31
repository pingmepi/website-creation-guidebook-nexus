'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductSize {
  size: string;
  available_stock: number;
}

interface ProductColor {
  color_name: string;
  color_hex: string;
  stock_quantity: number;
  variant_id: string;
}

export function useProductVariants(productId: string) {
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Fetch available sizes for the product
  useEffect(() => {
    if (!productId) return;

    const fetchSizes = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_product_sizes', {
          product_uuid: productId
        });

        if (error) {
          console.error('Error fetching product sizes:', error);
          return;
        }

        setSizes((data as any) || []);
        // Auto-select first available size
        if (data && (data as any).length > 0) {
          setSelectedSize((data as any)[0].size);
        }
      } catch (error) {
        console.error('Error fetching product sizes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSizes();
  }, [productId]);

  // Fetch available colors when size changes
  useEffect(() => {
    if (!productId || !selectedSize) return;

    const fetchColors = async () => {
      try {
        const { data, error } = await supabase.rpc('get_product_colors', {
          product_uuid: productId,
          size_param: selectedSize
        });

        if (error) {
          console.error('Error fetching product colors:', error);
          return;
        }

        setColors((data as any) || []);
      } catch (error) {
        console.error('Error fetching product colors:', error);
      }
    };

    fetchColors();
  }, [productId, selectedSize]);

  const checkStock = async (variantId: string, quantity: number = 1): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_variant_stock', {
        variant_uuid: variantId,
        requested_quantity: quantity
      });

      if (error) {
        console.error('Error checking stock:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Error checking stock:', error);
      return false;
    }
  };

  return {
    sizes,
    colors,
    loading,
    selectedSize,
    setSelectedSize,
    checkStock
  };
}