import type { Metadata } from "next";

// La pantalla de acceso es un componente de cliente y no puede declarar
// su propio título, así que se pone aquí.
export const metadata: Metadata = {
  title: "Acceso",
};

export default function LayoutLogin(props: { children: React.ReactNode }) {
  return props.children;
}
