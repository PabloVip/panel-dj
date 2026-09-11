import type { Metadata } from "next";
import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import {
  claveFecha,
  diasDeDiferencia,
  fechaDeHoy,
  formatearEuros,
  formatearFechaCorta,
  formatearRangoHorario,
  inicioDeSemana,
  limitesDelMes,
  mesAnterior,
  nombreMes,
  sumarDias,
  textoRelativo,
} from "@/lib/formato";
import { colorEstado } from "@/lib/estados";
import { netoDe, tieneComision, totalesDe } from "@/lib/calculos";
import { direccionDe, telefonoDe } from "@/lib/navegacion";
import BotonesDeCamino from "@/components/BotonesDeCamino";
import type { Bolo, Sala } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Resumen",
};

// Tarjeta de dato destacado. Si recibe un enlace, se puede pulsar.
function Tarjeta(props: {
  titulo: string;
  valor: string;
  detalle: string;
  destacada?: boolean;
  enlace?: string;
}) {
  let clases = "block rounded-2xl border border-borde bg-superficie p-5";
  if (props.destacada === true) {
    clases = "block rounded-2xl border border-acento/40 bg-acento/5 p-5";
  }

  const contenido = (
    <>
      <p className="text-xs uppercase tracking-wider text-textoSecundario">
        {props.titulo}
      </p>
      <p className="mt-2 text-2xl font-semibold">{props.valor}</p>
      <p className="mt-1 text-xs text-textoSecundario">{props.detalle}</p>
    </>
  );

  if (props.enlace !== undefined) {
    return (
      <Link href={props.enlace} className={clases + " transition hover:border-acento"}>
        {contenido}
      </Link>
    );
  }

  return <article className={clases}>{contenido}</article>;
}


