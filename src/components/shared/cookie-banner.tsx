"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearAnalyticsCookies, setConsent, useConsent } from "@/lib/cookie-consent";

// Finestra a tutto schermo per i cookie di statistica (Google Analytics).
// Resta aperta finché l'utente non sceglie: non ha il pulsante "X" e non si chiude
// con Esc o cliccando fuori. "Rifiuta" e "Accetta" hanno lo stesso peso grafico e
// con "Rifiuta" il sito funziona allo stesso modo. I cookie necessari al login
// non dipendono da questa scelta.
export function CookieBanner() {
  const consent = useConsent();

  return (
    <Dialog open={consent === null}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border border-border bg-surface p-6 shadow-xl"
        >
          <DialogHeader>
            <DialogTitle>Cookie di statistica</DialogTitle>
            <DialogDescription>
              Con il tuo consenso usiamo Google Analytics per capire come viene usato il sito. Se rifiuti, puoi usare
              Fanta SouthJam esattamente allo stesso modo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConsent("denied")}>
              Rifiuta
            </Button>
            <Button variant="secondary" onClick={() => setConsent("granted")}>
              Accetta
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
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
