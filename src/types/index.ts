import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type FantasyTeam = Database["public"]["Tables"]["fantasy_teams"]["Row"];
export type FantasyTeamPlayer = Database["public"]["Tables"]["fantasy_team_players"]["Row"];
export type Matchday = Database["public"]["Tables"]["matchdays"]["Row"];
export type BonusType = Database["public"]["Tables"]["bonus_types"]["Row"];
export type PlayerScoreEvent = Database["public"]["Tables"]["player_score_events"]["Row"];
export type PlayerScore = Database["public"]["Tables"]["player_scores"]["Row"];
export type Ranking = Database["public"]["Tables"]["rankings"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Setting = Database["public"]["Tables"]["settings"]["Row"];
export type AdminLog = Database["public"]["Tables"]["admin_logs"]["Row"];

export type CurrentRanking = Database["public"]["Views"]["current_rankings"]["Row"];

export type { UserRole, MatchdayStatus, TransactionType } from "./database.types";

/** Rosa arricchita con i dati del giocatore reale, per la UI. */
export interface RosterEntry extends FantasyTeamPlayer {
  player: Player;
}

/** Una riga della classifica pubblica, pronta per la UI. */
export interface LeaderboardRow {
  fantasyTeamId: string;
  teamName: string;
  coachUsername: string;
  pointsTotal: number;
  pointsMatchday: number;
  position: number | null;
  previousPosition: number | null;
}

/** Il punteggio di un giocatore in una giornata, con il dettaglio bonus/malus. */
export interface MatchdayPlayerScore {
  player: Player;
  points: number;
  events: Array<{ id: string; label: string; points: number; quantity: number }>;
}

/** Chiavi note della tabella `settings`, con il relativo tipo di valore atteso. */
export interface AppSettings {
  market_open: boolean;
  registration_open: boolean;
  roster_max_size: number;
  roster_max_starters: number;
  budget_initial: number;
  tournament_start_date: string | null;
  rules_text: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  market_open: false,
  registration_open: true,
  roster_max_size: 8,
  roster_max_starters: 6,
  budget_initial: 100,
  tournament_start_date: null,
  rules_text: "Il regolamento completo verrà pubblicato a breve dal pannello amministratore.",
};
