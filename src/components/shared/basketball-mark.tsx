import { cn } from "@/lib/utils";

/** Glifo pallone da basket disegnato a mano (nessuna icona stock), usato come logo/firma visiva. */
export function BasketballMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("size-8", className)} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="currentColor" />
      <g stroke="var(--court-black, #121012)" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <path d="M20 2v36" />
        <path d="M2 20h36" />
        <path d="M6.5 8.5c4.5 4 7 8.5 7 11.5s-2.5 7.5-7 11.5" />
        <path d="M33.5 8.5c-4.5 4-7 8.5-7 11.5s2.5 7.5 7 11.5" />
      </g>
    </svg>
  );
}
