import { BarraEsqueleto, CabeceraEsqueleto } from "@/components/Esqueleto";

export default function CargandoCalendario() {
  const celdas = [];
  let contador = 0;
  while (contador < 35) {
    celdas.push(contador);
    contador = contador + 1;
  }

  return (
    <section className="flex flex-col gap-5">
      <CabeceraEsqueleto />

      <div className="flex items-center justify-between">
        <BarraEsqueleto ancho="w-52" alto="h-9" />
        <BarraEsqueleto ancho="w-40" alto="h-9" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-borde bg-superficie p-2">
          <div className="grid grid-cols-7 gap-1">
            {celdas.map((numero) => (
              <span
                key={numero}
                className="h-[70px] animate-pulse rounded bg-superficieAlta sm:h-[86px]"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-borde bg-superficie p-4">
          <BarraEsqueleto ancho="w-32" alto="h-4" />
          <div className="mt-4">
            <BarraEsqueleto ancho="w-full" alto="h-20" />
          </div>
        </div>
      </div>
    </section>
  );
}
