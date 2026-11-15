"use client";

import * as React from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/shared/status-page";

/** Contenuto delle pagine di errore: spiega in parole semplici e offre «Riprova». */
export function ErrorContent({
  error,
  reset,
  className,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  className?: string;
}) {
  React.useEffect(() => {
    // Resta in console per chi fa assistenza; all'utente non mostriamo dettagli tecnici.
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="Time out"
      title="Qualcosa è andato storto"
      description="Non siamo riusciti a caricare la pagina. Controlla la connessione e riprova: i tuoi dati sono al sicuro."
      className={className}
    >
      <Button size="lg" onClick={reset}>
        <RotateCcw className="size-4" /> Riprova
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link href="/">
          <Home className="size-4" /> Torna alla home
        </Link>
      </Button>
    </StatusPage>
  );
}
