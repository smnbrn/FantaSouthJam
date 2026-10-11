import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings-service";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Admin · Impostazioni" };

export default async function AdminImpostazioniPage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);

  return <SettingsForm settings={settings} />;
}
