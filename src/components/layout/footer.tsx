import Link from "next/link";
import { BasketballMark } from "@/components/shared/basketball-mark";
import { CookieSettingsButton } from "@/components/shared/cookie-banner";

const FOOTER_LINKS = [
  {
    title: "Gioco",
    links: [
      { href: "/mercato", label: "Mercato" },
      { href: "/classifica", label: "Classifica" },
      { href: "/giornate", label: "Giornate" },
    ],
  },
  {
    title: "Informazioni",
    links: [
      { href: "/regolamento", label: "Regolamento" },
      { href: "/faq", label: "FAQ" },
      { href: "/crediti", label: "Crediti" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/registrati", label: "Registrati" },
      { href: "/login", label: "Accedi" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <BasketballMark />
            <span className="font-display text-lg tracking-wide text-foreground">
              FANTA <span className="text-primary">SOUTHJAM</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Il fantabasket del torneo 3v3 South Jam di Amantea. Componi la tua squadra con i giocatori reali del
            torneo e scala la classifica.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <h3 className="font-display text-sm tracking-wide text-muted-foreground">{group.title.toUpperCase()}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Fanta SouthJam. Progetto amatoriale, non affiliato alla NBA né ad alcuna lega
        professionistica.
        <div className="mt-2">
          <CookieSettingsButton className="underline-offset-4 transition-colors hover:text-primary hover:underline" />
        </div>
      </div>
    </footer>
  );
}
