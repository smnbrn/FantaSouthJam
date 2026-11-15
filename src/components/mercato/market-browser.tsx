"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, SearchX, ShoppingBag, Users } from "lucide-react";
import { toast } from "sonner";

import type { FantasyTeam, Player, RosterEntry } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { buyPlayer, translateTeamError } from "@/services/team-service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PlayerCard } from "@/components/mercato/player-card";
import { MarketFilters, type SortOption } from "@/components/mercato/market-filters";
import { MarketClosedBanner } from "@/components/mercato/market-closed-banner";

export function MarketBrowser({
  players,
  team,
  roster,
  marketOpen,
  rosterMaxSize,
}: {
  players: Player[];
  team: FantasyTeam | null;
  roster: RosterEntry[];
  marketOpen: boolean;
  rosterMaxSize: number;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortOption>("name_asc");
  const [buyingId, setBuyingId] = React.useState<string | null>(null);
  const [confirmPlayer, setConfirmPlayer] = React.useState<Player | null>(null);

  const ownedIds = React.useMemo(() => new Set(roster.map((r) => r.player_id)), [roster]);
  const rosterFull = roster.length >= rosterMaxSize;

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = players;
    if (query) {
      list = list.filter(
        (p) => p.full_name.toLowerCase().includes(query) || p.real_team.toLowerCase().includes(query)
      );
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case "cost_asc":
          return a.cost - b.cost;
        case "cost_desc":
          return b.cost - a.cost;
        case "points_desc":
          return b.total_points - a.total_points;
        default:
          return a.full_name.localeCompare(b.full_name, "it");
      }
    });
  }, [players, search, sort]);

  async function confirmBuy() {
    if (!confirmPlayer || !team) return;
    setBuyingId(confirmPlayer.id);
    const supabase = createClient();
    const { error } = await buyPlayer(supabase, team.id, confirmPlayer.id);
    setBuyingId(null);
    setConfirmPlayer(null);
    if (error) {
      toast.error("Acquisto non riuscito", { description: translateTeamError(error) });
      return;
    }
    toast.success(`${confirmPlayer.full_name} è nella tua rosa!`);
    router.refresh();
  }

  if (!team) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Crea prima la tua squadra"
        description="Ti serve una squadra per poter acquistare giocatori al mercato."
        className="py-14"
      >
        <Button asChild>
          <Link href="/squadra">Crea la tua squadra</Link>
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!marketOpen && <MarketClosedBanner />}

      {/* Crediti e posti in rosa restano visibili mentre si scorre l'elenco. */}
      <div className="glass-panel sticky top-[4.5rem] z-30 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 shadow-card">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Coins className="size-4 text-primary-ink" />
          <span key={team.budget_remaining} className="animate-scoreboard-in font-display text-xl leading-none tabular-nums text-primary-ink">
            {team.budget_remaining}
          </span>
          crediti
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Users className="size-4" />
          <span className="tabular-nums">
            {roster.length}/{rosterMaxSize}
          </span>
          {rosterFull && <span className="text-xs font-medium">completa</span>}
        </span>
      </div>

      <MarketFilters search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} resultCount={filtered.length} />

      {filtered.length === 0 ? (
        <EmptyState icon={SearchX} title="Nessun giocatore trovato" description={`Nessun risultato per «${search}». Prova con un altro nome o con la squadra reale.`} />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {filtered.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              owned={ownedIds.has(player.id)}
              canAfford={player.cost <= team.budget_remaining}
              canBuy={marketOpen && !team.is_locked && !rosterFull}
              buying={buyingId === player.id}
              onBuy={() => setConfirmPlayer(player)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!confirmPlayer} onOpenChange={(open) => !open && setConfirmPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acquistare {confirmPlayer?.full_name}?</DialogTitle>
            <DialogDescription>
              Costo {confirmPlayer?.cost} crediti. Ti resteranno{" "}
              {confirmPlayer ? team.budget_remaining - confirmPlayer.cost : 0} crediti.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPlayer(null)}>
              Annulla
            </Button>
            <Button onClick={confirmBuy} loading={!!buyingId}>
              Conferma acquisto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
