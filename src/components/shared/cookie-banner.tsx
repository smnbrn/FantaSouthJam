"use client";

import { Button } from "@/components/ui/button";
import { clearAnalyticsCookies, setConsent, useConsent } from "@/lib/cookie-consent";

// Banner per i cookie di statistica (Google Analytics). Compare finché l'utente
// non sceglie; i cookie necessari al login non dipendono da questa scelta.
export function CookieBanner() {
  const consent = useConsent();
  if (consent !== null) return null;

  return (
    <div role="dialog" aria-label="Preferenze cookie" className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xl sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-foreground/80">
          Usiamo Google Analytics, con cookie di statistica, solo se acconsenti. Il sito funziona allo stesso modo
          anche se rifiuti.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setConsent("denied")}>
            Rifiuta
          </Button>
          <Button size="sm" onClick={() => setConsent("granted")}>
            Accetta
          </Button>
        </div>
      </div>
    </div>
  );
}

// Pulsante per cambiare scelta: cancella la preferenza e i cookie di Analytics,
// poi ricarica la pagina così lo script già caricato non resta attivo.
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        clearAnalyticsCookies();
        setConsent(null);
        window.location.reload();
      }}
    >
      Preferenze cookie
    </button>
  );
}
