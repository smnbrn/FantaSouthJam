import { CalendarDays } from "lucide-react";
import type { Matchday } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_LABEL: Record<Matchday["status"], string> = {
  upcoming: "In arrivo",
  open: "In corso",
  closed: "Conclusa",
};

export function NextMatchdayCard({ matchday }: { matchday: Matchday | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4 text-primary-ink" /> Prossima giornata
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matchday ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-xl tracking-wide">{matchday.title}</p>
              {matchday.match_date && (
                <p className="text-sm text-muted-foreground">{formatDate(matchday.match_date)}</p>
              )}
            </div>
            <Badge variant={matchday.status === "open" ? "default" : "soft"}>{STATUS_LABEL[matchday.status]}</Badge>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Il torneo è terminato: grazie per aver giocato!</p>
        )}
      </CardContent>
    </Card>
  );
}
