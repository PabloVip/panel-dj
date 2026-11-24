import type { Config } from "tailwindcss";

const configuracion: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta glass: superficies translúcidas sobre el fondo ambiental
        fondo: "rgba(0, 0, 0, 0.22)",
        superficie: "rgba(255, 255, 255, 0.06)",
        superficieAlta: "rgba(255, 255, 255, 0.12)",
        borde: "rgba(255, 255, 255, 0.10)",
        acento: "#8b5cf6",
        acentoSuave: "#a78bfa",
        textoPrincipal: "#f5f5fa",
        textoSecundario: "rgba(235, 235, 245, 0.62)",
      },
    },
  },
  plugins: [],
};

export default configuracion;
