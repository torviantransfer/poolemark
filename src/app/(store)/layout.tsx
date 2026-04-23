import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { ExitIntent } from "@/components/store/exit-intent";
import { PresenceTracker } from "@/components/store/presence-tracker";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PresenceTracker />
      <Header />
      <main id="main" className="flex-1 pb-16 lg:pb-0 pt-16 md:pt-[68px]">{children}</main>
      <Footer />
      <ExitIntent />
    </>
  );
}
