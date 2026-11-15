import { Check } from "lucide-react";
import type { Player } from "@/types";
import { cn, formatNumber, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface PlayerCardProps {
  player: Player;
  owned: boolean;
  canAfford: boolean;
  canBuy: boolean;
  buying: boolean;
  onBuy: () => void;
}

/** Ruolo di default assegnato a tutti i giocatori: mostrarlo su ogni scheda sarebbe solo rumore. */
const DEFAULT_ROLE = "Giocatore";

/** Riga compatta del mercato: su telefono ne entrano sei o sette per schermata invece di tre. */
export function PlayerCard({ player, owned, canAfford, canBuy, buying, onBuy }: PlayerCardProps) {
  const available = canBuy && canAfford;

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-surface p-3 shadow-card transition-colors duration-200",
        owned ? "border-primary/40 bg-primary/[0.05]" : "border-border hover:border-primary/30"
      )}
    >
      <Avatar className="size-12 rounded-xl">
        {player.photo_url && <AvatarImage src={player.photo_url} alt="" className="rounded-xl" />}
        <AvatarFallback className="rounded-xl">{getInitials(player.full_name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[15px] leading-tight">{player.full_name}</h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {player.real_team}
          {player.role !== DEFAULT_ROLE && ` · ${player.role}`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{formatNumber(player.total_points)}</span> punti
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="font-display text-2xl leading-none tabular-nums text-primary">
          {player.cost}
          <span className="ml-1 font-sans text-[11px] font-semibold text-muted-foreground">cr.</span>
        </p>
        {owned ? (
          <span className="inline-flex h-10 items-center gap-1 text-sm font-semibold text-primary-ink animate-in fade-in zoom-in-90 duration-300">
            <Check className="size-4" /> In rosa
          </span>
        ) : (
          <Button
            size="sm"
            variant={available ? "soft" : "outline"}
            onClick={onBuy}
            loading={buying}
            disabled={!available}
            aria-label={`Acquista ${player.full_name} per ${player.cost} crediti`}
          >
            {!canAfford ? "Fuori budget" : "Acquista"}
          </Button>
        )}
      </div>
    </article>
  );
}
