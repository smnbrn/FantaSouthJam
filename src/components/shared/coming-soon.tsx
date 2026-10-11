import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <div className="scoreboard flex size-16 items-center justify-center rounded-2xl">
        <Icon className="size-7 text-primary" />
      </div>
      <h1 className="mt-6 font-display text-3xl tracking-wide">{title}</h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary">{phase}</p>
      <Button variant="outline" className="mt-8" asChild>
        <Link href="/">Torna alla home</Link>
      </Button>
    </div>
  );
}
