import { Check, Coins, TrendingUp } from "lucide-react";
import type { Player } from "@/types";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PlayerCardProps {
  player: Player;
  owned: boolean;
  canAfford: boolean;
  canBuy: boolean;
  buying: boolean;
  onBuy: () => void;
}

export function PlayerCard({ player, owned, canAfford, canBuy, buying, onBuy }: PlayerCardProps) {
  return (
    <Card className={cn("flex flex-col p-5 transition-shadow hover:shadow-md", owned && "border-primary/40 bg-primary/[0.03]")}>
      <div className="flex items-start gap-3">
        <Avatar className="size-14 rounded-2xl">
          {player.photo_url && <AvatarImage src={player.photo_url} alt={player.full_name} className="rounded-2xl" />}
          <AvatarFallback className="rounded-2xl text-base">{getInitials(player.full_name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg tracking-wide">{player.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{player.real_team}</p>
          <Badge variant="outline" className="mt-1.5">
            {player.role}
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-muted px-3 py-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Coins className="size-3.5 text-primary" /> {player.cost} cr.
        </span>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <TrendingUp className="size-3.5" /> {player.total_points} pt
        </span>
      </div>

      <div className="mt-4">
        {owned ? (
          <Button variant="secondary" className="w-full" disabled>
            <Check className="size-4" /> In rosa
          </Button>
        ) : (
          <Button className="w-full" onClick={onBuy} loading={buying} disabled={!canBuy || !canAfford}>
            {!canAfford ? "Crediti insufficienti" : "Acquista"}
          </Button>
        )}
      </div>
    </Card>
  );
}
