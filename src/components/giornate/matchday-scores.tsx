import { CalendarX } from "lucide-react";
import type { Matchday, MatchdayPlayerScore } from "@/types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function MatchdayScores({ matchday, scores }: { matchday: Matchday; scores: MatchdayPlayerScore[] }) {
  if (scores.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
        <CalendarX className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {matchday.status === "upcoming"
            ? "Questa giornata non è stata ancora giocata."
            : "Nessun punteggio assegnato per questa giornata."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {matchday.results_summary && (
        <p className="rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">🏀 {matchday.results_summary}</p>
      )}
      {scores.map(({ player, points, events }) => (
        <div key={player.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-11">
              {player.photo_url && <AvatarImage src={player.photo_url} alt={player.full_name} />}
              <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{player.full_name}</p>
              <p className="text-xs text-muted-foreground">{player.real_team}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            {events.map((event) => (
              <Badge key={event.id} variant={event.points >= 0 ? "success" : "destructive"}>
                {event.points >= 0 ? "+" : ""}
                {event.points * event.quantity} {event.label}
                {event.quantity > 1 ? ` ×${event.quantity}` : ""}
              </Badge>
            ))}
            <span className="ml-1 font-display text-xl text-primary">{points} pt</span>
          </div>
        </div>
      ))}
    </div>
  );
}
