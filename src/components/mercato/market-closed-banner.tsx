import { Lock } from "lucide-react";

export function MarketClosedBanner() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-5 py-4">
      <Lock className="size-5 shrink-0 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Il mercato è chiuso: puoi consultare i giocatori, ma non è possibile acquistarli in questo momento.
      </p>
    </div>
  );
}
