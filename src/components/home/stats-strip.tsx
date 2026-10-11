"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNumber } from "@/lib/utils";

interface Stats {
  teams: number;
  players: number;
}

const MATCHDAYS = 3;

export function StatsStrip() {
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const supabase = createClient();
        const [{ count: teams }, { count: players }] = await Promise.all([
          supabase.from("fantasy_teams").select("*", { count: "exact", head: true }),
          supabase.from("players").select("*", { count: "exact", head: true }).eq("is_active", true),
        ]);
        if (!cancelled) setStats({ teams: teams ?? 0, players: players ?? 0 });
      } catch {
        // Supabase non ancora configurato o offline: la sezione resta silenziosamente sui trattini.
        if (!cancelled) setStats({ teams: 0, players: 0 });
      }
    }
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = [
    { label: "Squadre iscritte", value: stats ? formatNumber(stats.teams) : "—" },
    { label: "Giocatori sul mercato", value: stats ? formatNumber(stats.players) : "—" },
    { label: "Giornate", value: MATCHDAYS },
    { label: "Budget di partenza", value: "100 crediti" },
  ];

  return (
    <section className="border-y border-border bg-surface-muted">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="font-display text-3xl tracking-wide text-primary sm:text-4xl">{item.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
