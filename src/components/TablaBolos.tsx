"use client";

import { useState } from "react";
import FormularioBolo from "./FormularioBolo";
import {
  formatearEuros,
  formatearFechaCorta,
  formatearRangoHorario,
} from "@/lib/formato";
import { clasesEtiquetaEstado, etiquetaEstado } from "@/lib/estados";
import { netoDe, tieneComision } from "@/lib/calculos";
import type { Bolo, Sala } from "@/lib/tipos";

type Propiedades = {
  bolos: Bolo[];
  hoy: string;
  salas: Sala[];
};

type Campo = "fecha" | "nombre" | "precio" | "estado";

export default function TablaBolos(props: Propiedades) {
  const [campo, establecerCampo] = useState<Campo>("fecha");
  const [descendente, establecerDescendente] = useState(true);
  const [formularioAbierto, establecerFormularioAbierto] = useState(false);
  const [boloEditando, establecerBoloEditando] = useState<Bolo | null>(null);

  function ordenarPor(nuevoCampo: Campo) {
    if (nuevoCampo === campo) {
      establecerDescendente(!descendente);
    } else {
      establecerCampo(nuevoCampo);
      establecerDescendente(true);
    }
  }

  // Copia ordenada: nunca se toca el array que llega del servidor
  const ordenados = props.bolos.slice();
  ordenados.sort((primero, segundo) => {
    let resultado = 0;

    if (campo === "precio") {
      resultado = Number(primero.precio) - Number(segundo.precio);
    } else if (campo === "nombre") {
      resultado = primero.nombre.localeCompare(segundo.nombre, "es");
    } else if (campo === "estado") {
      resultado = primero.estado.localeCompare(segundo.estado, "es");
    } else {
      resultado = primero.fecha.localeCompare(segundo.fecha);
    }

    if (descendente === true) {
      return resultado * -1;
    }
    return resultado;
  });

  function abrirEdicion(bolo: Bolo) {
    establecerBoloEditando(bolo);
    establecerFormularioAbierto(true);
  }

  function abrirNuevo() {
    establecerBoloEditando(null);
    establecerFormularioAbierto(true);
  }

  function cerrarFormulario() {
    establecerFormularioAbierto(false);
    establecerBoloEditando(null);
  }

  // Cabecera de columna que ordena al pulsarla
  function Cabecera(propiedades: {
    titulo: string;
    campoColumna: Campo;
    alineadaDerecha?: boolean;
  }) {
    let clases = "px-3 py-2 text-xs font-normal uppercase tracking-wider";
    if (propiedades.alineadaDerecha === true) {
      clases = clases + " text-right";
    } else {
      clases = clases + " text-left";
    }

    let flecha = "";
    if (campo === propiedades.campoColumna) {
      if (descendente === true) {
        flecha = " ↓";
      } else {
        flecha = " ↑";
      }
    }

    return (
      <th className={clases}>
        <button
          type="button"
          onClick={() => ordenarPor(propiedades.campoColumna)}
          className="text-textoSecundario transition hover:text-textoPrincipal"
        >
          {propiedades.titulo}
          {flecha}
        </button>
      </th>
    );
  }

  if (props.bolos.length === 0) {
    return (
      <div className="rounded-2xl border border-borde bg-superficie p-6">
        <p className="text-sm text-textoSecundario">
          Ningún bolo coincide con estos filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-borde bg-superficie">
      <div className="flex items-center justify-between border-b border-borde px-4 py-3">
        <span className="text-sm text-textoSecundario">
          {props.bolos.length} bolos
        </span>
        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded-lg bg-acento px-3 py-1.5 text-sm font-medium text-white transition hover:bg-acentoSuave"
        >
          Nuevo bolo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-borde">
              <Cabecera titulo="Fecha" campoColumna="fecha" />
              <Cabecera titulo="Bolo" campoColumna="nombre" />
              <th className="px-3 py-2 text-left text-xs font-normal uppercase tracking-wider text-textoSecundario">
                Horario
              </th>
              <Cabecera titulo="Estado" campoColumna="estado" />
              <Cabecera titulo="Precio" campoColumna="precio" alineadaDerecha />
            </tr>
          </thead>

          <tbody>
            {ordenados.map((bolo) => {
              let clasesFila = "border-b border-borde transition hover:bg-superficieAlta";
              if (bolo.fecha === props.hoy) {
                clasesFila = clasesFila + " bg-acento/5";
              }

              return (
                <tr
                  key={bolo.id}
                  className={clasesFila}
                  onClick={() => abrirEdicion(bolo)}
                  role="button"
                >
                  <td className="whitespace-nowrap px-3 py-3 text-textoSecundario">
                    {formatearFechaCorta(bolo.fecha)}
                    <span className="block text-[11px]">
                      {bolo.fecha.slice(0, 4)}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <span className="font-medium">{bolo.nombre}</span>
                    {bolo.ubicacion !== null && (
                      <span className="block text-xs text-textoSecundario">
                        {bolo.ubicacion}
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-textoSecundario">
                    {formatearRangoHorario(bolo.hora_inicio, bolo.hora_fin)}
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={
                        "inline-block rounded px-1.5 py-0.5 text-xs " +
                        clasesEtiquetaEstado(bolo.estado)
                      }
                    >
                      {etiquetaEstado(bolo.estado)}
                    </span>
                    {bolo.cobrado === false && bolo.estado !== "cancelado" && (
                      <span className="mt-1 block text-[11px] text-amber-300">
                        Sin cobrar
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-right font-medium">
                    {formatearEuros(Number(bolo.precio))}
                    {tieneComision(bolo) === true && (
                      <span className="block text-[11px] font-normal text-textoSecundario">
                        neto {formatearEuros(netoDe(bolo))}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {formularioAbierto === true && (
        <FormularioBolo
          bolo={boloEditando}
          fechaPorDefecto={props.hoy}
          salas={props.salas}
          alCerrar={cerrarFormulario}
        />
      )}
    </div>
  );
}
