"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export interface UserContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export const UserContext = React.createContext<UserContextValue | null>(null);

/**
 * Utente Supabase + profilo pubblico, letti UNA volta sola per pagina e condivisi
 * da navbar e barra di navigazione (prima ogni componente rifaceva le stesse
 * chiamate). Si aggiorna da solo su login e logout.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile(userId: string) {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (active) setProfile(data ?? null);
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user);
      if (data.user) await loadProfile(data.user.id);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // La sessione iniziale è già letta qui sopra con getUser(): evita il doppio caricamento.
      if (event === "INITIAL_SESSION") return;
      setUser(session?.user ?? null);
      if (session?.user) {
        void loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = React.useMemo(() => ({ user, profile, loading }), [user, profile, loading]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
