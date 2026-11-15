import { CalendarX } from "lucide-react";
import type { Matchday, MatchdayPlayerScore } from "@/types";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";

export function MatchdayScores({ matchday, scores }: { matchday: Matchday; scores: MatchdayPlayerScore[] }) {
  if (scores.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title={matchday.status === "upcoming" ? "Giornata non ancora giocata" : "Nessun punteggio"}
        description={
          matchday.status === "upcoming"
            ? "I punti compariranno qui appena la giornata viene giocata."
            : "Nessun punteggio assegnato per questa giornata."
        }
        className="py-14"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {matchday.results_summary && (
        <p className="rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">🏀 {matchday.results_summary}</p>
      )}
      <ol className="flex flex-col gap-2.5" aria-label="Punteggi dei giocatori, dal più alto">
        {scores.map(({ player, points, events }, index) => (
          <li key={player.id} className="rounded-2xl border border-border bg-surface p-3.5 shadow-card sm:p-4">
            {/* Riga principale: chi è e quanto ha fatto. Il totale è il dato che si cerca, quindi sta in evidenza a destra. */}
            <div className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-center font-display text-sm tabular-nums text-muted-foreground">{index + 1}</span>
              <Avatar className="size-10">
                {player.photo_url && <AvatarImage src={player.photo_url} alt="" />}
                <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold leading-tight">{player.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{player.real_team}</p>
              </div>
              <p className="shrink-0 text-right">
                <span
                  className={cn(
                    "font-display text-2xl leading-none tabular-nums",
                    points < 0 ? "text-destructive" : "text-primary"
                  )}
                >
                  {points}
                </span>
                <span className="ml-1 text-xs font-semibold text-muted-foreground">pt</span>
              </p>
            </div>

            {/* Dettaglio di bonus e malus: informazione secondaria, quindi in piccolo e senza colori pieni. */}
            {events.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3 pl-8">
                {events.map((event) => {
                  const total = event.points * event.quantity;
                  return (
                    <li
                      key={event.id}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        total >= 0 ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive"
                      )}
                    >
                      <span className="font-bold tabular-nums">
                        {total >= 0 ? "+" : "−"}
                        {Math.abs(total)}
                      </span>
                      <span className="text-foreground/80">
                        {event.label}
                        {event.quantity > 1 ? ` ×${event.quantity}` : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
