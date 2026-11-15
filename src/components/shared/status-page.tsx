import { cn } from "@/lib/utils";

/**
 * Pagina di stato a tutto schermo (404, errore): un numero o una sigla sul
 * tabellone, un titolo, una riga di spiegazione e le azioni per ripartire.
 */
export function StatusPage({
  code,
  title,
  description,
  children,
  className,
}: {
  code: string;
  title: string;
  description: string;
  /** Pulsanti di uscita (torna alla home, riprova...). */
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("court-arc-bg flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:py-24", className)}>
      <div className="scoreboard rounded-2xl px-8 py-5">
        <p className="scoreboard-digit text-6xl leading-none text-accent sm:text-7xl">{code}</p>
      </div>
      <h1 className="mt-8 font-display text-display-lg uppercase tracking-wide">{title}</h1>
      <p className="mt-3 max-w-md text-balance text-muted-foreground">{description}</p>
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">{children}</div>
    </div>
  );
}
