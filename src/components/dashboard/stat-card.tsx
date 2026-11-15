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
        "rounded-2xl border p-4 sm:p-5",
        highlight ? "scoreboard border-transparent" : "border-border bg-surface shadow-card"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-label uppercase", highlight ? "text-white/60" : "text-muted-foreground")}>{label}</p>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            highlight ? "bg-white/10 text-accent" : "bg-primary/12 text-primary-ink"
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p
        className={cn(
          "mt-2 font-display text-3xl leading-none tracking-wide tabular-nums sm:text-4xl",
          highlight ? "scoreboard-digit" : "text-foreground"
        )}
      >
        {value}
        {suffix && <span className="ml-1.5 font-sans text-sm font-semibold opacity-60">{suffix}</span>}
      </p>
    </div>
  );
}
