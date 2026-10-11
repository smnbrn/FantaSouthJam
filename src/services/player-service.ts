import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Player } from "@/types";

export async function getActivePlayers(supabase: SupabaseClient<Database>): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  if (error || !data) return [];
  return data;
}
