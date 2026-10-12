import { formatNumber } from "@/lib/utils";

export interface HomeStats {
  teams: number;
  players: number;
  matchdays: number;
  budgetInitial: number;
}

/** Numeri chiave del torneo, letti lato server dalla home: nessun caricamento lato client. */
export function StatsStrip({ stats }: { stats: HomeStats }) {
  const items = [
    { label: "Squadre iscritte", value: formatNumber(stats.teams) },
    { label: "Giocatori sul mercato", value: formatNumber(stats.players) },
    { label: "Giornate", value: formatNumber(stats.matchdays) },
    { label: "Budget di partenza", value: `${formatNumber(stats.budgetInitial)} crediti` },
  ];

  return (
    <section className="border-y border-border bg-surface-muted">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="font-display text-3xl tracking-wide text-primary tabular-nums sm:text-4xl">{item.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
