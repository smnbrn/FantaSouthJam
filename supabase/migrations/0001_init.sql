-- =============================================================================
-- FANTA3V3 AMANTEA — Schema iniziale del database
-- =============================================================================
-- Applicare con: supabase db push
-- oppure incollando questo file nel SQL Editor del progetto Supabase.
--
-- Indice:
--   1. Estensioni ed enum
--   2. Tabelle
--   3. Funzioni helper (ruoli, updated_at)
--   4. Logica di business (acquisto/vendita giocatori, calcolo punteggi)
--   5. Trigger
--   6. Row Level Security
--   7. Dati iniziali (bonus/malus di default, impostazioni)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ESTENSIONI ED ENUM
-- -----------------------------------------------------------------------------
create extension if not exists pgcrypto;

create type public.user_role as enum ('user', 'admin');
create type public.matchday_status as enum ('upcoming', 'open', 'closed');
create type public.transaction_type as enum ('acquisto', 'vendita');

-- -----------------------------------------------------------------------------
-- 2. TABELLE
-- -----------------------------------------------------------------------------

-- profiles: un profilo pubblico per ogni utente registrato (1:1 con auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 24)
);
comment on table public.profiles is 'Profilo pubblico collegato 1:1 a auth.users.';

-- players: i giocatori REALI del torneo 3vs3, acquistabili a fantamercato
create table public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  real_team text not null,
  role text not null default 'Giocatore',
  cost integer not null check (cost > 0),
  photo_url text,
  total_points integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.players is 'Partecipanti reali del torneo, acquistabili nel fantamercato. total_points è una cache aggiornata automaticamente.';
create index players_is_active_idx on public.players (is_active);
create index players_cost_idx on public.players (cost);
create index players_total_points_idx on public.players (total_points desc);

-- fantasy_teams: la squadra fantacalcistica di ogni utente (1:1 con profiles)
create table public.fantasy_teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  team_name text not null unique,
  budget_initial integer not null default 100 check (budget_initial > 0),
  budget_remaining integer not null default 100,
  total_points integer not null default 0,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_remaining_non_negative check (budget_remaining >= 0),
  constraint team_name_length check (char_length(team_name) between 3 and 40)
);
comment on table public.fantasy_teams is 'Una squadra fantacalcistica per utente. Bloccata (is_locked) alla chiusura del mercato.';

