import type { Metadata } from "next";
import ListaImpagos from "@/components/ListaImpagos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { totalesDe } from "@/lib/calculos";
import {
  diasDeDiferencia,
  fechaDeHoy,
  formatearEuros,
  formatearFechaCorta,
} from "@/lib/formato";
import type { Bolo } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Cobros",
};

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

export default async function PaginaCobros() {
  const hoy = fechaDeHoy();
  const supabase = await crearClienteServidor();

  const [respuestaSinCobrar, respuestaCobrados] = await Promise.all([
    supabase
      .from("bolos")
      .select("*")
      .eq("cobrado", false)
      .neq("estado", "cancelado")
      .order("fecha", { ascending: true })
      .limit(500),
    supabase
      .from("bolos")
      .select("*")
      .eq("cobrado", true)
      .order("fecha_cobro", { ascending: false, nullsFirst: false })
      .limit(10),
  ]);

  let sinCobrar: Bolo[] = [];
  if (respuestaSinCobrar.data !== null) {
    sinCobrar = respuestaSinCobrar.data as Bolo[];
  }

  let cobradosRecientes: Bolo[] = [];
  if (respuestaCobrados.data !== null) {
    cobradosRecientes = respuestaCobrados.data as Bolo[];
  }

  // Lo que ya se ha tocado y sigue sin pagarse frente a lo que aún no ha llegado
  const impagados: Bolo[] = [];
  const porVenir: Bolo[] = [];

  for (const bolo of sinCobrar) {
    if (bolo.fecha <= hoy) {
      impagados.push(bolo);
    } else {
      porVenir.push(bolo);
    }
  }

  const totalesImpagados = totalesDe(impagados);
  const totalesPorVenir = totalesDe(porVenir);

  const totalImpagado = totalesImpagados.bruto;
  const totalPorVenir = totalesPorVenir.bruto;

  // Si hay comisiones se aclara cuánto de eso acaba siendo tuyo
  let detalleImpagado = impagados.length + " bolos ya tocados sin cobrar";
  if (totalesImpagados.comisiones > 0) {
    detalleImpagado =
      detalleImpagado + " · " + formatearEuros(totalesImpagados.neto) + " netos";
  }

  let detallePorVenir = porVenir.length + " bolos futuros aún sin cobrar";
  if (totalesPorVenir.comisiones > 0) {
    detallePorVenir =
      detallePorVenir + " · " + formatearEuros(totalesPorVenir.neto) + " netos";
  }

  // El impago más antiguo marca la urgencia
  let detalleAntiguedad = "Nada pendiente";
  if (impagados.length > 0) {
    const masAntiguo = impagados[0];
    const dias = diasDeDiferencia(masAntiguo.fecha, hoy);
    detalleAntiguedad = "El más antiguo, " + dias + " días (" + masAntiguo.nombre + ")";
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Cobros</h1>
        <p className="text-sm text-textoSecundario">
          Lo que te deben y lo que está por llegar.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Tarjeta
          titulo="Te deben"
          valor={formatearEuros(totalImpagado)}
          detalle={detalleImpagado}
        />
        <Tarjeta
          titulo="Antigüedad"
          valor={String(impagados.length)}
          detalle={detalleAntiguedad}
        />
        <Tarjeta
          titulo="Por venir"
          valor={formatearEuros(totalPorVenir)}
          detalle={detallePorVenir}
        />
      </div>

      {(respuestaSinCobrar.error !== null || respuestaCobrados.error !== null) && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          No se han podido cargar los cobros. Comprueba que has ejecutado la
          migración <code>supabase/migracion-cobros.sql</code>.
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium">Pendientes de cobro</h2>
        <ListaImpagos
          bolos={impagados}
          hoy={hoy}
          mostrarAntiguedad
          textoVacio="No te debe nadie. Todo cobrado."
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">Bolos futuros sin cobrar</h2>
        <ListaImpagos
          bolos={porVenir}
          hoy={hoy}
          mostrarAntiguedad={false}
          textoVacio="No hay bolos futuros pendientes de cobro."
        />
      </section>

      <section className="rounded-2xl border border-borde bg-superficie p-5">
        <h2 className="mb-3 text-sm font-medium">Últimos cobros</h2>

        {cobradosRecientes.length === 0 && (
          <p className="text-sm text-textoSecundario">
            Todavía no has registrado ningún cobro.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {cobradosRecientes.map((bolo) => (
            <li
              key={bolo.id}
              className="flex flex-wrap items-center justify-between gap-2 border-t border-borde pt-2 text-sm first:border-none first:pt-0"
            >
              <span>
                <span className="block">{bolo.nombre}</span>
                <span className="block text-xs text-textoSecundario">
                  Bolo del {formatearFechaCorta(bolo.fecha)}
                  {bolo.fecha_cobro !== null &&
                    " · cobrado el " + formatearFechaCorta(bolo.fecha_cobro)}
                </span>
              </span>
              <span className="text-emerald-300">
                {formatearEuros(Number(bolo.precio))}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
