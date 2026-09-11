import { formatearEuros, nombreMes } from "@/lib/formato";

export type ResumenMes = {
  mes: number; // 1-12
  bruto: number;
  comisiones: number;
  neto: number;
  bolos: number;
};

type Propiedades = {
  resumen: ResumenMes[];
  anio: number;
  hayComisiones: boolean;
};

// Altura del área de barras. Se trabaja en píxeles y no en porcentajes
// porque dentro de un contenedor flexible los porcentajes no siempre
// tienen una altura contra la que calcularse.
const ALTURA_GRAFICO = 180;
const ALTURA_ETIQUETAS = 24;

// Gráfico de barras de ingresos por mes.
// Es HTML y CSS puro: sin librerías ni JavaScript.
// Cuando hay comisiones, cada barra se parte en dos: lo que te queda
// abajo y lo que se lleva el manager arriba.
export default function GraficoIngresos(props: Propiedades) {
  // El bruto más alto marca la altura de la barra más alta
  let maximo = 0;
  for (const fila of props.resumen) {
    if (fila.bruto > maximo) {
      maximo = fila.bruto;
    }
  }
  if (maximo === 0) {
    maximo = 1;
  }

  return (
    <section className="rounded-2xl border border-borde bg-superficie p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium">Ingresos por mes en {props.anio}</h2>

        {props.hayComisiones === true && (
          <p className="flex items-center gap-3 text-xs text-textoSecundario">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-acento" />
              Lo que te queda
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[#4b4b63]" />
              Comisión
            </span>
          </p>
        )}
      </div>

      <p className="mt-1 text-xs text-textoSecundario">
        Se excluyen los bolos cancelados.
      </p>

      <div
        className="mt-6 flex gap-2"
        style={{ height: ALTURA_GRAFICO + ALTURA_ETIQUETAS + "px" }}
      >
        {props.resumen.map((fila) => {
          // Alturas en píxeles sobre la altura fija del gráfico
          let alturaNeto = Math.round((fila.neto / maximo) * ALTURA_GRAFICO);
          const alturaComision = Math.round(
            (fila.comisiones / maximo) * ALTURA_GRAFICO
          );

          // Altura mínima visible para que un mes con ingresos no desaparezca
          if (fila.neto > 0 && alturaNeto < 3) {
            alturaNeto = 3;
          }

          const descripcion =
            nombreMes(fila.mes) +
            ": " +
            formatearEuros(fila.neto) +
            " netos de " +
            formatearEuros(fila.bruto) +
            " en " +
            fila.bolos +
            " bolos";

          return (
            <div key={fila.mes} className="flex h-full flex-1 flex-col items-center">
              <div
                className="flex w-full flex-1 flex-col justify-end"
                title={descripcion}
                aria-label={descripcion}
              >
                {fila.comisiones > 0 && (
                  <div
                    className="mb-[2px] w-full rounded-t bg-[#4b4b63]"
                    style={{ height: alturaComision + "px" }}
                  />
                )}
                <div
                  className="w-full rounded-t bg-acento"
                  style={{ height: alturaNeto + "px" }}
                />
              </div>
              <span className="mt-2 text-[10px] uppercase text-textoSecundario">
                {nombreMes(fila.mes).slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Misma información en tabla, para leerla con cifras exactas */}
      <div className="overflow-x-auto">
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-textoSecundario">
              <th className="py-2 font-normal">Mes</th>
              <th className="py-2 text-right font-normal">Bolos</th>
              <th className="py-2 text-right font-normal">Bruto</th>
              {props.hayComisiones === true && (
                <th className="hidden py-2 text-right font-normal sm:table-cell">
                  Comisión
                </th>
              )}
              <th className="py-2 text-right font-normal">Neto</th>
            </tr>
          </thead>
          <tbody>
            {props.resumen.map((fila) => {
              if (fila.bolos === 0) {
                return null;
              }
              return (
                <tr key={fila.mes} className="border-t border-borde">
                  <td className="py-2">{nombreMes(fila.mes)}</td>
                  <td className="py-2 text-right text-textoSecundario">
                    {fila.bolos}
                  </td>
                  <td className="py-2 text-right text-textoSecundario">
                    {formatearEuros(fila.bruto)}
                  </td>
                  {props.hayComisiones === true && (
                    <td className="hidden py-2 text-right text-textoSecundario sm:table-cell">
                      {formatearEuros(fila.comisiones)}
                    </td>
                  )}
                  <td className="py-2 text-right">{formatearEuros(fila.neto)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
