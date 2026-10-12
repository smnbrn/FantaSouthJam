"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import type { Player, BonusType } from "@/types";
import { assignScoreEventsSchema, MAX_BONUS_QUANTITY } from "@/lib/validations/admin";
import { assignScoreEvents } from "@/services/admin-service";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatPoints(points: number) {
  return `${points > 0 ? "+" : ""}${points}`;
}

export function AssignBonusForm({
  matchdayId,
  players,
  bonusTypes,
}: {
  matchdayId: string;
  players: Player[];
  bonusTypes: BonusType[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [playerId, setPlayerId] = React.useState("");
  // Quantità per ogni bonus/malus: l'admin sceglie il giocatore una volta sola e
  // imposta tutti i bonus che ha preso, poi salva tutto insieme.
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const items = Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([bonusTypeId, quantity]) => ({ bonusTypeId, quantity }));
  const totalPoints = items.reduce(
    (sum, item) => sum + item.quantity * (bonusTypes.find((b) => b.id === item.bonusTypeId)?.points ?? 0),
    0
  );

  function changeQuantity(bonusTypeId: string, delta: number) {
    setQuantities((current) => {
      const next = Math.min(MAX_BONUS_QUANTITY, Math.max(0, (current[bonusTypeId] ?? 0) + delta));
      return { ...current, [bonusTypeId]: next };
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = assignScoreEventsSchema.safeParse({ playerId, items });
    if (!parsed.success) {
      toast.error("Controlla i dati", { description: parsed.error.issues[0]?.message });
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await assignScoreEvents(supabase, { matchdayId, ...parsed.data });
    setSubmitting(false);
    if (error) {
      toast.error("Assegnazione non riuscita", { description: error });
      return;
    }
    toast.success(items.length === 1 ? "Bonus/malus assegnato" : `${items.length} bonus/malus assegnati`);
    // Si svuotano solo le quantità: il giocatore resta selezionato per eventuali correzioni.
    setQuantities({});
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assegna bonus/malus</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="flex max-w-sm flex-col gap-2">
            <Label htmlFor={`player-${matchdayId}`}>Giocatore</Label>
            <Select value={playerId} onValueChange={setPlayerId}>
              <SelectTrigger id={`player-${matchdayId}`}>
                <SelectValue placeholder="Scegli..." />
              </SelectTrigger>
              <SelectContent>
                {players.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <fieldset disabled={!playerId} className="flex flex-col gap-2 disabled:opacity-50">
            <legend className="mb-2 text-sm font-medium">Bonus e malus ricevuti</legend>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {bonusTypes.map((bonus) => {
                const quantity = quantities[bonus.id] ?? 0;
                return (
                  <li
                    key={bonus.id}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-colors",
                      quantity > 0 ? "border-primary/50 bg-primary/[0.06]" : "border-border"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{bonus.label}</p>
                      <p
                        className={cn(
                          "text-xs font-semibold tabular-nums",
                          bonus.points >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {formatPoints(bonus.points)} pt
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-8"
                        onClick={() => changeQuantity(bonus.id, -1)}
                        disabled={quantity === 0}
                        aria-label={`Rimuovi ${bonus.label}`}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-8"
                        onClick={() => changeQuantity(bonus.id, 1)}
                        disabled={quantity >= MAX_BONUS_QUANTITY}
                        aria-label={`Aggiungi ${bonus.label}`}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {items.length > 0 ? (
                <>
                  {items.length} {items.length === 1 ? "voce" : "voci"} ·{" "}
                  <span className="font-semibold text-foreground tabular-nums">{formatPoints(totalPoints)} punti</span>
                </>
              ) : (
                "Scegli il giocatore e imposta quante volte ha preso ogni bonus/malus."
              )}
            </p>
            <Button type="submit" loading={submitting} disabled={!playerId || items.length === 0}>
              <PlusCircle className="size-4" /> Assegna
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
