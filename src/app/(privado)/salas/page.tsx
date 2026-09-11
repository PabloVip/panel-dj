import type { Metadata } from "next";
import ListaSalas from "@/components/ListaSalas";
import type { ResumenSala } from "@/components/ListaSalas";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { netoDe } from "@/lib/calculos";
import { duracionEnHoras } from "@/lib/formato";
import type { Bolo, Sala } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Salas",
};

export default async function PaginaSalas() {
  const supabase = await crearClienteServidor();

  const [respuestaSalas, respuestaBolos] = await Promise.all([
    supabase.from("salas").select("*").order("nombre", { ascending: true }),
    supabase
      .from("bolos")
      .select("ubicacion, precio, comision_porcentaje, estado, fecha, hora_inicio, hora_fin")
      .not("ubicacion", "is", null)
      .limit(2000),
  ]);

  let salas: Sala[] = [];
  if (respuestaSalas.data !== null) {
    salas = respuestaSalas.data as Sala[];
  }

  let bolos: Bolo[] = [];
  if (respuestaBolos.data !== null) {
    bolos = respuestaBolos.data as Bolo[];
  }

  // Histórico por sala: se cruza por el nombre de la ubicación del bolo
  const resumenes: Record<string, ResumenSala> = {};
  for (const bolo of bolos) {
    if (bolo.estado === "cancelado" || bolo.ubicacion === null) {
      continue;
    }

    const clave = bolo.ubicacion.toLowerCase();
    let resumen = resumenes[clave];
    if (resumen === undefined) {
      resumen = { bolos: 0, neto: 0, ultimo: null, horas: 0, netoPorHoras: 0 };
      resumenes[clave] = resumen;
    }

    resumen.bolos = resumen.bolos + 1;
    resumen.neto = resumen.neto + netoDe(bolo);
    if (resumen.ultimo === null || bolo.fecha > resumen.ultimo) {
      resumen.ultimo = bolo.fecha;
    }

    // Para el precio por hora solo cuentan los bolos con horario apuntado,
    // con su importe, para que la división sea coherente
    const horas = duracionEnHoras(bolo.hora_inicio, bolo.hora_fin);
    if (horas > 0) {
      resumen.horas = resumen.horas + horas;
      resumen.netoPorHoras = resumen.netoPorHoras + netoDe(bolo);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold">Salas y contactos</h1>
        <p className="text-sm text-textoSecundario">
          {salas.length} sitios guardados. Al crear un bolo, escribir la
          ubicación te rellena el caché de esa sala.
        </p>
      </header>

      {respuestaSalas.error !== null && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          No se han podido cargar las salas. Comprueba que has ejecutado la
          migración <code>supabase/migracion-salas-y-calendario.sql</code>.
        </p>
      )}

      <ListaSalas salas={salas} resumenes={resumenes} />
    </section>
  );
}
