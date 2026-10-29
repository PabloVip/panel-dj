import { BarraEsqueleto, CabeceraEsqueleto, TarjetaEsqueleto } from "@/components/Esqueleto";

export default function CargandoEstadisticas() {
  return (
    <section className="flex flex-col gap-6">
      <CabeceraEsqueleto />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaEsqueleto />
        <TarjetaEsqueleto />
        <TarjetaEsqueleto />
        <TarjetaEsqueleto />
      </div>

      <div className="rounded-2xl border border-borde bg-superficie p-5">
        <BarraEsqueleto ancho="w-48" alto="h-4" />
        <div className="mt-6">
          <BarraEsqueleto ancho="w-full" alto="h-52" />
        </div>
      </div>
    </section>
  );
}
