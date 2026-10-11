import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings-service";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { StatsStrip } from "@/components/home/stats-strip";
import { CtaSection } from "@/components/home/cta-section";

export default async function HomePage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);

  return (
    <>
      <Hero tournamentStartDate={settings.tournament_start_date} />
      <StatsStrip />
      <HowItWorks />
      <CtaSection />
    </>
  );
}
