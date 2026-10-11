import { createClient } from "@/lib/supabase/server";
import { getAllMatchdaysAdmin, getAllBonusTypes } from "@/services/admin-service";
import { getActivePlayers } from "@/services/player-service";
import { getMatchdayScores } from "@/services/matchday-service";
import { AdminMatchdayTabs } from "@/components/admin/admin-matchday-tabs";
import type { MatchdayPlayerScore } from "@/types";

export const metadata = { title: "Admin · Giornate" };

export default async function AdminGiornatePage() {
  const supabase = await createClient();
  const [matchdays, players, bonusTypes] = await Promise.all([
    getAllMatchdaysAdmin(supabase),
    getActivePlayers(supabase),
    getAllBonusTypes(supabase),
  ]);

  const scoresList = await Promise.all(matchdays.map((m) => getMatchdayScores(supabase, m.id)));
  const scoresByMatchday: Record<string, MatchdayPlayerScore[]> = {};
  matchdays.forEach((m, i) => {
    scoresByMatchday[m.id] = scoresList[i];
  });

  if (matchdays.length === 0) {
    return <p className="text-sm text-muted-foreground">Nessuna giornata configurata.</p>;
  }

  return (
    <AdminMatchdayTabs matchdays={matchdays} players={players} bonusTypes={bonusTypes} scoresByMatchday={scoresByMatchday} />
  );
}
