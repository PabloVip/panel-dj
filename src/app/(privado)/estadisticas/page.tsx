import type { Metadata } from "next";
import Link from "next/link";
import GraficoIngresos from "@/components/GraficoIngresos";
import type { ResumenMes } from "@/components/GraficoIngresos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { claveFecha, fechaDeHoy, formatearEuros } from "@/lib/formato";
import { comisionDe, netoDe, totalesDe } from "@/lib/calculos";
import type { Bolo } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Estadísticas",
};

type Parametros = {
  searchParams: Promise<{ anio?: string }>;
};

// Tarjeta de un dato destacado
function Tarjeta(props: { titulo: string; valor: string; detalle: string }) {
  return (
    <article className="rounded-2xl border border-borde bg-superficie p-5">
      <p className="text-xs uppercase tracking-wider text-textoSecundario">
        {props.titulo}
      </p>
      <p className="mt-2 text-2xl font-semibold">{props.valor}</p>
      <p className="mt-1 text-xs text-textoSecundario">{props.detalle}</p>
    </article>
  );
}

export default async function PaginaEstadisticas(props: Parametros) {
  const parametros = await props.searchParams;
  const hoy = fechaDeHoy();

  let anio = Number(parametros.anio);
  if (Number.isInteger(anio) === false || anio < 2000 || anio > 2100) {
    anio = Number(hoy.slice(0, 4));
  }

  const supabase = await crearClienteServidor();
  const respuesta = await supabase
    .from("bolos")
    .select("*")
    .gte("fecha", claveFecha(anio, 1, 1))
    .lte("fecha", claveFecha(anio, 12, 31));

  let bolos: Bolo[] = [];
  if (respuesta.data !== null) {
    bolos = respuesta.data as Bolo[];
  }

  // Preparamos los doce meses aunque estén vacíos
  const resumen: ResumenMes[] = [];
  let mes = 1;
  while (mes <= 12) {
    resumen.push({ mes: mes, bruto: 0, comisiones: 0, neto: 0, bolos: 0 });
    mes = mes + 1;
  }

  let cancelados = 0;
  const netoPorUbicacion = new Map<string, number>();

  for (const bolo of bolos) {
    if (bolo.estado === "cancelado") {
      cancelados = cancelados + 1;
      continue;
    }

    const mesDelBolo = Number(bolo.fecha.slice(5, 7));
    const fila = resumen[mesDelBolo - 1];

    fila.bruto = fila.bruto + Number(bolo.precio);
    fila.comisiones = fila.comisiones + comisionDe(bolo);
    fila.neto = fila.neto + netoDe(bolo);
    fila.bolos = fila.bolos + 1;

    let ubicacion = bolo.ubicacion;
    if (ubicacion === null || ubicacion === "") {
      ubicacion = "Sin ubicación";
    }
    const acumulado = netoPorUbicacion.get(ubicacion);
    if (acumulado === undefined) {
      netoPorUbicacion.set(ubicacion, netoDe(bolo));
    } else {
      netoPorUbicacion.set(ubicacion, acumulado + netoDe(bolo));
    }
  }

  const totales = totalesDe(bolos);

  let pendienteDeCobro = 0;
  for (const bolo of bolos) {
    if (bolo.estado === "cancelado") {
      continue;
    }
    if (bolo.cobrado === false) {
      pendienteDeCobro = pendienteDeCobro + Number(bolo.precio);
    }
  }

  let mediaPorBolo = 0;
  if (totales.cantidad > 0) {
    mediaPorBolo = totales.neto / totales.cantidad;
  }

  const hayComisiones = totales.comisiones > 0;

  // Mejores ubicaciones por dinero que te dejan a ti
  const ubicaciones = Array.from(netoPorUbicacion.entries());
  ubicaciones.sort((primera, segunda) => segunda[1] - primera[1]);
  const mejoresUbicaciones = ubicaciones.slice(0, 5);

  let detalleGanancias = "Total facturado en el año";
  if (hayComisiones === true) {
    detalleGanancias = "Neto de " + formatearEuros(totales.bruto) + " facturados";
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Estadísticas {anio}</h1>
          <p className="text-sm text-textoSecundario">
            Resumen de ganancias y actividad del año.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={"/estadisticas?anio=" + (anio - 1)}
            className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
          >
            {anio - 1}
          </Link>
          <Link
            href={"/estadisticas?anio=" + (anio + 1)}
            className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
          >
            {anio + 1}
          </Link>
        </div>
      </header>

      {respuesta.error !== null && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          No se han podido cargar los datos: {respuesta.error.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta
          titulo="Ganancias"
          valor={formatearEuros(totales.neto)}
          detalle={detalleGanancias}
        />
        <Tarjeta
          titulo="Bolos"
          valor={String(totales.cantidad)}
          detalle={cancelados + " cancelados aparte"}
        />
        <Tarjeta
          titulo="Media por bolo"
          valor={formatearEuros(mediaPorBolo)}
          detalle="Lo que te queda por sesión"
        />

        {hayComisiones === true && (
          <Tarjeta
            titulo="Comisiones"
            valor={formatearEuros(totales.comisiones)}
            detalle="Se lo lleva el manager"
          />
        )}

        {hayComisiones === false && (
          <Tarjeta
            titulo="Sin cobrar"
            valor={formatearEuros(pendienteDeCobro)}
            detalle="Bolos marcados como no cobrados"
          />
        )}
      </div>

      <GraficoIngresos
        resumen={resumen}
        anio={anio}
        hayComisiones={hayComisiones}
      />

      <section className="rounded-2xl border border-borde bg-superficie p-5">
        <h2 className="text-sm font-medium">Dónde ganas más</h2>
        <p className="mt-1 text-xs text-textoSecundario">
          Ordenado por lo que te queda a ti tras comisiones.
        </p>

        {mejoresUbicaciones.length === 0 && (
          <p className="mt-3 text-sm text-textoSecundario">
            Todavía no hay bolos registrados este año.
          </p>
        )}

        <ul className="mt-4 flex flex-col gap-2">
          {mejoresUbicaciones.map((fila) => (
            <li
              key={fila[0]}
              className="flex items-center justify-between border-t border-borde pt-2 text-sm first:border-none first:pt-0"
            >
              <span>{fila[0]}</span>
              <span className="text-acentoSuave">{formatearEuros(fila[1])}</span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
