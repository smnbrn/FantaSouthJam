import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Client Supabase per i Client Component ("use client").
 * Va istanziato dentro ai componenti/hook che lo usano, mai a livello di
 * modulo, per evitare di condividere stato tra utenti diversi.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
