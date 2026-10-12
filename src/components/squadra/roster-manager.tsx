"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { FantasyTeam, RosterEntry } from "@/types";
import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { sellPlayer, setStarters, translateTeamError } from "@/services/team-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RosterManager({
  team,
  roster,
  rosterMaxStarters,
  marketOpen,
  liveMatchdayTitle,
}: {
  team: FantasyTeam;
  roster: RosterEntry[];
  rosterMaxStarters: number;
  marketOpen: boolean;
  /** Titolo della giornata in corso, se c'è: la formazione è congelata finché non si chiude. */
  liveMatchdayTitle: string | null;
}) {
  const router = useRouter();
  // Mercato (acquisti/vendite) e formazione hanno regole diverse, verificate anche dal database:
  // si compra e vende solo a mercato aperto, i titolari si cambiano sempre tranne durante una giornata.
  const canTrade = marketOpen && !team.is_locked;
  const canEditLineup = liveMatchdayTitle === null;

  const [starterIds, setStarterIds] = React.useState<Set<string>>(
    () => new Set(roster.filter((r) => r.is_starter).map((r) => r.player_id))
  );
  const [savingLineup, setSavingLineup] = React.useState(false);
  const [sellingId, setSellingId] = React.useState<string | null>(null);
  const [confirmSellId, setConfirmSellId] = React.useState<string | null>(null);

  const lineupDirty = React.useMemo(() => {
    const current = new Set(roster.filter((r) => r.is_starter).map((r) => r.player_id));
    return current.size !== starterIds.size || [...current].some((id) => !starterIds.has(id));
  }, [roster, starterIds]);

  function toggleStarter(playerId: string) {
    setStarterIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        if (next.size >= rosterMaxStarters) {
          toast.error(`Puoi schierare al massimo ${rosterMaxStarters} titolari`);
          return prev;
        }
        next.add(playerId);
      }
      return next;
    });
  }

  async function saveLineup() {
    setSavingLineup(true);
    const supabase = createClient();
    const { error } = await setStarters(supabase, team.id, [...starterIds]);
    setSavingLineup(false);
    if (error) {
      toast.error("Formazione non salvata", { description: translateTeamError(error) });
      return;
    }
    toast.success("Formazione salvata");
    router.refresh();
  }

  async function confirmSell() {
    if (!confirmSellId) return;
    setSellingId(confirmSellId);
    const supabase = createClient();
    const { error } = await sellPlayer(supabase, team.id, confirmSellId);
    setSellingId(null);
    setConfirmSellId(null);
    if (error) {
      toast.error("Vendita non riuscita", { description: translateTeamError(error) });
      return;
    }
    toast.success("Giocatore venduto");
    router.refresh();
  }

  const sellingEntry = roster.find((r) => r.player_id === confirmSellId);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Rosa</CardTitle>
          <CardDescription>
            {canEditLineup
              ? `Seleziona fino a ${rosterMaxStarters} titolari: solo loro segnano punti in giornata.`
              : `${liveMatchdayTitle} è in corso: la formazione è bloccata fino alla chiusura.`}
            {!canTrade && " Il mercato è chiuso: acquisti e vendite riapriranno più avanti."}
          </CardDescription>
        </div>
        {canEditLineup && (
          <Button size="sm" className="shrink-0 self-start sm:self-auto" onClick={saveLineup} loading={savingLineup} disabled={!lineupDirty}>
            Salva formazione
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {roster.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nessun giocatore in rosa. Vai al mercato per iniziare.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {roster.map((entry) => {
              const isStarter = starterIds.has(entry.player_id);
              return (
                <li key={entry.id} className="flex items-center gap-3 py-3">
                  {canEditLineup && (
                    <button
                      type="button"
                      onClick={() => toggleStarter(entry.player_id)}
                      aria-pressed={isStarter}
                      aria-label={isStarter ? "Rendi riserva" : "Rendi titolare"}
                      className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Star className={isStarter ? "size-5 fill-primary text-primary" : "size-5"} />
                    </button>
                  )}
                  <Avatar className="size-10 shrink-0">
                    {entry.player.photo_url && <AvatarImage src={entry.player.photo_url} alt={entry.player.full_name} />}
                    <AvatarFallback>{getInitials(entry.player.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{entry.player.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.player.real_team} · {entry.purchase_price} cr.
                    </p>
                  </div>
                  {!canEditLineup && (
                    <Badge variant={entry.is_starter ? "default" : "outline"}>
                      {entry.is_starter ? "Titolare" : "Riserva"}
                    </Badge>
                  )}
                  {canTrade && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmSellId(entry.player_id)}
                      aria-label={`Vendi ${entry.player.full_name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={!!confirmSellId} onOpenChange={(open) => !open && setConfirmSellId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vendere {sellingEntry?.player.full_name}?</DialogTitle>
            <DialogDescription>
              Riceverai indietro {sellingEntry?.purchase_price} crediti. L&apos;operazione è reversibile solo
              ricomprando il giocatore, se ancora disponibile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSellId(null)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={confirmSell} loading={!!sellingId}>
              Vendi giocatore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
