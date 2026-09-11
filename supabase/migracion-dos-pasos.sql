-- =====================================================================
-- Migración: verificación en dos pasos exigida por la base de datos
--
-- No basta con pedir el código en la pantalla de acceso: si alguien se
-- saltara la interfaz y hablara directamente con la base de datos con tu
-- contraseña robada, seguiría viendo tus datos. Estas políticas hacen que
-- la propia base de datos se niegue a devolver nada si la sesión no ha
-- pasado el segundo paso.
--
-- Se puede ejecutar las veces que haga falta: borra y recrea lo suyo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Una función que responde a una sola pregunta: ¿este usuario tiene
--    la verificación en dos pasos configurada?
--
--    Va aparte a propósito. La lista de factores vive en el esquema
--    interno de Supabase, al que tu usuario no tiene (ni debe tener)
--    acceso. Esta función se ejecuta con permisos elevados pero solo
--    mira TUS factores y solo devuelve un sí o un no.
-- ---------------------------------------------------------------------
create or replace function public.tiene_verificacion_en_dos_pasos()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from auth.mfa_factors
    where user_id = auth.uid()
      and status = 'verified'
  );
$$;

revoke all on function public.tiene_verificacion_en_dos_pasos() from public;
grant execute on function public.tiene_verificacion_en_dos_pasos() to authenticated;

-- ---------------------------------------------------------------------
-- 2. Las políticas
--
--    La condición se lee así: "pasa si NO tienes la verificación puesta
--    (para no dejarte fuera antes de configurarla), o si la tienes y esta
--    sesión ya ha metido el código".
--
--    Son "restrictive": se suman a las que ya hay, no las sustituyen.
-- ---------------------------------------------------------------------

drop policy if exists "Exigir verificacion en dos pasos" on public.bolos;
create policy "Exigir verificacion en dos pasos"
  on public.bolos
  as restrictive
  to authenticated
  using (
    public.tiene_verificacion_en_dos_pasos() = false
    or (select auth.jwt() ->> 'aal') = 'aal2'
  );

drop policy if exists "Exigir verificacion en dos pasos" on public.salas;
create policy "Exigir verificacion en dos pasos"
  on public.salas
  as restrictive
  to authenticated
  using (
    public.tiene_verificacion_en_dos_pasos() = false
    or (select auth.jwt() ->> 'aal') = 'aal2'
  );

drop policy if exists "Exigir verificacion en dos pasos" on public.ajustes;
create policy "Exigir verificacion en dos pasos"
  on public.ajustes
  as restrictive
  to authenticated
  using (
    public.tiene_verificacion_en_dos_pasos() = false
    or (select auth.jwt() ->> 'aal') = 'aal2'
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

-- 1) La función responde sin error (false si aún no la has activado)
select public.tiene_verificacion_en_dos_pasos() as tengo_dos_pasos;

-- 2) Las tres tablas tienen que tener la seguridad de filas ACTIVADA.
--    Si alguna sale en "false", las políticas no sirven de nada: ejecuta
--    entonces  alter table public.<tabla> enable row level security;
select
  relname as tabla,
  relrowsecurity as seguridad_activada
from pg_class
where relname in ('bolos', 'salas', 'ajustes');

-- =====================================================================
-- PARA DESHACERLO TODO, si algo va mal y quieres volver atrás:
--
--   drop policy if exists "Exigir verificacion en dos pasos" on public.bolos;
--   drop policy if exists "Exigir verificacion en dos pasos" on public.salas;
--   drop policy if exists "Exigir verificacion en dos pasos" on public.ajustes;
-- =====================================================================
