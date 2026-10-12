import { ChevronDown, HelpCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "FAQ",
  description: "Le domande più frequenti su Fanta3v3 Amantea: budget, mercato, punteggi e regole del gioco.",
};

function getFaqs(matchdays: number) {
  return [
    {
      q: "Chi sono i giocatori acquistabili?",
      a: "Non sono giocatori NBA o professionisti: sono i partecipanti reali del torneo di Basket 3vs3 di Amantea. L'elenco completo viene pubblicato dagli amministratori prima dell'apertura del mercato.",
    },
    {
      q: "Quanti crediti ho a disposizione?",
      a: "Ogni squadra parte con un budget iniziale in crediti (indicato in dashboard). Puoi spenderlo come preferisci, ma non puoi mai superarlo.",
    },
    {
      q: "Fino a quando posso modificare la mia rosa?",
      a: "Acquisti e vendite sono possibili solo finché il mercato resta aperto: alla chiusura, decisa dagli amministratori, la rosa si blocca. I titolari invece puoi cambiarli anche a mercato chiuso, tranne mentre una giornata è in corso.",
    },
    {
      q: "Se cambio i titolari, cambiano i punti delle giornate passate?",
      a: "No. Quando una giornata inizia la formazione di ogni squadra viene congelata: quella giornata conta sempre con i titolari schierati in quel momento, anche se in seguito cambi formazione.",
    },
    {
      q: "Come si calcolano i punti della mia squadra?",
      a: "Ad ogni giornata, gli amministratori assegnano bonus e malus ai giocatori reali (es. vittoria, MVP, canestri, fallo tecnico...). Il punteggio dei tuoi titolari viene sommato automaticamente e la classifica si aggiorna da sola.",
    },
    {
      q: "Quante giornate dura il torneo?",
      a:
        matchdays > 0
          ? `Il torneo di Basket 3vs3 di Amantea si gioca su ${matchdays} giornate. Il punteggio totale è la somma dei punti ottenuti in ciascuna giornata.`
          : "Il calendario delle giornate viene pubblicato dagli amministratori nella pagina Giornate. Il punteggio totale è la somma dei punti ottenuti in ciascuna giornata.",
    },
    {
      q: "Posso creare più di una squadra?",
      a: "No, ogni account può gestire una sola squadra fantabasket per l'intera durata del torneo.",
    },
  ];
}

export default async function FaqPage() {
  const supabase = await createClient();
  const { count } = await supabase.from("matchdays").select("*", { count: "exact", head: true });
  const faqs = getFaqs(count ?? 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HelpCircle className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl tracking-wide sm:text-5xl">Domande frequenti</h1>
        <p className="mt-3 text-muted-foreground">Tutto quello che c&apos;è da sapere prima di scendere in campo.</p>
      </div>

      <div className="mt-12 flex flex-col gap-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-surface p-5 open:shadow-sm [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base tracking-wide">
              {item.q}
              <ChevronDown className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
