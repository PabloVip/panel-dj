import Link from "next/link";
import { redirect } from "next/navigation";
import { AudioLines, LogOut } from "lucide-react";
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

  // Si tienes activada la verificación en dos pasos y la sesión todavía no
  // ha pasado ese segundo paso, no se entra a ninguna pantalla privada.
  const nivel = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (nivel.data !== null) {
    if (nivel.data.nextLevel === "aal2" && nivel.data.currentLevel !== "aal2") {
      redirect("/verificar");
    }
  }

  /* AVATAR */
  let correo = "";
  if (usuario.email !== undefined) {
    correo = usuario.email;
  }
  let inicial = "P";
  if (correo !== "") {
    inicial = correo.charAt(0).toUpperCase();
  }

  return (
    <div className="min-h-screen pb-[calc(6rem+var(--seguro-abajo))] sm:pb-8">
      {/* CABECERA */}
      <header className="cabecera-flotante zona-segura-arriba sticky top-0 z-30 px-3 pb-2 pt-3 sm:px-4">
        <div className="vidrio-barra mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-1.5 pl-1.5 pr-2">
          <Link href="/inicio" className="flex shrink-0 items-center gap-2.5">
            <span className="tono-violeta chip-color flex h-9 w-9 items-center justify-center rounded-full text-white">
              <AudioLines size={18} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-textoPrincipal sm:hidden lg:inline">
              Panel DJ
            </span>
          </Link>

          {/* En móvil la navegación va en la barra inferior */}
          <span className="hidden min-w-0 sm:block">
            <NavegacionPrivada />
          </span>

          <div className="flex shrink-0 items-center gap-2">
            <span
              title={correo}
              className="tono-azul chip-color flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            >
              {inicial}
            </span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                title="Salir"
                aria-label="Salir"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-textoSecundario transition hover:bg-white/10 hover:text-textoPrincipal"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6">{props.children}</main>

      <BarraInferior />
    </div>
  );
}
