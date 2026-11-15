import { redirect } from "next/navigation";
import { Coins, Gem, Lock, Trophy, Medal } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getMyTeam, getTeamRoster, getRosterValue } from "@/services/team-service";
import { getSettings } from "@/services/settings-service";
import { getNextMatchday } from "@/services/matchday-service";
import { getMyLatestRanking, getTotalTeamsCount } from "@/services/ranking-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { CreateTeamPrompt } from "@/components/dashboard/create-team-prompt";
import { RosterSummary } from "@/components/dashboard/roster-summary";
import { NextMatchdayCard } from "@/components/dashboard/next-matchday-card";
import { Badge } from "@/components/ui/badge";

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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
        <h1 className="font-display text-display-lg tracking-wide">Ciao, {username} 👋</h1>
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Ciao, {username} 👋</p>
          <h1 className="break-words font-display text-display-lg tracking-wide">{team.team_name}</h1>
        </div>
        {team.is_locked && (
          <Badge variant="secondary" className="py-1">
            <Lock className="size-3.5" /> Rosa bloccata
          </Badge>
        )}
      </div>

      {/* Due per riga anche su telefono: le quattro statistiche stanno in mezza schermata. */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="Posizione"
          value={ranking ? `${ranking.position}°` : "—"}
          suffix={ranking ? `/ ${totalTeams}` : undefined}
          highlight
        />
        <StatCard icon={Medal} label="Punti totali" value={ranking?.points_total ?? team.total_points} />
        <StatCard icon={Coins} label="Crediti rimasti" value={team.budget_remaining} suffix={`/ ${team.budget_initial}`} />
        <StatCard icon={Gem} label="Valore rosa" value={rosterValue} suffix="cr." />
      </div>

      {/* Su telefono la prossima giornata viene prima della rosa, su schermi larghi sta a destra. */}
      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="lg:order-last">
          <NextMatchdayCard matchday={nextMatchday} />
        </div>
        <RosterSummary roster={roster} rosterMaxSize={settings.roster_max_size} />
      </div>
    </div>
  );
}
