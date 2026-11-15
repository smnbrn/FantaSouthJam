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
- [x] **Blocco 2 — Componenti base** (15/11/2026): fatto in `src/components/ui/` (+ sostituzione dell'arancio-testo in 34 file).
  - Button: nuova variante `soft`; `secondary` ora neutro (scuro su chiaro e viceversa, non più marrone); disattivato
    grigio leggibile, in caricamento resta arancio (`data-loading`, `aria-busy`); `sm` alto 40 px; alone dal token.
  - Badge: `success` con testo dal token (7,2:1 nello scuro), nuove varianti `soft` e `secondary` neutra; ora è uno `<span>`.
  - Input, Textarea, Select: testo a 16 px su telefono (sotto, iPhone ingrandisce la pagina al tocco), alone di focus
    morbido, bordo al passaggio; voci del Select più alte.
  - Tabs: la fila scorre in orizzontale se le schede non entrano; schede alte 36 px.
  - Dialog e Sheet: pulsante di chiusura 36 px, ombra dal token, altezza massima con scorrimento; Sheet con fondo pieno.
  - Skeleton con riflesso che scorre; Avatar con iniziali ambra su fondo scuro (stile tabellone) al posto del marrone.
  - Mostra/nascondi password raggiungibile da tastiera e più grande.
  - Nuovo `EmptyState` (`src/components/ui/empty-state.tsx`), da usare nelle pagine nel blocco 3.
  - Arancio come testo: 47 righe passate a `text-primary-ink`. Restano in arancio pieno il logo, gli elementi sul
    tabellone scuro e i numeri grandi (24 px o più).
  - Verificato: typecheck 0 errori, lint 0, build ok; visto in locale a 390 px (squadra, giornate, mercato con
    finestra di acquisto, profilo; chiaro e scuro) e a 1280 px (dashboard). Nessun errore dell'app in console.
- [x] **Blocco 3 — Pagine chiave** (15/11/2026): fatto in cinque passi, un commit ciascuno.
  - 3a Navigazione: barra fissa in basso su telefono (`mobile-tab-bar.tsx`); `UserProvider` condiviso (una sola lettura
    di utente e profilo per pagina: era il punto 1 della lista tecnica); tolto il pallino trascinabile della chat;
    «Profilo» nel menu a scomparsa; area sicura di iPhone; avvisi sopra la barra.
  - 3b Classifica: elenco al posto della tabella (più spazio ai nomi), righe che scivolano alla nuova posizione e si
    accendono quando cambiano i punti, un solo ricaricamento ogni 400 ms (era il punto 2 della lista tecnica).
    Provata dal vivo assegnando un bonus nel database locale: la pagina si è aggiornata da sola.
    `cn()` ora conosce le dimensioni di testo e le ombre del tema (senza, `text-label` veniva scartata).
  - 3c Dashboard, mercato, la mia squadra: statistiche 2×2; righe del mercato compatte con crediti e posti sempre
    visibili; acquisto provato davvero in locale (saldo aggiornato, riga «In rosa», avviso); stella e cestino da 44 px.
  - 3d Giornate, Hall of Fame, pagina squadra: totale del giocatore in evidenza e bonus/malus in piccolo; intestazione
    della squadra a tabellone con posizione, punti e valore rosa; stati vuoti tutti con `EmptyState`.
  - 3e Chat: campo a 16 px su telefono, cestino da 36 px, stato «In diretta» come in classifica, messaggi nuovi animati.
  - Verificato: typecheck 0 errori, lint 0, build ok (28 pagine). Visto in locale a 390 px chiaro e scuro e a 1280 px.
  - **Non fatto / non verificato**: pannello admin non aperto; home, regolamento, FAQ, crediti e pagine di accesso
    non ridisegnate (hanno solo i nuovi token e componenti); nessuna prova su un iPhone vero né sull'anteprima Vercel.
- [x] **Blocco 4 — Correzioni tecniche** (15/11/2026)
  - Pagina 404 in italiano («Palla persa»), sia fuori sia dentro il sito (`app/not-found.tsx`, `app/(site)/not-found.tsx`);
    pagine di errore con «Riprova» (`app/error.tsx`, `app/(site)/error.tsx`); base comune `StatusPage`.
  - SEO: indirizzo del sito in un solo posto (`src/lib/site.ts`), di base `https://fanta3v3amantea.vercel.app`
    (su Vercel `NEXT_PUBLIC_SITE_URL` non è impostata: controllato, quindi vale questo); immagine di anteprima dei
    link generata dal codice (`app/opengraph-image.tsx`); sitemap senza `/mercato`; robots esclude anche
    `/squadra`, `/mercato`, `/chat`, `/auth`, `/reset-password`.
  - Impostazioni lette controllando il tipo vero dei valori invece dei cast (`settings-service.ts`).
  - Conteggi con `select("id")`; home: titolo con la scala del tema, etichetta del conto alla rovescia bilanciata.
  - Già chiusi nel blocco 3: chiamate doppie di `useUser`, ricaricamenti della classifica live.
  - Verificato: typecheck 0 errori, lint 0, build ok (29 pagine). In locale: 404 con stato HTTP 404 nelle due varianti,
    immagine di anteprima 1200×630, robots, sitemap e meta `og:image`/`twitter:image` presenti.
  - **Lasciato aperto di proposito — tipi dei join**: `src/types/database.types.ts` è scritto a mano e non descrive le
    relazioni tra tabelle, quindi i join (`players(*)`, `profiles(username)`…) hanno tipo «errore» che il codice
    attuale trasforma in `any`. Funziona, ma il compilatore lì non controlla nulla. La cura è rigenerare il file
    con `supabase gen types typescript --local` e adattare i servizi: è un cambio a parte, da approvare.
  - Non fatto: restringere i `select("*")` che leggono righe intere (guadagno minimo, tocca i tipi di cui sopra).

## Lavoro concluso: cosa resta da decidere

- Unione di `nuove-sale` in `main`: solo con l'OK del proprietario, dopo la prova sull'anteprima Vercel.
- Pannello admin mai aperto in queste sessioni: da guardare prima dell'unione.
- Rigenerazione dei tipi del database (vedi sopra).

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
