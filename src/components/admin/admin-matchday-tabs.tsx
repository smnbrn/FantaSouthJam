"use client";

import type { Matchday, Player, BonusType, MatchdayPlayerScore } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchdayStatusForm } from "@/components/admin/matchday-status-form";
import { AssignBonusForm } from "@/components/admin/assign-bonus-form";
import { MatchdayEventsAdmin } from "@/components/admin/matchday-events-admin";

export function AdminMatchdayTabs({
  matchdays,
  players,
  bonusTypes,
  scoresByMatchday,
}: {
  matchdays: Matchday[];
  players: Player[];
  bonusTypes: BonusType[];
  scoresByMatchday: Record<string, MatchdayPlayerScore[]>;
}) {
  return (
    <Tabs defaultValue={matchdays[0]?.id}>
      <TabsList>
        {matchdays.map((matchday) => (
          <TabsTrigger key={matchday.id} value={matchday.id}>
            Giornata {matchday.number}
          </TabsTrigger>
        ))}
      </TabsList>
      {matchdays.map((matchday) => (
        <TabsContent key={matchday.id} value={matchday.id} className="flex flex-col gap-6">
          <MatchdayStatusForm matchday={matchday} />
          <AssignBonusForm matchdayId={matchday.id} players={players} bonusTypes={bonusTypes} />
          <MatchdayEventsAdmin scores={scoresByMatchday[matchday.id] ?? []} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
