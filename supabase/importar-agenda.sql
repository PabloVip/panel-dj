-- =====================================================================
-- Importación de la agenda "AGENDA PV_OFICIAL.xlsx"
--
-- 131 bolos, de 2023-12-22 a 2026-11-14.
--
-- CÓMO USARLO
--   1. Supabase > SQL Editor > New query.
--   2. Pega este fichero entero y pulsa Run.
--   3. Comprueba en la web que aparecen. Si algo no cuadra, al final de
--      este fichero tienes la consulta para deshacer la importación.
--
-- CRITERIOS APLICADOS
--   - Comisión de manager del 20%, salvo en los bolos de Parabarap.
--   - Los bolos con el visto bueno en la agenda entran como cobrados,
--     con la fecha del propio bolo como fecha de cobro.
--   - Todos entran como "confirmado".
--   - El horario, el contacto y los comentarios de la agenda se guardan
--     en el campo de notas.
-- =====================================================================

with usuario as (
  -- Coge tu usuario. Si algún día hay más de uno, cambia esta consulta
  -- por: select id from auth.users where email = 'tu@correo.com'
  select id from auth.users order by created_at limit 1
),
agenda (nombre, ubicacion, fecha, hora_inicio, hora_fin, precio, comision, notas, cobrado) as (
  values
  ('CUMPLEAÑOS ATHENEA', 'MANAOS BIGASTRO', '2023-12-22'::date, '23:30'::time, '03:30'::time, 60.0::numeric, 20::numeric, 'Contacto: Jonathan Manaos', true),
  ('TARDEO MANAOS', null, '2023-12-23'::date, '16:00'::time, '17:00'::time, 50.0::numeric, 20::numeric, 'Contacto: Benavente', true),
  ('ASTADO GARDENLAND', null, '2023-12-24'::date, '01:00'::time, '07:00'::time, 120.0::numeric, 20::numeric, 'Contacto: Alberto Romero', true),
  ('ASTADO GARDENLAND', null, '2023-12-29'::date, '00:00'::time, '04:00'::time, 90.0::numeric, 20::numeric, null, true),
  ('PRE NOCHEVIEJA CRISTIANA', 'CASINO ORIHUELA', '2023-12-30'::date, '00:30'::time, '02:00'::time, 75.0::numeric, 20::numeric, null, true),
  ('NOCHEVIEJA SARRACENOS CALLOSA', null, '2023-12-31'::date, '01:00'::time, '04:00'::time, 150.0::numeric, 20::numeric, 'Contacto: Félix', true),
  ('ROSCON SARRACENOS CALLOSA', null, '2024-01-05'::date, '01:00'::time, '04:00'::time, 150.0::numeric, 20::numeric, 'Contacto: Félix', true),
  ('EVENTO PRIVADO MOLINS', null, '2024-01-06'::date, '16:00'::time, '20:00'::time, 120.0::numeric, 20::numeric, 'Contacto: Pao', true),
  ('ASTADO GARDENLAND', 'EL RAAL', '2024-02-03'::date, '00:00'::time, '04:00'::time, 90.0::numeric, 20::numeric, 'Contacto: Alberto', true),
  ('EVENTO PRIVADO CUMPLEAÑOS BIGASTRO', null, '2024-02-03'::date, '16:00'::time, '19:00'::time, 150.0::numeric, 20::numeric, 'Contacto: Eli', true),
  ('ASTADO GARDENLAND', 'EL RAAL', '2024-02-10'::date, '00:00'::time, '04:00'::time, 90.0::numeric, 20::numeric, 'Contacto: Alberto', true),
  ('MOROS Y CRISTIANOS CALLOSA', null, '2024-02-23'::date, '22:00'::time, '01:00'::time, 120.0::numeric, 20::numeric, 'Contacto: 621201749 Alejandro', true),
  ('BACANAL ROJALES', null, '2024-02-29'::date, null::time, null::time, 0.0::numeric, 20::numeric, null, true),
  ('ASTADO GARDENLAND', 'EL RAAL', '2024-03-16'::date, '23:00'::time, '04:00'::time, 90.0::numeric, 20::numeric, 'Contacto: Alberto', true),
  ('ASTADO GARDENLAND', 'EL RAAL', '2024-03-23'::date, '23:00'::time, '04:00'::time, 90.0::numeric, 20::numeric, 'Contacto: Alberto', true),
  ('ASTADO GARDENLAND', 'EL RAAL', '2024-04-05'::date, '23:00'::time, '04:00'::time, 90.0::numeric, 20::numeric, 'Nota: 70€/90€ · Contacto: Alberto', true),
  ('PARABARAP', 'MURCIA', '2024-04-11'::date, '23:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('DISCO PUB NEMO', 'COX', '2024-04-13'::date, '00:00'::time, '03:30'::time, 140.0::numeric, 20::numeric, 'Contacto: Susi', true),
  ('PARABARAP', 'MURCIA', '2024-04-18'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('ASTADO GARDENLAND', 'EL RAAL', '2024-04-20'::date, '23:00'::time, '04:00'::time, 90.0::numeric, 20::numeric, 'Contacto: Alberto', true),
  ('PARABARAP', 'MURCIA', '2024-04-25'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-05-02'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-05-10'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-05-16'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('GRADUACIÓN BENEJUZAR', null, '2024-05-17'::date, '00:00'::time, '04:00'::time, 200.0::numeric, 20::numeric, 'Reserva: 50 / Pablo', true),
  ('EVENTO PRIVADO', 'FINCA PICO DEL ÁGUILA', '2024-05-18'::date, '17:00'::time, '21:00'::time, 200.0::numeric, 20::numeric, 'Reserva: 100 / Pablo', true),
  ('PARABARAP', 'MURCIA', '2024-05-24'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('DISCO PUB NEMO', 'COX', '2024-06-01'::date, '19:00'::time, '23:00'::time, 140.0::numeric, 20::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-06-06'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('BARRACA POPULAR', 'MOLINS', '2024-06-07'::date, '00:30'::time, '02:30'::time, 200.0::numeric, 20::numeric, 'Contacto: Koko', true),
  ('PARABARAP', 'MURCIA', '2024-06-14'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('EVENTO PRIVADO', 'CREVILLENTE', '2024-06-15'::date, '16:00'::time, '20:00'::time, 200.0::numeric, 20::numeric, 'Contacto: Fran Música', true),
  ('PARABARAP', 'MURCIA', '2024-06-21'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-06-28'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-07-05'::date, '00:00'::time, '04:00'::time, 50.0::numeric, 0::numeric, null, true),
  ('COMPARSA CONTRABANDISTAS', 'ORIHUELA', '2024-07-12'::date, '23:00'::time, '00:00'::time, 60.0::numeric, 20::numeric, null, true),
  ('COMPARSA MOROS ESCORPIONES', 'ALBATERA', '2024-07-13'::date, '01:00'::time, '03:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('MOROS VIEJOS', null, '2024-07-16'::date, '01:00'::time, '02:30'::time, 120.0::numeric, 20::numeric, 'Contacto: Miguel Cámara', true),
  ('COMPARSA CONTRABANDISTAS', 'ORIHUELA', '2024-07-18'::date, '02:00'::time, '04:00'::time, 120.0::numeric, 20::numeric, null, true),
  ('CARNAVAL SUMMER FEST', null, '2024-08-07'::date, null::time, null::time, 70.0::numeric, 20::numeric, null, true),
  ('CABALLEROS DEL CID', 'CALLOSA DE SEGURA', '2024-08-13'::date, '01:00'::time, '03:00'::time, 150.0::numeric, 20::numeric, 'Contacto: 693370248', true),
  ('EVENTO PRIVADO', 'BENIEL', '2024-08-24'::date, '20:00'::time, '23:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('MOROS ALMIZDRANOS', 'SAN BARTOLOMÉ', '2024-08-24'::date, '00:30'::time, '03:30'::time, 150.0::numeric, 20::numeric, 'Contacto: Félix', true),
  ('BARRACA POPULAR', 'JACARILLA', '2024-08-30'::date, '02:00'::time, '04:00'::time, 200.0::numeric, 20::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-09-05'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('BARRACA POPULAR', 'JACARILLA', '2024-09-06'::date, '01:00'::time, '04:00'::time, 200.0::numeric, 20::numeric, null, true),
  ('FIESTAS MONSERRATE', 'ORIHUELA', '2024-09-07'::date, '23:00'::time, '01:00'::time, 150.0::numeric, 20::numeric, 'Nota: Evento pagado · Contacto: 622548771 · Reserva: 150 / Pablo', true),
  ('BARRACA POPULAR', 'VIRGEN DEL CAMINO', '2024-09-13'::date, '01:00'::time, '04:00'::time, 210.0::numeric, 20::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-09-20'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-09-27'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('BARRACA POPULAR', 'LOS MONTESINOS', '2024-10-04'::date, '00:00'::time, '02:00'::time, 250.0::numeric, 20::numeric, null, true),
  ('PEÑA LA COMPETENCIA', 'LA MURADA', '2024-10-05'::date, '01:00'::time, '05:00'::time, 230.0::numeric, 20::numeric, 'Reserva: 100 / Koko', true),
  ('BARRACA POPULAR', 'LA CAMPANETA', '2024-10-11'::date, '04:00'::time, '06:00'::time, 200.0::numeric, 20::numeric, 'Contacto: 674755322', true),
  ('BARRACA POPULAR', 'LA MATANZA', '2024-10-12'::date, '02:00'::time, '05:00'::time, 200.0::numeric, 20::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-10-18'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-10-25'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-10-31'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-11-08'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-11-15'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-11-22'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-11-29'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-12-05'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-12-13'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2024-12-27'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('NOCHEVIEJA', 'PROMENADE MURCIA', '2024-12-31'::date, '00:30'::time, '03:15'::time, 250.0::numeric, 20::numeric, 'Contacto: 609305629 Miguel', true),
  ('PARABARAP', 'MURCIA', '2025-01-03'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-01-10'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-01-17'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-01-24'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-01-31'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-02-07'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-02-14'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('EVENTO PRIVADO', 'BENFERRI', '2025-02-15'::date, '17:00'::time, '19:00'::time, 120.0::numeric, 20::numeric, null, true),
  ('MOROS VIEJOS', 'CASINO ORIHUELA', '2025-02-15'::date, '22:00'::time, '01:30'::time, 280.0::numeric, 20::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-02-21'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-02-28'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-03-07'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-03-14'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-03-21'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-03-28'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('MOROS VIEJOS', null, '2025-03-29'::date, '17:30'::time, '20:00'::time, 240.0::numeric, 20::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-04-04'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-04-18'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('PARABARAP', 'MURCIA', '2025-04-24'::date, '00:00'::time, '04:00'::time, 60.0::numeric, 0::numeric, null, true),
  ('BARRACA POPULAR', 'LA MURADA', '2025-04-25'::date, '02:00'::time, '04:00'::time, 250.0::numeric, 20::numeric, null, true),
  ('BARRACA POPULAR', 'MOLINS', '2025-05-31'::date, '01:30'::time, '03:00'::time, 200.0::numeric, 20::numeric, 'Nota: Koko', true),
  ('CARROZAS ALQUERIAS', null, '2025-06-14'::date, '22:00'::time, '00:00'::time, 120.0::numeric, 20::numeric, null, true),
  ('GRADUACIÓN THAMESIS', null, '2025-06-20'::date, null::time, null::time, 120.0::numeric, 20::numeric, null, true),
  ('MOROS NAZARÍES', 'ORIHUELA', '2025-07-15'::date, null::time, null::time, 120.0::numeric, 20::numeric, null, true),
  ('MOROS VIEJOS', 'ORIHUELA', '2025-07-16'::date, '00:00'::time, '02:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('COMPARSA CONTRABANDISTAS', 'ORIHUELA', '2025-07-18'::date, '04:00'::time, '06:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('EVENTO PRIVADO', 'SANTOMERA', '2025-07-26'::date, '18:00'::time, '22:00'::time, 300.0::numeric, 20::numeric, null, true),
  ('EVENTO PRIVADO', 'CUMPLEAÑOS', '2025-08-07'::date, '22:00'::time, '02:00'::time, 280.0::numeric, 20::numeric, null, true),
  ('FIESTAS BENIEL', null, '2025-08-08'::date, '00:00'::time, '03:30'::time, 245.0::numeric, 20::numeric, null, true),
  ('COMPARSA CONTRABANDISTAS', 'REDOVÁN', '2025-09-04'::date, '00:00'::time, '04:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('FIESTAS MONSERRATE', 'ORIHUELA', '2025-09-06'::date, '00:00'::time, '02:00'::time, 200.0::numeric, 20::numeric, null, true),
  ('COMPARSA CONTRABANDISTAS', 'REDOVÁN', '2025-09-07'::date, null::time, null::time, 0.0::numeric, 20::numeric, null, true),
  ('BARRACA POPULAR', 'VIRGEN DEL CAMINO', '2025-09-12'::date, '02:30'::time, '05:00'::time, 200.0::numeric, 20::numeric, null, true),
  ('REDOVÁN', null, '2025-09-20'::date, '23:00'::time, '01:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('MHIA YECLA', null, '2025-09-27'::date, null::time, null::time, 0.0::numeric, 20::numeric, null, true),
  ('MEDIO AÑO FESTERO', 'LA MURADA', '2025-10-04'::date, '01:00'::time, '03:00'::time, 250.0::numeric, 20::numeric, null, true),
  ('BODA', 'JARDINES DE LA ALQUIBLA', '2025-10-10'::date, '04:00'::time, null::time, 300.0::numeric, 20::numeric, null, true),
  ('BARRACA POPULAR', 'LA MATANZA', '2025-10-11'::date, '01:15'::time, '03:15'::time, 200.0::numeric, 20::numeric, null, true),
  ('BARRACA POPULAR', 'LA CAMPANETA', '2025-10-11'::date, '04:00'::time, '06:00'::time, 250.0::numeric, 20::numeric, 'Nota: 674755322', true),
  ('DESAMPARADOS', null, '2025-10-18'::date, '19:00'::time, '22:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('BODA', null, '2025-12-13'::date, null::time, null::time, 0.0::numeric, 20::numeric, null, true),
  ('CUMPLEAÑOS VISI', null, '2025-12-20'::date, '17:00'::time, '19:00'::time, 100.0::numeric, 20::numeric, null, true),
  ('LeBoutique', null, '2025-12-24'::date, '02:30'::time, '05:00'::time, 200.0::numeric, 20::numeric, null, true),
  ('NOCHEVIEJA', 'LA MURADA', '2025-12-31'::date, '01:00'::time, '03:00'::time, 300.0::numeric, 20::numeric, null, true),
  ('EVENTO PRIVADO', 'LA CAMPANETA', '2026-04-04'::date, '19:00'::time, '22:30'::time, 225.0::numeric, 20::numeric, 'Reserva: 50', true),
  ('BARRACA POPULAR', 'LA MURADA', '2026-04-11'::date, '04:00'::time, '06:00'::time, 250.0::numeric, 20::numeric, null, true),
  ('EVENTO PRIVADO', 'ROJALES', '2026-04-18'::date, '21:00'::time, '23:30'::time, 112.5::numeric, 20::numeric, 'Nota: Faltan 15€', true),
  ('TARDEO', 'CAMPANETA', '2026-04-25'::date, '19:30'::time, '21:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('BARRACA POPULAR', 'MOLINS', '2026-05-30'::date, '01:30'::time, '03:00'::time, 200.0::numeric, 20::numeric, null, true),
  ('Alquerias', null, '2026-06-13'::date, '22:00'::time, '00:30'::time, 130.0::numeric, 20::numeric, 'Nota: Mediación Miguel Cámara', true),
  ('GRADUACIÓN PUB DELUXE', 'DOLORES', '2026-06-20'::date, '00:00'::time, '03:30'::time, 280.0::numeric, 20::numeric, 'Nota: Reserva a Pablo de 50€', true),
  ('LOS RAMOS', null, '2026-06-27'::date, '22:00'::time, '00:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('Thamesis', null, '2026-06-27'::date, '04:00'::time, '06:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('MOROS VIEJOS ORIHUELA', null, '2026-07-16'::date, null::time, null::time, 150.0::numeric, 20::numeric, null, true),
  ('COMPARSA CABALLEROS DEL TADMIR', 'ORIHUELA', '2026-07-18'::date, '01:00'::time, '03:30'::time, 250.0::numeric, 20::numeric, null, true),
  ('COMPARSA MOROS NAZARÍES', null, '2026-07-22'::date, '01:20'::time, '02:40'::time, 120.0::numeric, 20::numeric, null, true),
  ('COMPARSA CONTRABANDISTAS', null, '2026-07-23'::date, '01:00'::time, '04:00'::time, 225.0::numeric, 20::numeric, null, true),
  ('REDOVÁN POST CORONACIÓN', null, '2026-08-28'::date, '23:00'::time, '02:00'::time, 150.0::numeric, 20::numeric, null, true),
  ('BARRACA POPULAR', 'VIRGEN DEL CAMINO', '2026-08-29'::date, '23:00'::time, '01:00'::time, 250.0::numeric, 20::numeric, null, true),
  ('JACARILLA', null, '2026-08-29'::date, null::time, null::time, 0.0::numeric, 20::numeric, null, true),
  ('REDOVÁN PIRATAS', null, '2026-09-03'::date, '03:00'::time, '04:00'::time, 200.0::numeric, 20::numeric, null, false),
  ('REDOVÁN ALKHAUSIL', null, '2026-09-04'::date, '03:00'::time, '06:00'::time, 225.0::numeric, 20::numeric, null, false),
  ('FIESTAS MONSERRATE', 'ORIHUELA', '2026-09-05'::date, '00:00'::time, '02:00'::time, 200.0::numeric, 20::numeric, 'Nota: Reserva a Pablo de 50€', false),
  ('CAMPANETA', null, '2026-10-02'::date, '01:00'::time, '04:00'::time, 250.0::numeric, 20::numeric, null, false),
  ('BARRACA POPULAR', 'DESAMPARADOS', '2026-10-10'::date, null::time, null::time, 0.0::numeric, 20::numeric, 'Precio en la agenda: 75€/h', false),
  ('Boda', null, '2026-11-14'::date, null::time, null::time, 0.0::numeric, 20::numeric, null, false)
)
insert into public.bolos (
  usuario_id, nombre, ubicacion, fecha, hora_inicio, hora_fin,
  precio, comision_porcentaje, estado, cobrado, fecha_cobro, notas
)
select
  usuario.id,
  agenda.nombre,
  agenda.ubicacion,
  agenda.fecha,
  agenda.hora_inicio,
  agenda.hora_fin,
  agenda.precio,
  agenda.comision,
  'confirmado',
  agenda.cobrado,
  case when agenda.cobrado then agenda.fecha else null end,
  agenda.notas
from agenda cross join usuario;

-- Comprobación: cuántos bolos hay ahora y cuánto suman
select count(*) as bolos, sum(precio) as bruto from public.bolos;

-- =====================================================================
-- PARA DESHACER la importación (borra SOLO lo importado por este
-- fichero, por el rango de fechas y la hora exacta de creación):
--
--   delete from public.bolos where creado_en > now() - interval '10 minutes';
-- =====================================================================
