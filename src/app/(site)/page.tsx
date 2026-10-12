import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings-service";
import { getAllMatchdays } from "@/services/matchday-service";
import { getHeroCountdown } from "@/lib/matchday-schedule";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { StatsStrip } from "@/components/home/stats-strip";
import { CtaSection } from "@/components/home/cta-section";

export default async function HomePage() {
  const supabase = await createClient();
  const [settings, allMatchdays, { count: teams }, { count: players }] = await Promise.all([
    getSettings(supabase),
    getAllMatchdays(supabase),
    supabase.from("fantasy_teams").select("*", { count: "exact", head: true }),
    supabase.from("players").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return (
    <>
      <Hero countdown={getHeroCountdown(allMatchdays, settings.tournament_start_date)} matchdays={allMatchdays.length} />
      <StatsStrip
        stats={{
          teams: teams ?? 0,
          players: players ?? 0,
          matchdays: allMatchdays.length,
          budgetInitial: settings.budget_initial,
        }}
      />
      <HowItWorks />
      <CtaSection marketOpen={settings.market_open} />
    </>
  );
}
