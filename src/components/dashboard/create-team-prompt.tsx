import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateTeamPrompt({ budgetInitial }: { budgetInitial: number }) {
  return (
    <div className="court-arc-bg rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Users className="size-6" />
      </div>
      <h2 className="mt-5 font-display text-2xl tracking-wide sm:text-3xl">Non hai ancora una squadra</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Scegli un nome e parti con {budgetInitial} crediti da spendere sui giocatori reali del torneo.
      </p>
      <Button size="lg" className="mt-6" asChild>
        <Link href="/squadra">
          Crea la tua squadra <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
