"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/cliente";

export default function PaginaLogin() {
  const router = useRouter();
  const [correo, establecerCorreo] = useState("");
  const [contrasena, establecerContrasena] = useState("");
  const [error, establecerError] = useState("");
  const [cargando, establecerCargando] = useState(false);

  async function iniciarSesion(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError("");
    establecerCargando(true);

    const supabase = crearClienteNavegador();
    const respuesta = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });

    if (respuesta.error !== null) {
      establecerError("No se ha podido entrar. Revisa el correo y la contraseña.");
      establecerCargando(false);
      return;
    }

    // refresh() hace que el middleware vuelva a leer la cookie de sesión
    router.push("/inicio");
    router.refresh();
  }

  let textoBoton = "Entrar";
  if (cargando === true) {
    textoBoton = "Entrando...";
  }

  return (
    <main className="zona-segura-arriba zona-segura-abajo flex min-h-screen items-center justify-center px-4 py-6">
      <section className="w-full max-w-sm rounded-2xl border border-borde bg-superficie p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-acentoSuave">
          Acceso privado
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Panel DJ</h1>
        <p className="mt-1 text-sm text-textoSecundario">
          Gestión de bolos, ganancias y estadísticas.
        </p>

        <form onSubmit={iniciarSesion} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="etiqueta" htmlFor="correo">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              className="campo"
              value={correo}
              onChange={(evento) => establecerCorreo(evento.target.value)}
              required
            />
          </div>

          <div>
            <label className="etiqueta" htmlFor="contrasena">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              className="campo"
              value={contrasena}
              onChange={(evento) => establecerContrasena(evento.target.value)}
              required
            />
          </div>

          {error !== "" && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="rounded-lg bg-acento px-4 py-2 font-medium text-white transition hover:bg-acentoSuave disabled:opacity-60"
          >
            {textoBoton}
          </button>
        </form>
      </section>
    </main>
  );
}
