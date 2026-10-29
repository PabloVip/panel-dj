"use client";

import { NOMBRES_DIAS, claveFecha, construirSemanas } from "@/lib/formato";
import { colorEstado } from "@/lib/estados";
import type { Bolo } from "@/lib/tipos";

type Propiedades = {
  anio: number;
  mes: number;
  hoy: string;
  diaSeleccionado: string;
  bolosPorFecha: Map<string, Bolo[]>;
  alSeleccionarDia: (fecha: string) => void;
};

// Rejilla clásica de mes: siete columnas y una fila por semana
export default function RejillaMes(props: Propiedades) {
  const semanas = construirSemanas(props.anio, props.mes);

  return (
    <div className="overflow-hidden rounded-2xl border border-borde bg-superficie">
      <div className="grid grid-cols-7 border-b border-borde">
        {NOMBRES_DIAS.map((dia) => (
          <span
            key={dia}
            className="px-1 py-2 text-center text-[11px] uppercase tracking-wider text-textoSecundario"
          >
            {dia}
          </span>
        ))}
      </div>

      <div>
        {semanas.map((semana, indiceSemana) => (
          <div key={indiceSemana} className="grid grid-cols-7">
            {semana.map((dia, indiceDia) => {
              if (dia === null) {
                return (
                  <span
                    key={indiceDia}
                    className="min-h-[70px] border-b border-r border-borde bg-fondo/40 sm:min-h-[86px]"
                  />
                );
              }

              const fecha = claveFecha(props.anio, props.mes, dia);
              let bolosDelDia = props.bolosPorFecha.get(fecha);
              if (bolosDelDia === undefined) {
                bolosDelDia = [];
              }

              let clasesCelda =
                "min-h-[70px] border-b border-r border-borde p-1 text-left align-top transition hover:bg-superficieAlta sm:min-h-[86px] sm:p-1.5";

              if (fecha === props.diaSeleccionado) {
                clasesCelda = clasesCelda + " bg-superficieAlta";
              }

              let clasesNumero =
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs";

              if (fecha === props.hoy) {
                clasesNumero = clasesNumero + " bg-acento text-white";
              } else {
                clasesNumero = clasesNumero + " text-textoSecundario";
              }

              return (
                <button
                  key={indiceDia}
                  type="button"
                  onClick={() => props.alSeleccionarDia(fecha)}
                  className={clasesCelda}
                >
                  <span className={clasesNumero}>{dia}</span>

                  {/* En móvil solo se pintan puntos; a partir de sm se ven los nombres */}
                  <span className="mt-1 flex gap-0.5 sm:hidden">
                    {bolosDelDia.slice(0, 3).map((bolo) => (
                      <span
                        key={bolo.id}
                        className={
                          "h-1.5 w-1.5 rounded-full " + colorEstado(bolo.estado)
                        }
                      />
                    ))}
                  </span>

                  <span className="mt-1 hidden flex-col gap-1 sm:flex">
                    {bolosDelDia.slice(0, 2).map((bolo) => (
                      <span
                        key={bolo.id}
                        className="flex items-center gap-1 truncate rounded bg-fondo px-1 py-0.5 text-[11px] text-textoPrincipal"
                      >
                        <span
                          className={
                            "h-1.5 w-1.5 shrink-0 rounded-full " +
                            colorEstado(bolo.estado)
                          }
                        />
                        <span className="truncate">{bolo.nombre}</span>
                      </span>
                    ))}

                    {bolosDelDia.length > 2 && (
                      <span className="text-[11px] text-textoSecundario">
                        +{bolosDelDia.length - 2} más
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
