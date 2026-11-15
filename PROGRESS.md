# PROGRESS — restyling professionale di Fanta SouthJam

Ramo di lavoro: `nuove-sale` (mai su `main`). Aggiornato il 15/11/2026.

## Stato

- [x] **Fase 1 — Audit** (15/11/2026): fatto, nessun file dell'app modificato. In attesa dell'OK del proprietario sul piano.
- [x] **Blocco 1 — Design tokens** (15/11/2026): fatto in `src/app/globals.css` e `src/app/layout.tsx`.
  - Effetto vetro corretto: nel CSS compilato ora c'è anche `backdrop-filter` standard; vetro un po' più coprente (0,72).
  - Colori: testo scuro sui pulsanti arancio anche nel tema chiaro (6,2:1); nuovo `primary-ink` (arancio da usare come
    testo: `#b93d0a` nel chiaro, 4,6:1); verde e rosso più scuri nel chiaro; nuovo `success-foreground`.
  - Raggi: scala unica crescente (8, 10, 12, 14, 20, 28 px). Prima `rounded-xl` (24) superava `rounded-2xl` (16).
  - Ombre: tre livelli (`shadow-card`, `shadow-raised`, `shadow-glow`). Scala tipografica `text-display-xl/lg/md/sm`
    e `text-label`. h3 e h4 non usano più Anton di base. Manrope da 5 a 4 pesi.
  - Verificato: typecheck 0 errori, lint 0, build ok; visto in locale a 390 px chiaro e scuro (giornate, mercato, classifica).
  - **Rimandato al blocco 2** (serve toccare i componenti): usare `text-primary-ink` al posto di `text-primary` per
    testi e icone, `text-success-foreground` nel Badge, le nuove ombre e la scala tipografica nei componenti.
- [ ] **Blocco 2 — Componenti base** (Button, Card, Input, Badge, Tabs, Dialog, Skeleton)
- [ ] **Blocco 3 — Pagine chiave** (dashboard, mercato, classifica live, profilo squadra, Hall of Fame, chat)
- [ ] **Blocco 4 — Correzioni tecniche** emerse dall'audit

## Verifiche eseguite nell'audit

- `npx tsc --noEmit`: 0 errori.
- `npm run lint`: 0 errori, 0 avvisi.
- `npm run build`: riesce (28 pagine) con le variabili Supabase impostate; senza `.env.local` si ferma
  perché manca la configurazione, non per un difetto del codice. Il repo non ha `.env.local`.
- Screenshot sul deploy `https://fanta3v3amantea.vercel.app` a 390 px e 1280 px, tema scuro e chiaro:
  home, classifica, giornate, Hall of Fame, regolamento, pagina squadra, login, 404.
- Pagine con login viste **in locale** (Supabase su Docker, dati di prova): dashboard, mercato, la mia squadra,
  chat, profilo. Non ancora visto: pannello admin.

## Problemi trovati (in ordine di impatto)

### Estetica
1. Effetto vetro assente su Chrome/Android/Firefox: nel CSS compilato `.glass-panel` ha solo
   `-webkit-backdrop-filter`, la proprietà standard viene scartata. La navbar allo scorrimento è
   trasparente e il logo si sovrappone al contenuto.
2. Contrasto insufficiente: testo bianco sui badge verdi (≈3,4:1), arancio `#ff5a1f` come testo su
   fondo chiaro (≈3:1), testo chiaro sui pulsanti arancio nel tema chiaro (≈3:1).
3. Pagina 404 di default di Next, in inglese e senza navbar; nessuna pagina di errore (`error.tsx`).
4. Niente navigazione mobile fissa: su telefono tutto passa dal menu a scomparsa (2 tocchi per pagina).
5. Scala tipografica non definita: Anton usato anche per nomi piccoli (card giocatore, righe), dimensioni
   scritte a mano pagina per pagina; classifica con «Posizione» come intestazione larga e nomi troncati.
