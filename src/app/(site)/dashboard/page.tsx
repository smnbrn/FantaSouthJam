import { redirect } from "next/navigation";
import { Coins, Gem, Trophy, Medal } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getMyTeam, getTeamRoster, getRosterValue } from "@/services/team-service";
import { getSettings } from "@/services/settings-service";
import { getNextMatchday } from "@/services/matchday-service";
import { getMyLatestRanking, getTotalTeamsCount } from "@/services/ranking-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { CreateTeamPrompt } from "@/components/dashboard/create-team-prompt";
import { RosterSummary } from "@/components/dashboard/roster-summary";
import { NextMatchdayCard } from "@/components/dashboard/next-matchday-card";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, team, settings] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user.id).single(),
    getMyTeam(supabase, user.id),
    getSettings(supabase),
  ]);
  const username = profileRes.data?.username ?? "";

  if (!team) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">Ciao, {username} 👋</h1>
        <div className="mt-8">
          <CreateTeamPrompt budgetInitial={settings.budget_initial} />
        </div>
      </div>
    );
  }

  const [roster, ranking, nextMatchday, totalTeams] = await Promise.all([
    getTeamRoster(supabase, team.id),
    getMyLatestRanking(supabase, team.id),
    getNextMatchday(supabase),
    getTotalTeamsCount(supabase),
  ]);
  const rosterValue = getRosterValue(roster);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Ciao, {username} 👋</p>
          <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{team.team_name}</h1>
        </div>
        {team.is_locked && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            🔒 Rosa bloccata
          </span>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="Posizione classifica"
          value={ranking ? `${ranking.position}°` : "—"}
          suffix={ranking ? `/ ${totalTeams}` : undefined}
          highlight
        />
        <StatCard icon={Medal} label="Punti totali" value={ranking?.points_total ?? team.total_points} />
        <StatCard icon={Coins} label="Crediti rimasti" value={team.budget_remaining} suffix={`/ ${team.budget_initial}`} />
        <StatCard icon={Gem} label="Valore rosa" value={rosterValue} suffix="cr." />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <RosterSummary roster={roster} rosterMaxSize={settings.roster_max_size} />
        <NextMatchdayCard matchday={nextMatchday} />
      </div>
    </div>
  );
}
