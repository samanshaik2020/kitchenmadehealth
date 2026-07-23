import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <AdminSidebar />
      <main className="lg:ml-64">{children}</main>
    </div>
  );
}
