import { createClient } from "@/lib/supabase/server";
import { getAllMatchdays, getMatchdayScores } from "@/services/matchday-service";
import { MatchdayTabs } from "@/components/giornate/matchday-tabs";
import { CalendarX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="mb-5 sm:mb-8">
        <h1 className="font-display text-display-lg tracking-wide">Giornate</h1>
        <p className="mt-1 text-muted-foreground">Punti, bonus e malus di ogni giocatore, giornata per giornata.</p>
      </div>

      {matchdays.length === 0 ? (
        <EmptyState icon={CalendarX} title="Nessuna giornata" description="Le giornate del torneo compariranno qui appena saranno create." />
      ) : (
        <MatchdayTabs matchdays={matchdays} scoresByMatchday={scoresByMatchday} />
      )}
    </div>
  );
}
