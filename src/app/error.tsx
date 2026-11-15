"use client";

import { ErrorContent } from "@/components/shared/error-content";

/** Errore nelle pagine fuori dal layout del sito (accesso, registrazione...). */
export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorContent {...props} className="min-h-screen" />;
}
