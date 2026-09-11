-- =====================================================================
-- Migración: verificación en dos pasos exigida por la base de datos
--
-- No basta con pedir el código en la pantalla de acceso: si alguien se
-- saltara la interfaz y hablara directamente con la base de datos con tu
-- contraseña robada, seguiría viendo tus datos. Estas políticas hacen que
-- la propia base de datos se niegue a devolver nada si la sesión no ha
-- pasado el segundo paso.
--
-- Son políticas "restrictive": se suman a las que ya hay, no las
-- sustituyen. Y están escritas para NO dejarte fuera: mientras no tengas
-- configurada la verificación, la sesión normal sigue funcionando; en
-- cuanto la configures, pasa a ser obligatoria.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Bolos
-- ---------------------------------------------------------------------
drop policy if exists "Exigir verificacion en dos pasos" on public.bolos;
create policy "Exigir verificacion en dos pasos"
  on public.bolos
  as restrictive
  to authenticated
  using (
    array[(select auth.jwt() ->> 'aal')] <@ (
      select
        case
          when count(id) > 0 then array['aal2']
          else array['aal1', 'aal2']
        end
      from auth.mfa_factors
      where user_id = auth.uid() and status = 'verified'
    )
  );

-- ---------------------------------------------------------------------
-- Salas
-- ---------------------------------------------------------------------
drop policy if exists "Exigir verificacion en dos pasos" on public.salas;
create policy "Exigir verificacion en dos pasos"
  on public.salas
  as restrictive
  to authenticated
  using (
    array[(select auth.jwt() ->> 'aal')] <@ (
      select
        case
          when count(id) > 0 then array['aal2']
          else array['aal1', 'aal2']
        end
      from auth.mfa_factors
      where user_id = auth.uid() and status = 'verified'
    )
  );

-- ---------------------------------------------------------------------
-- Ajustes (la clave del calendario)
-- ---------------------------------------------------------------------
drop policy if exists "Exigir verificacion en dos pasos" on public.ajustes;
create policy "Exigir verificacion en dos pasos"
  on public.ajustes
  as restrictive
  to authenticated
  using (
    array[(select auth.jwt() ->> 'aal')] <@ (
      select
        case
          when count(id) > 0 then array['aal2']
          else array['aal1', 'aal2']
        end
      from auth.mfa_factors
      where user_id = auth.uid() and status = 'verified'
    )
  );

-- ---------------------------------------------------------------------
-- El calendario del móvil NO se ve afectado: su función se ejecuta con
-- permisos propios y su credencial es la clave secreta del enlace, no tu
-- sesión. El iPhone no puede hacer el segundo paso, así que esto es lo
-- que hay que querer.
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- Comprobaciones
-- ---------------------------------------------------------------------

-- 1) Las tres tablas tienen que tener la seguridad de filas ACTIVADA.
--    Si alguna sale en "false", las políticas no sirven de nada: ejecuta
--    entonces  alter table public.<tabla> enable row level security;
select
  relname as tabla,
  relrowsecurity as seguridad_activada
from pg_class
where relname in ('bolos', 'salas', 'ajustes');

-- 2) Qué factores de verificación tienes configurados ahora mismo
select
  count(*) filter (where status = 'verified') as factores_activos,
  count(*) as factores_totales
from auth.mfa_factors;
