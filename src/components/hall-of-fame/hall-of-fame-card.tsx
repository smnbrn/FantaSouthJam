import { Trophy, Flame } from "lucide-react";
import type { HallOfFameEntry } from "@/types";
import { cn, formatNumber } from "@/lib/utils";

function Honor({
  icon: Icon,
  label,
  name,
  detail,
  points,
  dark,
}: {
  icon: typeof Trophy;
  label: string;
  name: string;
  detail: string | null;
  points: number | null;
  dark: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          dark ? "bg-white/10 text-accent" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className={cn("text-[11px] font-semibold uppercase tracking-widest", dark ? "text-white/60" : "text-muted-foreground")}>
          {label}
        </p>
        <p className="mt-0.5 break-words font-display text-xl tracking-wide">{name}</p>
        <p className={cn("text-sm", dark ? "text-white/70" : "text-muted-foreground")}>
          {[detail, points !== null ? `${formatNumber(points)} pt` : null].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}

export function HallOfFameCard({ entry, featured = false }: { entry: HallOfFameEntry; featured?: boolean }) {
  return (
    <article
      className={cn(
        "rounded-3xl border p-6 sm:p-8",
        featured ? "scoreboard border-transparent" : "border-border bg-surface"
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={cn("font-display text-4xl tracking-wide sm:text-5xl", featured ? "scoreboard-digit text-accent" : "text-primary")}>
          {entry.year}
        </h2>
        {featured && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            Ultima edizione
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:gap-10">
        <Honor
          icon={Trophy}
          label="Squadra campione"
          name={entry.winner_team_name}
          detail={entry.winner_coach ? `All. ${entry.winner_coach}` : null}
          points={entry.winner_points}
          dark={featured}
        />
        <Honor
          icon={Flame}
          label="Top player"
          name={entry.top_player_name}
          detail={entry.top_player_team}
          points={entry.top_player_points}
          dark={featured}
        />
      </div>

      {entry.notes && (
        <p className={cn("mt-6 border-t pt-4 text-sm", featured ? "border-white/10 text-white/70" : "border-border text-muted-foreground")}>
          {entry.notes}
        </p>
      )}
    </article>
  );
}
