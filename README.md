# Panel DJ

Aplicación web privada para gestionar los bolos: resumen, calendario en tres vistas,
listado con filtros, estadísticas de ganancias e instalación como app en el móvil.
El portfolio público se añadirá más adelante sobre este mismo proyecto.

Next.js 15 (App Router) + TypeScript + Tailwind + Supabase (base de datos y login).

## Qué hace

- **Inicio**: ingresos del mes con comparativa respecto al anterior, bolos de la
  semana, dinero pendiente de cobro, total del año y los próximos cinco bolos.
- **Calendario**: vista de **mes** (rejilla con panel del día), de **semana**
  (una columna por día) y **agenda** (los próximos bolos en orden).
- **Bolos**: listado completo con buscador por nombre o sala, filtros por estado,
  por cobro y por rango de fechas, y columnas ordenables.
- **Cobros**: lo que te deben, cuántos días lleva cada impago esperando, los bolos
  futuros aún sin cobrar y los últimos cobros registrados. Se marca como cobrado
  desde la propia lista.
- **Comisión de manager**: cada bolo puede llevar comisión con una casilla (20%
  por defecto, editable). A partir de ahí la aplicación distingue el bruto de lo
  que te queda a ti, y todas las cifras de ganancias son netas.
- **Estadísticas**: ganancias netas del año, comisiones pagadas, media por bolo,
  gráfico de ingresos por mes (partido en neto y comisión) y ranking de las salas
  que más dinero te dejan.
- **Duplicar y repetir**: cualquier bolo se copia a la semana siguiente con un
  botón, y al crear uno se puede generar una serie (cada semana, cada dos semanas
  o cada mes) para las residencias.
- **Aviso de solapes**: si guardas un bolo en un día y una franja horaria que ya
  tienes ocupada, la aplicación avisa antes de guardar y te deja confirmar.
- **Salas y contactos**: fichero de sitios donde tocas, con contacto, teléfono,
  caché habitual y comisión. Al escribir la ubicación de un bolo se rellena solo
  el caché de esa sala, y cada ficha enseña el histórico: bolos, neto y media.
- **Calendario en el móvil**: una dirección secreta a la que te suscribes una vez
  desde el iPhone; los bolos aparecen en la app Calendario y se actualizan solos.
- **Exportar a CSV**: descarga de los bolos filtrados, con bruto, comisión y neto,
  lista para Excel o Numbers.
- **PWA**: se instala en el iPhone desde Safari (*Compartir > Añadir a pantalla de
  inicio*) y se abre a pantalla completa con navegación inferior.

## 1. Crear el proyecto en Supabase

1. Entra en https://supabase.com y crea un proyecto nuevo (plan gratuito).
2. Ve a **SQL Editor**, pega el contenido de `supabase/esquema.sql` y pulsa **Run**.
   Eso crea la tabla `bolos` y las políticas de seguridad para que cada usuario solo
   vea sus propios datos.
   Si ya habías creado la tabla con una versión anterior, ejecuta además
   `supabase/migracion-cobros.sql` (fecha de cobro),
   `supabase/migracion-comision.sql` (comisión de manager) y
   `supabase/migracion-salas-y-calendario.sql` (salas y calendario del móvil),
   en ese orden.
3. Ve a **Authentication > Users > Add user** y crea tu usuario con correo y
   contraseña. Marca la opción de confirmar el correo automáticamente.
   El registro público no existe en la aplicación: solo se entra con este usuario.
4. Ve a **Settings > API Keys** y copia la *Project URL* y la *publishable key*
   (`sb_publishable_...`). Si tu proyecto todavía usa las claves antiguas, vale la
   *anon public*. Nunca copies la *secret* ni la *service_role*.

## 2. Configurar el proyecto en local

```bash
cd dj-manager
cp .env.local.example .env.local   # y rellena las dos variables
npm install
npm run dev
```

Abre http://localhost:3000 y entra con el usuario que creaste.

## 3. Estructura

```
dj-manager/
├── supabase/esquema.sql                     Script SQL de la base de datos
├── supabase/migracion-*.sql                 Cambios sobre una base ya creada
├── supabase/importar-agenda.sql             Carga del histórico del Excel
├── public/sw.js                             Service worker (permite instalar la app)
├── public/icono-192.png                     Iconos de la aplicación
├── public/icono-512.png
├── public/apple-touch-icon.png
├── src/middleware.ts                        Protege las rutas privadas
├── src/lib/tipos.ts                         Tipos compartidos
├── src/lib/formato.ts                       Euros, horas, semanas y rejilla del mes
├── src/lib/estados.ts                       Colores y etiquetas de cada estado
├── src/lib/calculos.ts                      Bruto, comisión y neto
├── src/lib/supabase/cliente.ts              Cliente de Supabase en el navegador
├── src/lib/supabase/servidor.ts             Cliente de Supabase en el servidor
├── src/acciones/bolos.ts                    Guardar y borrar bolos (server actions)
├── src/acciones/salas.ts                    Salas y clave del calendario
├── src/acciones/sesion.ts                   Cerrar sesión
├── src/app/layout.tsx                       Layout raíz y metadatos de la PWA
├── src/app/manifest.ts                      Manifiesto de la aplicación instalable
├── src/app/not-found.tsx                    Página 404
├── src/app/globals.css                      Estilos base
├── src/app/page.tsx                         Redirige al resumen
├── src/app/login/page.tsx                   Pantalla de acceso
├── src/app/api/calendario/[token]/route.ts  Calendario suscribible (.ics)
├── src/app/(privado)/layout.tsx             Cabecera, sesión y barra inferior
├── src/app/(privado)/inicio/                Resumen
├── src/app/(privado)/calendario/            Mes, semana y agenda
├── src/app/(privado)/bolos/                 Listado con filtros
├── src/app/(privado)/bolos/exportar/        Descarga en CSV
├── src/app/(privado)/cobros/                Impagos y cobros
├── src/app/(privado)/salas/                 Salas y contactos
├── src/app/(privado)/estadisticas/
├── src/app/(privado)/ajustes/               Calendario del móvil y copias
├── src/app/(privado)/mas/                   Menú de más opciones (móvil)
└── src/components/
    ├── VistaCalendario.tsx                  Orquesta las tres vistas y el formulario
    ├── RejillaMes.tsx
    ├── RejillaSemana.tsx
    ├── ListaAgenda.tsx
    ├── TarjetaBolo.tsx
    ├── TablaBolos.tsx
    ├── FiltrosBolos.tsx
    ├── FormularioBolo.tsx                   Alta, edición, duplicado y series
    ├── ListaImpagos.tsx
    ├── ListaSalas.tsx
    ├── FormularioSala.tsx
    ├── EnlaceCalendario.tsx
    ├── GraficoIngresos.tsx
    ├── Esqueleto.tsx                        Piezas de las pantallas de carga
    ├── NavegacionPrivada.tsx
    ├── BarraInferior.tsx                    Navegación de móvil
    └── RegistroServiceWorker.tsx
```

## 4. Publicar

El proyecto está listo para Vercel:

1. Sube la carpeta a un repositorio de GitHub.
2. En Vercel, **Add New > Project**, importa el repositorio.
3. Añade las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy.

La instalación en el móvil solo funciona sobre HTTPS, así que se prueba de verdad
una vez desplegado (en local, `localhost` también vale).

## 5. Siguientes pasos

- Portfolio público en `src/app/(publico)/` reutilizando el mismo layout raíz.
- Gastos por bolo para calcular el beneficio real tras desplazamientos.
- Hoja de ruta imprimible del bolo.
- Adjuntar carteles y contratos con Supabase Storage.
