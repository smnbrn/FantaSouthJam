"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, EyeOff, Eye, Search } from "lucide-react";
import { toast } from "sonner";

import type { Player } from "@/types";
import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { setPlayerActive } from "@/services/admin-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/shared/pagination";
import { PlayerFormDialog } from "@/components/admin/player-form-dialog";

const PAGE_SIZE = 10;

export function PlayersTable({ players }: { players: Player[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [editingPlayer, setEditingPlayer] = React.useState<Player | null | undefined>(undefined);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return players;
    return players.filter(
      (p) => p.full_name.toLowerCase().includes(query) || p.real_team.toLowerCase().includes(query)
    );
  }, [players, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  async function toggleActive(player: Player) {
    setTogglingId(player.id);
    const supabase = createClient();
    const { error } = await setPlayerActive(supabase, player.id, !player.is_active);
    setTogglingId(null);
    if (error) {
      toast.error("Operazione non riuscita", { description: error });
      return;
    }
    toast.success(player.is_active ? "Giocatore rimosso dal mercato" : "Giocatore riattivato");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca giocatore..." className="pl-10" />
        </div>
        <Button onClick={() => setEditingPlayer(null)}>
          <Plus className="size-4" /> Aggiungi giocatore
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Giocatore</th>
              <th className="hidden px-4 py-3 sm:table-cell">Ruolo</th>
              <th className="px-4 py-3 text-right">Costo</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Punti</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Nessun giocatore trovato.
                </td>
              </tr>
            ) : (
              pageItems.map((player) => (
                <tr key={player.id} className={`border-b border-border bg-surface last:border-0 ${!player.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        {player.photo_url && <AvatarImage src={player.photo_url} alt={player.full_name} />}
                        <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{player.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{player.real_team}</p>
                      </div>
                      {!player.is_active && <Badge variant="outline">Non a mercato</Badge>}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{player.role}</td>
                  <td className="px-4 py-3 text-right font-semibold">{player.cost} cr.</td>
                  <td className="hidden px-4 py-3 text-right text-muted-foreground sm:table-cell">{player.total_points}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingPlayer(player)} aria-label={`Modifica ${player.full_name}`}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(player)}
                        loading={togglingId === player.id}
                        aria-label={player.is_active ? `Rimuovi ${player.full_name} dal mercato` : `Riattiva ${player.full_name}`}
                      >
                        {player.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />

      <PlayerFormDialog
        player={editingPlayer}
        open={editingPlayer !== undefined}
        onOpenChange={(open) => !open && setEditingPlayer(undefined)}
      />
    </div>
  );
}
