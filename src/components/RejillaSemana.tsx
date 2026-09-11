"use client";

import TarjetaBolo from "./TarjetaBolo";
import { NOMBRES_DIAS, diasDeLaSemana, indiceDiaSemana } from "@/lib/formato";
import type { Bolo } from "@/lib/tipos";

type Propiedades = {
  lunes: string;
  hoy: string;
  bolosPorFecha: Map<string, Bolo[]>;
  alPulsarBolo: (bolo: Bolo) => void;
  alAnadirEnDia: (fecha: string) => void;
};

// Vista de semana: una columna por día con los bolos completos dentro
export default function RejillaSemana(props: Propiedades) {
  const dias = diasDeLaSemana(props.lunes);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {dias.map((fecha) => {
        let bolosDelDia = props.bolosPorFecha.get(fecha);
        if (bolosDelDia === undefined) {
          bolosDelDia = [];
        }

        const numeroDia = Number(fecha.slice(8, 10));

        // En móvil cada día ocupa lo que necesite; en pantalla grande
        // se igualan las alturas para que la semana se lea como una rejilla
        let clasesColumna =
          "flex flex-col rounded-2xl border border-borde bg-superficie p-2 lg:min-h-[150px]";

        if (fecha === props.hoy) {
          clasesColumna = clasesColumna + " border-acento";
        }

        return (
          <section key={fecha} className={clasesColumna}>
            <header className="mb-2 flex items-baseline justify-between px-1">
              <span className="text-[11px] uppercase tracking-wider text-textoSecundario">
                {NOMBRES_DIAS[indiceDiaSemana(fecha)]}
              </span>
              <span className="text-sm font-medium">{numeroDia}</span>
            </header>

            <div className="flex flex-1 flex-col gap-2">
              {bolosDelDia.map((bolo) => (
                <TarjetaBolo
                  key={bolo.id}
                  bolo={bolo}
                  alPulsar={props.alPulsarBolo}
                  mostrarEstado={false}
                  compacta
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => props.alAnadirEnDia(fecha)}
              className="mt-2 rounded-lg border border-dashed border-borde py-1 text-xs text-textoSecundario transition hover:border-acento hover:text-textoPrincipal"
            >
              + Añadir
            </button>
          </section>
        );
      })}
    </div>
  );
}
