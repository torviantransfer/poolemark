"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { formatPrice, calculateDiscountPercentage } from "@/lib/helpers";

interface FavoriteProduct {
  id: string;
  favorite_id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  image: string | null;
  stock_quantity: number;
}

export default function FavoritesPage() {
  const { user } = useUser();
  const { addItem } = useCart();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadFavorites();
  }, [user]);

  async function loadFavorites() {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("favorites")
      .select("id, product:products!product_id(id, name, slug, price, compare_at_price, stock_quantity, images:product_images(url, is_primary))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const mapped: FavoriteProduct[] = data.map((f: any) => {
        const img = f.product?.images?.find((i: any) => i.is_primary)?.url || f.product?.images?.[0]?.url || null;
        return {
          id: f.product?.id,
          favorite_id: f.id,
          name: f.product?.name || "",
          slug: f.product?.slug || "",
          price: f.product?.price || 0,
          compare_at_price: f.product?.compare_at_price,
          image: img,
          stock_quantity: f.product?.stock_quantity || 0,
        };
      });
      setFavorites(mapped);
    }
    setLoading(false);
  }

  async function removeFavorite(favoriteId: string) {
    const supabase = createClient();
    await supabase.from("favorites").delete().eq("id", favoriteId);
    setFavorites((prev) => prev.filter((f) => f.favorite_id !== favoriteId));
  }

  function handleAddToCart(product: FavoriteProduct) {
    addItem({
      product_id: product.id,
      variant_id: null,
      name: product.name,
      image: product.image,
      price: product.price,
      compare_at_price: product.compare_at_price,
      quantity: 1,
      stock_quantity: product.stock_quantity,
      slug: product.slug,
      variant_name: null,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <section className="bg-secondary/40 border-b">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/hesabim" className="hover:text-primary transition-colors">Hesabım</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Favorilerim</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Favorilerim
            {favorites.length > 0 && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({favorites.length} ürün)
              </span>
            )}
          </h1>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((product) => {
                const discount = product.compare_at_price
                  ? calculateDiscountPercentage(product.compare_at_price, product.price)
                  : 0;

                return (
                  <div
                    key={product.favorite_id}
                    className="bg-white rounded-2xl border overflow-hidden group"
                  >
                    <Link href={`/products/${product.slug}`} className="block aspect-square bg-secondary relative overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
                        </div>
                      )}
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-destructive text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          %{discount}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFavorite(product.favorite_id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-destructive hover:bg-white transition-colors shadow-sm"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </Link>

                    <div className="p-3">
                      <Link href={`/products/${product.slug}`} className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.compare_at_price)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 gap-1.5"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity <= 0}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {product.stock_quantity > 0 ? "Sepete Ekle" : "Tükendi"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-semibold text-foreground">Favori ürününüz yok</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Beğendiğiniz ürünleri favorilere ekleyin, kaçırmayın!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4 hover:underline underline-offset-4"
              >
                Ürünlere Göz At <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
