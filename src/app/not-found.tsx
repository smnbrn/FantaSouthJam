import { NotFoundContent } from "@/components/shared/not-found-content";

export const metadata = { title: "Pagina non trovata" };

/** 404 per gli indirizzi che non corrispondono a nessuna pagina (fuori dal layout del sito, quindi senza navbar). */
export default function NotFound() {
  return <NotFoundContent className="min-h-screen" />;
}
