import { Check } from "lucide-react";
import type { Player } from "@/types";
import { cn, formatNumber, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PlayerCardProps {
  player: Player;
  owned: boolean;
  canAfford: boolean;
  canBuy: boolean;
  buying: boolean;
  onBuy: () => void;
}

/** Ruolo di default assegnato a tutti i giocatori: mostrarlo su ogni card sarebbe solo rumore. */
const DEFAULT_ROLE = "Giocatore";

export function PlayerCard({ player, owned, canAfford, canBuy, buying, onBuy }: PlayerCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors",
        owned ? "border-primary/50 bg-primary/[0.04]" : "hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-12 rounded-xl">
          {player.photo_url && <AvatarImage src={player.photo_url} alt={player.full_name} className="rounded-xl" />}
          <AvatarFallback className="rounded-xl text-sm">{getInitials(player.full_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-display text-lg leading-tight tracking-wide">{player.full_name}</h3>
          <p className="truncate text-xs text-muted-foreground">{player.real_team}</p>
          {player.role !== DEFAULT_ROLE && (
            <Badge variant="outline" className="mt-1.5">
              {player.role}
            </Badge>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl leading-none tabular-nums text-primary">{player.cost}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">crediti</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{formatNumber(player.total_points)}</span> punti
        </p>
        {owned ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            <Check className="size-4" /> In rosa
          </span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className={cn(canBuy && canAfford && "border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground")}
            onClick={onBuy}
            loading={buying}
            disabled={!canBuy || !canAfford}
            aria-label={`Acquista ${player.full_name} per ${player.cost} crediti`}
          >
            {!canAfford ? "Fuori budget" : "Acquista"}
          </Button>
        )}
      </div>
    </article>
  );
}
