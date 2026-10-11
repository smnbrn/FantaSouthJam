"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import type { Player, BonusType } from "@/types";
import { assignScoreEventSchema, type AssignScoreEventInput } from "@/lib/validations/admin";
import { assignScoreEvent } from "@/services/admin-service";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function AssignBonusForm({
  matchdayId,
  players,
  bonusTypes,
}: {
  matchdayId: string;
  players: Player[];
  bonusTypes: BonusType[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<AssignScoreEventInput>({
    resolver: zodResolver(assignScoreEventSchema),
    defaultValues: { playerId: "", bonusTypeId: "", quantity: 1 },
  });

  async function onSubmit(values: AssignScoreEventInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await assignScoreEvent(supabase, {
      matchdayId,
      playerId: values.playerId,
      bonusTypeId: values.bonusTypeId,
      quantity: values.quantity,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Assegnazione non riuscita", { description: error });
      return;
    }
    toast.success("Bonus/malus assegnato");
    form.reset({ playerId: "", bonusTypeId: "", quantity: 1 });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assegna bonus/malus</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end">
            <FormField
              control={form.control}
              name="playerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giocatore</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Scegli..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {players.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bonusTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonus/malus</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Scegli..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bonusTypes.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.points >= 0 ? "+" : ""}
                          {b.points} {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qtà</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" loading={submitting}>
              <PlusCircle className="size-4" /> Assegna
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
