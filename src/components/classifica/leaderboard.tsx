"use client";

import * as React from "react";
import Link from "next/link";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

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

/**
 * Anima i cambi di classifica: quando una squadra cambia posto la riga scivola
 * dalla vecchia posizione alla nuova, e quando cambiano i punti si accende per
 * un attimo. Niente animazioni se il dispositivo chiede meno movimento.
 */
function useRankingMotion(rows: LeaderboardRow[]) {
  const nodes = React.useRef(new Map<string, HTMLElement>());
  const previous = React.useRef(new Map<string, { top: number; points: number }>());

  const register = React.useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) nodes.current.set(id, el);
      else nodes.current.delete(id);
    },
    []
  );

  React.useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointsById = new Map(rows.map((r) => [r.fantasyTeamId, r.pointsTotal]));
    const next = new Map<string, { top: number; points: number }>();

    nodes.current.forEach((el, id) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const points = pointsById.get(id) ?? 0;
      next.set(id, { top, points });

      const before = previous.current.get(id);
      if (!before || reduceMotion) return;
      if (Math.abs(before.top - top) > 1) {
        el.animate([{ transform: `translateY(${before.top - top}px)` }, { transform: "translateY(0)" }], {
          duration: 650,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        });
      }
      if (before.points !== points) {
        el.animate(
          [{ boxShadow: "inset 0 0 0 999px rgba(255, 90, 31, 0.22)" }, { boxShadow: "inset 0 0 0 999px rgba(255, 90, 31, 0)" }],
          { duration: 1400, easing: "ease-out" }
        );
      }
    });

    previous.current = next;
  }, [rows]);

  return register;
}

const PODIUM_ORDER = [1, 0, 2]; // da sinistra: 2°, 1°, 3°

function Podium({
  rows,
  myTeamId,
  register,
}: {
  rows: LeaderboardRow[];
  myTeamId: string | null;
  register: (id: string) => (el: HTMLElement | null) => void;
}) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-label="Podio">
      {PODIUM_ORDER.filter((i) => rows[i]).map((i) => {
        const row = rows[i];
        const first = i === 0;
        return (
          <li
            key={row.fantasyTeamId}
            ref={register(row.fantasyTeamId)}
            id={`team-${row.fantasyTeamId}`}
            className={cn(
              "scoreboard grid scroll-mt-24 grid-cols-[auto_1fr_auto] items-center gap-x-4 rounded-2xl px-4 py-3",
              "sm:block sm:p-5",
              first && "order-first sm:order-none sm:pb-8 sm:pt-7",
              row.fantasyTeamId === myTeamId && "ring-2 ring-primary"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "scoreboard-digit w-7 text-center leading-none sm:w-auto",
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
              <p className="truncate text-xs opacity-70 sm:text-sm">
                {row.coachUsername}
                {row.fantasyTeamId === myTeamId && " · la tua squadra"}
              </p>
            </div>
            <div className="text-right sm:mt-4 sm:text-left">
              <p className="flex items-baseline justify-end gap-2 sm:justify-start">
                <span className={cn("scoreboard-digit leading-none text-primary", first ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl")}>
                  {formatNumber(row.pointsTotal)}
                </span>
                <span className="hidden text-sm opacity-70 sm:inline">punti</span>
              </p>
              <p className="mt-1 text-xs tabular-nums opacity-60">
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

const ROW_GRID = "grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 px-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_8rem_5rem] sm:gap-x-4 sm:px-5";

export function Leaderboard({ initialRows, myTeamId }: { initialRows: LeaderboardRow[]; myTeamId: string | null }) {
  const [rows, setRows] = React.useState(initialRows);
  const [live, setLive] = React.useState(false);
  const register = useRankingMotion(rows);

  React.useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let active = true;

    // Un bonus cambia molte righe di classifica una dopo l'altra: invece di
    // rileggere tutto a ogni riga, si aspetta un attimo e si rilegge una volta.
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const fresh = await getLeaderboard(supabase);
        if (active) setRows(fresh);
      }, 400);
    };

    const channel = supabase
      .channel("classifica-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rankings" }, scheduleRefresh)
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      active = false;
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Il podio ha senso solo quando ci sono punti assegnati.
  const hasScores = rows.some((r) => r.position !== null);
  const podium = hasScores ? rows.slice(0, 3) : [];
  const listRows = rows.slice(podium.length);
  const myRow = myTeamId ? rows.find((r) => r.fantasyTeamId === myTeamId) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {myRow ? (
          <a
            href={`#team-${myRow.fantasyTeamId}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1.5 font-semibold text-primary-ink transition-colors hover:bg-primary/20"
          >
            La tua squadra: {myRow.position ? `${myRow.position}° posto` : "non ancora in classifica"}
            {myRow.position ? ` · ${formatNumber(myRow.pointsTotal)} pt` : ""}
          </a>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground" aria-live="polite">
          <span className="relative flex size-2">
            {live && <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />}
            <span className={cn("relative inline-flex size-2 rounded-full", live ? "bg-success" : "bg-muted-foreground/50")} />
          </span>
          {live ? "In diretta" : "Connessione in corso…"}
        </span>
      </div>

      {podium.length > 0 && <Podium rows={podium} myTeamId={myTeamId} register={register} />}

      {listRows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className={cn(ROW_GRID, "border-b border-border bg-surface-muted py-2.5 text-label uppercase text-muted-foreground")} aria-hidden="true">
            <span>Pos.</span>
            <span>Squadra</span>
            <span className="hidden text-right sm:block">Ultima giornata</span>
            <span className="text-right">Totale</span>
          </div>
          <ol aria-label="Classifica dal quarto posto in giù">
            {listRows.map((row) => {
              const mine = row.fantasyTeamId === myTeamId;
              return (
                <li
                  key={row.fantasyTeamId}
                  ref={register(row.fantasyTeamId)}
                  id={`team-${row.fantasyTeamId}`}
                  className={cn(
                    ROW_GRID,
                    "scroll-mt-24 border-b border-border py-3 transition-colors last:border-0 hover:bg-muted/50",
                    mine && "bg-primary/[0.07] shadow-[inset_3px_0_0_var(--primary)]"
                  )}
                >
                  <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-display text-lg leading-none tabular-nums">{row.position ?? "—"}</span>
                    <PositionMovement position={row.position} previousPosition={row.previousPosition} />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/squadre/${row.fantasyTeamId}`}
                      className="block truncate font-semibold hover:text-primary-ink hover:underline"
                    >
                      {row.teamName}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      {row.coachUsername}
                      {mine && " · la tua squadra"}
                    </span>
                  </div>
                  <div className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">
                    {row.position === null ? "—" : formatSigned(row.pointsMatchday)}
                  </div>
                  <div className="text-right">
                    <span className="font-display text-xl leading-none tabular-nums text-primary-ink">
                      {formatNumber(row.pointsTotal)}
                    </span>
                    <span className="block text-[11px] tabular-nums text-muted-foreground sm:hidden">
                      {row.position === null ? "—" : formatSigned(row.pointsMatchday)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
