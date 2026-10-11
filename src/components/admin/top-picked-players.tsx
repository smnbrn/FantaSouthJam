import { Flame } from "lucide-react";
import type { TopPickedPlayer } from "@/services/admin-service";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TopPickedPlayers({ players }: { players: TopPickedPlayer[] }) {
  return (
    <Card className="h-fit mt-9"> {/* <-- Aggiunta la classe h-fit */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="size-4 text-primary" /> Più pickati
        </CardTitle>
        <CardDescription>I 5 giocatori presenti in più rose.</CardDescription>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun giocatore ancora acquistato.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {players.map((entry, i) => (
              <li key={entry.player.id} className="flex items-center gap-3 rounded-xl px-2 py-2">
                <span className="font-display text-sm text-muted-foreground">{i + 1}</span>
                <Avatar className="size-9">
                  {entry.player.photo_url && <AvatarImage src={entry.player.photo_url} alt={entry.player.full_name} />}
                  <AvatarFallback>{getInitials(entry.player.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{entry.player.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{entry.player.real_team}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {entry.pickCount} squadr{entry.pickCount === 1 ? "a" : "e"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}