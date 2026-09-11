import { redirect } from "next/navigation";

// La raíz del sitio lleva al resumen.
// Si no hay sesión, el middleware redirige al login antes de llegar aquí.
export default function PaginaRaiz() {
  redirect("/inicio");
}
