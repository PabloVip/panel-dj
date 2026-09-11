import type { Metadata } from "next";
import Link from "next/link";
import FiltrosBolos from "@/components/FiltrosBolos";
import TablaBolos from "@/components/TablaBolos";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { fechaDeHoy, formatearEuros } from "@/lib/formato";
import { totalesDe } from "@/lib/calculos";
import type { Bolo, Sala } from "@/lib/tipos";

export const metadata: Metadata = {
  title: "Bolos",
};

type Parametros = {
  searchParams: Promise<{
    busqueda?: string;
    estado?: string;
    cobro?: string;
    desde?: string;
    hasta?: string;
    pagina?: string;
  }>;
};

// Cuántos bolos se muestran de una vez
const POR_PAGINA = 50;

// Quita los caracteres que romperían el filtro "or" de Supabase
function limpiarBusqueda(texto: string): string {
  return texto.replace(/[,()%]/g, " ").trim();
}

export default async function PaginaBolos(props: Parametros) {
  const parametros = await props.searchParams;
  const hoy = fechaDeHoy();

  const busqueda = parametros.busqueda ?? "";
  const estado = parametros.estado ?? "";
  const cobro = parametros.cobro ?? "";
  const desde = parametros.desde ?? "";
  const hasta = parametros.hasta ?? "";

  let pagina = Number(parametros.pagina);
  if (Number.isInteger(pagina) === false || pagina < 1) {
    pagina = 1;
  }

  const supabase = await crearClienteServidor();

  // Los mismos filtros se aplican a dos consultas: una trae la página que
  // se ve y otra los importes de TODO lo filtrado, para que los totales de
  // la cabecera no dependan de la página en la que estés.
  let consultaPagina = supabase.from("bolos").select("*", { count: "exact" });
  let consultaTotales = supabase
    .from("bolos")
    .select("precio, comision_porcentaje, estado, cobrado");

  const textoLimpio = limpiarBusqueda(busqueda);
  if (textoLimpio !== "") {
    const filtro =
      "nombre.ilike.%" + textoLimpio + "%,ubicacion.ilike.%" + textoLimpio + "%";
    consultaPagina = consultaPagina.or(filtro);
    consultaTotales = consultaTotales.or(filtro);
  }

  if (estado === "confirmado" || estado === "pendiente" || estado === "cancelado") {
    consultaPagina = consultaPagina.eq("estado", estado);
    consultaTotales = consultaTotales.eq("estado", estado);
  }

  if (cobro === "cobrado") {
    consultaPagina = consultaPagina.eq("cobrado", true);
    consultaTotales = consultaTotales.eq("cobrado", true);
  }
  if (cobro === "pendiente") {
    consultaPagina = consultaPagina.eq("cobrado", false);
    consultaTotales = consultaTotales.eq("cobrado", false);
  }

  if (desde.length === 10) {
    consultaPagina = consultaPagina.gte("fecha", desde);
    consultaTotales = consultaTotales.gte("fecha", desde);
  }
  if (hasta.length === 10) {
    consultaPagina = consultaPagina.lte("fecha", hasta);
    consultaTotales = consultaTotales.lte("fecha", hasta);
  }

  const primero = (pagina - 1) * POR_PAGINA;
  const ultimo = primero + POR_PAGINA - 1;

  const [respuesta, respuestaTotales, respuestaSalas] = await Promise.all([
    consultaPagina.order("fecha", { ascending: false }).range(primero, ultimo),
    consultaTotales.limit(2000),
    supabase.from("salas").select("*").order("nombre", { ascending: true }),
  ]);

  let salas: Sala[] = [];
  if (respuestaSalas.data !== null) {
    salas = respuestaSalas.data as Sala[];
  }

  let bolos: Bolo[] = [];
  if (respuesta.data !== null) {
    bolos = respuesta.data as Bolo[];
  }

  let paraTotales: Bolo[] = [];
  if (respuestaTotales.data !== null) {
    paraTotales = respuestaTotales.data as Bolo[];
  }

  // Totales de todo lo que cumple el filtro
  const totales = totalesDe(paraTotales);

  let sinCobrar = 0;
  for (const bolo of paraTotales) {
    if (bolo.estado === "cancelado") {
      continue;
    }
    if (bolo.cobrado === false) {
      sinCobrar = sinCobrar + Number(bolo.precio);
    }
  }

  let encontrados = 0;
  if (respuesta.count !== null && respuesta.count !== undefined) {
    encontrados = respuesta.count;
  }

  let ultimaPagina = Math.ceil(encontrados / POR_PAGINA);
  if (ultimaPagina < 1) {
    ultimaPagina = 1;
  }

  // Los filtros actuales, para reutilizarlos en los enlaces
  function filtrosEnLaUrl(): URLSearchParams {
    const partes = new URLSearchParams();
    if (busqueda !== "") {
      partes.set("busqueda", busqueda);
    }
    if (estado !== "") {
      partes.set("estado", estado);
    }
    if (cobro !== "") {
      partes.set("cobro", cobro);
    }
    if (desde !== "") {
      partes.set("desde", desde);
    }
    if (hasta !== "") {
      partes.set("hasta", hasta);
    }
    return partes;
  }

  function enlaceAPagina(numero: number): string {
    const partes = filtrosEnLaUrl();
    partes.set("pagina", String(numero));
    return "/bolos?" + partes.toString();
  }

  const enlaceExportar = "/bolos/exportar?" + filtrosEnLaUrl().toString();

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
        <h1 className="text-2xl font-semibold">Todos los bolos</h1>
        <p className="text-sm text-textoSecundario">
          {encontrados} bolos · {formatearEuros(totales.bruto)} en total
          {totales.comisiones > 0 && (
            <span> · neto {formatearEuros(totales.neto)}</span>
          )}{" "}
          · {formatearEuros(sinCobrar)} sin cobrar
        </p>
        </div>

        <a
          href={enlaceExportar}
          className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
        >
          Exportar CSV
        </a>
      </header>

      <FiltrosBolos
        busqueda={busqueda}
        estado={estado}
        cobro={cobro}
        desde={desde}
        hasta={hasta}
      />

      {respuesta.error !== null && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          No se han podido cargar los bolos: {respuesta.error.message}
        </p>
      )}

      <TablaBolos bolos={bolos} hoy={hoy} salas={salas} />

      {ultimaPagina > 1 && (
        <nav className="flex items-center justify-between gap-3">
          <span className="text-xs text-textoSecundario">
            Página {pagina} de {ultimaPagina}
          </span>

          <span className="flex gap-2">
            {pagina > 1 && (
              <Link
                href={enlaceAPagina(pagina - 1)}
                className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
              >
                Anteriores
              </Link>
            )}
            {pagina < ultimaPagina && (
              <Link
                href={enlaceAPagina(pagina + 1)}
                className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
              >
                Siguientes
              </Link>
            )}
          </span>
        </nav>
      )}
    </section>
  );
}
