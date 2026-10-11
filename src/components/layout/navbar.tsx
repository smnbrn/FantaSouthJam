"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, LayoutDashboard, ShoppingBag, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { cn, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useTheme } from "@/providers/theme-provider";
import { BasketballMark } from "@/components/shared/basketball-mark";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { href: "/mercato", label: "Mercato" },
  { href: "/classifica", label: "Classifica" },
  { href: "/giornate", label: "Giornate" },
  { href: "/regolamento", label: "Regolamento e Premi" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useUser();
  const { theme, toggleTheme, mounted } = useTheme();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Disconnesso", { description: "A presto su Fanta3v3 Amantea!" });
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "glass-panel shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-primary" aria-label="Fanta3v3 Amantea, torna alla home">
          <BasketballMark />
          <span className="font-display text-lg tracking-wide text-foreground">
            FANTA<span className="text-primary">3V3</span> AMANTEA
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted",
                pathname === link.href ? "text-primary" : "text-foreground/80"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Attiva tema chiaro" : "Attiva tema scuro"}
            className="rounded-full"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )
            ) : (
              <span className="block size-5 rounded-full bg-muted-foreground/20" aria-hidden="true" />
            )}
          </Button>

          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="size-8">
                      <AvatarFallback>{getInitials(profile?.username ?? "??")}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">{profile?.username ?? "Account"}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/squadra" className="flex items-center gap-2">
                      <ShoppingBag className="size-4" /> La mia squadra
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profilo" className="flex items-center gap-2">
                      <UserIcon className="size-4" /> Profilo
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <ShieldCheck className="size-4" /> Pannello admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive">
                    <LogOut className="size-4" /> Esci
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Accedi</Link>
                </Button>
                <Button asChild>
                  <Link href="/registrati">Registrati</Link>
                </Button>
              </div>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full md:hidden" aria-label="Apri il menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <BasketballMark className="size-6" /> Menu
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-muted",
                        pathname === link.href ? "text-primary" : "text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
                {user ? (
                  <>
                    <SheetClose asChild>
                      <Link href="/dashboard" className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-muted">
                        Dashboard
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/squadra" className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-muted">
                        La mia squadra
                      </Link>
                    </SheetClose>
                    {profile?.role === "admin" && (
                      <SheetClose asChild>
                        <Link href="/admin" className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-muted">
                          Pannello admin
                        </Link>
                      </SheetClose>
                    )}
                    <Button variant="outline" onClick={handleLogout} className="mt-2">
                      <LogOut className="size-4" /> Esci
                    </Button>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild>
                        <Link href="/login">Accedi</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild>
                        <Link href="/registrati">Registrati</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
