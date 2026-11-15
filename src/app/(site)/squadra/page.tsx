import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getMyTeam, getTeamRoster, getRosterValue } from "@/services/team-service";
import { getSettings } from "@/services/settings-service";
import { getAllMatchdays } from "@/services/matchday-service";
import { CreateTeamForm } from "@/components/squadra/create-team-form";
import { RosterManager } from "@/components/squadra/roster-manager";
import { BudgetBar } from "@/components/squadra/budget-bar";
import { Gem, Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

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
        {settings.registration_open ? (
          <CreateTeamForm budgetInitial={settings.budget_initial} />
        ) : (
          <EmptyState
            icon={Lock}
            title="Iscrizioni chiuse"
            description="Non è possibile creare nuove squadre in questo momento."
          />
        )}
      </div>
    );
  }

  const [roster, matchdays] = await Promise.all([getTeamRoster(supabase, team.id), getAllMatchdays(supabase)]);
  const liveMatchday = matchdays.find((m) => m.status === "open") ?? null;
  const rosterValue = getRosterValue(roster);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14">
      <h1 className="break-words font-display text-display-lg tracking-wide">{team.team_name}</h1>

      <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:grid-cols-[2fr_1fr] sm:items-center">
        <BudgetBar remaining={team.budget_remaining} total={team.budget_initial} />
        <div className="flex items-center gap-2 sm:justify-end">
          <Gem className="size-4 text-primary-ink" />
          <span className="text-sm font-semibold">Valore rosa: {rosterValue} cr.</span>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <RosterManager
          team={team}
          roster={roster}
          rosterMaxStarters={settings.roster_max_starters}
          marketOpen={settings.market_open}
          liveMatchdayTitle={liveMatchday?.title ?? null}
        />
      </div>
    </div>
  );
}
