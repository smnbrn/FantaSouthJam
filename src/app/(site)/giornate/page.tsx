import { createClient } from "@/lib/supabase/server";
import { getAllMatchdays, getMatchdayScores } from "@/services/matchday-service";
import { MatchdayTabs } from "@/components/giornate/matchday-tabs";
import type { MatchdayPlayerScore } from "@/types";

export const metadata = {
  title: "Giornate",
  description: "Risultati, punti, bonus e malus di ogni giornata del torneo di Basket 3vs3 di Amantea.",
};

export default async function GiornatePage() {
  const supabase = await createClient();
  const matchdays = await getAllMatchdays(supabase);

  const scoresList = await Promise.all(matchdays.map((m) => getMatchdayScores(supabase, m.id)));
  const scoresByMatchday: Record<string, MatchdayPlayerScore[]> = {};
  matchdays.forEach((m, i) => {
    scoresByMatchday[m.id] = scoresList[i];
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">Giornate</h1>
        <p className="mt-1 text-muted-foreground">Punti, bonus e malus di ogni giocatore, giornata per giornata.</p>
      </div>

      {matchdays.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessuna giornata configurata.</p>
      ) : (
        <MatchdayTabs matchdays={matchdays} scoresByMatchday={scoresByMatchday} />
      )}
    </div>
  );
}
