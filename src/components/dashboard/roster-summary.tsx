import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { RosterEntry } from "@/types";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RosterSummary({ roster, rosterMaxSize }: { roster: RosterEntry[]; rosterMaxSize: number }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>
          La mia rosa{" "}
          <span className="font-sans text-sm font-normal text-muted-foreground">
            ({roster.length}/{rosterMaxSize})
          </span>
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/squadra">
            Gestisci <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {roster.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <ShoppingBag className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Non hai ancora acquistato nessun giocatore.</p>
            <Button size="sm" asChild>
              <Link href="/mercato">Vai al mercato</Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {roster.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted">
                <Avatar className="size-9">
                  {entry.player.photo_url && <AvatarImage src={entry.player.photo_url} alt={entry.player.full_name} />}
                  <AvatarFallback>{getInitials(entry.player.full_name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{entry.player.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{entry.player.real_team}</p>
                </div>
                <Badge variant={entry.is_starter ? "default" : "outline"}>
                  {entry.is_starter ? "Titolare" : "Riserva"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
