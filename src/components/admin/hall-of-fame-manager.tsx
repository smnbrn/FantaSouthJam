"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { HallOfFameEntry } from "@/types";
import { hallOfFameSchema, type HallOfFameInput } from "@/lib/validations/hall-of-fame";
import { archiveSeason, deleteHallOfFameEntry, saveHallOfFameEntry } from "@/services/hall-of-fame-service";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// ---------------------------------------------------------------------------
// Archiviazione automatica della stagione in corso
// ---------------------------------------------------------------------------
function ArchiveSeasonCard({ existingYears }: { existingYears: number[] }) {
  const router = useRouter();
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const overwrite = existingYears.includes(year);

  async function handleArchive() {
    setLoading(true);
    const { error } = await archiveSeason(createClient(), year);
    setLoading(false);
    setConfirmOpen(false);
    if (error) {
      toast.error("Archiviazione non riuscita", { description: error });
      return;
    }
    toast.success(`Edizione ${year} archiviata nella Hall of Fame`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Archive className="size-4 text-primary" /> Archivia la stagione in corso
        </CardTitle>
        <CardDescription>
          Salva automaticamente la squadra prima in classifica e il giocatore con più fantapunti. Fallo a torneo
          finito, prima di azzerare squadre e giocatori per l&apos;anno dopo.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2">
          <label htmlFor="archive-year" className="text-sm font-medium">
            Anno edizione
          </label>
          <Input
            id="archive-year"
            type="number"
            className="sm:w-32"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        <Button onClick={() => setConfirmOpen(true)} disabled={!year}>
          <Archive className="size-4" /> Archivia {year}
        </Button>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archiviare l&apos;edizione {year}?</DialogTitle>
            <DialogDescription>
              {overwrite
                ? `Esiste già un'edizione ${year}: verrà sovrascritta con la classifica attuale.`
                : "Vincitore e top player verranno presi dalla classifica attuale."}{" "}
              In caso di pari merito vengono salvati tutti i nomi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleArchive} loading={loading}>
              Archivia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Inserimento/modifica manuale (es. edizioni giocate prima dell'app)
// ---------------------------------------------------------------------------
function EntryFormDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: HallOfFameEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<HallOfFameInput>({
    resolver: zodResolver(hallOfFameSchema) as Resolver<HallOfFameInput>,
    values: {
      year: entry?.year ?? new Date().getFullYear(),
      winnerTeamName: entry?.winner_team_name ?? "",
      winnerCoach: entry?.winner_coach ?? "",
      winnerPoints: entry?.winner_points ?? undefined,
      topPlayerName: entry?.top_player_name ?? "",
      topPlayerTeam: entry?.top_player_team ?? "",
      topPlayerPoints: entry?.top_player_points ?? undefined,
      notes: entry?.notes ?? "",
    },
  });

  async function onSubmit(values: HallOfFameInput) {
    setSubmitting(true);
    const { error } = await saveHallOfFameEntry(createClient(), values, entry?.id);
    setSubmitting(false);
    if (error) {
      toast.error("Salvataggio non riuscito", { description: error });
      return;
    }
    toast.success(entry ? "Edizione aggiornata" : "Edizione aggiunta");
    onOpenChange(false);
    router.refresh();
  }

  const textField = (name: keyof HallOfFameInput, label: string, type = "text", placeholder = "") => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? `Modifica edizione ${entry.year}` : "Aggiungi edizione"}</DialogTitle>
          <DialogDescription>Utile anche per inserire a mano le edizioni giocate prima dell&apos;app.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {textField("year", "Anno", "number")}
            <div className="grid gap-4 sm:grid-cols-2">
              {textField("winnerTeamName", "Squadra campione", "text", "Pres team")}
              {textField("winnerCoach", "Allenatore (opzionale)")}
            </div>
            {textField("winnerPoints", "Punti squadra (opzionale)", "number")}
            <div className="grid gap-4 sm:grid-cols-2">
              {textField("topPlayerName", "Top player", "text", "Mario Rossi")}
              {textField("topPlayerTeam", "Squadra reale (opzionale)")}
            </div>
            {textField("topPlayerPoints", "Fantapunti top player (opzionale)", "number")}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Es. vinta all'ultima giornata con un ankle breaker" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit" loading={submitting}>
                Salva
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Pagina completa
// ---------------------------------------------------------------------------
export function HallOfFameManager({ entries }: { entries: HallOfFameEntry[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<HallOfFameEntry | null | undefined>(undefined);
  const [deleting, setDeleting] = React.useState<HallOfFameEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    const { error } = await deleteHallOfFameEntry(createClient(), deleting.id);
    setDeleteLoading(false);
    setDeleting(null);
    if (error) {
      toast.error("Eliminazione non riuscita", { description: error });
      return;
    }
    toast.success("Edizione eliminata");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <ArchiveSeasonCard existingYears={entries.map((e) => e.year)} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Edizioni archiviate</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
            <Plus className="size-4" /> Aggiungi a mano
          </Button>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna edizione archiviata.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center gap-4 py-3">
                  <span className="font-display text-2xl text-primary">{entry.year}</span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-semibold">🏆 {entry.winner_team_name}</p>
                    <p className="truncate text-muted-foreground">🔥 {entry.top_player_name}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditing(entry)} aria-label={`Modifica ${entry.year}`}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-destructive"
                    onClick={() => setDeleting(entry)}
                    aria-label={`Elimina ${entry.year}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <EntryFormDialog entry={editing ?? null} open={editing !== undefined} onOpenChange={(o) => !o && setEditing(undefined)} />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminare l&apos;edizione {deleting?.year}?</DialogTitle>
            <DialogDescription>Sparirà dalla Hall of Fame pubblica. Non si può annullare.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={confirmDelete} loading={deleteLoading}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
