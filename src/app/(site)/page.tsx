import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings-service";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { StatsStrip } from "@/components/home/stats-strip";
import { CtaSection } from "@/components/home/cta-section";

export default async function HomePage() {
  const supabase = await createClient();
  const [settings, { count: teams }, { count: players }, { count: matchdays }] = await Promise.all([
    getSettings(supabase),
    supabase.from("fantasy_teams").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("matchdays").select("*", { count: "exact", head: true }),
  ]);

  return (
    <>
      <Hero tournamentStartDate={settings.tournament_start_date} matchdays={matchdays ?? 0} />
      <StatsStrip
        stats={{
          teams: teams ?? 0,
          players: players ?? 0,
          matchdays: matchdays ?? 0,
          budgetInitial: settings.budget_initial,
        }}
      />
      <HowItWorks />
      <CtaSection />
    </>
  );
}
