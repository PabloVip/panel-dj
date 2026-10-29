import type { Config } from "tailwindcss";

const configuracion: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta propia del panel: fondos oscuros y un acento violeta
        fondo: "#0b0b12",
        superficie: "#14141f",
        superficieAlta: "#1c1c2b",
        borde: "#2a2a3d",
        acento: "#8b5cf6",
        acentoSuave: "#a78bfa",
        textoPrincipal: "#f4f4f8",
        textoSecundario: "#a3a3b8",
      },
    },
  },
  plugins: [],
};

export default configuracion;
