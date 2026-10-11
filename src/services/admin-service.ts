import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Player, Profile, Matchday, BonusType, FantasyTeam } from "@/types";
import type { PlayerInput, MatchdayInput, SettingsInput } from "@/lib/validations/admin";

// ---------------------------------------------------------------------------
// Giocatori
// ---------------------------------------------------------------------------

export async function getAllPlayersAdmin(supabase: SupabaseClient<Database>): Promise<Player[]> {
  const { data, error } = await supabase.from("players").select("*").order("full_name", { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function createPlayer(
  supabase: SupabaseClient<Database>,
  input: PlayerInput
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("players").insert({
    full_name: input.fullName,
    real_team: input.realTeam,
    role: input.role,
    cost: input.cost,
    photo_url: input.photoUrl || null,
  });
  return { error: error?.message ?? null };
}

export async function updatePlayer(
  supabase: SupabaseClient<Database>,
  id: string,
  input: PlayerInput
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("players")
    .update({
      full_name: input.fullName,
      real_team: input.realTeam,
      role: input.role,
      cost: input.cost,
      photo_url: input.photoUrl || null,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function setPlayerActive(
  supabase: SupabaseClient<Database>,
  id: string,
  isActive: boolean
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("players").update({ is_active: isActive }).eq("id", id);
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Bonus/malus e giornate
// ---------------------------------------------------------------------------

export async function getAllBonusTypes(supabase: SupabaseClient<Database>): Promise<BonusType[]> {
  const { data, error } = await supabase
    .from("bonus_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function assignScoreEvent(
  supabase: SupabaseClient<Database>,
  params: { matchdayId: string; playerId: string; bonusTypeId: string; quantity: number }
): Promise<{ error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("player_score_events").insert({
    matchday_id: params.matchdayId,
    player_id: params.playerId,
    bonus_type_id: params.bonusTypeId,
    quantity: params.quantity,
    created_by: userData.user?.id,
  });
  return { error: error?.message ?? null };
}

export async function removeScoreEvent(
  supabase: SupabaseClient<Database>,
  eventId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("player_score_events").delete().eq("id", eventId);
  return { error: error?.message ?? null };
}

export async function updateMatchday(
  supabase: SupabaseClient<Database>,
  id: string,
  input: MatchdayInput
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("matchdays")
    .update({
      status: input.status,
      match_date: input.matchDate || null,
      results_summary: input.resultsSummary || null,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Impostazioni
// ---------------------------------------------------------------------------

export async function updateSettings(
  supabase: SupabaseClient<Database>,
  input: SettingsInput
): Promise<{ error: string | null }> {
  const rows: Array<{ key: string; value: unknown }> = [
    { key: "market_open", value: input.marketOpen },
    { key: "budget_initial", value: input.budgetInitial },
    { key: "roster_max_size", value: input.rosterMaxSize },
    { key: "roster_max_starters", value: input.rosterMaxStarters },
    { key: "tournament_start_date", value: input.tournamentStartDate || null },
    { key: "rules_text", value: input.rulesText },
  ];

  const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Utenti e squadre (sola lettura)
// ---------------------------------------------------------------------------

export async function getAllProfiles(supabase: SupabaseClient<Database>): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data;
}

export interface AdminTeamRow extends FantasyTeam {
  ownerUsername: string;
  rosterCount: number;
}

export async function getAllTeamsAdmin(supabase: SupabaseClient<Database>): Promise<AdminTeamRow[]> {
  const [{ data: teams, error }, { data: rosterRows }] = await Promise.all([
    supabase.from("fantasy_teams").select("*, profile:profiles(username)").order("created_at", { ascending: false }),
    supabase.from("fantasy_team_players").select("fantasy_team_id"),
  ]);
  if (error || !teams) return [];

  const rosterCounts = new Map<string, number>();
  (rosterRows ?? []).forEach((row) => {
    rosterCounts.set(row.fantasy_team_id, (rosterCounts.get(row.fantasy_team_id) ?? 0) + 1);
  });

  return teams.map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    return {
      id: row.id,
      user_id: row.user_id,
      team_name: row.team_name,
      budget_initial: row.budget_initial,
      budget_remaining: row.budget_remaining,
      total_points: row.total_points,
      is_locked: row.is_locked,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ownerUsername: profile?.username ?? "—",
      rosterCount: rosterCounts.get(row.id) ?? 0,
    };
  });
}

// ---------------------------------------------------------------------------

export interface TopPickedPlayer {
  player: Player;
  pickCount: number;
}

/** I giocatori presenti in più rose, ordinati dal più scelto. */
export async function getTopPickedPlayers(
  supabase: SupabaseClient<Database>,
  limit = 5
): Promise<TopPickedPlayer[]> {
  const { data, error } = await supabase.from("fantasy_team_players").select("player_id, player:players(*)");
  if (error || !data) return [];

  const counts = new Map<string, { player: Player; count: number }>();
  data.forEach((row) => {
    const player = Array.isArray(row.player) ? row.player[0] : row.player;
    if (!player) return;
    const existing = counts.get(row.player_id);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(row.player_id, { player, count: 1 });
    }
  });

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((entry) => ({ player: entry.player, pickCount: entry.count }));
}

// ---------------------------------------------------------------------------
export async function getAllMatchdaysAdmin(supabase: SupabaseClient<Database>): Promise<Matchday[]> {
  const { data, error } = await supabase.from("matchdays").select("*").order("number", { ascending: true });
  if (error || !data) return [];
  return data;
}
