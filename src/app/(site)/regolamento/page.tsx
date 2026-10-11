import { ScrollText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings-service";

export const metadata = {
  title: "Regolamento",
  description: "Il regolamento ufficiale di Fanta3v3 Amantea.",
};

export default async function RegolamentoPage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ScrollText className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl tracking-wide sm:text-5xl">Regolamento</h1>
      </div>
      <div className="mt-8 whitespace-pre-wrap rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-foreground sm:p-8">
        {settings.rules_text}
      </div>
    </div>
  );
}
