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

  const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
  return {
    market_open: (map.market_open as boolean) ?? DEFAULT_SETTINGS.market_open,
    registration_open: (map.registration_open as boolean) ?? DEFAULT_SETTINGS.registration_open,
    roster_max_size: (map.roster_max_size as number) ?? DEFAULT_SETTINGS.roster_max_size,
    roster_max_starters: (map.roster_max_starters as number) ?? DEFAULT_SETTINGS.roster_max_starters,
    budget_initial: (map.budget_initial as number) ?? DEFAULT_SETTINGS.budget_initial,
    tournament_start_date: (map.tournament_start_date as string | null) ?? DEFAULT_SETTINGS.tournament_start_date,
    rules_text: (map.rules_text as string) ?? DEFAULT_SETTINGS.rules_text,
  };
}
