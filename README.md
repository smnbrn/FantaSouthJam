# 🏀 Fanta3v3 Amantea

Fantabasket del torneo di Basket 3vs3 di Amantea. I giocatori acquistabili sono i partecipanti **reali** del
torneo (non NBA), il mercato è a crediti, il torneo dura 4 giornate e la classifica si aggiorna in automatico
quando l'admin assegna bonus/malus.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · componenti UI in stile shadcn (scritti a mano, vedi nota
sotto) · Supabase (Auth, Postgres, RLS, Realtime) · React Hook Form · Zod · Lucide Icons.

## Stato del progetto — completo (4 di 4 fasi)

Tutte le funzionalità del brief originale sono implementate e testate: autenticazione, dashboard, creazione
squadra, mercato, giornate, classifica realtime, pagina pubblica squadra e **pannello amministratore completo**.

| Fase | Contenuto | Stato |
|---|---|---|
| 1 | Setup, design system, database, autenticazione | ✅ |
| 2 | Dashboard utente, creazione squadra, mercato | ✅ |
| 3 | Giornate, classifica realtime, pagina pubblica squadra | ✅ |
| 4 | Pannello admin, rifiniture UX, SEO finale | ✅ |

### Pannello admin (`/admin`, solo per utenti con ruolo `admin`)

- **Giocatori**: aggiungi, modifica, costi, rimuovi dal mercato (disattivazione soft: non cancella rose o
  punteggi storici — una cancellazione "dura" romperebbe lo storico di chi li ha già posseduti)
- **Giornate**: stato e recap testuale, assegnazione bonus/malus per giocatore — punteggi, classifica e
  dashboard si aggiornano da soli grazie ai trigger della Fase 1
- **Impostazioni**: apertura/chiusura mercato, budget iniziale, dimensione rosa/titolari, data di inizio
  torneo (alimenta il countdown in homepage), testo del regolamento (alimenta /regolamento)
- **Utenti** e **Squadre**: elenco di sola lettura
- Ogni azione admin viene registrata automaticamente in `admin_logs` da un trigger (nessun codice applicativo
  da mantenere per farlo)

## 1. Prerequisiti