export default async function PaginaInicio() {
  const hoy = fechaDeHoy();
  const anio = Number(hoy.slice(0, 4));
  const mes = Number(hoy.slice(5, 7));

  const lunes = inicioDeSemana(hoy);
  const domingo = sumarDias(lunes, 6);
  const anterior = mesAnterior(anio, mes);

  const supabase = await crearClienteServidor();

  // Tres consultas independientes, lanzadas a la vez
  const [respuestaAnio, respuestaProximos, respuestaSinCobrar, respuestaSalas] = await Promise.all([
    supabase
      .from("bolos")
      .select("*")
      .gte("fecha", claveFecha(anterior.anio, anterior.mes, 1))
      .lte("fecha", claveFecha(anio, 12, 31)),
    supabase
      .from("bolos")
      .select("*")
      .gte("fecha", hoy)
      .neq("estado", "cancelado")
      .order("fecha", { ascending: true })
      .order("hora_inicio", { ascending: true, nullsFirst: true })
      .limit(5),
    supabase
      .from("bolos")
      .select("*")
      .eq("cobrado", false)
      .neq("estado", "cancelado")
      .limit(500),
    supabase.from("salas").select("*"),
  ]);

  let bolosDelPeriodo: Bolo[] = [];
  if (respuestaAnio.data !== null) {
    bolosDelPeriodo = respuestaAnio.data as Bolo[];
  }

  let proximos: Bolo[] = [];
  if (respuestaProximos.data !== null) {
    proximos = respuestaProximos.data as Bolo[];
  }

  let sinCobrar: Bolo[] = [];
  if (respuestaSinCobrar.data !== null) {
    sinCobrar = respuestaSinCobrar.data as Bolo[];
  }

  let salas: Sala[] = [];
  if (respuestaSalas.data !== null) {
    salas = respuestaSalas.data as Sala[];
  }

  // Lo de hoy va primero: es lo que se mira desde el coche
  const bolosDeHoy: Bolo[] = [];
  for (const bolo of proximos) {
    if (bolo.fecha === hoy) {
      bolosDeHoy.push(bolo);
    }
  }

  // Repartimos los bolos del periodo en los grupos que interesan
  const limitesMes = limitesDelMes(anio, mes);
  const limitesMesAnterior = limitesDelMes(anterior.anio, anterior.mes);

  const bolosMes: Bolo[] = [];
  const bolosMesAnterior: Bolo[] = [];
  const bolosSemana: Bolo[] = [];
  const bolosAnio: Bolo[] = [];

  for (const bolo of bolosDelPeriodo) {
    if (bolo.fecha >= limitesMes.desde && bolo.fecha <= limitesMes.hasta) {
      bolosMes.push(bolo);
    }
    if (
      bolo.fecha >= limitesMesAnterior.desde &&
      bolo.fecha <= limitesMesAnterior.hasta
    ) {
      bolosMesAnterior.push(bolo);
    }
    if (bolo.fecha >= lunes && bolo.fecha <= domingo) {
      bolosSemana.push(bolo);
    }
    if (bolo.fecha.slice(0, 4) === String(anio)) {
      bolosAnio.push(bolo);
    }
  }

  // Las cifras de ganancias son netas: lo que queda tras la comisión
  const totalesMes = totalesDe(bolosMes);
  const totalesMesAnterior = totalesDe(bolosMesAnterior);
  const totalesAnio = totalesDe(bolosAnio);
  const totalesSinCobrar = totalesDe(sinCobrar);

  const ingresosMes = totalesMes.neto;
  const ingresosMesAnterior = totalesMesAnterior.neto;
  const ingresosAnio = totalesAnio.neto;
  const pendiente = totalesSinCobrar.bruto;

  // De lo pendiente, lo que ya está vencido: bolos tocados que siguen sin pagar
  const impagados: Bolo[] = [];
  for (const bolo of sinCobrar) {
    if (bolo.fecha <= hoy) {
      impagados.push(bolo);
    }
  }

  let detalleCobros = sinCobrar.length + " bolos sin cobrar";
  if (impagados.length > 0) {
    impagados.sort((primero, segundo) => primero.fecha.localeCompare(segundo.fecha));
    const dias = diasDeDiferencia(impagados[0].fecha, hoy);
    detalleCobros =
      impagados.length + " ya vencidos · el más antiguo, " + dias + " días";
  }

  // Comparativa con el mes anterior
  let comparativa = "Sin datos del mes anterior";
  if (ingresosMesAnterior > 0) {
    const diferencia = ingresosMes - ingresosMesAnterior;
    const porcentaje = Math.round((diferencia / ingresosMesAnterior) * 100);
    if (diferencia >= 0) {
      comparativa = "+" + porcentaje + "% respecto a " + nombreMes(anterior.mes).toLowerCase();
    } else {
      comparativa = porcentaje + "% respecto a " + nombreMes(anterior.mes).toLowerCase();
    }
  }

  // Si hay comisiones de por medio se aclara sobre qué bruto sale el neto
  let detalleMes = comparativa;
  if (totalesMes.comisiones > 0) {
    detalleMes =
      "Neto de " + formatearEuros(totalesMes.bruto) + " · " + comparativa;
  }

  let detalleAnio = totalesAnio.cantidad + " bolos en el año";
  if (totalesAnio.comisiones > 0) {
    detalleAnio =
      detalleAnio + " · " + formatearEuros(totalesAnio.comisiones) + " en comisiones";
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Resumen</h1>
        <p className="text-sm text-textoSecundario">
          {nombreMes(mes)} de {anio}
        </p>
      </header>

      {bolosDeHoy.map((bolo) => (
        <article
          key={bolo.id}
          className="rounded-2xl border border-acento bg-acento/10 p-5"
        >
          <p className="text-xs uppercase tracking-wider text-acentoSuave">
            Hoy tocas
          </p>
          <h2 className="mt-2 text-xl font-semibold">{bolo.nombre}</h2>
          <p className="mt-1 text-sm text-textoSecundario">
            {formatearRangoHorario(bolo.hora_inicio, bolo.hora_fin)}
            {bolo.ubicacion !== null && " · " + bolo.ubicacion}
            {" · "}
            {formatearEuros(Number(bolo.precio))}
          </p>

          {bolo.notas !== null && (
            <p className="mt-2 text-xs text-textoSecundario">{bolo.notas}</p>
          )}

          <BotonesDeCamino
            direccion={direccionDe(bolo, salas)}
            telefono={telefonoDe(bolo, salas)}
          />
        </article>
      ))}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta
          titulo={"Ganas en " + nombreMes(mes).toLowerCase()}
          valor={formatearEuros(ingresosMes)}
          detalle={detalleMes}
          destacada
        />
        <Tarjeta
          titulo="Esta semana"
          valor={String(bolosSemana.length)}
          detalle={"Bolos entre el " + lunes.slice(8, 10) + " y el " + domingo.slice(8, 10)}
        />
        <Tarjeta
          titulo="Pendiente de cobro"
          valor={formatearEuros(pendiente)}
          detalle={detalleCobros}
          enlace="/cobros"
        />
        <Tarjeta
          titulo={"Total " + anio}
          valor={formatearEuros(ingresosAnio)}
          detalle={detalleAnio}
        />
      </div>

      <section className="rounded-2xl border border-borde bg-superficie p-5">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">Próximos bolos</h2>
          <Link
            href="/calendario?vista=agenda"
            className="text-xs text-acentoSuave transition hover:underline"
          >
            Ver agenda
          </Link>
        </header>

        {proximos.length === 0 && (
          <p className="text-sm text-textoSecundario">
            No hay nada en el calendario por delante.{" "}
            <Link href="/calendario" className="text-acentoSuave hover:underline">
              Añadir un bolo
            </Link>
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {proximos.map((bolo) => (
            <li key={bolo.id}>
              <Link
                href={"/calendario?vista=mes&anio=" + bolo.fecha.slice(0, 4) + "&mes=" + Number(bolo.fecha.slice(5, 7))}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-borde bg-fondo p-3 transition hover:border-acento"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={
                      "h-2 w-2 shrink-0 rounded-full " + colorEstado(bolo.estado)
                    }
                  />
                  <span>
                    <span className="block font-medium">{bolo.nombre}</span>
                    <span className="block text-xs text-textoSecundario">
                      {formatearFechaCorta(bolo.fecha)} ·{" "}
                      {formatearRangoHorario(bolo.hora_inicio, bolo.hora_fin)}
                      {bolo.ubicacion !== null && " · " + bolo.ubicacion}
                    </span>
                  </span>
                </span>

                <span className="flex items-center gap-3">
                  <span className="rounded bg-superficieAlta px-1.5 py-0.5 text-[11px] text-textoSecundario">
                    {textoRelativo(bolo.fecha, hoy)}
                  </span>
                  <span className="text-right text-sm font-medium text-acentoSuave">
                    {formatearEuros(Number(bolo.precio))}
                    {tieneComision(bolo) === true && (
                      <span className="block text-[11px] font-normal text-textoSecundario">
                        neto {formatearEuros(netoDe(bolo))}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
