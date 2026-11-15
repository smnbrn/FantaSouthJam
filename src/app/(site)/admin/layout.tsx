import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="mb-5 sm:mb-8">
        <p className="text-label uppercase text-primary-ink">Pannello amministratore</p>
        <h1 className="mt-1 font-display text-display-lg tracking-wide">Gestione torneo</h1>
      </div>
      <AdminNav />
      <div className="mt-6">{children}</div>
    </div>
  );
}
