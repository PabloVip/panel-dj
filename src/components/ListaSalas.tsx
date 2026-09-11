"use client";

import { useState } from "react";
import Link from "next/link";
import FormularioSala from "./FormularioSala";
import { formatearEuros, formatearFechaCorta } from "@/lib/formato";
import type { Sala } from "@/lib/tipos";

export type ResumenSala = {
  bolos: number;
  neto: number;
  ultimo: string | null;
  // Horas y dinero de los bolos con horario apuntado, para el precio por hora
  horas: number;
  netoPorHoras: number;
};

type Propiedades = {
  salas: Sala[];
  // Histórico por sala, con el nombre en minúsculas como clave
  resumenes: Record<string, ResumenSala>;
};

export default function ListaSalas(props: Propiedades) {
  const [formularioAbierto, establecerFormularioAbierto] = useState(false);
  const [salaEditando, establecerSalaEditando] = useState<Sala | null>(null);
  const [busqueda, establecerBusqueda] = useState("");

  function abrirNueva() {
    establecerSalaEditando(null);
    establecerFormularioAbierto(true);
  }

  function abrirEdicion(sala: Sala) {
    establecerSalaEditando(sala);
    establecerFormularioAbierto(true);
  }

  function cerrarFormulario() {
    establecerFormularioAbierto(false);
    establecerSalaEditando(null);
  }

  // Filtro rápido por nombre o contacto
  const visibles = [];
  const textoBuscado = busqueda.trim().toLowerCase();
  for (const sala of props.salas) {
    if (textoBuscado === "") {
      visibles.push(sala);
      continue;
    }
    const contacto = sala.contacto ?? "";
    if (
      sala.nombre.toLowerCase().includes(textoBuscado) ||
      contacto.toLowerCase().includes(textoBuscado)
    ) {
      visibles.push(sala);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="campo sm:max-w-xs"
          value={busqueda}
          onChange={(evento) => establecerBusqueda(evento.target.value)}
          placeholder="Buscar sala o contacto"
        />
        <button
          type="button"
          onClick={abrirNueva}
          className="rounded-lg bg-acento px-3 py-2 text-sm font-medium text-white transition hover:bg-acentoSuave"
        >
          Nueva sala
        </button>
      </div>

      {visibles.length === 0 && (
        <p className="rounded-2xl border border-borde bg-superficie p-6 text-sm text-textoSecundario">
          No hay salas que coincidan.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((sala) => {
          let resumen = props.resumenes[sala.nombre.toLowerCase()];
          if (resumen === undefined) {
            resumen = { bolos: 0, neto: 0, ultimo: null, horas: 0, netoPorHoras: 0 };
          }

          let media = 0;
          if (resumen.bolos > 0) {
            media = resumen.neto / resumen.bolos;
          }

          // Lo que te han pagado de verdad por hora en esta sala
          let precioPorHora = 0;
          if (resumen.horas > 0) {
            precioPorHora = resumen.netoPorHoras / resumen.horas;
          }

          return (
            <article
              key={sala.id}
              className="flex flex-col rounded-2xl border border-borde bg-superficie p-4"
            >
              <header className="flex items-start justify-between gap-2">
                <h2 className="font-medium">{sala.nombre}</h2>
                <button
                  type="button"
                  onClick={() => abrirEdicion(sala)}
                  className="shrink-0 rounded-lg border border-borde px-2 py-1 text-xs text-textoSecundario transition hover:text-textoPrincipal"
                >
                  Editar
                </button>
              </header>

              {sala.contacto !== null && (
                <p className="mt-1 text-sm text-textoSecundario">
                  {sala.contacto}
                  {sala.telefono !== null && " · " + sala.telefono}
                </p>
              )}
              {sala.contacto === null && sala.telefono !== null && (
                <p className="mt-1 text-sm text-textoSecundario">{sala.telefono}</p>
              )}

              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-textoSecundario">
                <span>
                  <dt className="inline">Caché: </dt>
                  <dd className="inline text-acentoSuave">
                    {formatearEuros(Number(sala.cache_habitual))}
                  </dd>
                </span>
                {precioPorHora > 0 && (
                  <span>
                    <dt className="inline">Por hora: </dt>
                    <dd className="inline text-acentoSuave">
                      {formatearEuros(precioPorHora)}/h
                    </dd>
                  </span>
                )}
                {Number(sala.comision_porcentaje) > 0 && (
                  <span>
                    <dt className="inline">Comisión: </dt>
                    <dd className="inline">{Number(sala.comision_porcentaje)}%</dd>
                  </span>
                )}
              </dl>

              <div className="mt-3 rounded-xl bg-fondo p-3 text-xs">
                {resumen.bolos === 0 && (
                  <p className="text-textoSecundario">Todavía sin bolos aquí.</p>
                )}

                {resumen.bolos > 0 && (
                  <p className="text-textoSecundario">
                    <span className="text-textoPrincipal">{resumen.bolos} bolos</span> ·{" "}
                    {formatearEuros(resumen.neto)} netos · media{" "}
                    {formatearEuros(media)}
                    {resumen.ultimo !== null && (
                      <span className="mt-1 block">
                        Último: {formatearFechaCorta(resumen.ultimo)}{" "}
                        {resumen.ultimo.slice(0, 4)}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {sala.notas !== null && (
                <p className="mt-3 text-xs text-textoSecundario">{sala.notas}</p>
              )}

              <Link
                href={"/bolos?busqueda=" + encodeURIComponent(sala.nombre)}
                className="mt-3 text-xs text-acentoSuave transition hover:underline"
              >
                Ver sus bolos
              </Link>
            </article>
          );
        })}
      </div>

      {formularioAbierto === true && (
        <FormularioSala sala={salaEditando} alCerrar={cerrarFormulario} />
      )}
    </section>
  );
}
