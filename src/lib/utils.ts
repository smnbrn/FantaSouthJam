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

/**
 * Restituisce `value` solo se è un percorso interno all'app ("/mercato"),
 * altrimenti `fallback`. Evita gli open redirect: "//sito.com", "/\\sito.com"
 * o "https://sito.com" porterebbero l'utente su un dominio esterno. I browser
 * ignorano tab e a capo negli URL ("/\t/sito.com" diventa "//sito.com"), quindi
 * qualsiasi carattere di controllo o backslash viene rifiutato.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (/[\u0000-\u001F\u007F\\]/.test(value)) return fallback;
  return value;
}
