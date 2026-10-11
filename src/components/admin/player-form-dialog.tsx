"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { Player } from "@/types";
import { playerSchema, type PlayerInput } from "@/lib/validations/admin";
import { createPlayer, updatePlayer } from "@/services/admin-service";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function PlayerFormDialog({
  player,
  open,
  onOpenChange,
}: {
  player?: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const isEdit = !!player;

  const form = useForm<PlayerInput>({
    resolver: zodResolver(playerSchema),
    values: {
      fullName: player?.full_name ?? "",
      realTeam: player?.real_team ?? "",
      role: player?.role ?? "Giocatore",
      cost: player?.cost ?? 10,
      photoUrl: player?.photo_url ?? "",
    },
  });

  async function onSubmit(values: PlayerInput) {
    setSubmitting(true);
    const supabase = createClient();
    const { error } = isEdit
      ? await updatePlayer(supabase, player.id, values)
      : await createPlayer(supabase, values);
    setSubmitting(false);

    if (error) {
      toast.error(isEdit ? "Modifica non riuscita" : "Creazione non riuscita", { description: error });
      return;
    }
    toast.success(isEdit ? "Giocatore aggiornato" : "Giocatore aggiunto");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Modifica ${player.full_name}` : "Aggiungi giocatore"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Aggiorna i dati del giocatore reale." : "Inserisci un nuovo giocatore reale acquistabile a mercato."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome e cognome</FormLabel>
                  <FormControl>
                    <Input placeholder="Mario Rossi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="realTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Squadra reale</FormLabel>
                    <FormControl>
                      <Input placeholder="Amantea Warriors" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruolo</FormLabel>
                    <FormControl>
                      <Input placeholder="Playmaker" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo (crediti)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL foto (opzionale)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit" loading={submitting}>
                {isEdit ? "Salva modifiche" : "Aggiungi giocatore"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
