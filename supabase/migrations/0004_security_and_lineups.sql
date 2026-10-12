-- =============================================================================
-- FANTA3V3 AMANTEA — Migration 0004: hardening dei permessi + formazioni per giornata
-- =============================================================================
-- Applicare DOPO 0001, 0002 e 0003. Idempotente dove possibile.
--
-- Cosa risolve:
--   1. Escalation di privilegi: un utente poteva aggiornare la colonna `role` del
--      proprio profilo e diventare admin.
--   2. Budget e punti falsificabili: il client inseriva la squadra con un budget
--      arbitrario e poteva poi aggiornare budget_remaining / total_points.
--      Ora la squadra si crea solo con la funzione create_team(), che legge il
--      budget dalle impostazioni, e il client non può più scrivere su fantasy_teams.
--   3. Formazioni retroattive: il calcolo usava i titolari ATTUALI anche per le
--      giornate passate. Ora ogni giornata ha la sua formazione congelata
--      (matchday_lineups), scattata quando la giornata passa da 'upcoming' ad
--      'open'/'closed'. Mentre una giornata è 'open' la formazione non si cambia.
--   4. Classifica non aggiornata a cascata: correggere un bonus di una giornata
--      vecchia ora ricalcola anche tutte le giornate successive già calcolate.
--   5. is_locked mai valorizzato: ora segue automaticamente lo stato del mercato.
--   6. Acquisto oltre il limite titolari: un nuovo acquisto entra come titolare
--      solo se c'è posto, altrimenti come riserva.
--   7. Funzioni interne (trigger, ricalcoli) non più invocabili via API.
--
-- NON ricalcola la classifica esistente: lo storico resta quello attuale.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILI: il client può modificare solo username, nome e avatar
-- -----------------------------------------------------------------------------
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username, full_name, avatar_url) on public.profiles to authenticated;

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Registrazione più robusta: se lo username scelto è già preso o non rispetta
-- la lunghezza, ne genera uno valido invece di far fallire l'iscrizione.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  if v_username is null or char_length(v_username) not between 3 and 24 then
    v_username := 'utente_' || substr(new.id::text, 1, 8);
  end if;
  if exists (select 1 from public.profiles where lower(username) = lower(v_username)) then
    v_username := left(v_username, 19) || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.profiles (id, username, full_name)
  values (new.id, v_username, nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''));
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. SQUADRE: nessuna scrittura diretta dal client, creazione via create_team()
-- -----------------------------------------------------------------------------
revoke insert, update on public.fantasy_teams from anon, authenticated;
revoke delete on public.fantasy_teams from anon;

drop policy if exists "fantasy_teams_insert_own" on public.fantasy_teams;
drop policy if exists "fantasy_teams_update_own" on public.fantasy_teams;

create or replace function public.create_team(p_team_name text)
returns public.fantasy_teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := trim(p_team_name);
  v_budget integer;
  v_registration_open boolean;
  v_market_open boolean;
  v_team public.fantasy_teams;
