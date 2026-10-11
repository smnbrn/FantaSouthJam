-- =============================================================================
-- FANTA3V3 AMANTEA — Migration 0003: audit log automatico per il pannello admin
-- =============================================================================
-- Applicare DOPO 0001_init.sql e 0002_rankings_view_and_realtime.sql.
--
-- Invece di far scrivere ad ogni singola azione del pannello admin una riga di
-- log a mano (facile da dimenticare in futuro), un trigger generico registra
-- automaticamente ogni insert/update/delete sulle tabelle che l'admin gestisce.
-- Poiché tutte queste tabelle hanno già RLS che riserva le scritture agli
-- admin, qualunque riga arrivi qui è per costruzione un'azione amministrativa.

create or replace function public.log_admin_action()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity_id uuid;
begin
  v_entity_id := case
    when tg_op = 'DELETE' then nullif(to_jsonb(old) ->> 'id', '')::uuid
    else nullif(to_jsonb(new) ->> 'id', '')::uuid
  end;

  insert into public.admin_logs (admin_id, action, entity_type, entity_id, details)
  values (
    auth.uid(),
    lower(tg_op) || '_' || tg_table_name,
    tg_table_name,
    v_entity_id,
    case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end
  );

  return coalesce(new, old);
end;
$$;

create trigger log_players_changes
  after insert or update or delete on public.players
  for each row execute function public.log_admin_action();

create trigger log_bonus_types_changes
  after insert or update or delete on public.bonus_types
  for each row execute function public.log_admin_action();

create trigger log_matchdays_changes
  after update on public.matchdays
  for each row execute function public.log_admin_action();

create trigger log_player_score_events_changes
  after insert or delete on public.player_score_events
  for each row execute function public.log_admin_action();

-- settings non ha una colonna "id" (chiave primaria = key): loggata a parte,
-- con la chiave salvata dentro "details" invece che in "entity_id".
create or replace function public.log_settings_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_logs (admin_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'update_settings', 'settings', null, to_jsonb(new));
  return new;
end;
$$;

create trigger log_settings_changes
  after insert or update on public.settings
  for each row execute function public.log_settings_change();
