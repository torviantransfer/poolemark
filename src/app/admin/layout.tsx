import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.12),_transparent_36%),linear-gradient(to_bottom,_hsl(var(--background)),_hsl(var(--secondary)/0.35))]">
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="pt-14 lg:pt-0 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
