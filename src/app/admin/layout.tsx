import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="pt-14 lg:pt-0 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
