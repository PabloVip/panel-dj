import Link from "next/link";

type Propiedades = {
  busqueda: string;
  estado: string;
  cobro: string;
  desde: string;
  hasta: string;
};

// Formulario de filtros. Es un <form> normal que navega por GET,
// así los filtros quedan en la URL y se pueden compartir o guardar.
export default function FiltrosBolos(props: Propiedades) {
  return (
    <form
      method="get"
      action="/bolos"
      className="rounded-2xl border border-borde bg-superficie p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="etiqueta" htmlFor="busqueda">
            Buscar
          </label>
          <input
            id="busqueda"
            name="busqueda"
            className="campo"
            defaultValue={props.busqueda}
            placeholder="Nombre del bolo o sala"
          />
        </div>

        <div>
          <label className="etiqueta" htmlFor="estado">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            className="campo"
            defaultValue={props.estado}
          >
            <option value="">Todos</option>
            <option value="confirmado">Confirmados</option>
            <option value="pendiente">Pendientes</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>

        <div>
          <label className="etiqueta" htmlFor="cobro">
            Cobro
          </label>
          <select id="cobro" name="cobro" className="campo" defaultValue={props.cobro}>
            <option value="">Todos</option>
            <option value="cobrado">Cobrados</option>
            <option value="pendiente">Sin cobrar</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="etiqueta" htmlFor="desde">
              Desde
            </label>
            <input
              id="desde"
              name="desde"
              type="date"
              className="campo"
              defaultValue={props.desde}
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="hasta">
              Hasta
            </label>
            <input
              id="hasta"
              name="hasta"
              type="date"
              className="campo"
              defaultValue={props.hasta}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          className="rounded-lg bg-acento px-4 py-2 text-sm font-medium text-white transition hover:bg-acentoSuave"
        >
          Aplicar
        </button>
        <Link
          href="/bolos"
          className="rounded-lg border border-borde px-3 py-2 text-sm text-textoSecundario transition hover:text-textoPrincipal"
        >
          Limpiar
        </Link>
      </div>
    </form>
  );
}
