import type { MetadataRoute } from "next";

// Next genera con esto el fichero /manifest.webmanifest,
// que es lo que permite instalar la web como aplicación.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Panel DJ",
    short_name: "Panel DJ",
    description: "Gestor privado de bolos, ganancias y estadísticas",
    start_url: "/inicio",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b12",
    theme_color: "#0b0b12",
    lang: "es",
    icons: [
      {
        src: "/icono-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icono-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icono-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
