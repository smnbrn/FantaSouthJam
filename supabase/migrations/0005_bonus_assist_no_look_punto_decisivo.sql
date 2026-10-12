-- =============================================================================
-- FANTA SOUTHJAM — Migration 0005: bonus "Assist No Look" e "Punto decisivo"
-- =============================================================================
-- Idempotente: se un bonus con lo stesso codice esiste già (è il caso di
-- "Assist No Look" sul database di produzione) non viene toccato.
-- =============================================================================
insert into public.bonus_types (code, label, points, sort_order) values
  ('nolook', 'Assist No Look', 2, 7),
  ('decisivo', 'Punto decisivo', 5, 20)
on conflict (code) do nothing;
