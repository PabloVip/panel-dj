// Piezas grises que se enseñan mientras la página carga sus datos.
// Dan la sensación de que la app responde al instante.

export function BarraEsqueleto(props: { ancho: string; alto?: string }) {
  let alto = "h-4";
  if (props.alto !== undefined) {
    alto = props.alto;
  }
  return (
    <span
      className={"block animate-pulse rounded bg-superficieAlta " + alto + " " + props.ancho}
    />
  );
}

export function TarjetaEsqueleto() {
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-5">
      <BarraEsqueleto ancho="w-24" alto="h-3" />
      <div className="mt-3">
        <BarraEsqueleto ancho="w-32" alto="h-7" />
      </div>
      <div className="mt-2">
        <BarraEsqueleto ancho="w-40" alto="h-3" />
      </div>
    </div>
  );
}

export function CabeceraEsqueleto() {
  return (
    <header className="flex flex-col gap-2">
      <BarraEsqueleto ancho="w-52" alto="h-7" />
      <BarraEsqueleto ancho="w-72" alto="h-4" />
    </header>
  );
}

export function FilasEsqueleto(props: { cantidad: number }) {
  const filas = [];
  let contador = 0;
  while (contador < props.cantidad) {
    filas.push(contador);
    contador = contador + 1;
  }

  return (
    <div className="flex flex-col gap-2">
      {filas.map((numero) => (
        <div
          key={numero}
          className="flex items-center justify-between rounded-xl border border-borde bg-superficie p-3"
        >
          <span className="flex w-full flex-col gap-2">
            <BarraEsqueleto ancho="w-1/3" />
            <BarraEsqueleto ancho="w-1/4" alto="h-3" />
          </span>
          <BarraEsqueleto ancho="w-16" />
        </div>
      ))}
    </div>
  );
}
