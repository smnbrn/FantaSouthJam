"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Crown, Home, LogIn, MessageCircle, Shield, ShoppingBag, Trophy, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MEMBER_TABS: TabItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/mercato", label: "Mercato", icon: ShoppingBag },
  { href: "/classifica", label: "Classifica", icon: Trophy },
  { href: "/squadra", label: "Squadra", icon: Shield },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

const GUEST_TABS: TabItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/classifica", label: "Classifica", icon: Trophy },
  { href: "/giornate", label: "Giornate", icon: CalendarDays },
  { href: "/hall-of-fame", label: "Albo d'oro", icon: Crown },
  { href: "/login", label: "Accedi", icon: LogIn },
];

/**
 * Barra di navigazione fissa in basso, solo su telefono: le cinque pagine più
 * usate a un tocco. Le altre (regolamento, FAQ, profilo, admin) restano nel menu.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  // Finché non si sa se l'utente è entrato la barra resta vuota (stessa altezza), per non mostrare voci sbagliate.
  const tabs = loading ? [] : user ? MEMBER_TABS : GUEST_TABS;

  return (
    <nav
      aria-label="Navigazione principale"
      className="glass-panel fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors duration-200 active:scale-95",
                  active ? "text-primary-ink" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
