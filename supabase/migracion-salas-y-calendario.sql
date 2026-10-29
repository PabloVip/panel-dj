-- =====================================================================
-- Migración: salas y contactos + calendario suscribible
-- Ejecuta este fichero en Supabase > SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Salas: el fichero de sitios donde tocas, con su contacto y su caché
-- ---------------------------------------------------------------------
create table if not exists public.salas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- El nombre coincide con la "ubicación" de los bolos: así se cruzan
  nombre text not null,
  contacto text,
  telefono text,
  cache_habitual numeric(10, 2) not null default 0,
  comision_porcentaje numeric(5, 2) not null default 0,
  notas text,
  creado_en timestamptz not null default now()
);

-- No tiene sentido tener dos veces la misma sala
create unique index if not exists salas_usuario_nombre_idx
  on public.salas (usuario_id, lower(nombre));

alter table public.salas enable row level security;

drop policy if exists "El usuario ve sus salas" on public.salas;
create policy "El usuario ve sus salas"
  on public.salas for select using (auth.uid() = usuario_id);

drop policy if exists "El usuario crea sus salas" on public.salas;
create policy "El usuario crea sus salas"
  on public.salas for insert with check (auth.uid() = usuario_id);

drop policy if exists "El usuario edita sus salas" on public.salas;
create policy "El usuario edita sus salas"
  on public.salas for update using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

drop policy if exists "El usuario borra sus salas" on public.salas;
create policy "El usuario borra sus salas"
  on public.salas for delete using (auth.uid() = usuario_id);

-- ---------------------------------------------------------------------
-- 2. Ajustes: guarda la clave secreta del calendario del móvil
-- ---------------------------------------------------------------------
create table if not exists public.ajustes (
  usuario_id uuid primary key references auth.users (id) on delete cascade,
  -- Clave larga y aleatoria. Se construye con dos identificadores únicos
  -- para no depender de extensiones que quizá no estén instaladas.
  token_calendario text not null unique default (
    replace(gen_random_uuid()::text, '-', '') ||
    replace(gen_random_uuid()::text, '-', '')
  ),
  creado_en timestamptz not null default now()
);

alter table public.ajustes enable row level security;

drop policy if exists "El usuario ve sus ajustes" on public.ajustes;
create policy "El usuario ve sus ajustes"
  on public.ajustes for select using (auth.uid() = usuario_id);

drop policy if exists "El usuario crea sus ajustes" on public.ajustes;
create policy "El usuario crea sus ajustes"
  on public.ajustes for insert with check (auth.uid() = usuario_id);

drop policy if exists "El usuario edita sus ajustes" on public.ajustes;
create policy "El usuario edita sus ajustes"
  on public.ajustes for update using (auth.uid() = usuario_id)
  with check (auth.uid() = usuario_id);

-- Crea la fila de ajustes de los usuarios que ya existen
insert into public.ajustes (usuario_id)
select id from auth.users
on conflict (usuario_id) do nothing;

-- ---------------------------------------------------------------------
-- 3. Función que sirve el calendario
--
-- El iPhone pide el calendario sin estar identificado, así que la única
-- credencial es la clave secreta del enlace. Esta función se ejecuta con
-- permisos elevados (security definer) pero SOLO devuelve los bolos del
-- usuario dueño de esa clave: sin clave válida, no devuelve nada.
-- ---------------------------------------------------------------------
create or replace function public.bolos_del_calendario(p_token text)
returns table (
  nombre text,
  ubicacion text,
  fecha date,
  hora_inicio time,
  hora_fin time,
  precio numeric,
  estado text,
  notas text,
  id uuid
)
language sql
security definer
set search_path = public
as $$
  select b.nombre, b.ubicacion, b.fecha, b.hora_inicio, b.hora_fin,
         b.precio, b.estado, b.notas, b.id
  from public.bolos b
  join public.ajustes a on a.usuario_id = b.usuario_id
  where a.token_calendario = p_token
    and length(p_token) >= 24
    and b.estado <> 'cancelado'
  order by b.fecha;
$$;

grant execute on function public.bolos_del_calendario(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Rellena el fichero de salas con las ubicaciones que ya usas
-- ---------------------------------------------------------------------
insert into public.salas (usuario_id, nombre, cache_habitual, comision_porcentaje)
select
  b.usuario_id,
  b.ubicacion,
  round(avg(b.precio), 2),
  round(avg(b.comision_porcentaje), 0)
from public.bolos b
where b.ubicacion is not null
  and btrim(b.ubicacion) <> ''
  and b.estado <> 'cancelado'
group by b.usuario_id, b.ubicacion
on conflict do nothing;

-- Comprobación
select count(*) as salas from public.salas;
select token_calendario from public.ajustes;