-- fantasy_team_players: la rosa, cioè i giocatori reali acquistati da ogni squadra
create table public.fantasy_team_players (
  id uuid primary key default gen_random_uuid(),
  fantasy_team_id uuid not null references public.fantasy_teams (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  purchase_price integer not null check (purchase_price > 0),
  is_starter boolean not null default true,
  purchased_at timestamptz not null default now(),
  unique (fantasy_team_id, player_id)
);
comment on table public.fantasy_team_players is 'Rosa di ogni squadra. is_starter distingue titolari da riserve (i soli titolari fanno punteggio).';
create index ftp_team_idx on public.fantasy_team_players (fantasy_team_id);
create index ftp_player_idx on public.fantasy_team_players (player_id);

-- matchdays: le 4 giornate del torneo
create table public.matchdays (
  id uuid primary key default gen_random_uuid(),
  number integer not null unique check (number between 1 and 4),
  title text not null,
  match_date date,
  status public.matchday_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.matchdays is 'Le 4 giornate del torneo di Basket 3vs3.';

-- bonus_types: catalogo dei bonus/malus, modificabile dall'admin in qualsiasi momento
create table public.bonus_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  points integer not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.bonus_types is 'Catalogo bonus/malus (es. +3 Vittoria, -2 Espulsione). Editabile da pannello admin, mai hardcoded.';

-- player_score_events: singoli bonus/malus assegnati a un giocatore in una giornata
create table public.player_score_events (
  id uuid primary key default gen_random_uuid(),
  matchday_id uuid not null references public.matchdays (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  bonus_type_id uuid not null references public.bonus_types (id) on delete restrict,
  quantity integer not null default 1 check (quantity <> 0),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
comment on table public.player_score_events is 'Ogni riga = un bonus/malus assegnato dall''admin a un giocatore in una giornata. Fonte di verità per player_scores.';
create index pse_matchday_player_idx on public.player_score_events (matchday_id, player_id);

-- player_scores: totale calcolato (cache) per giocatore/giornata, ricalcolato automaticamente
create table public.player_scores (
  id uuid primary key default gen_random_uuid(),
  matchday_id uuid not null references public.matchdays (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  points integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (matchday_id, player_id)
);
comment on table public.player_scores is 'Somma automatica di player_score_events per giocatore/giornata. Non scrivere qui manualmente.';

-- rankings: storico della classifica, una riga per squadra per giornata
create table public.rankings (
  id uuid primary key default gen_random_uuid(),
  fantasy_team_id uuid not null references public.fantasy_teams (id) on delete cascade,
  matchday_id uuid not null references public.matchdays (id) on delete cascade,
  points_matchday integer not null default 0,
  points_total integer not null default 0,
  position integer not null,
  previous_position integer,
  created_at timestamptz not null default now(),
  unique (fantasy_team_id, matchday_id)
);
comment on table public.rankings is 'Storico classifica: una riga per squadra per giornata, calcolata automaticamente. Abilitata per Supabase Realtime.';
create index rankings_matchday_position_idx on public.rankings (matchday_id, position);

-- transactions: storico di ogni acquisto/vendita a mercato
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  fantasy_team_id uuid not null references public.fantasy_teams (id) on delete cascade,
  player_id uuid references public.players (id) on delete set null,
  type public.transaction_type not null,
  amount integer not null,
  created_at timestamptz not null default now()
);
comment on table public.transactions is 'Storico acquisti/vendite. Scritta solo dalle funzioni purchase_player/sell_player, mai da client diretto.';

-- settings: impostazioni chiave/valore (stato mercato, regolamento, budget iniziale, ecc.)
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
comment on table public.settings is 'Impostazioni globali editabili da admin: mercato aperto/chiuso, regolamento, budget iniziale, countdown, ecc.';

-- admin_logs: log di audit delle azioni amministrative
create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);
comment on table public.admin_logs is 'Audit trail di tutte le azioni compiute dal pannello admin.';
create index admin_logs_created_idx on public.admin_logs (created_at desc);

-- -----------------------------------------------------------------------------
-- 3. FUNZIONI HELPER
-- -----------------------------------------------------------------------------

-- Verifica se l'utente autenticato corrente è admin (usata nelle policy RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Generic trigger: mantiene aggiornata la colonna updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.players for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.fantasy_teams for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.matchdays for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.bonus_types for each row execute function public.set_updated_at();

-- Crea automaticamente un profilo quando un utente si registra (auth.users -> profiles)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      'utente_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 4. LOGICA DI BUSINESS
-- -----------------------------------------------------------------------------

-- purchase_player: acquisto atomico e validato di un giocatore.
-- Controlla proprietà squadra, mercato aperto, rosa non bloccata, giocatore non
-- già posseduto, tetto massimo rosa e budget disponibile, poi aggiorna rosa,
-- budget e registra la transazione, tutto in un'unica transazione DB.
create or replace function public.purchase_player(p_fantasy_team_id uuid, p_player_id uuid)
returns public.fantasy_team_players
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.fantasy_teams;
  v_player public.players;
  v_market_open boolean;
  v_max_roster integer;
  v_roster_count integer;
  v_new_row public.fantasy_team_players;
begin
  select * into v_team from public.fantasy_teams where id = p_fantasy_team_id for update;
  if v_team.id is null then
    raise exception 'Squadra non trovata';
  end if;
  if v_team.user_id <> auth.uid() then
    raise exception 'Non sei autorizzato a modificare questa squadra';
  end if;
  if v_team.is_locked then
    raise exception 'La rosa è bloccata: il mercato è chiuso';
  end if;

  select coalesce((value #>> '{}')::boolean, false) into v_market_open
  from public.settings where key = 'market_open';
  if not coalesce(v_market_open, false) then
    raise exception 'Il mercato è chiuso';
  end if;

  select * into v_player from public.players where id = p_player_id and is_active = true for update;
  if v_player.id is null then
    raise exception 'Giocatore non trovato o non disponibile';
  end if;

  if exists (
    select 1 from public.fantasy_team_players
    where fantasy_team_id = p_fantasy_team_id and player_id = p_player_id
  ) then
    raise exception 'Giocatore già presente in rosa';
  end if;

  select coalesce((value #>> '{}')::integer, 8) into v_max_roster
  from public.settings where key = 'roster_max_size';

  select count(*) into v_roster_count
  from public.fantasy_team_players where fantasy_team_id = p_fantasy_team_id;

  if v_roster_count >= coalesce(v_max_roster, 8) then
    raise exception 'Numero massimo di giocatori in rosa raggiunto (%)', coalesce(v_max_roster, 8);
  end if;

  if v_team.budget_remaining < v_player.cost then
    raise exception 'Crediti insufficienti: servono % crediti, ne restano %', v_player.cost, v_team.budget_remaining;
  end if;

  insert into public.fantasy_team_players (fantasy_team_id, player_id, purchase_price, is_starter)
  values (p_fantasy_team_id, p_player_id, v_player.cost, true)
  returning * into v_new_row;

  update public.fantasy_teams
  set budget_remaining = budget_remaining - v_player.cost
  where id = p_fantasy_team_id;

  insert into public.transactions (fantasy_team_id, player_id, type, amount)
  values (p_fantasy_team_id, p_player_id, 'acquisto', v_player.cost);

  return v_new_row;
end;
$$;

-- sell_player: rivendita di un giocatore dalla rosa, rimborsa il prezzo di acquisto.
create or replace function public.sell_player(p_fantasy_team_id uuid, p_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.fantasy_teams;
  v_market_open boolean;
  v_roster_row public.fantasy_team_players;
begin
  select * into v_team from public.fantasy_teams where id = p_fantasy_team_id for update;
  if v_team.id is null or v_team.user_id <> auth.uid() then
    raise exception 'Non sei autorizzato a modificare questa squadra';
  end if;
  if v_team.is_locked then
    raise exception 'La rosa è bloccata: il mercato è chiuso';
  end if;

  select coalesce((value #>> '{}')::boolean, false) into v_market_open
  from public.settings where key = 'market_open';
  if not coalesce(v_market_open, false) then
    raise exception 'Il mercato è chiuso';
  end if;

  select * into v_roster_row from public.fantasy_team_players
  where fantasy_team_id = p_fantasy_team_id and player_id = p_player_id
  for update;
  if v_roster_row.id is null then
    raise exception 'Giocatore non presente in rosa';
  end if;

  delete from public.fantasy_team_players where id = v_roster_row.id;

  update public.fantasy_teams
  set budget_remaining = budget_remaining + v_roster_row.purchase_price
  where id = p_fantasy_team_id;

  insert into public.transactions (fantasy_team_id, player_id, type, amount)
  values (p_fantasy_team_id, p_player_id, 'vendita', v_roster_row.purchase_price);
end;
$$;

-- set_starters: imposta quali giocatori della rosa sono titolari (max roster_max_starters)
create or replace function public.set_starters(p_fantasy_team_id uuid, p_player_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.fantasy_teams;
  v_max_starters integer;
begin
  select * into v_team from public.fantasy_teams where id = p_fantasy_team_id;
  if v_team.id is null or v_team.user_id <> auth.uid() then
    raise exception 'Non sei autorizzato a modificare questa squadra';
  end if;
  if v_team.is_locked then
    raise exception 'La rosa è bloccata: il mercato è chiuso';
  end if;

  select coalesce((value #>> '{}')::integer, 6) into v_max_starters
  from public.settings where key = 'roster_max_starters';

  if array_length(p_player_ids, 1) > coalesce(v_max_starters, 6) then
    raise exception 'Puoi schierare al massimo % titolari', coalesce(v_max_starters, 6);
  end if;

  update public.fantasy_team_players
  set is_starter = (player_id = any (p_player_ids))
  where fantasy_team_id = p_fantasy_team_id;
end;
$$;

-- recalc_player_score: ricalcola il totale di un giocatore per una giornata
-- sommando tutti i suoi player_score_events, e aggiorna la cache su players.
create or replace function public.recalc_player_score(p_matchday_id uuid, p_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
begin
  select coalesce(sum(bt.points * pse.quantity), 0) into v_total
  from public.player_score_events pse
  join public.bonus_types bt on bt.id = pse.bonus_type_id
  where pse.matchday_id = p_matchday_id and pse.player_id = p_player_id;

  insert into public.player_scores (matchday_id, player_id, points, updated_at)
  values (p_matchday_id, p_player_id, v_total, now())
  on conflict (matchday_id, player_id)
  do update set points = excluded.points, updated_at = now();

  update public.players
  set total_points = (
    select coalesce(sum(points), 0) from public.player_scores where player_id = p_player_id
  )
  where id = p_player_id;
end;
$$;

-- recalc_rankings: ricalcola punti giornata/totali e posizione di TUTTE le
-- squadre fino alla giornata indicata (inclusa), sommando i punti dei soli
-- titolari. Robusta rispetto all'ordine con cui le giornate vengono chiuse,
-- perché ricalcola sempre dal dato sorgente (player_scores).
create or replace function public.recalc_rankings(p_matchday_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_matchday_number integer;
begin
  select number into v_matchday_number from public.matchdays where id = p_matchday_id;
  if v_matchday_number is null then
    raise exception 'Giornata non trovata';
  end if;

  with points_per_team_matchday as (
    select
      ft.id as fantasy_team_id,
      m.id as matchday_id,
      m.number as matchday_number,
      coalesce((
        select sum(ps.points)
        from public.fantasy_team_players ftp
        join public.player_scores ps
          on ps.player_id = ftp.player_id and ps.matchday_id = m.id
        where ftp.fantasy_team_id = ft.id and ftp.is_starter = true
      ), 0) as points_matchday
    from public.fantasy_teams ft
    cross join public.matchdays m
    where m.number <= v_matchday_number
  ),
  cumulative as (
    select
      fantasy_team_id,
      matchday_id,
      matchday_number,
      points_matchday,
      sum(points_matchday) over (
        partition by fantasy_team_id order by matchday_number
        rows between unbounded preceding and current row
      ) as points_total
    from points_per_team_matchday
  ),
  current_md as (
    select * from cumulative where matchday_number = v_matchday_number
  ),
  ranked as (
    select *, rank() over (order by points_total desc) as position
    from current_md
  ),
  prev_ranked as (
    select r.fantasy_team_id, r.position as previous_position
    from public.rankings r
    join public.matchdays m on m.id = r.matchday_id
    where m.number = v_matchday_number - 1
  )
  insert into public.rankings (
    fantasy_team_id, matchday_id, points_matchday, points_total, position, previous_position
  )
  select r.fantasy_team_id, p_matchday_id, r.points_matchday, r.points_total, r.position, pr.previous_position
  from ranked r
  left join prev_ranked pr on pr.fantasy_team_id = r.fantasy_team_id
  on conflict (fantasy_team_id, matchday_id) do update set
    points_matchday = excluded.points_matchday,
    points_total = excluded.points_total,
    position = excluded.position,
    previous_position = excluded.previous_position;

  update public.fantasy_teams ft
  set total_points = r.points_total
  from public.rankings r
  where r.fantasy_team_id = ft.id and r.matchday_id = p_matchday_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 5. TRIGGER — rendono il calcolo dei punteggi completamente automatico
-- -----------------------------------------------------------------------------

-- Ogni volta che l'admin assegna/modifica/rimuove un bonus o malus, ricalcola
-- automaticamente il punteggio del giocatore e l'intera classifica.
create or replace function public.trg_player_score_events_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_matchday_id uuid;
  v_player_id uuid;
begin
  v_matchday_id := coalesce(new.matchday_id, old.matchday_id);
  v_player_id := coalesce(new.player_id, old.player_id);

  perform public.recalc_player_score(v_matchday_id, v_player_id);
  perform public.recalc_rankings(v_matchday_id);

  return coalesce(new, old);
end;
$$;

create trigger on_player_score_events_change
  after insert or update or delete on public.player_score_events
  for each row execute function public.trg_player_score_events_changed();

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.fantasy_teams enable row level security;
alter table public.fantasy_team_players enable row level security;
alter table public.matchdays enable row level security;
alter table public.bonus_types enable row level security;
alter table public.player_score_events enable row level security;
alter table public.player_scores enable row level security;
alter table public.rankings enable row level security;
alter table public.transactions enable row level security;
alter table public.settings enable row level security;
alter table public.admin_logs enable row level security;

-- profiles: leggibili da chiunque sia autenticato (servono per nomi squadra /
-- pagine pubbliche); ognuno modifica solo il proprio profilo; admin gestisce tutti.
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin());

-- players: catalogo pubblico in lettura, scrittura riservata all'admin.
create policy "players_select_all" on public.players for select using (true);
create policy "players_insert_admin" on public.players for insert with check (public.is_admin());
create policy "players_update_admin" on public.players for update using (public.is_admin());
create policy "players_delete_admin" on public.players for delete using (public.is_admin());

-- fantasy_teams: pubbliche in lettura (pagina squadra + classifica); l'utente
-- crea/aggiorna solo la propria; admin gestisce tutte.
create policy "fantasy_teams_select_all" on public.fantasy_teams for select using (true);
create policy "fantasy_teams_insert_own" on public.fantasy_teams for insert with check (auth.uid() = user_id);
create policy "fantasy_teams_update_own" on public.fantasy_teams for update using (auth.uid() = user_id and is_locked = false);
create policy "fantasy_teams_update_admin" on public.fantasy_teams for update using (public.is_admin());
create policy "fantasy_teams_delete_admin" on public.fantasy_teams for delete using (public.is_admin());

-- fantasy_team_players: rosa pubblica in lettura (pagina squadra). Le scritture
-- dirette sono bloccate: acquisti/vendite passano SEMPRE dalle funzioni
-- purchase_player/sell_player (security definer), mai da insert/delete diretti
-- del client, così i controlli su budget/mercato non sono aggirabili.
create policy "ftp_select_all" on public.fantasy_team_players for select using (true);
create policy "ftp_admin_all" on public.fantasy_team_players for all using (public.is_admin());

-- matchdays: pubbliche in lettura, gestite solo da admin.
create policy "matchdays_select_all" on public.matchdays for select using (true);
create policy "matchdays_admin_all" on public.matchdays for insert with check (public.is_admin());
create policy "matchdays_update_admin" on public.matchdays for update using (public.is_admin());
create policy "matchdays_delete_admin" on public.matchdays for delete using (public.is_admin());

-- bonus_types: pubblici in lettura (mostrati come legenda), gestiti da admin.
create policy "bonus_types_select_all" on public.bonus_types for select using (true);
create policy "bonus_types_admin_all" on public.bonus_types for insert with check (public.is_admin());
create policy "bonus_types_update_admin" on public.bonus_types for update using (public.is_admin());
create policy "bonus_types_delete_admin" on public.bonus_types for delete using (public.is_admin());

-- player_score_events: pubblici in lettura (dettaglio giornata), scritti solo da admin.
create policy "pse_select_all" on public.player_score_events for select using (true);
create policy "pse_insert_admin" on public.player_score_events for insert with check (public.is_admin());
create policy "pse_update_admin" on public.player_score_events for update using (public.is_admin());
create policy "pse_delete_admin" on public.player_score_events for delete using (public.is_admin());

-- player_scores: cache pubblica in lettura, mai scritta da client (solo dal trigger).
create policy "player_scores_select_all" on public.player_scores for select using (true);
create policy "player_scores_admin_all" on public.player_scores for all using (public.is_admin());

-- rankings: pubblica in lettura (classifica + Realtime), mai scritta da client.
create policy "rankings_select_all" on public.rankings for select using (true);
create policy "rankings_admin_all" on public.rankings for all using (public.is_admin());

-- transactions: un utente vede solo le transazioni della propria squadra; admin vede tutto.
-- Nessuna insert/update/delete diretta: solo le funzioni security definer scrivono qui.
create policy "transactions_select_own" on public.transactions for select using (
  exists (
    select 1 from public.fantasy_teams ft
    where ft.id = transactions.fantasy_team_id and ft.user_id = auth.uid()
  )
);
create policy "transactions_select_admin" on public.transactions for select using (public.is_admin());

-- settings: leggibili da chiunque (mercato aperto?, regolamento, countdown...), scritte solo da admin.
create policy "settings_select_all" on public.settings for select using (true);
create policy "settings_admin_all" on public.settings for insert with check (public.is_admin());
create policy "settings_update_admin" on public.settings for update using (public.is_admin());

-- admin_logs: visibili e scrivibili solo dagli admin.
create policy "admin_logs_admin_only" on public.admin_logs for all using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. DATI INIZIALI
-- -----------------------------------------------------------------------------

insert into public.bonus_types (code, label, points, sort_order) values
  ('vittoria', 'Vittoria', 3, 10),
  ('mvp', 'MVP della partita', 2, 20),
  ('tre_punti', 'Canestro da 3', 1, 30),
  ('assist', 'Assist', 1, 40),
  ('rimbalzo', 'Rimbalzo', 1, 50),
  ('fallo_tecnico', 'Fallo tecnico', -1, 60),
  ('palla_persa', 'Palla persa', -1, 70),
  ('espulsione', 'Espulsione', -2, 80);

insert into public.settings (key, value) values
  ('market_open', 'false'),
  ('registration_open', 'true'),
  ('roster_max_size', '8'),
  ('roster_max_starters', '6'),
  ('budget_initial', '100'),
  ('tournament_start_date', 'null'),
  ('rules_text', '"Il regolamento completo verrà pubblicato a breve dal pannello amministratore."');

insert into public.matchdays (number, title, status) values
  (1, 'Giornata 1', 'upcoming'),
  (2, 'Giornata 2', 'upcoming'),
  (3, 'Giornata 3', 'upcoming'),
  (4, 'Giornata 4', 'upcoming');
