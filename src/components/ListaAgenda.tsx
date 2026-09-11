"use client";

import TarjetaBolo from "./TarjetaBolo";
import { formatearFechaLarga, nombreDiaLargo, textoRelativo } from "@/lib/formato";
import type { Bolo } from "@/lib/tipos";

type Propiedades = {
  bolos: Bolo[];
  hoy: string;
  alPulsarBolo: (bolo: Bolo) => void;
};

// Agenda: los próximos bolos en orden cronológico, agrupados por día
export default function ListaAgenda(props: Propiedades) {
  if (props.bolos.length === 0) {
    return (
      <p className="rounded-2xl border border-borde bg-superficie p-6 text-sm text-textoSecundario">
        No hay bolos por delante. Añade uno desde el calendario.
      </p>
    );
  }

  // Se ordena aquí también por si la lista llega sin ordenar
  const ordenados = props.bolos.slice();
  ordenados.sort((primero, segundo) => {
    if (primero.fecha !== segundo.fecha) {
      return primero.fecha.localeCompare(segundo.fecha);
    }
    const horaPrimero = primero.hora_inicio ?? "";
    const horaSegundo = segundo.hora_inicio ?? "";
    return horaPrimero.localeCompare(horaSegundo);
  });

  const fechas: string[] = [];
  const porFecha = new Map<string, Bolo[]>();

  for (const bolo of ordenados) {
    const lista = porFecha.get(bolo.fecha);
    if (lista === undefined) {
      porFecha.set(bolo.fecha, [bolo]);
      fechas.push(bolo.fecha);
    } else {
      lista.push(bolo);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {fechas.map((fecha) => {
        let bolosDelDia = porFecha.get(fecha);
        if (bolosDelDia === undefined) {
          bolosDelDia = [];
        }

        return (
          <section key={fecha}>
            <header className="mb-2 flex flex-wrap items-baseline gap-2">
              <h3 className="font-medium">
                {nombreDiaLargo(fecha)}, {formatearFechaLarga(fecha)}
              </h3>
              <span className="rounded bg-superficieAlta px-1.5 py-0.5 text-[11px] text-textoSecundario">
                {textoRelativo(fecha, props.hoy)}
              </span>
            </header>

            <div className="flex flex-col gap-2">
              {bolosDelDia.map((bolo) => (
                <TarjetaBolo
                  key={bolo.id}
                  bolo={bolo}
                  alPulsar={props.alPulsarBolo}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