6. Schede e riquadri ripetuti a mano (`rounded-2xl border border-border bg-surface`) invece di `Card`;
   stati vuoti di tre tipi diversi; raggi misti (xl, 2xl, 3xl, full).
7. Giornate: i bonus sono una fila di pillole verdi tutte uguali, il totale è in coda e si perde.
8. Skeleton presenti solo su 4 pagine; nessuna animazione sui cambi di posizione o sull'acquisto.
9. Avatar marroni (`secondary`) tutti uguali; nessuna foto né colore per squadra.
10. Banner cookie: due pulsanti identici in colore spento.
11. Dashboard su telefono: le 4 statistiche sono in colonna e riempiono tutto il primo schermo (meglio 2×2).
12. Pulsante principale disattivato («Salva formazione», «Salva modifiche»): arancio scuro con testo poco leggibile.
13. Mercato su telefono: ogni giocatore occupa una scheda alta, 24 giocatori sono uno scorrimento lungo;
    il pallino della chat copre i pulsanti «Acquista».

### Tecnica
1. `useUser` montato due volte (navbar e pallino chat): 2 `getUser` + 2 letture profilo + 1 `can_use_chat`
   a ogni pagina, anche da visitatore.
2. Classifica live: ogni riga cambiata fa ricaricare tutta la classifica (nessuna attesa/raggruppamento);
   un bonus che tocca 100 squadre genera fino a 100 riletture per ogni spettatore.
3. `metadataBase`, sitemap e robots usano `fanta3v3amantea.it` se manca `NEXT_PUBLIC_SITE_URL`: quel
   dominio non risponde. Manca l'immagine Open Graph. La sitemap elenca `/mercato` (privata).
4. Font con `<link>` bloccante e 5 pesi di Manrope (ne servono 3); vincolo del proprietario: restare su `<link>`.
5. Bersagli di tocco sotto 44 px: elimina messaggio (22 px), chiudi finestra (24 px), schede, pulsanti `sm`.
6. `select("*")` dove bastano poche colonne; conteggi con `select("*", { head: true })`.
7. Tipi deboli: `as` ripetuti sui join Supabase e sulle impostazioni; `photo_url` con `<img>` senza dimensioni.
8. Sicurezza (letta dalle migrazioni, non provata sul database): RLS e funzioni `SECURITY DEFINER` in ordine;
   da verificare solo `search_path = public` (meglio vuoto con nomi qualificati) — non si tocca senza richiesta.

## Decisioni e note

- Repo usato: `C:\Users\simon\Desktop\Repos\FantaSouthJam` (Next 15.5.27, allineato a `origin/main`).
  La copia in `Downloads\fanta3v3-amantea` (Next 15.5.22, senza Git) non è stata toccata.
- Dominio ufficiale: `https://fanta3v3amantea.vercel.app` (risposta del proprietario, 15/11/2026).
- Il ramo resta `nuove-sale` (risposta del proprietario, 15/11/2026).

## Ambiente locale (creato il 15/11/2026)

- Supabase locale su porte dedicate 553xx (`supabase/config.toml`, progetto `fantasouthjam`): non tocca quello
  del gestionale. Avvio: `supabase start -x studio,logflare,vector,edge-runtime,imgproxy,storage-api,mailpit,postgres-meta,supavisor`.
- Le 6 migrazioni si applicano da zero senza errori.
- Dati di prova: `node scripts/seed-local.mjs` (chiavi locali da `supabase status -o env`): 12 utenti
  `<username>@prova.test`, 24 giocatori, 2 giornate chiuse, chat, Hall of Fame. Utente per le prove: `marco_p`; admin: `admin`.
- App: `npm run dev -- -p 3100` con `.env.local` che punta al Supabase locale (file fuori dal repository).
- Il primo clic su «Rifiuta» nel banner cookie durante l'audit è stato fatto apposta (scelta più riservata).
