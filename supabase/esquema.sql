-- =====================================================================
-- Esquema de la base de datos del gestor de bolos
-- Pega este fichero entero en Supabase > SQL Editor y pulsa "Run".
-- =====================================================================

-- Tabla principal: cada fila es un bolo del DJ
create table if not exists public.bolos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null,
  ubicacion text,
  fecha date not null,
  hora_inicio time,
  hora_fin time,
  precio numeric(10, 2) not null default 0,
  -- Porcentaje que se lleva el manager en ese bolo (0 = sin comisión)
  comision_porcentaje numeric(5, 2) not null default 0,
  estado text not null default 'pendiente',
  cobrado boolean not null default false,
  fecha_cobro date,
  notas text,
  creado_en timestamptz not null default now()
);

-- La comisión tiene que estar entre 0 y 100
alter table public.bolos drop constraint if exists bolos_comision_valida;
alter table public.bolos
  add constraint bolos_comision_valida
  check (comision_porcentaje >= 0 and comision_porcentaje <= 100);

-- Solo se admiten estos tres estados
alter table public.bolos drop constraint if exists bolos_estado_valido;
alter table public.bolos
  add constraint bolos_estado_valido
  check (estado in ('pendiente', 'confirmado', 'cancelado'));

-- Índice para que las consultas por mes sean rápidas
create index if not exists bolos_usuario_fecha_idx
  on public.bolos (usuario_id, fecha);

-- Índice para buscar rápido lo que está sin cobrar
create index if not exists bolos_sin_cobrar_idx
  on public.bolos (usuario_id, cobrado, fecha);

-- =====================================================================
-- Seguridad a nivel de fila (RLS)
-- Sin esto cualquier usuario registrado podría leer los bolos de otro.
-- =====================================================================

alter table public.bolos enable row level security;

drop policy if exists "El usuario ve sus bolos" on public.bolos;
create policy "El usuario ve sus bolos"
  on public.bolos for select
  using (auth.uid() = usuario_id);

drop policy if exists "El usuario crea sus bolos" on public.bolos;
create policy "El usuario crea sus bolos"
  on public.bolos for insert
  with check (auth.uid() = usuario_id);

drop policy if exists "El usuario edita sus bolos" on public.bolos;
create policy "El usuario edita sus bolos"
  on public.bolos for update
  using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "El usuario borra sus bolos" on public.bolos;
create policy "El usuario borra sus bolos"
  on public.bolos for delete
  using (auth.uid() = usuario_id);
