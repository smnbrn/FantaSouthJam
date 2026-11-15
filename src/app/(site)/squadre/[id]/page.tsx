import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { User } from "lucide-react";

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14">
      {/* Intestazione a tabellone: nome, allenatore e i tre numeri che contano. */}
      <div className="scoreboard rounded-3xl p-5 sm:p-8">
        <p className="flex items-center gap-1.5 text-sm text-white/70">
          <User className="size-4" /> Allenatore: {team.ownerUsername}
        </p>
        <h1 className="mt-1 break-words font-display text-display-lg tracking-wide">{team.team_name}</h1>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 sm:mt-6 sm:pt-5">
          <div>
            <dt className="text-label uppercase text-white/60">Posizione</dt>
            <dd className="scoreboard-digit mt-1 text-2xl leading-none text-accent sm:text-4xl">{latest ? `${latest.position}°` : "—"}</dd>
          </div>
          <div>
            <dt className="text-label uppercase text-white/60">Punti</dt>
            <dd className="scoreboard-digit mt-1 text-2xl leading-none text-primary sm:text-4xl">
              {latest ? latest.pointsTotal : team.total_points}
            </dd>
          </div>
          <div>
            <dt className="text-label uppercase text-white/60">Valore rosa</dt>
            <dd className="scoreboard-digit mt-1 text-2xl leading-none sm:text-4xl">
              {rosterValue}
              <span className="ml-1 font-sans text-xs font-semibold text-white/60">cr.</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section>
          <h2 className="mb-3 font-display text-display-sm tracking-wide">Rosa</h2>
          <PublicRoster roster={roster} />
        </section>
        <section>
          <h2 className="mb-3 font-display text-display-sm tracking-wide">Storico giornate</h2>
          <MatchdayHistory history={history} />
        </section>
      </div>
    </div>
  );
}
