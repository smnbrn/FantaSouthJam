import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/services/ranking-service";
import { getMyTeam } from "@/services/team-service";
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">Classifica</h1>
        <p className="mt-1 text-muted-foreground">Aggiornata in automatico ad ogni bonus o malus assegnato.</p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted-foreground">
          Nessuna squadra iscritta ancora.
        </p>
      ) : (
        <Leaderboard initialRows={rows} myTeamId={myTeam?.id ?? null} />
      )}
    </div>
  );
}
