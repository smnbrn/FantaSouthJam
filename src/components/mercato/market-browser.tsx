"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Coins } from "lucide-react";
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
      <div className="rounded-3xl border border-border bg-surface p-8 text-center sm:p-12">
        <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
        <h2 className="mt-4 font-display text-2xl tracking-wide">Crea prima la tua squadra</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Ti serve una squadra per poter acquistare giocatori al mercato.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/squadra">Crea la tua squadra</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!marketOpen && <MarketClosedBanner />}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Coins className="size-4 text-primary" /> {team.budget_remaining} crediti disponibili
        </span>
        <span className="text-xs text-muted-foreground">
          Rosa: {roster.length}/{rosterMaxSize}
          {rosterFull && " (completa)"}
        </span>
      </div>

      <MarketFilters search={search} onSearchChange={setSearch} sort={sort} onSortChange={setSort} resultCount={filtered.length} />

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Nessun giocatore trovato per &quot;{search}&quot;.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
