import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAllTeamsAdmin, getTopPickedPlayers } from "@/services/admin-service";
import { Badge } from "@/components/ui/badge";
import { TopPickedPlayers } from "@/components/admin/top-picked-players";

export const metadata = { title: "Admin · Squadre" };

export default async function AdminSquadrePage() {
  const supabase = await createClient();
  const [teams, topPlayers] = await Promise.all([getAllTeamsAdmin(supabase), getTopPickedPlayers(supabase, 5)]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <p className="mb-4 text-sm text-muted-foreground">{teams.length} squadre create.</p>
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Squadra</th>
                <th className="hidden px-4 py-3 sm:table-cell">Allenatore</th>
                <th className="px-4 py-3 text-right">Rosa</th>
                <th className="px-4 py-3 text-right">Crediti</th>
                <th className="px-4 py-3 text-right">Punti</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-border bg-surface last:border-0">
                  <td className="px-4 py-3 font-semibold">
                    {team.team_name} {team.is_locked && <Badge variant="outline" className="ml-1">🔒</Badge>}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{team.ownerUsername}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{team.rosterCount}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {team.budget_remaining}/{team.budget_initial}
                  </td>
                  <td className="px-4 py-3 text-right font-display text-primary">{team.total_points}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/squadre/${team.id}`} target="_blank" className="text-muted-foreground hover:text-primary" aria-label={`Apri pagina pubblica di ${team.team_name}`}>
                      <ExternalLink className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TopPickedPlayers players={topPlayers} />
    </div>
  );
}