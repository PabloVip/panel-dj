import type { Metadata } from "next";
import VistaCalendario from "@/components/VistaCalendario";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  fechaDeHoy,
  inicioDeSemana,
  limitesDelMes,
  sumarDias,
} from "@/lib/formato";
import type { Bolo, Sala } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Calendario",
};

type Parametros = {
  searchParams: Promise<{
    vista?: string;
    anio?: string;
    mes?: string;
    dia?: string;
  }>;
};

export default async function PaginaCalendario(props: Parametros) {
  const parametros = await props.searchParams;
  const hoy = fechaDeHoy();

  // Vista solicitada; si no es válida, se muestra el mes
  let vista: "mes" | "semana" | "agenda" = "mes";
  if (parametros.vista === "semana") {
    vista = "semana";
  }
  if (parametros.vista === "agenda") {
    vista = "agenda";
  }

  // Mes que se está viendo
  let anio = Number(parametros.anio);
  let mes = Number(parametros.mes);
  if (Number.isInteger(anio) === false || anio < 2000 || anio > 2100) {
    anio = Number(hoy.slice(0, 4));
  }
  if (Number.isInteger(mes) === false || mes < 1 || mes > 12) {
    mes = Number(hoy.slice(5, 7));
  }

  // Semana que se está viendo (siempre empieza en lunes)
  let diaDeReferencia = hoy;
  if (parametros.dia !== undefined && parametros.dia.length === 10) {
    diaDeReferencia = parametros.dia;
  }
  const lunes = inicioDeSemana(diaDeReferencia);

  // Cada vista pide a la base de datos solo el rango que necesita
  let desde = "";
  let hasta = "";

  if (vista === "mes") {
    const limites = limitesDelMes(anio, mes);
    desde = limites.desde;
    hasta = limites.hasta;
  }
  if (vista === "semana") {
    desde = lunes;
    hasta = sumarDias(lunes, 6);
  }
  if (vista === "agenda") {
    desde = hoy;
    hasta = sumarDias(hoy, 365);
  }

  const supabase = await crearClienteServidor();

  const [respuesta, respuestaSalas] = await Promise.all([
    supabase
      .from("bolos")
      .select("*")
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true, nullsFirst: true }),
    supabase.from("salas").select("*").order("nombre", { ascending: true }),
  ]);

  let bolos: Bolo[] = [];
  if (respuesta.data !== null) {
    bolos = respuesta.data as Bolo[];
  }

  let salas: Sala[] = [];
  if (respuestaSalas.data !== null) {
    salas = respuestaSalas.data as Sala[];
  }

  return (
    <>
      {respuesta.error !== null && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          No se han podido cargar los bolos: {respuesta.error.message}
        </p>
      )}
      <VistaCalendario
        vista={vista}
        anio={anio}
        mes={mes}
        lunes={lunes}
        hoy={hoy}
        bolos={bolos}
        salas={salas}
      />
    </>
  );
}
