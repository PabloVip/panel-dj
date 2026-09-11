"use client";

import { useState, useTransition } from "react";
import { guardarSala, borrarSala } from "@/acciones/salas";
import type { Sala } from "@/lib/tipos";

type Propiedades = {
  sala: Sala | null;
  alCerrar: () => void;
};

export default function FormularioSala(props: Propiedades) {
  const [error, establecerError] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();
  const [conComision, establecerConComision] = useState(() => {
    if (props.sala === null) {
      return false;
    }
    return Number(props.sala.comision_porcentaje) > 0;
  });

  function enviar(datos: FormData) {
    establecerError("");
    iniciarTransicion(async () => {
      const resultado = await guardarSala(datos);
      if (resultado.ok === true) {
        props.alCerrar();
      } else {
        establecerError(resultado.mensaje);
      }
    });
  }

  function alBorrar() {
    if (props.sala === null) {
      return;
    }
    const identificador = props.sala.id;

    establecerError("");
    iniciarTransicion(async () => {
      const resultado = await borrarSala(identificador);
      if (resultado.ok === true) {
        props.alCerrar();
      } else {
        establecerError(resultado.mensaje);
      }
    });
  }

  let valorNombre = "";
  let valorContacto = "";
  let valorTelefono = "";
  let valorCache = "";
  let valorComision = "20";
  let valorNotas = "";
  let titulo = "Nueva sala";

  if (props.sala !== null) {
    valorNombre = props.sala.nombre;
    valorContacto = props.sala.contacto ?? "";
    valorTelefono = props.sala.telefono ?? "";
    valorCache = String(props.sala.cache_habitual);
    valorNotas = props.sala.notas ?? "";
    titulo = "Editar sala";

    if (Number(props.sala.comision_porcentaje) > 0) {
      valorComision = String(props.sala.comision_porcentaje);
    }
  }

  let textoBoton = "Guardar";
  if (pendiente === true) {
    textoBoton = "Guardando...";
  }

  return (
    <div className="ventana-emergente fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4">
      <section className="my-4 w-full max-w-lg rounded-2xl border border-borde bg-superficie p-6 sm:my-8">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={props.alCerrar}
            className="rounded-lg px-2 py-1 text-textoSecundario transition hover:text-textoPrincipal"
          >
            Cerrar
          </button>
        </header>

        <form action={enviar} className="flex flex-col gap-4">
          {props.sala !== null && (
            <input type="hidden" name="id" value={props.sala.id} />
          )}

          <div>
            <label className="etiqueta" htmlFor="nombre">
              Sala o sitio
            </label>
            <input
              id="nombre"
              name="nombre"
              className="campo"
              defaultValue={valorNombre}
              placeholder="La Murada"
              required
            />
            <p className="mt-1 text-xs text-textoSecundario">
              Escríbelo igual que en la ubicación de los bolos, así se cruzan
              con el histórico.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="contacto">
                Contacto
              </label>
              <input
                id="contacto"
                name="contacto"
                className="campo"
                defaultValue={valorContacto}
                placeholder="Koko"
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="telefono">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                className="campo"
                defaultValue={valorTelefono}
                placeholder="600 000 000"
              />
            </div>
          </div>

          <div>
            <label className="etiqueta" htmlFor="cache_habitual">
              Caché habitual (€)
            </label>
            <input
              id="cache_habitual"
              name="cache_habitual"
              type="number"
              step="0.01"
              min="0"
              className="campo"
              defaultValue={valorCache}
              placeholder="200"
            />
            <p className="mt-1 text-xs text-textoSecundario">
              Se usa para rellenar el precio al crear un bolo aquí.
            </p>
          </div>

          <div className="rounded-xl border border-borde p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={conComision}
                onChange={(evento) => establecerConComision(evento.target.checked)}
                className="h-4 w-4 accent-[#8b5cf6]"
              />
              Los bolos de esta sala llevan comisión
            </label>

            {conComision === true && (
              <div className="mt-3 w-28">
                <label className="etiqueta" htmlFor="comision_porcentaje">
                  Porcentaje
                </label>
                <input
                  id="comision_porcentaje"
                  name="comision_porcentaje"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  className="campo"
                  defaultValue={valorComision}
                />
              </div>
            )}
          </div>

          <div>
            <label className="etiqueta" htmlFor="notas">
              Notas
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={3}
              className="campo"
              defaultValue={valorNotas}
              placeholder="Equipo de la sala, aparcamiento, horario de prueba de sonido..."
            />
          </div>

          {error !== "" && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <span>
              {props.sala !== null && (
                <button
                  type="button"
                  onClick={alBorrar}
                  disabled={pendiente}
                  className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                >
                  Borrar
                </button>
              )}
            </span>

            <button
              type="submit"
              disabled={pendiente}
              className="rounded-lg bg-acento px-4 py-2 font-medium text-white transition hover:bg-acentoSuave disabled:opacity-60"
            >
              {textoBoton}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
