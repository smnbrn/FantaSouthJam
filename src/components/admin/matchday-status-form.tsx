"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Matchday } from "@/types";
import { matchdaySchema, type MatchdayInput } from "@/lib/validations/admin";
import { updateMatchday } from "@/services/admin-service";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Da giocare" },
  { value: "open", label: "In corso" },
  { value: "closed", label: "Chiusa" },
] as const;

export function MatchdayStatusForm({ matchday }: { matchday: Matchday }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<MatchdayInput>({
    resolver: zodResolver(matchdaySchema),
    values: {
      status: matchday.status,
      matchDate: matchday.match_date ?? "",
      resultsSummary: matchday.results_summary ?? "",
    },
  });

  async function onSubmit(values: MatchdayInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await updateMatchday(supabase, matchday.id, values);
    setSubmitting(false);
    if (error) {
      toast.error("Salvataggio non riuscito", { description: error });
      return;
    }
    toast.success("Giornata aggiornata");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dettagli giornata</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {matchday.lineups_locked_at
                        ? "Formazioni congelate: i punti usano i titolari schierati all'avvio della giornata."
                        : "Passando a \"In corso\" o \"Chiusa\" le formazioni di tutte le squadre vengono congelate."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="matchDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="resultsSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recap risultato (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Es. Amantea United 21 - 18 Calabria Ballers" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="self-start" loading={submitting}>
              Salva
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
