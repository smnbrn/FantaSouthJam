import Link from "next/link";
import { Home, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/shared/status-page";

export function NotFoundContent({ className }: { className?: string }) {
  return (
    <StatusPage
      code="404"
      title="Palla persa"
      description="Questa pagina non esiste o è stata spostata. Riparti dalla home o dai un'occhiata alla classifica."
      className={className}
    >
      <Button size="lg" asChild>
        <Link href="/">
          <Home className="size-4" /> Torna alla home
        </Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link href="/classifica">
          <Trophy className="size-4" /> Classifica
        </Link>
      </Button>
    </StatusPage>
  );
}
