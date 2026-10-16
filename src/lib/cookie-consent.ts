"use client";

import { useSyncExternalStore } from "react";

export type ConsentChoice = "granted" | "denied";

const STORAGE_KEY = "fanta3v3-cookie-consent";
const CHANGE_EVENT = "fanta3v3-cookie-consent-change";

function readConsent(): ConsentChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Scelta dell'utente sui cookie di statistica.
 * - undefined: non ancora nota (render sul server / prima dell'idratazione)
 * - null: l'utente non ha ancora scelto
 * - "granted" / "denied": scelta salvata nel browser
 */
export function useConsent(): ConsentChoice | null | undefined {
  return useSyncExternalStore<ConsentChoice | null | undefined>(subscribe, readConsent, () => undefined);
}

export function setConsent(choice: ConsentChoice | null) {
  try {
    if (choice) localStorage.setItem(STORAGE_KEY, choice);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage non disponibile: la scelta vale solo finché la pagina resta aperta
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Elimina i cookie di Google Analytics (_ga, _ga_XXXX) dal browser. */
export function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = [undefined, host, `.${host}`];
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (!name.startsWith("_ga")) return;
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
    });
  });
}
