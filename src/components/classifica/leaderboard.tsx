"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, TrendingDown, TrendingUp, Radio } from "lucide-react";

import type { LeaderboardRow } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getLeaderboard } from "@/services/ranking-service";

function PositionMovement({ position, previousPosition }: { position: number | null; previousPosition: number | null }) {
  if (position === null || previousPosition === null || position === previousPosition) {
    return <Minus className="size-3.5 text-muted-foreground" />;
  }
  if (position < previousPosition) {
    return <TrendingUp className="size-3.5 text-success" />;
  }
  return <TrendingDown className="size-3.5 text-destructive" />;
}

function medalClass(position: number | null) {
  if (position === 1) return "bg-accent text-accent-foreground";
  if (position === 2) return "bg-muted-foreground/20 text-foreground";
  if (position === 3) return "bg-hardwood/30 text-foreground";
  return "bg-muted text-muted-foreground";
}

export function Leaderboard({ initialRows }: { initialRows: LeaderboardRow[] }) {
  const [rows, setRows] = React.useState(initialRows);
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("classifica-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rankings" }, async () => {
        const fresh = await getLeaderboard(supabase);
        setRows(fresh);
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <div className="mb-3 flex items-center justify-end gap-1.5 text-xs font-semibold text-muted-foreground">
        <Radio className={cn("size-3.5", live && "text-success")} />
        {live ? "Aggiornamento in tempo reale attivo" : "Connessione in corso..."}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="w-14 px-4 py-3">Pos.</th>
              <th className="px-4 py-3">Team</th>
              <th className="hidden px-4 py-3 sm:table-cell">Allenatore</th>
              <th className="pr-4 py-3 text-right">PG</th>
              <th className="px-4 py-3 text-right">Tot</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.fantasyTeamId} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("flex size-7 items-center justify-center rounded-full font-display text-xs", medalClass(row.position))}>
                      {row.position ?? "—"}
                    </span>
                    <PositionMovement position={row.position} previousPosition={row.previousPosition} />
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/squadre/${row.fantasyTeamId}`} className="hover:text-primary hover:underline">
                    {row.teamName}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{row.coachUsername}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatNumber(row.pointsMatchday)}</td>
                <td className="px-4 py-3 text-right font-display text-lg text-primary">{formatNumber(row.pointsTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
