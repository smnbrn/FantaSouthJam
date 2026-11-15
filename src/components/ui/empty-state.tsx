import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Stato vuoto unico per tutta l'app: icona, titolo, una riga di spiegazione e un'azione facoltativa. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Azione (di solito un Button). */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12 text-primary-ink">
          <Icon className="size-6" />
        </div>
      )}
      <p className={cn("text-base font-bold tracking-tight", Icon && "mt-4")}>{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
