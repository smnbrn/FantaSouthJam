import { UserPlus, ShoppingBag, Users, Trophy } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Registrati",
    text: "Crea il tuo account in un minuto: ti serve solo email, username e password.",
  },
  {
    icon: Users,
    title: "Crea la squadra",
    text: "Scegli un nome per la tua squadra: sarà la tua identità per tutto il torneo.",
  },
  {
    icon: ShoppingBag,
    title: "Gioca il mercato",
    text: "Acquista i giocatori reali del torneo entro il budget assegnato, senza sforare.",
  },
  {
    icon: Trophy,
    title: "Scala la classifica",
    text: "Ad ogni giornata i punti dei tuoi titolari si sommano da soli: segui la classifica in tempo reale.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-3xl uppercase tracking-wide sm:text-4xl">Come funziona</h2>
        <p className="mt-3 text-muted-foreground">Tre passi, tre giornate, una classifica sola.</p>
      </div>

      <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="group relative rounded-2xl border border-border bg-surface p-6">
            <span className="font-display text-4xl text-primary/20 transition-colors group-hover:text-primary/40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <step.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-display text-lg tracking-wide">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
