import Link from "next/link";
import { Users, Shield, ShoppingBag, CalendarCog, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/settings-service";
import { getActivePlayers } from "@/services/player-service";
import { getAllProfiles, getAllTeamsAdmin, getAllMatchdaysAdmin } from "@/services/admin-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Panoramica admin" };

const STATUS_LABEL = { upcoming: "Da giocare", open: "In corso", closed: "Chiusa" } as const;

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const [settings, players, profiles, teams, matchdays] = await Promise.all([
    getSettings(supabase),
    getActivePlayers(supabase),
    getAllProfiles(supabase),
    getAllTeamsAdmin(supabase),
    getAllMatchdaysAdmin(supabase),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Utenti registrati" value={profiles.length} />
        <StatCard icon={Shield} label="Squadre create" value={teams.length} />
        <StatCard icon={ShoppingBag} label="Giocatori sul mercato" value={players.length} />
        <StatCard
          icon={CalendarCog}
          label="Mercato"
          value={settings.market_open ? "Aperto" : "Chiuso"}
          highlight={settings.market_open}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Giornate</CardTitle>
          <Link href="/admin/giornate" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Gestisci <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {matchdays.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
              <span className="font-display text-sm tracking-wide">Giornata {m.number}</span>
              <Badge variant={m.status === "closed" ? "secondary" : m.status === "open" ? "default" : "outline"}>
                {STATUS_LABEL[m.status]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
