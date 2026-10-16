-- =============================================================================
-- FANTA SOUTHJAM — Migration 0006: Hall of Fame + Chat globale
-- =============================================================================
-- Applicare DOPO tutte le migration precedenti (0001 → 0005). Segue le stesse
-- regole di hardening della 0004: funzioni interne non invocabili via API,
-- nessun TRUNCATE/TRIGGER/REFERENCES per i ruoli esposti.

-- -----------------------------------------------------------------------------
-- 1. HALL OF FAME
-- -----------------------------------------------------------------------------
-- I dati sono salvati come "fotografia" (testo + punti), non come riferimenti
-- a squadre/giocatori: così l'albo d'oro resta intatto anche quando l'anno
-- dopo squadre e giocatori vengono cancellati o reinseriti da zero.
create table public.hall_of_fame (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique check (year between 2000 and 2100),
  winner_team_name text not null,
  winner_coach text,
  winner_points integer,
  top_player_name text not null,
  top_player_team text,
  top_player_points integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.hall_of_fame is
  'Albo d''oro: vincitore del fantabasket e giocatore con più fantapunti di ogni edizione.';

create trigger set_updated_at before update on public.hall_of_fame
  for each row execute function public.set_updated_at();

alter table public.hall_of_fame enable row level security;
create policy "hof_select_all" on public.hall_of_fame for select using (true);
create policy "hof_insert_admin" on public.hall_of_fame for insert with check (public.is_admin());
create policy "hof_update_admin" on public.hall_of_fame for update using (public.is_admin());
create policy "hof_delete_admin" on public.hall_of_fame for delete using (public.is_admin());

-- Archivia la stagione in corso con un click dal pannello admin: prende la
-- squadra prima in classifica e il giocatore con più fantapunti. In caso di
-- pari merito salva tutti i nomi separati da " / ". Se l'anno esiste già,
-- lo sovrascrive (utile se l'admin archivia prima di un'ultima correzione).
create or replace function public.archive_season(p_year integer)
returns public.hall_of_fame
language plpgsql
security definer
set search_path = public
as $$
declare
  v_winner_names text;
  v_winner_coaches text;
  v_winner_points integer;
  v_player_names text;
  v_player_teams text;
  v_player_points integer;
  v_row public.hall_of_fame;
begin
  if not public.is_admin() then
    raise exception 'Solo un amministratore può archiviare la stagione';
  end if;

  select max(total_points) into v_winner_points from public.fantasy_teams;
  if v_winner_points is null then
    raise exception 'Nessuna squadra iscritta: niente da archiviare';
  end if;

  select
    string_agg(ft.team_name, ' / ' order by ft.team_name),
    string_agg(p.username, ' / ' order by ft.team_name)
  into v_winner_names, v_winner_coaches
  from public.fantasy_teams ft
  join public.profiles p on p.id = ft.user_id
  where ft.total_points = v_winner_points;

  select max(total_points) into v_player_points from public.players;
  if v_player_points is null then
    raise exception 'Nessun giocatore inserito: niente da archiviare';
  end if;

  select
    string_agg(full_name, ' / ' order by full_name),
    string_agg(distinct real_team, ' / ')
  into v_player_names, v_player_teams
  from public.players
  where total_points = v_player_points;

  insert into public.hall_of_fame (
    year, winner_team_name, winner_coach, winner_points,
    top_player_name, top_player_team, top_player_points
  )
  values (
    p_year, v_winner_names, v_winner_coaches, v_winner_points,
    v_player_names, v_player_teams, v_player_points
  )
  on conflict (year) do update set
    winner_team_name = excluded.winner_team_name,
    winner_coach = excluded.winner_coach,
    winner_points = excluded.winner_points,
    top_player_name = excluded.top_player_name,
    top_player_team = excluded.top_player_team,
    top_player_points = excluded.top_player_points
  returning * into v_row;

  return v_row;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. CHAT GLOBALE
-- -----------------------------------------------------------------------------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 500),
  created_at timestamptz not null default now()
);
comment on table public.chat_messages is
  'Chat globale unica, riservata a chi ha creato una squadra (più gli admin).';
create index chat_messages_created_idx on public.chat_messages (created_at desc);

-- true se l'utente corrente ha una squadra o è admin: è la "chiave" della chat.
create or replace function public.can_use_chat()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_admin()
      or exists (select 1 from public.fantasy_teams where user_id = auth.uid());
$$;

alter table public.chat_messages enable row level security;

-- Leggono la chat solo i partecipanti (chi ha una squadra) e gli admin.
create policy "chat_select_participants" on public.chat_messages
  for select using (public.can_use_chat());

-- Si scrive solo a proprio nome e solo se si ha una squadra.
create policy "chat_insert_own" on public.chat_messages
  for insert with check (auth.uid() = user_id and public.can_use_chat());

-- Ognuno può cancellare i propri messaggi; l'admin può cancellare tutto (moderazione).
create policy "chat_delete_own_or_admin" on public.chat_messages
  for delete using (auth.uid() = user_id or public.is_admin());

-- Anti-spam lato database: massimo 5 messaggi ogni 10 secondi per utente.
-- Vive nel DB, quindi non è aggirabile scrivendo direttamente dalle API.
create or replace function public.chat_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*) from public.chat_messages
    where user_id = new.user_id and created_at > now() - interval '10 seconds'
  ) >= 5 then
    raise exception 'Stai scrivendo troppo velocemente, aspetta qualche secondo';
  end if;
  new.content := btrim(new.content);
  return new;
end;
$$;

create trigger chat_rate_limit
  before insert on public.chat_messages
  for each row execute function public.chat_rate_limit();

-- Realtime: i nuovi messaggi arrivano a tutti senza ricaricare la pagina.
alter publication supabase_realtime add table public.chat_messages;

-- -----------------------------------------------------------------------------
-- 3. PERMESSI (stesse regole della 0004)
-- -----------------------------------------------------------------------------
-- Hall of Fame: scrittura solo per admin (RLS) e mai per anon.
revoke insert, update, delete on public.hall_of_fame from anon;

-- Chat: i messaggi non si modificano, si scrivono/cancellano solo da loggati.
revoke update on public.chat_messages from anon, authenticated;
revoke insert, delete on public.chat_messages from anon;

revoke truncate, trigger, references on public.hall_of_fame, public.chat_messages from anon, authenticated;

-- Funzione interna (trigger): eseguibile solo dal database.
revoke execute on function public.chat_rate_limit() from public, anon, authenticated;

-- Archiviazione: solo utenti autenticati (il controllo admin è interno).
revoke execute on function public.archive_season(integer) from public, anon;
grant execute on function public.archive_season(integer) to authenticated;

-- can_use_chat è usata dalle policy RLS: deve restare eseguibile da chi
-- interroga la tabella (per anon restituisce semplicemente false).
grant execute on function public.can_use_chat() to anon, authenticated;
