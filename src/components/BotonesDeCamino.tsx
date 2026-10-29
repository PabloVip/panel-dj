"use client";

import { enlaceMapa, enlaceTelefono } from "@/lib/navegacion";

type Propiedades = {
  direccion: string | null;
  telefono: string | null;
};

// Los dos botones que se usan de camino al bolo: navegar y llamar.
// Son enlaces normales para que el móvil los abra con sus propias apps.
export default function BotonesDeCamino(props: Propiedades) {
  if (props.direccion === null && props.telefono === null) {
    return null;
  }

  return (
    <span className="mt-3 flex flex-wrap gap-2">
      {props.direccion !== null && (
        <a
          href={enlaceMapa(props.direccion)}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-acento/50 bg-acento/10 px-3 py-1.5 text-xs text-acentoSuave transition hover:bg-acento/20"
        >
          Cómo llegar
        </a>
      )}

      {props.telefono !== null && (
        <a
          href={enlaceTelefono(props.telefono)}
          className="rounded-lg border border-borde px-3 py-1.5 text-xs text-textoSecundario transition hover:text-textoPrincipal"
        >
          Llamar
        </a>
      )}
    </span>
  );
}
