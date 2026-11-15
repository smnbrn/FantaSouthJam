import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { DEFAULT_SETTINGS, type AppSettings } from "@/types";

/**
 * Legge tutte le righe di `settings` e le assembla in un oggetto tipizzato,
 * con fallback sui valori di default se una chiave manca ancora nel DB.
 */
export async function getSettings(
  supabase: SupabaseClient<Database>
): Promise<AppSettings> {
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error || !data) return DEFAULT_SETTINGS;

  // I valori arrivano come JSON generico: si controlla il tipo vero invece di fidarsi
  // di un cast, e se una chiave manca o ha un tipo inatteso vale il default.
  const map = new Map<string, unknown>(data.map((row) => [row.key, row.value]));
  const bool = (key: string, fallback: boolean) => {
    const value = map.get(key);
    return typeof value === "boolean" ? value : fallback;
  };
  const num = (key: string, fallback: number) => {
    const value = map.get(key);
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  };
  const text = (key: string, fallback: string) => {
    const value = map.get(key);
    return typeof value === "string" ? value : fallback;
  };
  const startDate = map.get("tournament_start_date");

  return {
    market_open: bool("market_open", DEFAULT_SETTINGS.market_open),
    registration_open: bool("registration_open", DEFAULT_SETTINGS.registration_open),
    roster_max_size: num("roster_max_size", DEFAULT_SETTINGS.roster_max_size),
    roster_max_starters: num("roster_max_starters", DEFAULT_SETTINGS.roster_max_starters),
    budget_initial: num("budget_initial", DEFAULT_SETTINGS.budget_initial),
    // Stringa vuota = data non impostata (vedi updateSettings): per l'app vale come null.
    tournament_start_date:
      typeof startDate === "string" && startDate !== "" ? startDate : DEFAULT_SETTINGS.tournament_start_date,
    rules_text: text("rules_text", DEFAULT_SETTINGS.rules_text),
  };
}
