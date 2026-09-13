"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { ruta: "/inicio", texto: "Inicio" },
  { ruta: "/calendario", texto: "Calendario" },
  { ruta: "/bolos", texto: "Bolos" },
  { ruta: "/cobros", texto: "Cobros" },
  { ruta: "/manager", texto: "Manager" },
  { ruta: "/salas", texto: "Salas" },
  { ruta: "/estadisticas", texto: "Estadísticas" },
  { ruta: "/ajustes", texto: "Ajustes" },
];

export default function NavegacionPrivada() {
  const rutaActual = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {ENLACES.map((enlace) => {
        let clases =
          "whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-superficieAlta";

        if (rutaActual.startsWith(enlace.ruta) === true) {
          clases = clases + " bg-superficieAlta text-textoPrincipal";
        } else {
          clases = clases + " text-textoSecundario";
        }

        return (
          <Link key={enlace.ruta} href={enlace.ruta} className={clases}>
            {enlace.texto}
          </Link>
        );
      })}
    </nav>
  );
}
