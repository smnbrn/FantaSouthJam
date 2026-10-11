import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getMyTeam, getTeamRoster, getRosterValue } from "@/services/team-service";
import { getSettings } from "@/services/settings-service";
import { CreateTeamForm } from "@/components/squadra/create-team-form";
import { RosterManager } from "@/components/squadra/roster-manager";
import { BudgetBar } from "@/components/squadra/budget-bar";
import { Gem } from "lucide-react";

export const metadata = { title: "La mia squadra" };

export default async function SquadraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [team, settings] = await Promise.all([getMyTeam(supabase, user.id), getSettings(supabase)]);

  if (!team) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
        <CreateTeamForm userId={user.id} budgetInitial={settings.budget_initial} />
      </div>
    );
  }

  const roster = await getTeamRoster(supabase, team.id);
  const rosterValue = getRosterValue(roster);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{team.team_name}</h1>

      <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[2fr_1fr] sm:items-center">
        <BudgetBar remaining={team.budget_remaining} total={team.budget_initial} />
        <div className="flex items-center gap-2 sm:justify-end">
          <Gem className="size-4 text-primary" />
          <span className="text-sm font-semibold">Valore rosa: {rosterValue} cr.</span>
        </div>
      </div>

      <div className="mt-6">
        <RosterManager team={team} roster={roster} rosterMaxStarters={settings.roster_max_starters} marketOpen={settings.market_open} />
      </div>
    </div>
  );
}
