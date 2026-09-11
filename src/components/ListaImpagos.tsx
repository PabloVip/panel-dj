"use client";

import { useState, useTransition } from "react";
import { marcarCobrado } from "@/acciones/bolos";
import {
  diasDeDiferencia,
  formatearEuros,
  formatearFechaCorta,
} from "@/lib/formato";
import { netoDe, tieneComision } from "@/lib/calculos";
import type { Bolo } from "@/lib/tipos";

type Propiedades = {
  bolos: Bolo[];
  hoy: string;
  // En los impagos se muestran los días que llevan sin pagar
  mostrarAntiguedad: boolean;
  textoVacio: string;
};

export default function ListaImpagos(props: Propiedades) {
  const [error, establecerError] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();
  const [enCurso, establecerEnCurso] = useState("");

  function cobrar(id: string) {
    establecerError("");
    establecerEnCurso(id);

    iniciarTransicion(async () => {
      const resultado = await marcarCobrado(id);
      if (resultado.ok === false) {
        establecerError(resultado.mensaje);
      }
      establecerEnCurso("");
    });
  }

  if (props.bolos.length === 0) {
    return (
      <p className="rounded-2xl border border-borde bg-superficie p-6 text-sm text-textoSecundario">
        {props.textoVacio}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error !== "" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {props.bolos.map((bolo) => {
        const dias = diasDeDiferencia(bolo.fecha, props.hoy);

        // Cuanto más antiguo es el impago, más se destaca
        let clasesAntiguedad = "text-textoSecundario";
        if (dias > 60) {
          clasesAntiguedad = "text-red-300";
        } else if (dias > 30) {
          clasesAntiguedad = "text-amber-300";
        }

        let textoBoton = "Marcar cobrado";
        if (pendiente === true && enCurso === bolo.id) {
          textoBoton = "Guardando...";
        }

        return (
          <article
            key={bolo.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borde bg-superficie p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{bolo.nombre}</p>
              <p className="text-xs text-textoSecundario">
                {formatearFechaCorta(bolo.fecha)} {bolo.fecha.slice(0, 4)}
                {bolo.ubicacion !== null && " · " + bolo.ubicacion}
              </p>
              {props.mostrarAntiguedad === true && (
                <p className={"mt-1 text-xs " + clasesAntiguedad}>
                  {dias} días esperando el pago
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-right font-medium text-acentoSuave">
                {formatearEuros(Number(bolo.precio))}
                {tieneComision(bolo) === true && (
                  <span className="block text-[11px] font-normal text-textoSecundario">
                    neto {formatearEuros(netoDe(bolo))}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => cobrar(bolo.id)}
                disabled={pendiente}
                className="rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-60"
              >
                {textoBoton}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
