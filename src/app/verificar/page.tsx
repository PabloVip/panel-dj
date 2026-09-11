"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/cliente";

// Segundo paso del acceso: la sesión existe pero todavía no está
// verificada, así que aquí se pide el código de la app.
export default function PaginaVerificar() {
  const router = useRouter();
  const [codigo, establecerCodigo] = useState("");
  const [error, establecerError] = useState("");
  const [cargando, establecerCargando] = useState(false);
  const [idFactor, establecerIdFactor] = useState("");

  useEffect(() => {
    async function buscarFactor() {
      const supabase = crearClienteNavegador();
      const respuesta = await supabase.auth.mfa.listFactors();

      if (respuesta.data === null || respuesta.data.totp.length === 0) {
        // Si no hay nada que verificar, no pinta nada aquí
        router.replace("/inicio");
        return;
      }

      establecerIdFactor(respuesta.data.totp[0].id);
    }

    buscarFactor();
  }, [router]);

  async function comprobar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError("");
    establecerCargando(true);

    const supabase = crearClienteNavegador();

    const desafio = await supabase.auth.mfa.challenge({ factorId: idFactor });
    if (desafio.error !== null || desafio.data === null) {
      establecerError("No se ha podido comprobar el código. Inténtalo de nuevo.");
      establecerCargando(false);
      return;
    }

    const comprobacion = await supabase.auth.mfa.verify({
      factorId: idFactor,
      challengeId: desafio.data.id,
      code: codigo.trim(),
    });

    if (comprobacion.error !== null) {
      establecerError("Ese código no es correcto. Usa el que aparece ahora.");
      establecerCargando(false);
      return;
    }

    router.push("/inicio");
    router.refresh();
  }

  async function salir() {
    const supabase = crearClienteNavegador();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  let textoBoton = "Entrar";
  if (cargando === true) {
    textoBoton = "Comprobando...";
  }

  return (
    <main className="zona-segura-arriba zona-segura-abajo flex min-h-screen items-center justify-center px-4 py-6">
      <section className="w-full max-w-sm rounded-2xl border border-borde bg-superficie p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-acentoSuave">
          Segundo paso
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Código de acceso</h1>
        <p className="mt-1 text-sm text-textoSecundario">
          Abre tu app de autenticación y escribe los seis dígitos.
        </p>

        <form onSubmit={comprobar} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="etiqueta" htmlFor="codigo">
              Código
            </label>
            <input
              id="codigo"
              className="campo text-center text-lg tracking-[0.3em]"
              value={codigo}
              onChange={(evento) => establecerCodigo(evento.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              autoFocus
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

          <button
            type="button"
            onClick={salir}
            className="text-xs text-textoSecundario transition hover:text-textoPrincipal"
          >
            Salir y entrar con otra cuenta
          </button>
        </form>
      </section>
    </main>
  );
}
