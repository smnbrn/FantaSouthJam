import { Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHallOfFame } from "@/services/hall-of-fame-service";
import { HallOfFameCard } from "@/components/hall-of-fame/hall-of-fame-card";

export const metadata = {
  title: "Hall of Fame",
  description: "L'albo d'oro di Fanta SouthJam: le squadre campioni e i top player di ogni edizione.",
};

export default async function HallOfFamePage() {
  const supabase = await createClient();
  const entries = await getHallOfFame(supabase);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Crown className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-4xl tracking-wide sm:text-5xl">Hall of Fame</h1>
        <p className="mt-2 text-muted-foreground">Campioni e top player di ogni edizione.</p>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-5 py-10 text-center text-sm text-muted-foreground">
          L&apos;albo d&apos;oro si riempie alla fine della prima edizione. Chi sarà il primo nome?
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {entries.map((entry, i) => (
            <HallOfFameCard key={entry.id} entry={entry} featured={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
