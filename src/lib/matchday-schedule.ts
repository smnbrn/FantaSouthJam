import type { Matchday } from "@/types";

const TIME_ZONE = "Europe/Rome";

/** Differenza in ms tra l'ora locale di Roma e UTC nell'istante indicato (gestisce ora legale). */
function romeOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Ora del giorno (ora di Roma) di un istante, come { hours, minutes }. */
function romeTimeOfDay(instant: Date) {
  const local = new Date(instant.getTime() + romeOffsetMs(instant));
  return { hours: local.getUTCHours(), minutes: local.getUTCMinutes() };
}

/** Istante UTC corrispondente a "YYYY-MM-DD hh:mm" in ora di Roma. */
function fromRomeLocal(date: string, hours: number, minutes: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hours, minutes);
  // Due passaggi: il primo stima l'offset, il secondo lo corregge a cavallo del cambio ora.
  const first = guess - romeOffsetMs(new Date(guess));
  return new Date(guess - romeOffsetMs(new Date(first)));
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export type HeroCountdown =
  | { kind: "matchday"; targetDate: string; matchdayTitle: string }
  | { kind: "matchday-live"; matchdayTitle: string }
  | { kind: "next-edition"; targetDate: string | null };

/**
 * Decide cosa mostra il countdown della home.
 *
 * - C'è una giornata in corso → "giornata in corso", niente conto alla rovescia.
 * - C'è una giornata ancora da giocare → conto alla rovescia al suo inizio. Il giorno è quello
 *   della giornata (o il giorno dopo l'ultima chiusa), l'orario è lo stesso del torneo
 *   (quello di `tournament_start_date`, in ora di Roma).
 * - Tutte le giornate sono chiuse → conto alla rovescia alla prossima edizione.
 */
export function getHeroCountdown(matchdays: Matchday[], tournamentStartDate: string | null): HeroCountdown {
  const sorted = [...matchdays].sort((a, b) => a.number - b.number);
  const live = sorted.find((m) => m.status === "open");
  if (live) return { kind: "matchday-live", matchdayTitle: live.title };

  const next = sorted.find((m) => m.status === "upcoming");
  if (!next) return { kind: "next-edition", targetDate: tournamentStartDate };

  const lastClosed = [...sorted].reverse().find((m) => m.status === "closed" && m.number < next.number);
  const day = next.match_date ?? (lastClosed?.match_date ? addDays(lastClosed.match_date, 1) : null);
  const startInstant = tournamentStartDate ? new Date(tournamentStartDate) : null;

  if (!day || !startInstant || Number.isNaN(startInstant.getTime())) {
    // Nessuna data utilizzabile: si ripiega sulla data di inizio del torneo, se c'è.
    return tournamentStartDate
      ? { kind: "matchday", targetDate: tournamentStartDate, matchdayTitle: next.title }
      : { kind: "next-edition", targetDate: null };
  }

  const { hours, minutes } = romeTimeOfDay(startInstant);
  return { kind: "matchday", targetDate: fromRomeLocal(day, hours, minutes).toISOString(), matchdayTitle: next.title };
}
