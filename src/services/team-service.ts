import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { FantasyTeam, RosterEntry } from "@/types";

export async function getMyTeam(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<FantasyTeam | null> {
  const { data } = await supabase.from("fantasy_teams").select("*").eq("user_id", userId).maybeSingle();
  return data;
}

export async function getTeamById(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<FantasyTeam | null> {
  const { data } = await supabase.from("fantasy_teams").select("*").eq("id", teamId).maybeSingle();
  return data;
}

export interface TeamWithOwner extends FantasyTeam {
  ownerUsername: string;
}

/** La squadra con lo username del proprietario, per la pagina pubblica squadra. */
export async function getTeamWithOwner(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<TeamWithOwner | null> {
  const { data } = await supabase
    .from("fantasy_teams")
    .select("*, profile:profiles(username)")
    .eq("id", teamId)
    .maybeSingle();
  if (!data) return null;
  const profile = Array.isArray(data.profile) ? data.profile[0] : data.profile;
  return {
    id: data.id,
    user_id: data.user_id,
    team_name: data.team_name,
    budget_initial: data.budget_initial,
    budget_remaining: data.budget_remaining,
    total_points: data.total_points,
    is_locked: data.is_locked,
    created_at: data.created_at,
    updated_at: data.updated_at,
    ownerUsername: profile?.username ?? "—",
  };
}

export async function getTeamRoster(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<RosterEntry[]> {
  const { data, error } = await supabase
    .from("fantasy_team_players")
    .select("*, player:players(*)")
    .eq("fantasy_team_id", teamId)
    .order("purchased_at", { ascending: true });

  if (error || !data) return [];
  // Il join Supabase tipizza `player` come possibile array in alcuni casi:
  // normalizziamo qui per avere un oggetto singolo (relazione 1:1 sull'FK).
  return data.map((row) => ({
    ...row,
    player: Array.isArray(row.player) ? row.player[0] : row.player,
  })) as RosterEntry[];
}

/** Valore corrente della rosa: somma del costo ATTUALE dei giocatori posseduti
 *  (diverso dal budget speso, che è invece la somma di purchase_price). */
export function getRosterValue(roster: RosterEntry[]): number {
  return roster.reduce((sum, entry) => sum + entry.player.cost, 0);
}

/**
 * Crea la squadra dell'utente loggato tramite la funzione Postgres
 * `create_team`: budget iniziale, unicità del nome e stato delle iscrizioni
 * sono decisi dal database, non dal client.
 */
export async function createTeam(
  supabase: SupabaseClient<Database>,
  teamName: string
): Promise<{ team: FantasyTeam | null; error: string | null }> {
  const { data, error } = await supabase.rpc("create_team", { p_team_name: teamName });
  if (error) {
    return { team: null, error: translateTeamError(error.message) };
  }
  return { team: data, error: null };
}

export async function buyPlayer(
  supabase: SupabaseClient<Database>,
  fantasyTeamId: string,
  playerId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("purchase_player", {
    p_fantasy_team_id: fantasyTeamId,
    p_player_id: playerId,
  });
  return { error: error?.message ?? null };
}

export async function sellPlayer(
  supabase: SupabaseClient<Database>,
  fantasyTeamId: string,
  playerId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("sell_player", {
    p_fantasy_team_id: fantasyTeamId,
    p_player_id: playerId,
  });
  return { error: error?.message ?? null };
}

export async function setStarters(
  supabase: SupabaseClient<Database>,
  fantasyTeamId: string,
  playerIds: string[]
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("set_starters", {
    p_fantasy_team_id: fantasyTeamId,
    p_player_ids: playerIds,
  });
  return { error: error?.message ?? null };
}

/** Traduce i messaggi delle funzioni Postgres (già in italiano) e gli errori generici di rete. */
export function translateTeamError(message: string | null): string {
  if (!message) return "Si è verificato un errore imprevisto. Riprova.";
  // I messaggi delle funzioni Postgres (create_team, purchase_player, ...) sono già in
  // italiano e PostgREST li restituisce così come sono. Rimuoviamo solo un eventuale
  // prefisso tecnico in inglese (es. "ERROR: "), senza toccare i ":" del messaggio.
  const cleaned = message.replace(/^(?:ERROR|P0001):\s*/i, "").trim();
  if (/failed to fetch|network/i.test(cleaned)) return "Connessione assente. Controlla la rete e riprova.";
  return cleaned || "Si è verificato un errore imprevisto. Riprova.";
}
