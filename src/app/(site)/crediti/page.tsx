import type { Metadata } from "next";
import { Info, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Crediti",
  description: "Chi ha progettato e sviluppato Fanta SouthJam, e come contattarlo.",
};

const DEVELOPER = {
  name: "Simone Bruni",
  initials: "SB",
  email: "simonebruni14gen@gmail.com",
  linkedin: "https://www.linkedin.com/in/simonebruni14/",
  linkedinLabel: "linkedin.com/in/simonebruni14",
};

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const contactLinkClass =
  "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-primary/[0.04]";

export default function CreditiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Info className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl tracking-wide sm:text-5xl">Crediti</h1>
        <p className="mt-2 text-sm text-muted-foreground">Fanta SouthJam — il fantabasket del torneo South Jam 3v3</p>
      </div>

      <section className="mt-10 flex items-center gap-4 rounded-2xl border border-border bg-surface p-6">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
          aria-hidden="true"
        >
          {DEVELOPER.initials}
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Developer</p>
          <p className="font-display text-2xl tracking-wide">{DEVELOPER.name}</p>
          <p className="text-sm text-muted-foreground">Progettazione e sviluppo di Fanta SouthJam.</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-xl tracking-wide">Contatti</h2>
        <p className="mt-1 text-sm text-muted-foreground">Per domande, segnalazioni o nuove idee scrivimi pure.</p>
        <div className="mt-4 flex flex-col gap-3">
          <a href={`mailto:${DEVELOPER.email}`} className={contactLinkClass}>
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{DEVELOPER.email}</span>
            <span className="text-xs text-muted-foreground">Email</span>
          </a>
          <a href={DEVELOPER.linkedin} target="_blank" rel="noopener noreferrer" className={contactLinkClass}>
            <LinkedInIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{DEVELOPER.linkedinLabel}</span>
            <span className="text-xs text-muted-foreground">LinkedIn</span>
          </a>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {DEVELOPER.name}. Progetto amatoriale, non affiliato alla NBA né ad alcuna lega
        professionistica.
      </p>
    </div>
  );
}
