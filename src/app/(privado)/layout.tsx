import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { cerrarSesion } from "@/acciones/sesion";
import NavegacionPrivada from "@/components/NavegacionPrivada";
import BarraInferior from "@/components/BarraInferior";

// Todas las páginas dentro de (privado) comparten esta cabecera
// y exigen tener la sesión iniciada.
export default async function LayoutPrivado(props: { children: React.ReactNode }) {
  const supabase = await crearClienteServidor();
  const datosUsuario = await supabase.auth.getUser();
  const usuario = datosUsuario.data.user;

  if (usuario === null) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      <header className="sticky top-0 z-30 border-b border-borde bg-superficie/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-acentoSuave">
              Panel DJ
            </span>
            {/* En móvil la navegación va en la barra inferior */}
            <span className="hidden sm:block">
              <NavegacionPrivada />
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-textoSecundario lg:inline">
              {usuario.email}
            </span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-lg border border-borde px-3 py-1.5 text-sm text-textoSecundario transition hover:text-textoPrincipal"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{props.children}</main>

      <BarraInferior />
    </div>
  );
}
