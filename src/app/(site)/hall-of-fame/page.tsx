import { Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getHallOfFame } from "@/services/hall-of-fame-service";
import { HallOfFameCard } from "@/components/hall-of-fame/hall-of-fame-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Hall of Fame",
  description: "L'albo d'oro di Fanta SouthJam: le squadre campioni e i top player di ogni edizione.",
};

export default async function HallOfFamePage() {
  const supabase = await createClient();
  const entries = await getHallOfFame(supabase);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary-ink">
          <Crown className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-display-xl uppercase tracking-wide">Hall of Fame</h1>
        <p className="mt-2 text-muted-foreground">Campioni e top player di ogni edizione.</p>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={Crown} title="Albo d'oro ancora vuoto" description="Si riempie alla fine della prima edizione. Chi sarà il primo nome?" />
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry, i) => (
            <HallOfFameCard key={entry.id} entry={entry} featured={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
