import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ChatMessage } from "@/types";

export interface ChatAuthor {
  username: string;
  teamName: string | null;
  isAdmin: boolean;
}

export interface ChatMessageWithAuthor extends ChatMessage {
  author: ChatAuthor;
}

const UNKNOWN_AUTHOR: ChatAuthor = { username: "utente", teamName: null, isAdmin: false };

/** Username, nome squadra e ruolo per un elenco di utenti (per etichettare i messaggi). */
export async function getChatAuthors(
  supabase: SupabaseClient<Database>,
  userIds: string[]
): Promise<Record<string, ChatAuthor>> {
  const ids = [...new Set(userIds)];
  if (ids.length === 0) return {};

  const [{ data: profiles }, { data: teams }] = await Promise.all([
    supabase.from("profiles").select("id, username, role").in("id", ids),
    supabase.from("fantasy_teams").select("user_id, team_name").in("user_id", ids),
  ]);

  const teamByUser = new Map((teams ?? []).map((t) => [t.user_id, t.team_name]));
  const result: Record<string, ChatAuthor> = {};
  (profiles ?? []).forEach((p) => {
    result[p.id] = { username: p.username, teamName: teamByUser.get(p.id) ?? null, isAdmin: p.role === "admin" };
  });
  return result;
}

/** Ultimi messaggi della chat, dal più vecchio al più recente. */
export async function getRecentMessages(
  supabase: SupabaseClient<Database>,
  limit = 100
): Promise<ChatMessageWithAuthor[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];

  const authors = await getChatAuthors(supabase, data.map((m) => m.user_id));
  return data.reverse().map((m) => ({ ...m, author: authors[m.user_id] ?? UNKNOWN_AUTHOR }));
}

export async function sendMessage(
  supabase: SupabaseClient<Database>,
  userId: string,
  content: string
): Promise<{ message: ChatMessage | null; error: string | null }> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_id: userId, content })
    .select()
    .single();
  if (error) {
    const friendly = error.message.includes("troppo velocemente")
      ? error.message
      : error.code === "42501"
        ? "Per scrivere in chat devi prima creare la tua squadra"
        : "Messaggio non inviato, riprova";
    return { message: null, error: friendly };
  }
  return { message: data, error: null };
}

export async function deleteMessage(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("chat_messages").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export { UNKNOWN_AUTHOR };
