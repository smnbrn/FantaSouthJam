"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shirt, CalendarCog, Settings, Users, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Panoramica", icon: LayoutDashboard, exact: true },
  { href: "/admin/giocatori", label: "Giocatori", icon: Shirt },
  { href: "/admin/giornate", label: "Giornate", icon: CalendarCog },
  { href: "/admin/impostazioni", label: "Impostazioni", icon: Settings },
  { href: "/admin/utenti", label: "Utenti", icon: Users },
  { href: "/admin/squadre", label: "Squadre", icon: Shield },
  { href: "/admin/hall-of-fame", label: "Hall of Fame", icon: Crown },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {ADMIN_LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <link.icon className="size-4" /> {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
