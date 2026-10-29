import {
  BarraEsqueleto,
  CabeceraEsqueleto,
  FilasEsqueleto,
} from "@/components/Esqueleto";

export default function CargandoBolos() {
  return (
    <section className="flex flex-col gap-5">
      <CabeceraEsqueleto />

      <div className="rounded-2xl border border-borde bg-superficie p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <BarraEsqueleto ancho="w-full" alto="h-10" />
          <BarraEsqueleto ancho="w-full" alto="h-10" />
          <BarraEsqueleto ancho="w-full" alto="h-10" />
          <BarraEsqueleto ancho="w-full" alto="h-10" />
          <BarraEsqueleto ancho="w-full" alto="h-10" />
        </div>
      </div>

      <FilasEsqueleto cantidad={8} />
    </section>
  );
}
