import { createClient } from "@/lib/supabase/client";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
}

export async function signUp(params: { email: string; password: string; username: string; fullName?: string }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: { username: params.username, full_name: params.fullName || null },
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(params: { email: string; password: string }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(params);
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updateProfile(params: { username?: string; fullName?: string; avatarUrl?: string }) {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error("Utente non autenticato");

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(params.username ? { username: params.username } : {}),
      ...(params.fullName !== undefined ? { full_name: params.fullName || null } : {}),
      ...(params.avatarUrl !== undefined ? { avatar_url: params.avatarUrl || null } : {}),
    })
    .eq("id", userData.user.id);
  if (error) throw error;
}

/** Mappa i messaggi di errore Supabase (in inglese) in messaggi utente in italiano. */
export function translateAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const map: Record<string, string> = {
    "Invalid login credentials": "Email o password non corretti",
    "Email not confirmed": "Devi confermare la tua email prima di accedere",
    "User already registered": "Esiste già un account con questa email",
    "Password should be at least 6 characters": "La password deve avere almeno 6 caratteri",
    "Unable to validate email address: invalid format": "Formato email non valido",
    "For security purposes, you can only request this once every 60 seconds":
      "Per sicurezza puoi richiederlo solo una volta ogni 60 secondi",
    profiles_username_key: "Questo username è già in uso",
    username_length: "Lo username deve avere tra 3 e 24 caratteri",
    "New password should be different from the old password": "La nuova password deve essere diversa da quella attuale",
  };
  for (const [key, value] of Object.entries(map)) {
    if (message.includes(key)) return value;
  }
  return message || "Si è verificato un errore imprevisto. Riprova.";
}
