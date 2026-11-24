"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Ellipsis, House, ListMusic, Wallet } from "lucide-react";

// En el móvil solo caben cinco. El resto de pantallas vive en "Más".
const ENLACES = [
  { ruta: "/inicio", texto: "Inicio", icono: House },
  { ruta: "/calendario", texto: "Calendario", icono: CalendarDays },
  { ruta: "/bolos", texto: "Bolos", icono: ListMusic },
  { ruta: "/cobros", texto: "Cobros", icono: Wallet },
  { ruta: "/mas", texto: "Más", icono: Ellipsis },
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
    <nav className="vidrio-barra fixed inset-x-3 bottom-[calc(var(--seguro-abajo)+0.5rem)] z-40 mx-auto max-w-md rounded-[1.75rem] p-1.5 sm:hidden">
      <div className="flex gap-1">
        {ENLACES.map((enlace) => {
          const Icono = enlace.icono;

          /* DOCK */
          let clases =
            "flex flex-1 flex-col items-center gap-0.5 rounded-[1.25rem] py-1.5 text-[10px] font-medium transition active:scale-95";

          if (estaActivo(enlace.ruta) === true) {
            clases = clases + " bg-white/15 text-textoPrincipal shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]";
          } else {
            clases = clases + " text-textoSecundario";
          }

          return (
            <Link key={enlace.ruta} href={enlace.ruta} className={clases}>
              <Icono size={21} strokeWidth={1.9} aria-hidden="true" />
              {enlace.texto}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
