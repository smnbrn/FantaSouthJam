import { createClient } from "@/lib/supabase/server";
import { getAllProfiles } from "@/services/admin-service";
import { getInitials, formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Utenti" };

export default async function AdminUtentiPage() {
  const supabase = await createClient();
  const profiles = await getAllProfiles(supabase);

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{profiles.length} utenti registrati.</p>
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Utente</th>
              <th className="px-4 py-3">Ruolo</th>
              <th className="hidden px-4 py-3 sm:table-cell">Iscritto il</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b border-border bg-surface last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile.username}</p>
                      {profile.full_name && <p className="text-xs text-muted-foreground">{profile.full_name}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={profile.role === "admin" ? "default" : "outline"}>
                    {profile.role === "admin" ? "Admin" : "Utente"}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{formatDate(profile.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
