import { createClient } from "@/lib/supabase/server";
import { getHallOfFame } from "@/services/hall-of-fame-service";
import { HallOfFameManager } from "@/components/admin/hall-of-fame-manager";

export const metadata = { title: "Admin · Hall of Fame" };

export default async function AdminHallOfFamePage() {
  const supabase = await createClient();
  const entries = await getHallOfFame(supabase);
  return <HallOfFameManager entries={entries} />;
}
