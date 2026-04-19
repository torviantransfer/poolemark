import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";
import { CartProvider } from "@/hooks/use-cart";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0 pt-16 md:pt-[68px]">{children}</main>
      <Footer />
      <MobileBottomNav />
    </CartProvider>
  );
}
