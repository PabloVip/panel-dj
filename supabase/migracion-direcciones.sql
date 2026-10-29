-- =====================================================================
-- Migración: direcciones para navegar
--
-- Cada sala guarda su dirección y cada bolo puede sobrescribirla si esa
-- noche tocas en otro sitio del mismo pueblo. Con eso, el calendario del
-- móvil lleva una dirección de verdad y el coche puede trazar la ruta.
-- =====================================================================

alter table public.salas
  add column if not exists direccion text;

alter table public.bolos
  add column if not exists direccion text;

-- ---------------------------------------------------------------------
-- El calendario pasa a llevar la dirección resuelta: la del bolo si la
-- tiene, si no la de su sala, y en último caso el nombre de la ubicación.
-- ---------------------------------------------------------------------
drop function if exists public.bolos_del_calendario(text);

create or replace function public.bolos_del_calendario(p_token text)
returns table (
  nombre text,
  ubicacion text,
  direccion text,
  fecha date,
  hora_inicio time,
  hora_fin time,
  precio numeric,
  estado text,
  notas text,
  telefono text,
  id uuid
)
language sql
security definer
set search_path = public
as $$
  select
    b.nombre,
    b.ubicacion,
    coalesce(nullif(btrim(b.direccion), ''), nullif(btrim(s.direccion), ''), b.ubicacion),
    b.fecha,
    b.hora_inicio,
    b.hora_fin,
    b.precio,
    b.estado,
    b.notas,
    s.telefono,
    b.id
  from public.bolos b
  join public.ajustes a on a.usuario_id = b.usuario_id
  left join public.salas s
    on s.usuario_id = b.usuario_id
   and lower(s.nombre) = lower(b.ubicacion)
  where a.token_calendario = p_token
    and length(p_token) >= 24
    and b.estado <> 'cancelado'
  order by b.fecha;
$$;

grant execute on function public.bolos_del_calendario(text) to anon, authenticated;

-- Comprobación
select count(*) as salas_sin_direccion from public.salas where direccion is null;
