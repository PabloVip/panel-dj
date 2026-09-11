import {
  CabeceraEsqueleto,
  FilasEsqueleto,
  TarjetaEsqueleto,
} from "@/components/Esqueleto";

export default function CargandoInicio() {
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
        <FilasEsqueleto cantidad={4} />
      </div>
    </section>
  );
}
