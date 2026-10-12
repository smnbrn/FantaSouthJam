"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, Radio, TrendingDown, TrendingUp } from "lucide-react";

import type { LeaderboardRow } from "@/types";
import { cn, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getLeaderboard } from "@/services/ranking-service";

/** Punti con segno esplicito: "+83", "−15", "0". */
function formatSigned(value: number) {
  if (value > 0) return `+${formatNumber(value)}`;
  if (value < 0) return `−${formatNumber(Math.abs(value))}`;
  return "0";
}

/** Posizioni guadagnate (+) o perse (−) rispetto alla giornata precedente. */
function PositionMovement({ position, previousPosition }: { position: number | null; previousPosition: number | null }) {
  if (position === null || previousPosition === null || position === previousPosition) {
    return (
      <span className="inline-flex items-center text-muted-foreground" aria-label="Posizione invariata">
        <Minus className="size-3.5" />
      </span>
    );
  }
  const gained = previousPosition - position;
  const up = gained > 0;
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums", up ? "text-success" : "text-destructive")}
      aria-label={up ? `Guadagnate ${gained} posizioni` : `Perse ${-gained} posizioni`}
    >
      {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
      {Math.abs(gained)}
    </span>
  );
}

const PODIUM_ORDER = [1, 0, 2]; // da sinistra: 2°, 1°, 3°

function Podium({ rows, myTeamId }: { rows: LeaderboardRow[]; myTeamId: string | null }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-label="Podio">
      {PODIUM_ORDER.filter((i) => rows[i]).map((i) => {
        const row = rows[i];
        const first = i === 0;
        return (
          <li
            key={row.fantasyTeamId}
            className={cn(
              "scoreboard grid grid-cols-[auto_1fr_auto] items-center gap-x-4 rounded-2xl px-4 py-3",
              "sm:block sm:p-5",
              first && "order-first sm:order-none sm:pb-8 sm:pt-7",
              row.fantasyTeamId === myTeamId && "ring-2 ring-primary"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "scoreboard-digit leading-none",
                  first ? "text-4xl text-accent sm:text-6xl" : "text-3xl opacity-70 sm:text-5xl"
                )}
              >
                {row.position}
              </span>
              <span className="hidden sm:inline-flex">
                <PositionMovement position={row.position} previousPosition={row.previousPosition} />
              </span>
            </div>
            <div className="min-w-0 sm:mt-4">
              <Link
                href={`/squadre/${row.fantasyTeamId}`}
                className="block truncate font-bold hover:text-primary hover:underline sm:text-lg"
              >
                {row.teamName}
              </Link>
              <p className="truncate text-xs opacity-70 sm:text-sm">{row.coachUsername}</p>
            </div>
            <div className="text-right sm:mt-4 sm:text-left">
              <p className="flex items-baseline justify-end gap-2 sm:justify-start">
                <span className={cn("scoreboard-digit leading-none text-primary", first ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl")}>
                  {formatNumber(row.pointsTotal)}
                </span>
                <span className="hidden text-sm opacity-70 sm:inline">punti</span>
              </p>
              <p className="mt-1 text-xs opacity-60">
                {formatSigned(row.pointsMatchday)}
                <span className="hidden sm:inline"> nell&apos;ultima giornata</span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Leaderboard({ initialRows, myTeamId }: { initialRows: LeaderboardRow[]; myTeamId: string | null }) {
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

  // Il podio ha senso solo quando ci sono punti assegnati.
  const hasScores = rows.some((r) => r.position !== null);
  const podium = hasScores ? rows.slice(0, 3) : [];
  const tableRows = rows.slice(podium.length);
  const myRow = myTeamId ? rows.find((r) => r.fantasyTeamId === myTeamId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {myRow ? (
          <a href={`#team-${myRow.fantasyTeamId}`} className="font-semibold hover:text-primary">
            La tua squadra: {myRow.position ? `${myRow.position}° posto` : "non ancora in classifica"}
            {myRow.position ? ` con ${formatNumber(myRow.pointsTotal)} punti` : ""}
          </a>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
          <Radio className={cn("size-3.5", live && "text-success")} />
          {live ? "Aggiornamento in tempo reale" : "Connessione in corso…"}
        </span>
      </div>

      {podium.length > 0 && <Podium rows={podium} myTeamId={myTeamId} />}

      {tableRows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold text-muted-foreground">
                <th scope="col" className="w-20 px-4 py-3">
                  Posizione
                </th>
                <th scope="col" className="px-2 py-3">
                  Squadra
                </th>
                <th scope="col" className="hidden px-4 py-3 text-right sm:table-cell">
                  Ultima giornata
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Totale
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                const mine = row.fantasyTeamId === myTeamId;
                return (
                  <tr
                    key={row.fantasyTeamId}
                    id={`team-${row.fantasyTeamId}`}
                    className={cn(
                      "scroll-mt-24 border-b border-border last:border-0 transition-colors hover:bg-muted/50",
                      mine && "bg-primary/[0.07] shadow-[inset_3px_0_0_var(--primary)]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 font-display text-base tabular-nums">{row.position ?? "—"}</span>
                        <PositionMovement position={row.position} previousPosition={row.previousPosition} />
                      </div>
                    </td>
                    <td className="max-w-0 px-2 py-3">
                      <Link
                        href={`/squadre/${row.fantasyTeamId}`}
                        className="block truncate font-semibold hover:text-primary hover:underline"
                      >
                        {row.teamName}
                      </Link>
                      <span className="block truncate text-xs text-muted-foreground">
                        {row.coachUsername}
                        {mine && " · la tua squadra"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">
                      {row.position === null ? "—" : formatSigned(row.pointsMatchday)}
                    </td>
                    <td className="px-4 py-3 text-right font-display text-lg tabular-nums text-primary">
                      {formatNumber(row.pointsTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
