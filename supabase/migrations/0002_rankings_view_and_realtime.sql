-- =============================================================================
-- FANTA3V3 AMANTEA — Migration 0002: classifica corrente + Realtime
-- =============================================================================
-- Applicare DOPO 0001_init.sql, con lo stesso metodo (SQL Editor o supabase db push).

-- -----------------------------------------------------------------------------
-- 1. Campo libero per il recap testuale della giornata (es. "Finale 21-18 per...")
-- -----------------------------------------------------------------------------
alter table public.matchdays add column if not exists results_summary text;

-- -----------------------------------------------------------------------------
-- 2. Vista "classifica corrente": l'ultima riga di rankings per ogni squadra.
--    security_invoker fa sì che la vista rispetti le RLS di rankings/matchdays
--    in base a chi la interroga, invece che ai permessi di chi l'ha creata.
-- -----------------------------------------------------------------------------
create or replace view public.current_rankings
with (security_invoker = true) as
select distinct on (r.fantasy_team_id)
  r.fantasy_team_id,
  r.matchday_id,
  m.number as matchday_number,
  r.points_matchday,
  r.points_total,
  r.position,
  r.previous_position,
  r.created_at
from public.rankings r
join public.matchdays m on m.id = r.matchday_id
order by r.fantasy_team_id, m.number desc;

comment on view public.current_rankings is
  'Ultima riga di classifica calcolata per ogni squadra (la classifica "attuale"). Sola lettura.';

-- Concessione esplicita, per sicurezza in ambienti dove i privilegi di default
-- sullo schema public non coprissero automaticamente le nuove viste.
grant select on public.current_rankings to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Realtime: le nuove tabelle NON entrano automaticamente nella pubblicazione
--    usata da Supabase Realtime, vanno aggiunte esplicitamente.
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.rankings;
