import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings-service";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Registrati" };

export default async function RegisterPage() {
  const supabase = await createClient();
  const settings = await getSettings(supabase);

  if (!settings.registration_open) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Lock className="size-5" />
        </div>
        <h1 className="font-display text-2xl tracking-wide">Iscrizioni chiuse</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Le iscrizioni per questa edizione non sono aperte. Se hai già un account puoi comunque accedere.
        </p>
        <Button asChild variant="outline">
          <Link href="/login">Vai al login</Link>
        </Button>
      </div>
    );
  }

  return <RegisterForm />;
}
