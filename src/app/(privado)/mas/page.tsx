import type { Metadata } from "next";
import Link from "next/link";
import { cerrarSesion } from "@/acciones/sesion";

export const metadata: Metadata = {
  title: "Más",
};

const ENLACES = [
  {
    ruta: "/estadisticas",
    titulo: "Estadísticas",
    detalle: "Ganancias del año, comisiones y dónde ganas más",
  },
  {
    ruta: "/salas",
    titulo: "Salas y contactos",
    detalle: "Sitios donde tocas, con su contacto y su caché",
  },
  {
    ruta: "/ajustes",
    titulo: "Ajustes",
    detalle: "Calendario del móvil y copia de tus datos",
  },
];

// Pantalla puente para el móvil, donde la barra de abajo solo tiene sitio
// para cinco botones.
export default function PaginaMas() {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold">Más</h1>
      </header>

      <div className="flex flex-col gap-2">
        {ENLACES.map((enlace) => (
          <Link
            key={enlace.ruta}
            href={enlace.ruta}
            className="rounded-xl border border-borde bg-superficie p-4 transition hover:border-acento"
          >
            <span className="block font-medium">{enlace.titulo}</span>
            <span className="mt-0.5 block text-xs text-textoSecundario">
              {enlace.detalle}
            </span>
          </Link>
        ))}
      </div>

      <form action={cerrarSesion}>
        <button
          type="submit"
          className="w-full rounded-xl border border-borde px-4 py-3 text-sm text-textoSecundario transition hover:text-textoPrincipal"
        >
          Cerrar sesión
        </button>
      </form>
    </section>
  );
}
