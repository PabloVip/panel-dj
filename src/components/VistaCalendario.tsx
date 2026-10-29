"use client";

import { useState } from "react";
import Link from "next/link";
import FormularioBolo from "./FormularioBolo";
import RejillaMes from "./RejillaMes";
import RejillaSemana from "./RejillaSemana";
import ListaAgenda from "./ListaAgenda";
import TarjetaBolo from "./TarjetaBolo";
import {
  claveFecha,
  diasDeLaSemana,
  formatearEuros,
  formatearFechaCorta,
  formatearFechaLarga,
  mesAnterior,
  mesSiguiente,
  nombreDiaLargo,
  nombreMes,
  sumarDias,
} from "@/lib/formato";
import { totalesDe } from "@/lib/calculos";
import type { Bolo, Sala } from "@/lib/tipos";

type Propiedades = {
  vista: "mes" | "semana" | "agenda";
  anio: number;
  mes: number;
  lunes: string;
  hoy: string;
  bolos: Bolo[];
  salas: Sala[];
};

// Cuenta los bolos de un día sin contar los cancelados
function contarActivos(lista: Bolo[]): number {
  let total = 0;
  for (const bolo of lista) {
    if (bolo.estado !== "cancelado") {
      total = total + 1;
    }
  }
  return total;
}

