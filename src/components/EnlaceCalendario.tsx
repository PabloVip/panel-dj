"use client";

import { useState, useTransition } from "react";
import { regenerarTokenCalendario } from "@/acciones/salas";

type Propiedades = {
  enlace: string;
};

export default function EnlaceCalendario(props: Propiedades) {
  const [copiado, establecerCopiado] = useState(false);
  const [error, establecerError] = useState("");
  const [confirmando, establecerConfirmando] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();

  // El enlace webcal abre directamente la app Calendario del iPhone
  const enlaceMovil = props.enlace.replace(/^https?:/, "webcal:");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(props.enlace);
      establecerCopiado(true);
      setTimeout(() => establecerCopiado(false), 2500);
    } catch {
      establecerError("No se ha podido copiar. Selecciona el texto a mano.");
    }
  }

  function regenerar() {
    establecerError("");
    iniciarTransicion(async () => {
      const resultado = await regenerarTokenCalendario();
      if (resultado.ok === false) {
        establecerError(resultado.mensaje);
      }
      establecerConfirmando(false);
    });
  }

  let textoCopiar = "Copiar enlace";
  if (copiado === true) {
    textoCopiar = "Copiado";
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="break-all rounded-xl border border-borde bg-fondo p-3 font-mono text-xs text-textoSecundario">
        {props.enlace}
      </p>

      <div className="flex flex-wrap gap-2">
        <a
          href={enlaceMovil}
          className="rounded-lg bg-acento px-3 py-2 text-sm font-medium text-white transition hover:bg-acentoSuave"
        >
          Añadir a mi calendario
        </a>
        <button
          type="button"
          onClick={copiar}
          className="rounded-lg border border-borde px-3 py-2 text-sm text-textoSecundario transition hover:text-textoPrincipal"
        >
          {textoCopiar}
        </button>

        {confirmando === false && (
          <button
            type="button"
            onClick={() => establecerConfirmando(true)}
            className="rounded-lg border border-borde px-3 py-2 text-sm text-textoSecundario transition hover:text-textoPrincipal"
          >
            Cambiar la clave
          </button>
        )}
      </div>

      {confirmando === true && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <p>
            Si cambias la clave, el calendario que ya tengas añadido en el móvil
            dejará de actualizarse y tendrás que añadirlo otra vez.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={regenerar}
              disabled={pendiente}
              className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/30"
            >
              Cambiarla de todos modos
            </button>
            <button
              type="button"
              onClick={() => establecerConfirmando(false)}
              className="rounded-lg px-3 py-1.5 text-xs text-amber-200/70 transition hover:text-amber-100"
            >
              Dejarlo como está
            </button>
          </div>
        </div>
      )}

      {error !== "" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
