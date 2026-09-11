-- =====================================================================
-- Parabarap, temporada 2025-2026
--
-- Todos los viernes del 2025-09-01 al 2026-06-30 en los que no había
-- ningún bolo apuntado: 41 fechas, 3880 € en total.
--   - Septiembre, octubre y noviembre de 2025: 80 € por noche.
--   - De diciembre de 2025 a junio de 2026: 100 € por noche.
--   - Sin comisión de manager, como el resto de los Parabarap.
--   - Horario 00:00 a 04:00, que es el habitual en tu agenda.
--
-- IMPORTANTE: ejecútalo DESPUÉS de importar-agenda.sql.
-- La consulta comprueba fecha a fecha que no exista ya un bolo ese día,
-- así que se puede lanzar dos veces sin duplicar nada.
--
-- Se saltan estos viernes porque ya tenías bolo: 2025-09-12, 2025-10-10
-- =====================================================================

with usuario as (
  select id from auth.users order by created_at limit 1
),
noches (fecha, precio, cobrado) as (
  values
  ('2025-09-05'::date, 80::numeric, true),
  ('2025-09-19'::date, 80::numeric, true),
  ('2025-09-26'::date, 80::numeric, true),
  ('2025-10-03'::date, 80::numeric, true),
  ('2025-10-17'::date, 80::numeric, true),
  ('2025-10-24'::date, 80::numeric, true),
  ('2025-10-31'::date, 80::numeric, true),
  ('2025-11-07'::date, 80::numeric, true),
  ('2025-11-14'::date, 80::numeric, true),
  ('2025-11-21'::date, 80::numeric, true),
  ('2025-11-28'::date, 80::numeric, true),
  ('2025-12-05'::date, 100::numeric, true),
  ('2025-12-12'::date, 100::numeric, true),
  ('2025-12-19'::date, 100::numeric, true),
  ('2025-12-26'::date, 100::numeric, true),
  ('2026-01-02'::date, 100::numeric, true),
  ('2026-01-09'::date, 100::numeric, true),
  ('2026-01-16'::date, 100::numeric, true),
  ('2026-01-23'::date, 100::numeric, true),
  ('2026-01-30'::date, 100::numeric, true),
  ('2026-02-06'::date, 100::numeric, true),
  ('2026-02-13'::date, 100::numeric, true),
  ('2026-02-20'::date, 100::numeric, true),
  ('2026-02-27'::date, 100::numeric, true),
  ('2026-03-06'::date, 100::numeric, true),
  ('2026-03-13'::date, 100::numeric, true),
  ('2026-03-20'::date, 100::numeric, true),
  ('2026-03-27'::date, 100::numeric, true),
  ('2026-04-03'::date, 100::numeric, true),
  ('2026-04-10'::date, 100::numeric, true),
  ('2026-04-17'::date, 100::numeric, true),
  ('2026-04-24'::date, 100::numeric, true),
  ('2026-05-01'::date, 100::numeric, true),
  ('2026-05-08'::date, 100::numeric, true),
  ('2026-05-15'::date, 100::numeric, true),
  ('2026-05-22'::date, 100::numeric, true),
  ('2026-05-29'::date, 100::numeric, true),
  ('2026-06-05'::date, 100::numeric, true),
  ('2026-06-12'::date, 100::numeric, true),
  ('2026-06-19'::date, 100::numeric, true),
  ('2026-06-26'::date, 100::numeric, true)
)
insert into public.bolos (
  usuario_id, nombre, ubicacion, fecha, hora_inicio, hora_fin,
  precio, comision_porcentaje, estado, cobrado, fecha_cobro, notas
)
select
  usuario.id,
  'PARABARAP',
  'MURCIA',
  noches.fecha,
  '00:00'::time,
  '04:00'::time,
  noches.precio,
  0,
  'confirmado',
  noches.cobrado,
  case when noches.cobrado then noches.fecha else null end,
  'Sesión semanal de la temporada 2025-2026'
from noches cross join usuario
where not exists (
  select 1 from public.bolos existente
  where existente.usuario_id = usuario.id
    and existente.fecha = noches.fecha
);

-- Comprobación: cuántas noches de Parabarap hay por temporada
select
  count(*) as noches,
  min(fecha) as primera,
  max(fecha) as ultima,
  sum(precio) as total
from public.bolos
where nombre = 'PARABARAP' and fecha >= '2025-09-01' and fecha <= '2026-06-30';

-- =====================================================================
-- PARA DESHACER solo estas noches:
--
--   delete from public.bolos
--   where nombre = 'PARABARAP'
--     and fecha between '2025-09-01' and '2026-06-30';
-- =====================================================================
