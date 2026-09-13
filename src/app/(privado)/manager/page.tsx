import type { Metadata } from "next";
import LiquidacionesManager from "@/components/LiquidacionesManager";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { agruparPorMes, resumenDelManager } from "@/lib/manager";
import { fechaDeHoy, formatearEuros, nombreMes } from "@/lib/formato";
import type { Bolo } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Manager",
};

function Tarjeta(props: {
  titulo: string;
  valor: string;
  detalle: string;
  clasesValor?: string;
}) {
  let clasesValor = "";
  if (props.clasesValor !== undefined) {
    clasesValor = " " + props.clasesValor;
  }

  return (
    <article className="rounded-2xl border border-borde bg-superficie p-5">
      <p className="text-xs uppercase tracking-wider text-textoSecundario">
        {props.titulo}
      </p>
      <p className={"mt-2 text-2xl font-semibold" + clasesValor}>{props.valor}</p>
      <p className="mt-1 text-xs text-textoSecundario">{props.detalle}</p>
    </article>
  );
}

export default async function PaginaManager() {
  const hoy = fechaDeHoy();
  const supabase = await crearClienteServidor();

  // Solo los bolos que llevan comisión: el resto no pinta nada aquí
  const respuesta = await supabase
    .from("bolos")
    .select("*")
    .gt("comision_porcentaje", 0)
    .neq("estado", "cancelado")
    .order("fecha", { ascending: false })
    .limit(1000);

  let bolos: Bolo[] = [];
  if (respuesta.data !== null) {
    bolos = respuesta.data as Bolo[];
  }

  const meses = agruparPorMes(bolos);
  const resumen = resumenDelManager(meses, hoy);

  // --- Tarjeta de la deuda ---
  let clasesDeuda = "text-amber-300";
  let detalleDeuda = "";

  if (resumen.pendienteTotal <= 0) {
    clasesDeuda = "text-emerald-300";
    detalleDeuda = "Al día, no le debes nada";
  } else {
    detalleDeuda = resumen.bolosPendientes + " bolos sin liquidar";
    if (resumen.mesMasAntiguo !== null) {
      detalleDeuda = detalleDeuda + " · desde " + resumen.mesMasAntiguo;
    }
  }

  // --- Tarjeta del mes en curso ---
  const mesEnCurso = nombreMes(Number(hoy.slice(5, 7)));

  let detalleEsteMes = "Comisión de " + mesEnCurso.toLowerCase();
  if (resumen.comisionEsteMes <= 0) {
    detalleEsteMes = "Este mes todavía no ha generado comisión";
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Manager</h1>
        <p className="text-sm text-textoSecundario">
          Su comisión mes a mes y lo que le queda por cobrarte.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tarjeta
          titulo="Le debes"
          valor={formatearEuros(resumen.pendienteTotal)}
          detalle={detalleDeuda}
          clasesValor={clasesDeuda}
        />
        <Tarjeta
          titulo={mesEnCurso}
          valor={formatearEuros(resumen.comisionEsteMes)}
          detalle={detalleEsteMes}
        />
        <Tarjeta
          titulo={"Pagado en " + hoy.slice(0, 4)}
          valor={formatearEuros(resumen.pagadoEsteAnio)}
          detalle="Lo que le has ido pagando este año"
        />
      </div>

      {respuesta.error !== null && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          No se han podido cargar las comisiones. Comprueba que has ejecutado la
          migración <code>supabase/migracion-manager.sql</code> en Supabase.
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium">Cuenta mes a mes</h2>

        <LiquidacionesManager meses={meses} />
      </section>

      <p className="text-xs text-textoSecundario">
        Un bolo cuenta en el mes en que lo tocas, no en el mes en que te pagan
        la sala. Al dar un mes por pagado se apunta la fecha de hoy en los
        bolos que quedaran pendientes; los que ya estaban pagados no se tocan y
        conservan su fecha.
      </p>
    </section>
  );
}
