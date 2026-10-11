import { CalendarDays } from "lucide-react";
import type { Matchday } from "@/types";
import { formatDate } from "@/lib/utils";
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
          <CalendarDays className="size-4 text-primary" /> Prossima giornata
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
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {STATUS_LABEL[matchday.status]}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Il torneo è terminato: grazie per aver giocato!</p>
        )}
      </CardContent>
    </Card>
  );
}
