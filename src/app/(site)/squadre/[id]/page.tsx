import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Trophy, Coins, User } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getTeamWithOwner, getTeamRoster, getRosterValue } from "@/services/team-service";
import { getTeamRankingHistory } from "@/services/ranking-service";
import { PublicRoster } from "@/components/squadre/public-roster";
import { MatchdayHistory } from "@/components/squadre/matchday-history";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const team = await getTeamWithOwner(supabase, id);
  return { title: team ? team.team_name : "Squadra non trovata" };
}

export default async function PublicTeamPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const team = await getTeamWithOwner(supabase, id);
  if (!team) notFound();

  const [roster, history] = await Promise.all([
    getTeamRoster(supabase, team.id),
    getTeamRankingHistory(supabase, team.id),
  ]);
  const rosterValue = getRosterValue(roster);
  const latest = history[history.length - 1];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="court-arc-bg rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="size-4" /> Allenatore: {team.ownerUsername}
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-wide sm:text-4xl">{team.team_name}</h1>

        <div className="mt-5 flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Trophy className="size-4 text-primary" /> {latest ? `${latest.position}° in classifica` : "Nessuna giornata giocata"}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Coins className="size-4 text-primary" /> Valore rosa: {rosterValue} cr.
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="mb-4 font-display text-xl tracking-wide">Rosa</h2>
          <PublicRoster roster={roster} />
        </section>
        <section>
          <h2 className="mb-4 font-display text-xl tracking-wide">Storico giornate</h2>
          <MatchdayHistory history={history} />
        </section>
      </div>
    </div>
  );
}
