import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/services/ranking-service";
import { getMyTeam } from "@/services/team-service";
import { Trophy } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Leaderboard } from "@/components/classifica/leaderboard";

export const metadata = {
  title: "Classifica",
  description: "La classifica del fantabasket di Amantea, aggiornata in tempo reale ad ogni giornata.",
};

export default async function ClassificaPage() {
  const supabase = await createClient();
  const [rows, { data: userData }] = await Promise.all([getLeaderboard(supabase), supabase.auth.getUser()]);
  const myTeam = userData.user ? await getMyTeam(supabase, userData.user.id) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="mb-5 sm:mb-8">
        <h1 className="font-display text-display-lg tracking-wide">Classifica</h1>
        <p className="mt-1 text-muted-foreground">Aggiornata in automatico ad ogni bonus o malus assegnato.</p>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Trophy} title="Nessuna squadra iscritta" description="La classifica si riempie appena vengono create le prime squadre." />
      ) : (
        <Leaderboard initialRows={rows} myTeamId={myTeam?.id ?? null} />
      )}
    </div>
  );
}
