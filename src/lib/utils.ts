import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina class names condizionali e risolve i conflitti di Tailwind (es. "p-2 p-4" -> "p-4"). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatta un numero di crediti/punti con separatore delle migliaia italiano. */
export function formatNumber(value: number) {
  return new Intl.NumberFormat("it-IT").format(value);
}

/** Formatta una data in formato leggibile italiano (es. "26 luglio 2026"). */
export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Genera le iniziali da un nome (per gli avatar placeholder). */
export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
