import type { RosterEntry } from "@/types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function PublicRoster({ roster }: { roster: RosterEntry[] }) {
  if (roster.length === 0) {
    return <p className="text-sm text-muted-foreground">Questa squadra non ha ancora acquistato giocatori.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {roster.map((entry) => (
        <div key={entry.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
          <Avatar className="size-11">
            {entry.player.photo_url && <AvatarImage src={entry.player.photo_url} alt={entry.player.full_name} />}
            <AvatarFallback>{getInitials(entry.player.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{entry.player.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {entry.player.real_team} · {entry.player.total_points} pt
            </p>
          </div>
          <Badge variant={entry.is_starter ? "default" : "outline"}>{entry.is_starter ? "Titolare" : "Riserva"}</Badge>
        </div>
      ))}
    </div>
  );
}
