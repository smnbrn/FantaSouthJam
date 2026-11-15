"use client";

import { ErrorContent } from "@/components/shared/error-content";

/** Errore dentro il sito: navbar e barra di navigazione restano al loro posto. */
export default function SiteError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorContent {...props} />;
}
