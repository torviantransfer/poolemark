import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/store/account-sidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris?redirect=/hesabim");

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* flex-col on mobile (nav stacks above content), flex-row on desktop (sidebar left) */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
          <AccountSidebar
            firstName={profile?.first_name || ""}
            lastName={profile?.last_name || ""}
            email={user.email || ""}
          />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
