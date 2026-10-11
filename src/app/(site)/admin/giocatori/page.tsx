import { createClient } from "@/lib/supabase/server";
import { getAllPlayersAdmin } from "@/services/admin-service";
import { PlayersTable } from "@/components/admin/players-table";

export const metadata = { title: "Admin · Giocatori" };

export default async function AdminGiocatoriPage() {
  const supabase = await createClient();
  const players = await getAllPlayersAdmin(supabase);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {players.length} giocator{players.length === 1 ? "e" : "i"} totali. Rimuovere dal mercato nasconde il
        giocatore senza cancellare rose o punteggi già assegnati.
      </p>
      <PlayersTable players={players} />
    </div>
  );
}
