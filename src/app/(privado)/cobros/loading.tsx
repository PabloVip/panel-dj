import {
  CabeceraEsqueleto,
  FilasEsqueleto,
  TarjetaEsqueleto,
} from "@/components/Esqueleto";

export default function CargandoCobros() {
  return (
    <section className="flex flex-col gap-6">
      <CabeceraEsqueleto />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TarjetaEsqueleto />
        <TarjetaEsqueleto />
        <TarjetaEsqueleto />
      </div>

      <FilasEsqueleto cantidad={5} />
    </section>
  );
}
