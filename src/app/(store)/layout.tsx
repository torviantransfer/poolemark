import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { ExitIntent } from "@/components/store/exit-intent";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0 pt-16 md:pt-[68px]">{children}</main>
      <Footer />
      <ExitIntent />
    </>
  );
}
