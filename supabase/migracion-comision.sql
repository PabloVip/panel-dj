-- =====================================================================
-- Migración: comisión de manager
-- Ejecuta este fichero en Supabase > SQL Editor.
-- Añade el porcentaje que se lleva el manager en los bolos que lo tengan.
-- Un 0 significa que ese bolo no paga comisión.
-- =====================================================================

alter table public.bolos
  add column if not exists comision_porcentaje numeric(5, 2) not null default 0;

-- El porcentaje tiene que estar entre 0 y 100
alter table public.bolos drop constraint if exists bolos_comision_valida;
alter table public.bolos
  add constraint bolos_comision_valida
  check (comision_porcentaje >= 0 and comision_porcentaje <= 100);
