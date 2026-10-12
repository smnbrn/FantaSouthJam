import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BasketballMark } from "@/components/shared/basketball-mark";

export function CtaSection({ marketOpen }: { marketOpen: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="scoreboard relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-16">
        <BasketballMark className="mx-auto size-10 text-primary" />
        <h2 className="mt-6 font-display text-3xl uppercase tracking-wide sm:text-4xl">
          {marketOpen ? "Il mercato è aperto." : "Il mercato è chiuso."}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70 sm:text-base">
          {marketOpen
            ? "Componi la tua squadra e scegli i giocatori prima della chiusura del mercato."
            : "Segui i tuoi giocatori e le loro performance in tempo reale."}
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/registrati">
            Registrati gratis <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
