"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChartColumn,
  Handshake,
  House,
  ListMusic,
  Settings,
  Wallet,
} from "lucide-react";

const ENLACES = [
  { ruta: "/inicio", texto: "Inicio", icono: House },
  { ruta: "/calendario", texto: "Calendario", icono: CalendarDays },
  { ruta: "/bolos", texto: "Bolos", icono: ListMusic },
  { ruta: "/cobros", texto: "Cobros", icono: Wallet },
  { ruta: "/manager", texto: "Manager", icono: Handshake },
  { ruta: "/salas", texto: "Salas", icono: Building2 },
  { ruta: "/estadisticas", texto: "Estadísticas", icono: ChartColumn },
  { ruta: "/ajustes", texto: "Ajustes", icono: Settings },
];

export default function NavegacionPrivada() {
  const rutaActual = usePathname();

  return (
    <nav className="sin-barra flex items-center gap-1 overflow-x-auto">
      {ENLACES.map((enlace) => {
        const Icono = enlace.icono;
        const activo = rutaActual.startsWith(enlace.ruta);

        let clases =
          "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition";

        /* PASTILLA ACTIVA */
        let clasesTexto = "hidden xl:inline";
        if (activo === true) {
          clases = clases + " border-white/80 bg-white font-medium text-[#0d0b1a] shadow-[0_6px_18px_-8px_rgba(255,255,255,0.6)]";
          clasesTexto = "inline";
        } else {
          clases =
            clases +
            " border-white/10 bg-white/5 text-textoSecundario hover:bg-white/10 hover:text-textoPrincipal";
        }

        return (
          <Link
            key={enlace.ruta}
            href={enlace.ruta}
            className={clases}
            title={enlace.texto}
            aria-label={enlace.texto}
          >
            <Icono size={16} strokeWidth={2} aria-hidden="true" />
            <span className={clasesTexto}>{enlace.texto}</span>
          </Link>
        );
      })}
    </nav>
  );
}
