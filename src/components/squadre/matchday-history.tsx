import type { RankingHistoryEntry } from "@/services/ranking-service";
import { EmptyState } from "@/components/ui/empty-state";

export function MatchdayHistory({ history }: { history: RankingHistoryEntry[] }) {
  if (history.length === 0) {
    return <EmptyState title="Nessuna giornata giocata" description="Lo storico compare dopo la prima giornata." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left text-label uppercase text-muted-foreground">
            <th scope="col" className="px-4 py-2.5">Giornata</th>
            <th scope="col" className="px-3 py-2.5 text-right">Punti</th>
            <th scope="col" className="px-3 py-2.5 text-right">Totale</th>
            <th scope="col" className="px-4 py-2.5 text-right">Pos.</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.matchdayNumber} className="border-b border-border bg-surface last:border-0">
              <td className="px-4 py-3 font-semibold">{entry.matchdayTitle}</td>
              <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{entry.pointsMatchday}</td>
              <td className="px-3 py-3 text-right font-semibold tabular-nums">{entry.pointsTotal}</td>
              <td className="px-4 py-3 text-right font-display text-lg leading-none tabular-nums text-primary-ink">{entry.position}°</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
