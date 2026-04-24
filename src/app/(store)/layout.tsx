import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { ExitIntent } from "@/components/store/exit-intent";
import { PresenceTracker } from "@/components/store/presence-tracker";
import { createClient } from "@/lib/supabase/server";
import type { FooterSettings } from "@/components/store/footer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let footerSettings: FooterSettings = {};
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["contact_phone", "contact_email", "contact_address", "instagram_url", "facebook_url", "twitter_url", "whatsapp_number"]);
    if (data) {
      const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
      footerSettings = {
        phone: map.contact_phone,
        email: map.contact_email,
        address: map.contact_address,
        instagram_url: map.instagram_url,
        facebook_url: map.facebook_url,
        twitter_url: map.twitter_url,
        whatsapp_number: map.whatsapp_number,
      };
    }
  } catch {
    // DB erişimi başarısız olursa SITE_CONFIG fallback'i kullanılır
  }

  const enablePresence = process.env.NEXT_PUBLIC_ENABLE_PRESENCE === "true";

  return (
    <>
      {enablePresence ? <PresenceTracker /> : null}
      <Header />
      <main id="main" className="flex-1 pb-16 lg:pb-0 pt-16 md:pt-[68px]">{children}</main>
      <Footer settings={footerSettings} />
      <ExitIntent />
    </>
  );
}
