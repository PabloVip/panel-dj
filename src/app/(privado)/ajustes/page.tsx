import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import EnlaceCalendario from "@/components/EnlaceCalendario";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export const metadata: Metadata = {
  title: "Ajustes",
};

type Ajustes = {
  usuario_id: string;
  token_calendario: string;
};

export default async function PaginaAjustes() {
  const supabase = await crearClienteServidor();

  const respuesta = await supabase
    .from("ajustes")
    .select("usuario_id, token_calendario")
    .limit(1)
    .maybeSingle();

  let ajustes: Ajustes | null = null;
  if (respuesta.data !== null) {
    ajustes = respuesta.data as Ajustes;
  }

  // Dirección pública del sitio, tal y como ha llegado la petición
  const cabeceras = await headers();
  let protocolo = cabeceras.get("x-forwarded-proto");
  if (protocolo === null) {
    protocolo = "http";
  }
  let dominio = cabeceras.get("host");
  if (dominio === null) {
    dominio = "localhost:3000";
  }

  let enlace = "";
  if (ajustes !== null) {
    enlace = protocolo + "://" + dominio + "/api/calendario/" + ajustes.token_calendario;
  }

  const esLocal = dominio.startsWith("localhost") || dominio.startsWith("127.0.0.1");

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Ajustes</h1>
        <p className="text-sm text-textoSecundario">
          Calendario del móvil y copias de tus datos.
        </p>
      </header>

      <section className="rounded-2xl border border-borde bg-superficie p-5">
        <h2 className="text-sm font-medium">Calendario en el móvil</h2>
        <p className="mt-1 text-xs text-textoSecundario">
          Suscríbete una vez y tus bolos aparecerán en la app Calendario del
          iPhone. Cada bolo nuevo que guardes aquí se añade solo, sin tener que
          volver a tocar nada.
        </p>

        {ajustes === null && (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            Todavía no hay clave de calendario. Ejecuta la migración{" "}
            <code>supabase/migracion-salas-y-calendario.sql</code> en Supabase.
          </p>
        )}

        {ajustes !== null && (
          <div className="mt-4">
            <EnlaceCalendario enlace={enlace} />

            {esLocal === true && (
              <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                Esta dirección apunta a tu propio ordenador, así que desde el
                móvil no funcionará. El enlace bueno saldrá aquí cuando la
                aplicación esté publicada.
              </p>
            )}

            <details className="mt-4 text-xs text-textoSecundario">
              <summary className="cursor-pointer">
                Cómo añadirlo en el iPhone paso a paso
              </summary>
              <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4">
                <li>
                  Abre este enlace desde el propio iPhone y pulsa “Añadir a mi
                  calendario”.
                </li>
                <li>
                  Si prefieres hacerlo a mano: Ajustes del iPhone → Apps →
                  Calendario → Cuentas → Añadir cuenta → Otra → Añadir
                  calendario suscrito, y pega la dirección.
                </li>
                <li>
                  Se actualiza solo. Los bolos cancelados no aparecen, y los que
                  están pendientes de confirmar salen marcados como tentativos.
                </li>
              </ol>
            </details>

            <p className="mt-4 text-xs text-textoSecundario">
              Cualquiera que tenga esta dirección puede ver tus bolos, así que
              no la compartas. Si se te escapa, cambia la clave y la anterior
              deja de servir.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-borde bg-superficie p-5">
        <h2 className="text-sm font-medium">Copia de tus datos</h2>
        <p className="mt-1 text-xs text-textoSecundario">
          Descarga todos los bolos en una hoja de cálculo. Desde la pantalla de
          Bolos puedes aplicar filtros antes de exportar y bajarte solo un año o
          solo lo que está sin cobrar.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/bolos/exportar"
            className="rounded-lg border border-borde px-3 py-2 text-sm text-textoSecundario transition hover:text-textoPrincipal"
          >
            Descargar todo en CSV
          </a>
          <Link
            href="/bolos"
            className="rounded-lg border border-borde px-3 py-2 text-sm text-textoSecundario transition hover:text-textoPrincipal"
          >
            Ir a filtrar
          </Link>
        </div>
      </section>
    </section>
  );
}
