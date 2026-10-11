"use client";

import type { Matchday, MatchdayPlayerScore } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchdayScores } from "@/components/giornate/matchday-scores";

export function MatchdayTabs({
  matchdays,
  scoresByMatchday,
}: {
  matchdays: Matchday[];
  scoresByMatchday: Record<string, MatchdayPlayerScore[]>;
}) {
  const defaultTab = [...matchdays].reverse().find((m) => scoresByMatchday[m.id]?.length)?.id ?? matchdays[0]?.id;

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        {matchdays.map((matchday) => (
          <TabsTrigger key={matchday.id} value={matchday.id}>
            Giornata {matchday.number}
          </TabsTrigger>
        ))}
      </TabsList>
      {matchdays.map((matchday) => (
        <TabsContent key={matchday.id} value={matchday.id}>
          <MatchdayScores matchday={matchday} scores={scoresByMatchday[matchday.id] ?? []} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
