"use client";

import { useState, useTransition } from "react";
import {
  pagarComision,
  pagarMes,
  quitarPagoComision,
  quitarPagoMes,
} from "@/acciones/manager";
import { comisionDe, comisionPagada } from "@/lib/calculos";
import {
  formatearEuros,
  formatearFechaCorta,
  formatearFechaLarga,
  nombreMes,
} from "@/lib/formato";
import type { MesDelManager } from "@/lib/manager";
import type { Bolo, Resultado } from "@/lib/tipos";

export default function LiquidacionesManager(props: { meses: MesDelManager[] }) {
  const [error, establecerError] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();
  const [enCurso, establecerEnCurso] = useState("");

  // Todas las acciones de esta pantalla funcionan igual: se lanza, se
  // marca cuál está en curso para bloquear los botones, y si falla se
  // enseña el motivo arriba.
  function lanzar(referencia: string, accion: () => Promise<Resultado>) {
    establecerError("");
    establecerEnCurso(referencia);

    iniciarTransicion(async () => {
      const resultado = await accion();
      if (resultado.ok === false) {
        establecerError(resultado.mensaje);
      }
      establecerEnCurso("");
    });
  }

  if (props.meses.length === 0) {
    return (
      <p className="rounded-2xl border border-borde bg-superficie p-6 text-sm text-textoSecundario">
        Ningún bolo lleva comisión de manager, así que no hay nada que
        liquidar. La comisión se pone bolo a bolo, con la casilla del
        formulario.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error !== "" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {props.meses.map((mes) => {
        // --- Etiqueta de estado del mes ---
        let textoEstado = "Pendiente";
        let clasesEstado = "border-amber-500/40 bg-amber-500/10 text-amber-200";

        if (mes.liquidado === true) {
          textoEstado = "Pagado";
          clasesEstado = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
        } else if (mes.pagado > 0) {
          textoEstado = "A medias";
        }

        if (mes.ultimoPago !== null && mes.liquidado === true) {
          textoEstado = "Pagado el " + diaYMes(mes.ultimoPago);
        }

        // --- Importe que se destaca: lo que se debe, o lo que se pagó ---
        let importe = mes.pendiente;
        let clasesImporte = "text-amber-300";
        let detalleImporte = "de comisión, sin pagar";

        if (mes.pendiente <= 0) {
          importe = mes.comision;
          clasesImporte = "text-textoSecundario";
          detalleImporte = "de comisión, ya pagada";
        } else if (mes.pagado > 0) {
          detalleImporte = "sin pagar de " + formatearEuros(mes.comision);
        }

        // --- Botón del mes ---
        let textoBoton = "Dar el mes por pagado";
        let clasesBoton =
          "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10";
        let accionDelMes = function () {
          return pagarMes(mes.clave);
        };

        if (mes.pendiente <= 0) {
          textoBoton = "Deshacer";
          clasesBoton = "border-borde text-textoSecundario hover:text-textoPrincipal";
          accionDelMes = function () {
            return quitarPagoMes(mes.clave);
          };
        }

        if (pendiente === true && enCurso === mes.clave) {
          textoBoton = "Guardando...";
        }

        let textoCantidad = mes.bolos.length + " bolos con comisión";
        if (mes.bolos.length === 1) {
          textoCantidad = "1 bolo con comisión";
        }

        return (
          <article
            key={mes.clave}
            className="rounded-2xl border border-borde bg-superficie p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{mes.titulo}</p>
                <p className="mt-0.5 text-xs text-textoSecundario">
                  {textoCantidad} · {formatearEuros(mes.bruto)} facturados
                </p>
                <span
                  className={
                    "mt-2 inline-block rounded-md border px-2 py-0.5 text-[11px] " +
                    clasesEstado
                  }
                >
                  {textoEstado}
                </span>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-right">
                  <span className={"block text-lg font-semibold " + clasesImporte}>
                    {formatearEuros(importe)}
                  </span>
                  <span className="block text-[11px] text-textoSecundario">
                    {detalleImporte}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => lanzar(mes.clave, accionDelMes)}
                  disabled={pendiente}
                  className={
                    "whitespace-nowrap rounded-lg border px-3 py-2 text-xs transition disabled:opacity-60 " +
                    clasesBoton
                  }
                >
                  {textoBoton}
                </button>
              </div>
            </div>

            <details className="mt-3 border-t border-borde pt-3">
              <summary className="cursor-pointer text-xs text-textoSecundario">
                Ver los bolos de {mes.titulo.toLowerCase()}
              </summary>

              <ul className="mt-3 flex flex-col gap-2">
                {mes.bolos.map((bolo) => (
                  <FilaBolo
                    key={bolo.id}
                    bolo={bolo}
                    bloqueado={pendiente}
                    enCurso={enCurso}
                    alPulsar={lanzar}
                  />
                ))}
              </ul>
            </details>
          </article>
        );
      })}
    </div>
  );
}

// Una línea del desglose: el bolo, su comisión y su tick
function FilaBolo(props: {
  bolo: Bolo;
  bloqueado: boolean;
  enCurso: string;
  alPulsar: (referencia: string, accion: () => Promise<Resultado>) => void;
}) {
  const bolo = props.bolo;
  const pagada = comisionPagada(bolo);

  let textoBoton = "Pagar";
  let clasesBoton = "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10";
  let titulo = "Apuntar que le has pagado esta comisión";
  let accion = function () {
    return pagarComision(bolo.id);
  };

  if (pagada === true) {
    textoBoton = "✓ Pagada";
    clasesBoton = "border-borde text-textoSecundario hover:text-textoPrincipal";
    titulo = "Pagada el " + fechaDelPago(bolo.comision_pagada_el) + ". Pulsa para deshacer.";
    accion = function () {
      return quitarPagoComision(bolo.id);
    };
  }

  if (props.bloqueado === true && props.enCurso === bolo.id) {
    textoBoton = "...";
  }

  let clasesComision = "text-amber-300";
  if (pagada === true) {
    clasesComision = "text-textoSecundario";
  }

  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="min-w-0">
        <span className="block truncate">{bolo.nombre}</span>
        <span className="block text-[11px] text-textoSecundario">
          {formatearFechaCorta(bolo.fecha)} · {formatearEuros(Number(bolo.precio))} ·{" "}
          {Number(bolo.comision_porcentaje)}%
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-3">
        <span className={clasesComision}>{formatearEuros(comisionDe(bolo))}</span>
        <button
          type="button"
          title={titulo}
          onClick={() => props.alPulsar(bolo.id, accion)}
          disabled={props.bloqueado}
          className={
            "whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] transition disabled:opacity-60 " +
            clasesBoton
          }
        >
          {textoBoton}
        </button>
      </span>
    </li>
  );
}

// "2026-09-05" -> "5 sep", que es lo que cabe en la etiqueta del mes
function diaYMes(fecha: string): string {
  const dia = Number(fecha.slice(8, 10));
  const mes = Number(fecha.slice(5, 7));
  return dia + " " + nombreMes(mes).slice(0, 3).toLowerCase();
}

// La fecha larga para el aviso al pasar el ratón por encima
function fechaDelPago(fecha: string | null): string {
  if (fecha === null) {
    return "";
  }
  return formatearFechaLarga(fecha);
}