export default function VistaCalendario(props: Propiedades) {
  const [diaSeleccionado, establecerDiaSeleccionado] = useState(() => {
    if (props.vista === "semana") {
      return props.lunes;
    }
    const primerDia = claveFecha(props.anio, props.mes, 1);
    if (props.hoy.startsWith(primerDia.slice(0, 7)) === true) {
      return props.hoy;
    }
    return primerDia;
  });

  const [formularioAbierto, establecerFormularioAbierto] = useState(false);
  const [boloEditando, establecerBoloEditando] = useState<Bolo | null>(null);
  const [fechaDelFormulario, establecerFechaDelFormulario] = useState(diaSeleccionado);

  // Agrupamos los bolos por fecha una sola vez
  const bolosPorFecha = new Map<string, Bolo[]>();
  for (const bolo of props.bolos) {
    const lista = bolosPorFecha.get(bolo.fecha);
    if (lista === undefined) {
      bolosPorFecha.set(bolo.fecha, [bolo]);
    } else {
      lista.push(bolo);
    }
  }

  // Resumen de lo que se está viendo ahora mismo
  const totales = totalesDe(props.bolos);

  let sinCobrar = 0;
  for (const bolo of props.bolos) {
    if (bolo.estado === "cancelado") {
      continue;
    }
    if (bolo.cobrado === false) {
      sinCobrar = sinCobrar + Number(bolo.precio);
    }
  }

  function abrirNuevo(fecha: string) {
    establecerFechaDelFormulario(fecha);
    establecerBoloEditando(null);
    establecerFormularioAbierto(true);
  }

  function abrirEdicion(bolo: Bolo) {
    establecerFechaDelFormulario(bolo.fecha);
    establecerBoloEditando(bolo);
    establecerFormularioAbierto(true);
  }

  function cerrarFormulario() {
    establecerFormularioAbierto(false);
    establecerBoloEditando(null);
  }

  function seleccionarDia(fecha: string) {
    establecerDiaSeleccionado(fecha);
  }

  // --- Título y enlaces de navegación según la vista ---
  const anterior = mesAnterior(props.anio, props.mes);
  const siguiente = mesSiguiente(props.anio, props.mes);
  const diasSemana = diasDeLaSemana(props.lunes);

  let titulo = nombreMes(props.mes) + " " + props.anio;
  let enlaceAtras = "/calendario?vista=mes&anio=" + anterior.anio + "&mes=" + anterior.mes;
  let enlaceAdelante =
    "/calendario?vista=mes&anio=" + siguiente.anio + "&mes=" + siguiente.mes;

  if (props.vista === "semana") {
    titulo =
      formatearFechaCorta(diasSemana[0]) + " — " + formatearFechaCorta(diasSemana[6]);
    enlaceAtras = "/calendario?vista=semana&dia=" + sumarDias(props.lunes, -7);
    enlaceAdelante = "/calendario?vista=semana&dia=" + sumarDias(props.lunes, 7);
  }

  if (props.vista === "agenda") {
    titulo = "Próximos bolos";
  }

  let bolosDelDia = bolosPorFecha.get(diaSeleccionado);
  if (bolosDelDia === undefined) {
    bolosDelDia = [];
  }

  // Clases del selector de vista
  function clasesPestana(vista: string): string {
    let clases = "rounded-lg px-3 py-1.5 text-sm transition";
    if (props.vista === vista) {
      clases = clases + " bg-acento text-white";
    } else {
      clases = clases + " text-textoSecundario hover:text-textoPrincipal";
    }
    return clases;
  }

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{titulo}</h1>
          <p className="text-sm text-textoSecundario">
            {totales.cantidad} bolos · {formatearEuros(totales.bruto)}
            {totales.comisiones > 0 && (
              <span> · neto {formatearEuros(totales.neto)}</span>
            )}{" "}
            · {formatearEuros(sinCobrar)} sin cobrar
          </p>
        </div>

        <button
          type="button"
          onClick={() => abrirNuevo(diaSeleccionado)}
          className="rounded-lg bg-acento px-3 py-1.5 text-sm font-medium text-white transition hover:bg-acentoSuave"
        >
          Nuevo bolo
        </button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Selector de vista */}
        <nav className="flex gap-1 rounded-xl border border-borde bg-superficie p-1">
          <Link href="/calendario?vista=mes" className={clasesPestana("mes")}>
            Mes
          </Link>
          <Link href="/calendario?vista=semana" className={clasesPestana("semana")}>
            Semana
          </Link>
          <Link href="/calendario?vista=agenda" className={clasesPestana("agenda")}>
            Agenda
          </Link>
        </nav>

        {/* Navegación temporal: la agenda no la necesita */}
        {props.vista !== "agenda" && (
          <div className="flex items-center gap-2">
            <Link
              href={enlaceAtras}
              className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
            >
              Anterior
            </Link>
            <Link
              href={"/calendario?vista=" + props.vista}
              className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
            >
              Hoy
            </Link>
            <Link
              href={enlaceAdelante}
              className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
            >
              Siguiente
            </Link>
          </div>
        )}
      </div>

      {props.vista === "mes" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
          <RejillaMes
            anio={props.anio}
            mes={props.mes}
            hoy={props.hoy}
            diaSeleccionado={diaSeleccionado}
            bolosPorFecha={bolosPorFecha}
            alSeleccionarDia={seleccionarDia}
          />

          <aside className="rounded-2xl border border-borde bg-superficie p-4">
            <h2 className="text-sm font-medium">
              {nombreDiaLargo(diaSeleccionado)}
            </h2>
            <p className="text-xs text-textoSecundario">
              {formatearFechaLarga(diaSeleccionado)}
            </p>

            {bolosDelDia.length === 0 && (
              <p className="mt-4 text-sm text-textoSecundario">
                No hay bolos este día.
              </p>
            )}

            {contarActivos(bolosDelDia) > 1 && (
              <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                Tienes {contarActivos(bolosDelDia)} bolos este mismo día.
                Revisa que te dé tiempo.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {bolosDelDia.map((bolo) => (
                <TarjetaBolo
                  key={bolo.id}
                  bolo={bolo}
                  alPulsar={abrirEdicion}
                  salas={props.salas}
                  mostrarCamino
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => abrirNuevo(diaSeleccionado)}
              className="mt-4 w-full rounded-lg border border-dashed border-borde px-3 py-2 text-sm text-textoSecundario transition hover:border-acento hover:text-textoPrincipal"
            >
              Añadir bolo en este día
            </button>
          </aside>
        </div>
      )}

      {props.vista === "semana" && (
        <RejillaSemana
          lunes={props.lunes}
          hoy={props.hoy}
          bolosPorFecha={bolosPorFecha}
          alPulsarBolo={abrirEdicion}
          alAnadirEnDia={abrirNuevo}
        />
      )}

      {props.vista === "agenda" && (
        <ListaAgenda
          bolos={props.bolos}
          hoy={props.hoy}
          salas={props.salas}
          alPulsarBolo={abrirEdicion}
        />
      )}

      {formularioAbierto === true && (
        <FormularioBolo
          bolo={boloEditando}
          fechaPorDefecto={fechaDelFormulario}
          salas={props.salas}
          alCerrar={cerrarFormulario}
        />
      )}
    </section>
  );
}
