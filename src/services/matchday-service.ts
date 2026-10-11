import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Matchday, MatchdayPlayerScore } from "@/types";

export async function getAllMatchdays(supabase: SupabaseClient<Database>): Promise<Matchday[]> {
  const { data, error } = await supabase.from("matchdays").select("*").order("number", { ascending: true });
  if (error || !data) return [];
  return data;
}

/** La prossima giornata da giocare: la prima non ancora chiusa. Null se il torneo è terminato. */
export async function getNextMatchday(supabase: SupabaseClient<Database>): Promise<Matchday | null> {
  const { data } = await supabase
    .from("matchdays")
    .select("*")
    .neq("status", "closed")
    .order("number", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

/** Punteggio di ogni giocatore che ha segnato in questa giornata, con il dettaglio bonus/malus,
 *  ordinato dal punteggio più alto. Array vuoto se la giornata non ha ancora punteggi. */
export async function getMatchdayScores(
  supabase: SupabaseClient<Database>,
  matchdayId: string
): Promise<MatchdayPlayerScore[]> {
  const [{ data: scores }, { data: events }] = await Promise.all([
    supabase
      .from("player_scores")
      .select("points, player:players(*)")
      .eq("matchday_id", matchdayId)
      .order("points", { ascending: false }),
    supabase
      .from("player_score_events")
      .select("id, player_id, quantity, bonus_type:bonus_types(label, points)")
      .eq("matchday_id", matchdayId),
  ]);

  if (!scores) return [];

  return scores
    .map((row) => {
      const player = Array.isArray(row.player) ? row.player[0] : row.player;
      if (!player) return null;
      const playerEvents = (events ?? [])
        .filter((e) => e.player_id === player.id)
        .map((e) => {
          const bonusType = Array.isArray(e.bonus_type) ? e.bonus_type[0] : e.bonus_type;
          return {
            id: e.id,
            label: bonusType?.label ?? "",
            points: bonusType?.points ?? 0,
            quantity: e.quantity,
          };
        });
      return { player, points: row.points, events: playerEvents } satisfies MatchdayPlayerScore;
    })
    .filter((row): row is MatchdayPlayerScore => row !== null);
}
