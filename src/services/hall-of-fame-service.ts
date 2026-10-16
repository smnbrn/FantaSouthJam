import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { HallOfFameEntry } from "@/types";
import type { HallOfFameInput } from "@/lib/validations/hall-of-fame";

export async function getHallOfFame(supabase: SupabaseClient<Database>): Promise<HallOfFameEntry[]> {
  const { data, error } = await supabase.from("hall_of_fame").select("*").order("year", { ascending: false });
  if (error || !data) return [];
  return data;
}

/** Archivia la stagione in corso: vincitore = prima squadra, top player = più fantapunti. */
export async function archiveSeason(
  supabase: SupabaseClient<Database>,
  year: number
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("archive_season", { p_year: year });
  return { error: error?.message ?? null };
}

function toRow(input: HallOfFameInput) {
  return {
    year: input.year,
    winner_team_name: input.winnerTeamName,
    winner_coach: input.winnerCoach || null,
    winner_points: input.winnerPoints ?? null,
    top_player_name: input.topPlayerName,
    top_player_team: input.topPlayerTeam || null,
    top_player_points: input.topPlayerPoints ?? null,
    notes: input.notes || null,
  };
}

export async function saveHallOfFameEntry(
  supabase: SupabaseClient<Database>,
  input: HallOfFameInput,
  id?: string
): Promise<{ error: string | null }> {
  const { error } = id
    ? await supabase.from("hall_of_fame").update(toRow(input)).eq("id", id)
    : await supabase.from("hall_of_fame").insert(toRow(input));
  if (error?.code === "23505") return { error: `Esiste già un'edizione ${input.year}` };
  return { error: error?.message ?? null };
}

export async function deleteHallOfFameEntry(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("hall_of_fame").delete().eq("id", id);
  return { error: error?.message ?? null };
}
