"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { formatPrice } from "@/lib/helpers";

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  name: string;
  image: string | null;
  price: number;
  compare_at_price: number | null;
  quantity: number;
  stock_quantity: number;
  slug: string;
  variant_name: string | null;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "poolemark_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loading]);

  // Sync with Supabase if logged in
  useEffect(() => {
    if (!user || loading) return;

    const supabase = createClient();

    // Load server cart and merge
    supabase
      .from("cart_items")
      .select("*, product:products!product_id(name, slug, price, compare_at_price, stock_quantity, images:product_images(url, is_primary))")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const serverItems: CartItem[] = data.map((ci: any) => {
            const primaryImage = ci.product?.images?.find((i: any) => i.is_primary)?.url || ci.product?.images?.[0]?.url || null;
            return {
              id: ci.id,
              product_id: ci.product_id,
              variant_id: ci.variant_id,
              name: ci.product?.name || "",
              image: primaryImage,
              price: ci.product?.price || 0,
              compare_at_price: ci.product?.compare_at_price || null,
              quantity: ci.quantity,
              stock_quantity: ci.product?.stock_quantity || 0,
              slug: ci.product?.slug || "",
              variant_name: null,
            };
          });

          // Merge: server items take priority, add local-only items
          setItems((localItems) => {
            const merged = [...serverItems];
            for (const local of localItems) {
              if (!merged.find((m) => m.product_id === local.product_id && m.variant_id === local.variant_id)) {
                merged.push(local);
                // Also push local item to server
                supabase.from("cart_items").insert({
                  user_id: user.id,
                  product_id: local.product_id,
                  variant_id: local.variant_id,
                  quantity: local.quantity,
                });
              }
            }
            return merged;
          });
        }
      });
  }, [user, loading]);

  const addItem = useCallback(
    (item: Omit<CartItem, "id">) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
        );
        if (existing) {
          const newQty = Math.min(existing.quantity + item.quantity, item.stock_quantity);
          const updated = prev.map((i) =>
            i.id === existing.id ? { ...i, quantity: newQty } : i
          );

          // Sync to server
          if (user) {
            const supabase = createClient();
            supabase
              .from("cart_items")
              .update({ quantity: newQty })
              .eq("id", existing.id);
          }

          return updated;
        }

        const newItem: CartItem = {
          ...item,
          id: crypto.randomUUID(),
        };

        // Sync to server
        if (user) {
          const supabase = createClient();
          supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          });
        }

        return [...prev, newItem];
      });
    },
    [user]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );

      if (user) {
        const supabase = createClient();
        supabase.from("cart_items").update({ quantity }).eq("id", id);
      }
    },
    [user]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));

      if (user) {
        const supabase = createClient();
        supabase.from("cart_items").delete().eq("id", id);
      }
    },
    [user]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);

    if (user) {
      const supabase = createClient();
      supabase.from("cart_items").delete().eq("user_id", user.id);
    }
  }, [user]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
