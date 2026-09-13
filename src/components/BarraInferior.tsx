"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// En el móvil solo caben cinco. El resto de pantallas vive en "Más".
const ENLACES = [
  { ruta: "/inicio", texto: "Inicio", icono: "◆" },
  { ruta: "/calendario", texto: "Calendario", icono: "▦" },
  { ruta: "/bolos", texto: "Bolos", icono: "☰" },
  { ruta: "/cobros", texto: "Cobros", icono: "€" },
  { ruta: "/mas", texto: "Más", icono: "⋯" },
];

// Pantallas que se consideran parte de "Más"
const RUTAS_DE_MAS = ["/mas", "/manager", "/salas", "/estadisticas", "/ajustes"];

export default function BarraInferior() {
  const rutaActual = usePathname();

  function estaActivo(ruta: string): boolean {
    if (ruta === "/mas") {
      for (const posible of RUTAS_DE_MAS) {
        if (rutaActual.startsWith(posible) === true) {
          return true;
        }
      }
      return false;
    }
    return rutaActual.startsWith(ruta);
  }

  return (
    <nav className="zona-segura-abajo fixed bottom-0 left-0 right-0 z-40 border-t border-borde bg-superficie sm:hidden">
      <div className="flex">
        {ENLACES.map((enlace) => {
          let clases =
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition";

          if (estaActivo(enlace.ruta) === true) {
            clases = clases + " text-acentoSuave";
          } else {
            clases = clases + " text-textoSecundario";
          }

          return (
            <Link key={enlace.ruta} href={enlace.ruta} className={clases}>
              <span className="text-base leading-none">{enlace.icono}</span>
              {enlace.texto}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
