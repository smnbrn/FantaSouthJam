import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase per Server Component, Server Action e Route Handler.
 * Va creato ad ogni richiesta (usa i cookie della request corrente), mai
 * riutilizzato/cachato a livello di modulo.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll chiamato da un Server Component: può essere ignorato se
            // esiste un middleware che aggiorna la sessione ad ogni richiesta.
          }
        },
      },
    }
  );
}

/**
 * Client con service role, SOLO per operazioni server-side che devono
 * bypassare la RLS (es. job amministrativi lato server). Non importare mai
 * questo file in codice che finisce nel bundle del browser.
 */
export async function createServiceRoleClient() {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
