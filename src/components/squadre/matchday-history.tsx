import type { RankingHistoryEntry } from "@/services/ranking-service";

export function MatchdayHistory({ history }: { history: RankingHistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">Ancora nessuna giornata giocata.</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Giornata</th>
            <th className="px-4 py-3 text-right">Punti</th>
            <th className="px-4 py-3 text-right">Totale</th>
            <th className="px-4 py-3 text-right">Posizione</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.matchdayNumber} className="border-b border-border bg-surface last:border-0">
              <td className="px-4 py-3 font-semibold">{entry.matchdayTitle}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{entry.pointsMatchday}</td>
              <td className="px-4 py-3 text-right">{entry.pointsTotal}</td>
              <td className="px-4 py-3 text-right font-display text-primary">{entry.position}°</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
