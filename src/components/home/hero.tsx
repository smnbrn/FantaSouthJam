import Link from "next/link";
import { ArrowRight, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/home/countdown";

export function Hero({ tournamentStartDate }: { tournamentStartDate: string | null }) {
  return (
    <section className="court-arc-bg relative overflow-hidden">
      {/* Motivo grafico: arco da tre punti di un campo da basket, in filigrana. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 500"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] w-full text-hardwood/[0.18] dark:text-hardwood/[0.14]"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M -50 550 A 400 400 0 0 1 850 550"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M 150 550 A 250 250 0 0 1 650 550"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="400" cy="550" r="60" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          South Jam 3v3 · Amantea
        </span>

        <h1
          className="animate-fade-up mt-6 max-w-3xl font-display text-5xl uppercase leading-[0.95] tracking-wide sm:text-6xl md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Il tuo Basket <span className="text-primary">di strada</span> parte da qui
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
          style={{ animationDelay: "160ms" }}
        >
          Componi la squadra con i giocatori reali del torneo 3vs3 South Jam di Amantea, gioca il mercato e scala la
          classifica durante le 3 giornate.
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <Button size="lg" asChild>
            <Link href="/registrati">
              Crea la tua squadra <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/regolamento">
              <ScrollText className="size-4" /> Informazioni
            </Link>
          </Button>
        </div>

        <div className="animate-fade-up mt-14" style={{ animationDelay: "320ms" }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Il torneo è terminato, South Jam 2027 inizia tra
          </p>
          <Countdown targetDate={tournamentStartDate} />
        </div>
      </div>
    </section>
  );
}
