import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Shield } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getMyTeam } from "@/services/team-service";
import { formatDate, formatNumber, getInitials } from "@/lib/utils";
import { ProfileForm } from "@/components/profilo/profile-form";
import { ChangePasswordForm } from "@/components/profilo/change-password-form";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Profilo" };

export default async function ProfiloPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/profilo");

  const [{ data: profile }, team] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getMyTeam(supabase, user.id),
  ]);
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-2xl text-primary-foreground">
          {getInitials(profile.full_name || profile.username)}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-3xl tracking-wide sm:text-4xl">{profile.username}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {user.email}
            {profile.role === "admin" && <Badge variant="outline">Admin</Badge>}
            <span aria-hidden="true">·</span>
            iscritto dal {formatDate(profile.created_at)}
          </p>
        </div>
      </header>

      {team ? (
        <Link
          href="/squadra"
          className="group mt-8 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/40"
        >
          <Shield className="size-6 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{team.team_name}</p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(team.total_points)} punti · {formatNumber(team.budget_remaining)} crediti rimasti
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <Link
          href="/squadra"
          className="mt-8 flex items-center justify-between rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground hover:border-primary/40"
        >
          Non hai ancora una squadra. <span className="font-semibold text-primary">Creala ora</span>
        </Link>
      )}

      <div className="mt-8 grid gap-6">
        <ProfileForm username={profile.username} fullName={profile.full_name} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
