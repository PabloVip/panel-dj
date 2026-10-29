-- =====================================================================
-- Migración: pagos al manager
--
-- Añade una fecha por bolo: el día en que le pagaste al manager la
-- comisión de ESE bolo. Si está vacía, esa comisión sigue debiéndose.
--
-- Se guarda bolo a bolo (y no un apunte por mes) para que la cuenta
-- siga cuadrando si más adelante añades un bolo a un mes que ya habías
-- liquidado: ese bolo nuevo aparecerá como pendiente él solo.
--
-- Se puede ejecutar las veces que haga falta.
-- =====================================================================

alter table public.bolos
  add column if not exists comision_pagada_el date;

comment on column public.bolos.comision_pagada_el is
  'Día en que se le pagó al manager la comisión de este bolo. Nulo = pendiente.';

-- Para que la pantalla del manager filtre rápido lo que queda por pagar
create index if not exists bolos_comision_pendiente_idx
  on public.bolos (usuario_id, comision_pagada_el);

-- ---------------------------------------------------------------------
-- OPCIONAL: dar por pagado todo lo viejo
--
-- Tienes bolos con comisión desde 2023 y al manager ya le pagaste lo de
-- entonces, así que la pantalla te diría que le debes una fortuna. Quita
-- las dos barras de la línea de abajo y ajusta la fecha para dejar
-- saldado todo lo anterior a ella. Lo que venga después lo irás ticando
-- tú desde la aplicación.
--
-- La fecha de pago que se apunta es el último día de ese mes, que es lo
-- más parecido a la realidad sin inventarse días concretos.
-- ---------------------------------------------------------------------

-- update public.bolos
--    set comision_pagada_el = (date_trunc('month', fecha) + interval '1 month - 1 day')::date
--  where comision_porcentaje > 0
--    and estado <> 'cancelado'
--    and comision_pagada_el is null
--    and fecha < '2026-09-01';

-- ---------------------------------------------------------------------
-- Comprobaciones
-- ---------------------------------------------------------------------

-- 1) La columna existe
select column_name, data_type
from information_schema.columns
where table_name = 'bolos' and column_name = 'comision_pagada_el';

-- 2) Cuánto se le debe al manager, mes a mes
select
  to_char(fecha, 'YYYY-MM') as mes,
  count(*) as bolos,
  round(sum(precio * comision_porcentaje / 100), 2) as comision,
  round(sum(case when comision_pagada_el is null
                 then precio * comision_porcentaje / 100
                 else 0 end), 2) as pendiente
from public.bolos
where comision_porcentaje > 0
  and estado <> 'cancelado'
group by 1
order by 1 desc;
