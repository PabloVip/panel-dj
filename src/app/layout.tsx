import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegistroServiceWorker from "@/components/RegistroServiceWorker";

export const metadata: Metadata = {
  // Cada pantalla pone su nombre delante: "Cobros · Panel DJ"
  title: {
    default: "Panel DJ",
    template: "%s · Panel DJ",
  },
  description: "Gestor privado de bolos, ganancias y estadísticas",
  appleWebApp: {
    capable: true,
    title: "Panel DJ",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icono-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b12",
  width: "device-width",
  initialScale: 1,
  // Evita que iOS haga zoom al tocar un campo del formulario
  maximumScale: 1,
  viewportFit: "cover",
};

export default function LayoutRaiz(props: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {props.children}
        <RegistroServiceWorker />
      </body>
    </html>
  );
}
