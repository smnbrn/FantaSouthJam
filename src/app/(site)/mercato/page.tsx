import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getMyTeam, getTeamRoster } from "@/services/team-service";
import { getActivePlayers } from "@/services/player-service";
import { getSettings } from "@/services/settings-service";
import { MarketBrowser } from "@/components/mercato/market-browser";

export const metadata = {
  title: "Mercato",
  description: "Cerca, confronta e acquista i giocatori reali del torneo di Basket 3vs3 di Amantea.",
};

export default async function MercatoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [players, team, settings] = await Promise.all([
    getActivePlayers(supabase),
    getMyTeam(supabase, user.id),
    getSettings(supabase),
  ]);
  const roster = team ? await getTeamRoster(supabase, team.id) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">Mercato</h1>
        <p className="mt-1 text-muted-foreground">Cerca, confronta e acquista i giocatori reali del torneo.</p>
      </div>

      <MarketBrowser
        players={players}
        team={team}
        roster={roster}
        marketOpen={settings.market_open}
        rosterMaxSize={settings.roster_max_size}
      />
    </div>
  );
}
