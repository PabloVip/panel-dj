-- =====================================================================
-- Migración: control de cobros
-- Ejecuta este fichero en Supabase > SQL Editor si ya creaste la tabla
-- "bolos" con el esquema anterior. Si empiezas de cero, esquema.sql ya
-- incluye estos cambios y no hace falta ejecutar esto.
-- =====================================================================

-- Fecha en la que se cobró el bolo (queda vacía mientras esté pendiente)
alter table public.bolos
  add column if not exists fecha_cobro date;

-- Índice para buscar rápido lo que está sin cobrar
create index if not exists bolos_sin_cobrar_idx
  on public.bolos (usuario_id, cobrado, fecha);
