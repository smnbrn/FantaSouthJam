"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";

import type { MatchdayPlayerScore } from "@/types";
import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { removeScoreEvent } from "@/services/admin-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function MatchdayEventsAdmin({ scores }: { scores: MatchdayPlayerScore[] }) {
  const router = useRouter();
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  async function handleRemove(eventId: string) {
    setRemovingId(eventId);
    const supabase = createClient();
    const { error } = await removeScoreEvent(supabase, eventId);
    setRemovingId(null);
    if (error) {
      toast.error("Rimozione non riuscita", { description: error });
      return;
    }
    toast.success("Bonus/malus rimosso");
    router.refresh();
  }

  if (scores.length === 0) {
    return <p className="text-sm text-muted-foreground">Nessun bonus/malus ancora assegnato per questa giornata.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {scores.map(({ player, points, events }) => (
        <div key={player.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {player.photo_url && <AvatarImage src={player.photo_url} alt={player.full_name} />}
              <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{player.full_name}</p>
              <p className="text-xs text-muted-foreground">{points} pt totali in giornata</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {events.map((event) => (
              <Badge key={event.id} variant={event.points >= 0 ? "success" : "destructive"} className="gap-1 pr-1">
                {event.points >= 0 ? "+" : ""}
                {event.points * event.quantity} {event.label}
                {event.quantity > 1 ? ` ×${event.quantity}` : ""}
                <button
                  type="button"
                  onClick={() => handleRemove(event.id)}
                  disabled={removingId === event.id}
                  aria-label={`Rimuovi ${event.label} da ${player.full_name}`}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
