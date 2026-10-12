"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { AppSettings } from "@/types";
import { settingsSchema, type SettingsInput } from "@/lib/validations/admin";
import { updateSettings } from "@/services/admin-service";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      marketOpen: settings.market_open,
      registrationOpen: settings.registration_open,
      budgetInitial: settings.budget_initial,
      rosterMaxSize: settings.roster_max_size,
      rosterMaxStarters: settings.roster_max_starters,
      tournamentStartDate: toDatetimeLocal(settings.tournament_start_date),
      rulesText: settings.rules_text,
    },
  });

  async function onSubmit(values: SettingsInput) {
    setSubmitting(true);
    const supabase = createClient();
    const isoDate = values.tournamentStartDate ? new Date(values.tournamentStartDate).toISOString() : "";
    const { error } = await updateSettings(supabase, { ...values, tournamentStartDate: isoDate });
    setSubmitting(false);
    if (error) {
      toast.error("Salvataggio non riuscito", { description: error });
      return;
    }
    toast.success("Impostazioni salvate");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mercato e iscrizioni</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="marketOpen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <FormLabel>Mercato aperto</FormLabel>
                    <FormDescription>Quando è chiuso, nessuno può acquistare o vendere giocatori. Le rose si bloccano in automatico.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registrationOpen"
              render={({ field }) => (
                <FormItem className="mt-3 flex flex-row items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <FormLabel>Iscrizioni aperte</FormLabel>
                    <FormDescription>Quando sono chiuse, nessuno può registrarsi o creare una nuova squadra.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget e rosa</CardTitle>
            <CardDescription>Si applicano alle nuove squadre create da qui in avanti.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="budgetInitial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget iniziale</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rosterMaxSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rosa massima</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rosterMaxStarters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolari massimi</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Countdown homepage</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="tournamentStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data e ora di inizio torneo</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="sm:max-w-xs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regolamento</CardTitle>
            <CardDescription>Il testo mostrato nella pagina pubblica /regolamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="rulesText"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea rows={8} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="self-start" loading={submitting}>
          Salva tutte le impostazioni
        </Button>
      </form>
    </Form>
  );
}
