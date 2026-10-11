import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  highlight = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        highlight ? "scoreboard border-transparent" : "border-border bg-surface"
      )}
    >
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          highlight ? "bg-white/10 text-accent" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-5" />
      </div>
      <p
        className={cn(
          "mt-3 font-display text-3xl tracking-wide",
          highlight ? "scoreboard-digit" : "text-foreground"
        )}
      >
        {value}
        {suffix && <span className="ml-1 text-base opacity-70">{suffix}</span>}
      </p>
      <p className={cn("mt-0.5 text-xs font-semibold uppercase tracking-wider", highlight ? "text-white/60" : "text-muted-foreground")}>
        {label}
      </p>
    </div>
  );
}