- Node.js 20+
- Un progetto Supabase gratuito → [supabase.com](https://supabase.com)

## 2. Installazione

```bash
npm install
cp .env.local.example .env.local
```

Compila `.env.local` con i valori del tuo progetto Supabase (Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # solo per operazioni server-side, non esporre mai al client
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Database

Nel SQL Editor del tuo progetto Supabase, esegui **in ordine**:

```
supabase/migrations/0001_init.sql
supabase/migrations/0002_rankings_view_and_realtime.sql
supabase/migrations/0003_admin_audit_log.sql
```

La prima crea tutte le 12 tabelle, le policy RLS, le funzioni di acquisto/vendita e i trigger che calcolano
automaticamente punteggi e classifica. La seconda aggiunge la vista `current_rankings` (usata da dashboard e
classifica) e attiva Supabase Realtime sulla tabella `rankings`. La terza aggiunge il log automatico delle
azioni del pannello admin. **Tutte e tre sono state testate end-to-end** (acquisti, budget, calcolo punteggi,
sorpassi in classifica, controlli di sicurezza, audit log) prima di questa consegna.

Dopo aver eseguito le migration, promuovi il tuo primo account ad amministratore (l'unico passaggio che resta
da fare via SQL, perché finché non esiste un admin nessuno può usare il pannello per farlo):

```sql
update public.profiles set role = 'admin' where username = 'il_tuo_username';
```

Da qui in poi, giocatori, giornate, bonus/malus, mercato e regolamento si gestiscono tutti dal pannello
`/admin` — non serve più altro SQL manuale.

Se vuoi che Supabase invii davvero le email di conferma/reset (in locale spesso non serve), configura il
provider email in Authentication → Email Templates. In sviluppo puoi anche disattivare la conferma email in
Authentication → Providers → Email per registrarti più velocemente.

## 4. Avvio

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## 5. Deploy su Vercel

1. Importa la repo su Vercel
2. Aggiungi le stesse variabili d'ambiente di `.env.local` (con `NEXT_PUBLIC_SITE_URL` uguale al dominio di
   produzione)
3. Deploy — zero configurazione aggiuntiva richiesta

## Struttura del progetto

```
src/
  app/            Route Next.js (App Router)
    (site)/       Pagine pubbliche con Navbar+Footer (home, mercato, classifica...)
    (auth)/       Pagine di autenticazione, layout minimale
    auth/callback Route handler per conferma email / reset password
  components/
    ui/           Primitive stile shadcn (button, input, card, dialog, textarea...)
    layout/       Navbar, Footer
    home/         Sezioni della homepage
    auth/         Form di login/registrazione/recupero password
    dashboard/    Stat card, riepilogo rosa, prossima giornata
    squadra/      Creazione squadra, gestione rosa (titolari/riserve, vendita)
    mercato/      Ricerca/filtri/ordinamento, card giocatore, acquisto
    classifica/   Classifica con sottoscrizione Supabase Realtime
    giornate/     Tab giornate, punteggi e dettaglio bonus/malus
    squadre/      Rosa e storico per la pagina pubblica squadra
    admin/        Form e tabelle del pannello amministratore
    shared/       Componenti condivisi (logo, paginazione, stato "in arrivo")
  hooks/          useUser, useCountdown
  lib/
    supabase/     Client browser/server/middleware
    validations/  Schemi Zod (auth, team, admin)
    utils.ts      Helper (cn, formatNumber, formatDate...)
  services/       Layer di chiamate a Supabase (auth, team, player, settings, matchday, ranking, admin)
  types/          Tipi TypeScript sincronizzati con lo schema DB
  providers/      ThemeProvider (dark mode)
supabase/
  migrations/     Schema SQL completo e testato
```

## Note tecniche importanti

- **Next.js è pinnato alla v15** (`15.5.22`) come richiesto, non alla v16 che `create-next-app` installa di
  default al momento di questa consegna.
- **Componenti UI scritti a mano invece che con la CLI shadcn**: il registry `ui.shadcn.com` non era
  raggiungibile dall'ambiente in cui è stato generato il progetto. `components.json` è comunque incluso e
  corretto, quindi da un tuo ambiente con accesso di rete normale puoi eseguire `npx shadcn@latest add <componente>`
  per aggiungerne altri in modo standard.
- **Font caricati via `<link>` a Google Fonts** (in `app/layout.tsx`) invece che con `next/font/google`: stessa
  identica resa finale, scelta per lo stesso motivo di rete di cui sopra. Se preferisci il self-hosting
  automatico di `next/font`, è una modifica di poche righe.
- **Dark mode implementata a mano** (`src/providers/theme-provider.tsx`) invece che con `next-themes`, per
  restare esclusivamente sullo stack richiesto nel brief.
- Acquisti, vendite e formazione titolari passano **sempre** da funzioni Postgres `SECURITY DEFINER`
  (`purchase_player`, `sell_player`, `set_starters`), mai da insert/update diretti del client: è lì che vivono i
  controlli su budget, mercato aperto/chiuso e rosa bloccata, e non sono aggirabili dal client.

## Limiti noti e prossimi passi consigliati

Il brief è coperto per intero, ma per un lancio reale con utenti veri considera anche:

- **Email**: Supabase invia le email di conferma/reset con un provider di test limitato nei volumi. Per un
  torneo con iscrizioni pubbliche, configura un provider SMTP tuo in Authentication → Settings.
- **Foto giocatori**: il campo è un URL testuale (come richiesto, "foto placeholder"); se vuoi caricare file
  direttamente da /admin, serve aggiungere un bucket Supabase Storage e un componente di upload.
- **Test automatici**: la logica critica (schema, trigger, RLS, RPC) è stata validata con test end-to-end
  manuali eseguiti su Postgres reale durante lo sviluppo (vedi cronologia del progetto), ma il repository non
  include una suite di test automatica da eseguire in CI. Consigliata prima di aprire il torneo al pubblico.
- **Promozione admin**: al momento si fa solo via SQL (vedi sopra); con più amministratori da gestire, vale la
  pena aggiungere un controllo ruoli nella pagina /admin/utenti.
