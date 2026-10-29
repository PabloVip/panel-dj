"use client";

import BotonesDeCamino from "./BotonesDeCamino";
import { formatearEuros, formatearRangoHorario } from "@/lib/formato";
import { clasesEtiquetaEstado, colorEstado, etiquetaEstado } from "@/lib/estados";
import { netoDe, tieneComision } from "@/lib/calculos";
import { direccionDe, telefonoDe } from "@/lib/navegacion";
import type { Bolo, Sala } from "@/lib/tipos";

type Propiedades = {
  bolo: Bolo;
  alPulsar: (bolo: Bolo) => void;
  mostrarEstado?: boolean;
  // En columnas estrechas (vista de semana) el precio va debajo del nombre
  compacta?: boolean;
  // Con las salas se sabe a dónde ir y a quién llamar
  salas?: Sala[];
  mostrarCamino?: boolean;
};

// Tarjeta de un bolo. Se usa en el panel del día, en la semana y en la agenda.
export default function TarjetaBolo(props: Propiedades) {
  let mostrarEstado = true;
  if (props.mostrarEstado === false) {
    mostrarEstado = false;
  }

  const bolo = props.bolo;

  let clasesCabecera = "flex items-start justify-between gap-2";
  let clasesPrecio = "shrink-0 text-sm font-medium text-acentoSuave";

  if (props.compacta === true) {
    clasesCabecera = "flex flex-col gap-0.5";
    clasesPrecio = "text-sm font-medium text-acentoSuave";
  }

  // Datos para ir y para llamar
  let direccion: string | null = null;
  let telefono: string | null = null;
  if (props.mostrarCamino === true && props.salas !== undefined) {
    direccion = direccionDe(bolo, props.salas);
    telefono = telefonoDe(bolo, props.salas);
  }

  return (
    <div className="rounded-xl border border-borde bg-fondo p-2.5 transition hover:border-acento sm:p-3">
      {/* Toda la ficha abre la edición, menos los botones de abajo */}
      <button
        type="button"
        onClick={() => props.alPulsar(bolo)}
        className="w-full text-left"
      >
        <span className={clasesCabecera}>
          <span className="flex items-center gap-2">
            <span
              className={"h-2 w-2 shrink-0 rounded-full " + colorEstado(bolo.estado)}
            />
            <span className="font-medium">{bolo.nombre}</span>
          </span>
          <span className={clasesPrecio}>
            {formatearEuros(Number(bolo.precio))}
            {tieneComision(bolo) === true && (
              <span className="block text-[11px] font-normal text-textoSecundario">
                neto {formatearEuros(netoDe(bolo))}
              </span>
            )}
          </span>
        </span>

        <span className="mt-1 block text-xs text-textoSecundario">
          {formatearRangoHorario(bolo.hora_inicio, bolo.hora_fin)}
          {bolo.ubicacion !== null && " · " + bolo.ubicacion}
        </span>

        <span className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {mostrarEstado === true && (
            <span
              className={
                "rounded px-1.5 py-0.5 " + clasesEtiquetaEstado(bolo.estado)
              }
            >
              {etiquetaEstado(bolo.estado)}
            </span>
          )}

          {bolo.cobrado === true && (
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">
              Cobrado
            </span>
          )}

          {bolo.cobrado === false && bolo.estado !== "cancelado" && (
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300">
              Sin cobrar
            </span>
          )}
        </span>

        {bolo.notas !== null && (
          <span className="mt-2 block text-xs text-textoSecundario">
            {bolo.notas}
          </span>
        )}
      </button>

      <BotonesDeCamino direccion={direccion} telefono={telefono} />
    </div>
  );
}
