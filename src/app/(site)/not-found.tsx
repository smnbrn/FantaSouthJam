import { NotFoundContent } from "@/components/shared/not-found-content";

export const metadata = { title: "Pagina non trovata" };

/** 404 dentro il sito (es. una squadra che non esiste): resta visibile la navigazione. */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