begin
  if v_user_id is null then
    raise exception 'Devi effettuare l''accesso per creare una squadra';
  end if;

  select coalesce((value #>> '{}')::boolean, true) into v_registration_open
  from public.settings where key = 'registration_open';
  if not coalesce(v_registration_open, true) then
    raise exception 'Le iscrizioni sono chiuse';
  end if;

  if exists (select 1 from public.fantasy_teams where user_id = v_user_id) then
    raise exception 'Hai già una squadra';
  end if;

  if v_name is null or char_length(v_name) not between 3 and 40 then
    raise exception 'Il nome squadra deve avere tra 3 e 40 caratteri';
  end if;

  select coalesce((value #>> '{}')::integer, 100) into v_budget
  from public.settings where key = 'budget_initial';
  v_budget := coalesce(v_budget, 100);

  select coalesce((value #>> '{}')::boolean, false) into v_market_open
  from public.settings where key = 'market_open';

  begin
    insert into public.fantasy_teams (user_id, team_name, budget_initial, budget_remaining, is_locked)
    values (v_user_id, v_name, v_budget, v_budget, not coalesce(v_market_open, false))
    returning * into v_team;
  exception when unique_violation then
    raise exception 'Questo nome squadra è già stato scelto da qualcun altro';
  end;

  return v_team;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3. is_locked segue lo stato del mercato
-- -----------------------------------------------------------------------------
create or replace function public.trg_sync_team_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.key = 'market_open' then
    update public.fantasy_teams
    set is_locked = not coalesce((new.value #>> '{}')::boolean, false)
    where is_locked is distinct from not coalesce((new.value #>> '{}')::boolean, false);
  end if;
  return new;
end;
$$;

drop trigger if exists sync_team_lock on public.settings;
create trigger sync_team_lock
  after insert or update on public.settings
  for each row execute function public.trg_sync_team_lock();

update public.fantasy_teams ft
set is_locked = not coalesce((s.value #>> '{}')::boolean, false)
from public.settings s
where s.key = 'market_open'
  and ft.is_locked is distinct from not coalesce((s.value #>> '{}')::boolean, false);

-- -----------------------------------------------------------------------------
-- 4. FORMAZIONI PER GIORNATA
-- -----------------------------------------------------------------------------
alter table public.matchdays add column if not exists lineups_locked_at timestamptz;
comment on column public.matchdays.lineups_locked_at is
  'Quando sono state congelate le formazioni della giornata. NULL = si usano i titolari attuali.';

create table if not exists public.matchday_lineups (
  matchday_id uuid not null references public.matchdays (id) on delete cascade,
  fantasy_team_id uuid not null references public.fantasy_teams (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  primary key (matchday_id, fantasy_team_id, player_id)
);
comment on table public.matchday_lineups is
  'Titolari congelati di ogni squadra per ogni giornata: fonte di verità per il punteggio di squadra.';
create index if not exists matchday_lineups_team_idx on public.matchday_lineups (fantasy_team_id);

alter table public.matchday_lineups enable row level security;
drop policy if exists "matchday_lineups_select_all" on public.matchday_lineups;
create policy "matchday_lineups_select_all" on public.matchday_lineups for select using (true);
revoke insert, update, delete on public.matchday_lineups from anon, authenticated;

-- Congela le formazioni quando la giornata parte, le scongela se torna 'upcoming'.
create or replace function public.trg_matchday_lineups()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'upcoming' and new.lineups_locked_at is null then
    insert into public.matchday_lineups (matchday_id, fantasy_team_id, player_id)
    select new.id, ftp.fantasy_team_id, ftp.player_id
    from public.fantasy_team_players ftp
    where ftp.is_starter
    on conflict do nothing;
    new.lineups_locked_at := now();
  elsif new.status = 'upcoming' and new.lineups_locked_at is not null then
    delete from public.matchday_lineups where matchday_id = new.id;
    new.lineups_locked_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists matchday_lineups_lock on public.matchdays;
create trigger matchday_lineups_lock
  before update of status on public.matchdays
  for each row execute function public.trg_matchday_lineups();

-- Backfill: per le giornate già giocate lo storico delle formazioni non esiste;
-- si usano i titolari attuali, cioè la stessa base con cui è stata calcolata la
-- classifica corrente. La classifica salvata NON viene ricalcolata.
insert into public.matchday_lineups (matchday_id, fantasy_team_id, player_id)
select m.id, ftp.fantasy_team_id, ftp.player_id
from public.matchdays m
cross join public.fantasy_team_players ftp
where m.status <> 'upcoming' and m.lineups_locked_at is null and ftp.is_starter
on conflict do nothing;

update public.matchdays
set lineups_locked_at = now()
where status <> 'upcoming' and lineups_locked_at is null;

-- -----------------------------------------------------------------------------
-- 5. LOGICA DI MERCATO E FORMAZIONE
-- -----------------------------------------------------------------------------

-- Acquisto: come prima, ma il nuovo giocatore entra titolare solo se c'è posto.
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
  v_max_starters integer;
  v_roster_count integer;
  v_starter_count integer;
  v_new_row public.fantasy_team_players;
begin
  select * into v_team from public.fantasy_teams where id = p_fantasy_team_id for update;
  if v_team.id is null or v_team.user_id is distinct from auth.uid() then
    raise exception 'Non sei autorizzato a modificare questa squadra';
  end if;

  select coalesce((value #>> '{}')::boolean, false) into v_market_open
  from public.settings where key = 'market_open';
  if not coalesce(v_market_open, false) or v_team.is_locked then
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
  v_max_roster := coalesce(v_max_roster, 8);
  select coalesce((value #>> '{}')::integer, 6) into v_max_starters
  from public.settings where key = 'roster_max_starters';
  v_max_starters := coalesce(v_max_starters, 6);

  select count(*), count(*) filter (where is_starter)
  into v_roster_count, v_starter_count
  from public.fantasy_team_players where fantasy_team_id = p_fantasy_team_id;

  if v_roster_count >= v_max_roster then
    raise exception 'Numero massimo di giocatori in rosa raggiunto (%)', v_max_roster;
  end if;

  if v_team.budget_remaining < v_player.cost then
    raise exception 'Crediti insufficienti: servono % crediti, ne restano %', v_player.cost, v_team.budget_remaining;
  end if;

  insert into public.fantasy_team_players (fantasy_team_id, player_id, purchase_price, is_starter)
  values (p_fantasy_team_id, p_player_id, v_player.cost, v_starter_count < v_max_starters)
  returning * into v_new_row;

  update public.fantasy_teams
  set budget_remaining = budget_remaining - v_player.cost
  where id = p_fantasy_team_id;

  insert into public.transactions (fantasy_team_id, player_id, type, amount)
  values (p_fantasy_team_id, p_player_id, 'acquisto', v_player.cost);

  return v_new_row;
end;
$$;

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
  if v_team.id is null or v_team.user_id is distinct from auth.uid() then
    raise exception 'Non sei autorizzato a modificare questa squadra';
  end if;

  select coalesce((value #>> '{}')::boolean, false) into v_market_open
  from public.settings where key = 'market_open';
  if not coalesce(v_market_open, false) or v_team.is_locked then
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

-- Formazione: modificabile anche a mercato chiuso, ma NON mentre una giornata
-- è in corso ('open'). Le giornate già congelate non vengono toccate.
create or replace function public.set_starters(p_fantasy_team_id uuid, p_player_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.fantasy_teams;
  v_max_starters integer;
  v_ids uuid[] := coalesce(p_player_ids, '{}');
begin
  select * into v_team from public.fantasy_teams where id = p_fantasy_team_id;
  if v_team.id is null or v_team.user_id is distinct from auth.uid() then
    raise exception 'Non sei autorizzato a modificare questa squadra';
  end if;

  if exists (select 1 from public.matchdays where status = 'open') then
    raise exception 'C''è una giornata in corso: la formazione è bloccata fino alla sua chiusura';
  end if;

  select coalesce((value #>> '{}')::integer, 6) into v_max_starters
  from public.settings where key = 'roster_max_starters';
  v_max_starters := coalesce(v_max_starters, 6);

  if cardinality(v_ids) > v_max_starters then
    raise exception 'Puoi schierare al massimo % titolari', v_max_starters;
  end if;

  if exists (
    select 1 from unnest(v_ids) as requested(pid)
    where not exists (
      select 1 from public.fantasy_team_players ftp
      where ftp.fantasy_team_id = p_fantasy_team_id and ftp.player_id = requested.pid
    )
  ) then
    raise exception 'Puoi schierare solo giocatori della tua rosa';
  end if;

  update public.fantasy_team_players
  set is_starter = (player_id = any (v_ids))
  where fantasy_team_id = p_fantasy_team_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 6. CLASSIFICA: formazioni congelate + ricalcolo a cascata
-- -----------------------------------------------------------------------------

-- Ricalcola UNA giornata. Per le giornate congelate usa matchday_lineups,
-- per quelle non ancora iniziate usa i titolari attuali.
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

  with lineups as (
    select ml.matchday_id, ml.fantasy_team_id, ml.player_id
    from public.matchday_lineups ml
    join public.matchdays m on m.id = ml.matchday_id
    where m.lineups_locked_at is not null and m.number <= v_matchday_number
    union all
    select m.id, ftp.fantasy_team_id, ftp.player_id
    from public.matchdays m
    join public.fantasy_team_players ftp on ftp.is_starter
    where m.lineups_locked_at is null and m.number <= v_matchday_number
  ),
  points_per_team_matchday as (
    select
      ft.id as fantasy_team_id,
      m.id as matchday_id,
      m.number as matchday_number,
      coalesce((
        select sum(ps.points)
        from lineups l
        join public.player_scores ps
          on ps.player_id = l.player_id and ps.matchday_id = l.matchday_id
        where l.fantasy_team_id = ft.id and l.matchday_id = m.id
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
  ranked as (
    select *, rank() over (order by points_total desc) as position
    from cumulative
    where matchday_number = v_matchday_number
  ),
  prev_ranked as (
    select r.fantasy_team_id, r.position as previous_position
    from public.rankings r
    join public.matchdays m on m.id = r.matchday_id
    where m.number = (
      select max(number) from public.matchdays where number < v_matchday_number
    )
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
end;
$$;

-- Ricalcola la giornata indicata e tutte le successive già presenti in classifica,
-- poi allinea la cache total_points delle squadre all'ultima giornata calcolata.
create or replace function public.recalc_rankings_from(p_matchday_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number integer;
  v_md record;
begin
  select number into v_number from public.matchdays where id = p_matchday_id;
  if v_number is null then
    raise exception 'Giornata non trovata';
  end if;

  for v_md in
    select m.id from public.matchdays m
    where m.number >= v_number
      and (m.id = p_matchday_id or exists (select 1 from public.rankings r where r.matchday_id = m.id))
    order by m.number
  loop
    perform public.recalc_rankings(v_md.id);
  end loop;

  update public.fantasy_teams ft
  set total_points = cr.points_total
  from public.current_rankings cr
  where cr.fantasy_team_id = ft.id and ft.total_points is distinct from cr.points_total;
end;
$$;

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
  -- Se un evento viene spostato su un'altra giornata/giocatore, ricalcola anche la vecchia.
  if tg_op = 'UPDATE' and (old.matchday_id, old.player_id) is distinct from (new.matchday_id, new.player_id) then
    perform public.recalc_player_score(old.matchday_id, old.player_id);
    perform public.recalc_rankings_from(
      (select id from public.matchdays where id in (old.matchday_id, new.matchday_id) order by number limit 1)
    );
  else
    perform public.recalc_rankings_from(v_matchday_id);
  end if;

  return coalesce(new, old);
end;
$$;

-- -----------------------------------------------------------------------------
-- 7. PERMESSI SULLE FUNZIONI
-- -----------------------------------------------------------------------------
alter function public.set_updated_at() set search_path = public;

-- Funzioni interne: eseguibili solo dal database (trigger) e dal service role.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.log_admin_action() from public, anon, authenticated;
revoke execute on function public.log_settings_change() from public, anon, authenticated;
revoke execute on function public.trg_player_score_events_changed() from public, anon, authenticated;
revoke execute on function public.trg_matchday_lineups() from public, anon, authenticated;
revoke execute on function public.trg_sync_team_lock() from public, anon, authenticated;
revoke execute on function public.recalc_player_score(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.recalc_rankings(uuid) from public, anon, authenticated;
revoke execute on function public.recalc_rankings_from(uuid) from public, anon, authenticated;

-- Funzioni di gioco: solo utenti autenticati (i controlli di proprietà sono interni).
revoke execute on function public.create_team(text) from public, anon;
revoke execute on function public.purchase_player(uuid, uuid) from public, anon;
revoke execute on function public.sell_player(uuid, uuid) from public, anon;
revoke execute on function public.set_starters(uuid, uuid[]) from public, anon;
grant execute on function public.create_team(text) to authenticated;
grant execute on function public.purchase_player(uuid, uuid) to authenticated;
grant execute on function public.sell_player(uuid, uuid) to authenticated;
grant execute on function public.set_starters(uuid, uuid[]) to authenticated;

-- TRUNCATE non è soggetto a RLS: nessun ruolo esposto via API deve averlo.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
