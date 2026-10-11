import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { CurrentRanking, LeaderboardRow } from "@/types";

/** L'ultima riga di classifica calcolata per questa squadra (null se nessuna giornata è ancora chiusa). */
export async function getMyLatestRanking(
  supabase: SupabaseClient<Database>,
  fantasyTeamId: string
): Promise<CurrentRanking | null> {
  const { data } = await supabase
    .from("current_rankings")
    .select("*")
    .eq("fantasy_team_id", fantasyTeamId)
    .maybeSingle();
  return data;
}

/** Numero totale di squadre iscritte, per mostrare "3° su 12" invece del solo "3°". */
export async function getTotalTeamsCount(supabase: SupabaseClient<Database>): Promise<number> {
  const { count } = await supabase.from("fantasy_teams").select("*", { count: "exact", head: true });
  return count ?? 0;
}

/** Classifica completa: tutte le squadre iscritte, ordinate per posizione (le squadre
 *  che non hanno ancora punti restano in fondo, ordinate per nome). */
export async function getLeaderboard(supabase: SupabaseClient<Database>): Promise<LeaderboardRow[]> {
  const [{ data: teams }, { data: rankings }] = await Promise.all([
    supabase.from("fantasy_teams").select("id, team_name, profile:profiles(username)"),
    supabase.from("current_rankings").select("*"),
  ]);

  const rankingByTeam = new Map((rankings ?? []).map((r) => [r.fantasy_team_id, r]));

  const rows: LeaderboardRow[] = (teams ?? []).map((team) => {
    const ranking = rankingByTeam.get(team.id);
    const profile = Array.isArray(team.profile) ? team.profile[0] : team.profile;
    return {
      fantasyTeamId: team.id,
      teamName: team.team_name,
      coachUsername: profile?.username ?? "—",
      pointsTotal: ranking?.points_total ?? 0,
      pointsMatchday: ranking?.points_matchday ?? 0,
      position: ranking?.position ?? null,
      previousPosition: ranking?.previous_position ?? null,
    };
  });

  return rows.sort((a, b) => {
    if (a.position === null && b.position === null) return a.teamName.localeCompare(b.teamName, "it");
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return a.position - b.position;
  });
}

export interface RankingHistoryEntry {
  matchdayNumber: number;
  matchdayTitle: string;
  pointsMatchday: number;
  pointsTotal: number;
  position: number;
}

/** Storico di posizione/punti di una squadra, giornata per giornata (per la pagina pubblica squadra). */
export async function getTeamRankingHistory(
  supabase: SupabaseClient<Database>,
  fantasyTeamId: string
): Promise<RankingHistoryEntry[]> {
  const { data, error } = await supabase
    .from("rankings")
    .select("*, matchday:matchdays(number, title)")
    .eq("fantasy_team_id", fantasyTeamId);
  if (error || !data) return [];

  return data
    .map((row) => {
      const matchday = Array.isArray(row.matchday) ? row.matchday[0] : row.matchday;
      return {
        matchdayNumber: matchday?.number ?? 0,
        matchdayTitle: matchday?.title ?? "",
        pointsMatchday: row.points_matchday,
        pointsTotal: row.points_total,
        position: row.position,
      };
    })
    .sort((a, b) => a.matchdayNumber - b.matchdayNumber);
}
