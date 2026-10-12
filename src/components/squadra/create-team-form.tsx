"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Shield } from "lucide-react";
import { toast } from "sonner";

import { createTeamSchema, type CreateTeamInput } from "@/lib/validations/team";
import { createTeam } from "@/services/team-service";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

export function CreateTeamForm({ budgetInitial }: { budgetInitial: number }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { teamName: "" },
  });

  async function onSubmit(values: CreateTeamInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { team, error } = await createTeam(supabase, values.teamName);
    setSubmitting(false);

    if (error) {
      form.setError("teamName", { message: error });
      return;
    }
    toast.success("Squadra creata!", {
      description: `Hai ${team?.budget_initial ?? budgetInitial} crediti da spendere al mercato.`,
    });
    router.push("/mercato");
    router.refresh();
  }

  return (
    <Card className="glass-panel animate-fade-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Shield className="size-6 text-primary" /> Crea la tua squadra
        </CardTitle>
        <CardDescription>Scegli un nome: sarà la tua identità per tutto il torneo.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome squadra</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Amantea Warriors" {...field} />
                  </FormControl>
                  <FormDescription>Da 3 a 40 caratteri. Potrai vederlo anche nella pagina pubblica della squadra.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="mt-2" loading={submitting}>
              Crea squadra con {budgetInitial} crediti
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
