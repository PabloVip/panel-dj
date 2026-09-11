"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/cliente";

type Factor = {
  id: string;
  friendly_name?: string;
  status: string;
};

// Activar y desactivar la verificación en dos pasos con app autenticadora.
export default function SeguridadCuenta() {
  const router = useRouter();
  const [factores, establecerFactores] = useState<Factor[]>([]);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState("");
  const [aviso, establecerAviso] = useState("");

  // Datos del alta en curso
  const [idFactor, establecerIdFactor] = useState("");
  const [codigoQr, establecerCodigoQr] = useState("");
  const [secreto, establecerSecreto] = useState("");
  const [codigo, establecerCodigo] = useState("");
  const [ocupado, establecerOcupado] = useState(false);

  async function cargarFactores() {
    const supabase = crearClienteNavegador();
    const respuesta = await supabase.auth.mfa.listFactors();

    if (respuesta.error !== null) {
      establecerError("No se han podido leer tus métodos de acceso.");
      establecerCargando(false);
      return;
    }

    let lista: Factor[] = [];
    if (respuesta.data !== null && respuesta.data.totp !== undefined) {
      lista = respuesta.data.totp as Factor[];
    }
    establecerFactores(lista);
    establecerCargando(false);
  }

  useEffect(() => {
    cargarFactores();
  }, []);

  // Paso 1: pedir a Supabase un secreto nuevo y su código QR
  async function empezarAlta() {
    establecerError("");
    establecerAviso("");
    establecerOcupado(true);

    const supabase = crearClienteNavegador();
    const respuesta = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Panel DJ " + Date.now(),
    });

    establecerOcupado(false);

    if (respuesta.error !== null || respuesta.data === null) {
      establecerError("No se ha podido preparar la verificación. Inténtalo de nuevo.");
      return;
    }

    establecerIdFactor(respuesta.data.id);
    establecerCodigoQr(respuesta.data.totp.qr_code);
    establecerSecreto(respuesta.data.totp.secret);
  }

  // Paso 2: confirmar con un código de la app para dejarlo activado
  async function confirmarAlta(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    establecerError("");
    establecerOcupado(true);

    const supabase = crearClienteNavegador();

    const desafio = await supabase.auth.mfa.challenge({ factorId: idFactor });
    if (desafio.error !== null || desafio.data === null) {
      establecerError("No se ha podido comprobar el código. Inténtalo de nuevo.");
      establecerOcupado(false);
      return;
    }

    const comprobacion = await supabase.auth.mfa.verify({
      factorId: idFactor,
      challengeId: desafio.data.id,
      code: codigo.trim(),
    });

    establecerOcupado(false);

    if (comprobacion.error !== null) {
      establecerError("Ese código no es correcto. Mira que sea el de ahora mismo.");
      return;
    }

    establecerIdFactor("");
    establecerCodigoQr("");
    establecerSecreto("");
    establecerCodigo("");
    establecerAviso("Verificación en dos pasos activada.");
    await cargarFactores();
    router.refresh();
  }

  function cancelarAlta() {
    establecerIdFactor("");
    establecerCodigoQr("");
    establecerSecreto("");
    establecerCodigo("");
    establecerError("");
  }

  async function quitarFactor(id: string) {
    establecerError("");
    establecerAviso("");
    establecerOcupado(true);

    const supabase = crearClienteNavegador();
    const respuesta = await supabase.auth.mfa.unenroll({ factorId: id });

    establecerOcupado(false);

    if (respuesta.error !== null) {
      establecerError("No se ha podido desactivar: " + respuesta.error.message);
      return;
    }

    establecerAviso("Verificación en dos pasos desactivada.");
    await cargarFactores();
    router.refresh();
  }

  // ¿Hay ya algún método confirmado?
  const activos: Factor[] = [];
  for (const factor of factores) {
    if (factor.status === "verified") {
      activos.push(factor);
    }
  }

  return (
    <section className="rounded-2xl border border-borde bg-superficie p-5">
      <h2 className="text-sm font-medium">Verificación en dos pasos</h2>
      <p className="mt-1 text-xs text-textoSecundario">
        Además de la contraseña, la app te pedirá un código de seis dígitos de
        tu aplicación de autenticación. Sin ese código, la base de datos no
        entrega tus datos aunque alguien tenga tu contraseña.
      </p>

      {cargando === true && (
        <p className="mt-4 text-sm text-textoSecundario">Comprobando...</p>
      )}

      {/* Ya está activada */}
      {cargando === false && activos.length > 0 && idFactor === "" && (
        <div className="mt-4">
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Activada. Al entrar se te pedirá el código.
          </p>

          <div className="mt-3 flex flex-col gap-2">
            {activos.map((factor) => (
              <div
                key={factor.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-fondo p-3"
              >
                <span className="text-sm">App de autenticación</span>
                <button
                  type="button"
                  onClick={() => quitarFactor(factor.id)}
                  disabled={ocupado}
                  className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                >
                  Desactivar
                </button>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-textoSecundario">
            Si pierdes el móvil o borras la app de autenticación, puedes
            recuperar el acceso desde el panel de Supabase, en Authentication →
            Users, borrando el factor de tu usuario.
          </p>
        </div>
      )}

      {/* Todavía no está activada */}
      {cargando === false && activos.length === 0 && idFactor === "" && (
        <button
          type="button"
          onClick={empezarAlta}
          disabled={ocupado}
          className="mt-4 rounded-lg bg-acento px-4 py-2 text-sm font-medium text-white transition hover:bg-acentoSuave disabled:opacity-60"
        >
          Activar la verificación
        </button>
      )}

      {/* Alta en curso: escanear y confirmar */}
      {idFactor !== "" && (
        <div className="mt-4 flex flex-col gap-4">
          <ol className="flex list-decimal flex-col gap-1 pl-4 text-xs text-textoSecundario">
            <li>
              Abre tu app de autenticación (Google Authenticator, 1Password,
              Authy...).
            </li>
            <li>Escanea este código.</li>
            <li>Escribe abajo los seis dígitos que te muestre.</li>
          </ol>

          {codigoQr !== "" && (
            /* El QR llega como imagen ya generada por Supabase */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={codigoQr}
              alt="Código para la app de autenticación"
              className="mx-auto h-48 w-48 rounded-xl bg-white p-2"
            />
          )}

          <details className="text-xs text-textoSecundario">
            <summary className="cursor-pointer">
              No puedo escanear el código
            </summary>
            <p className="mt-2 break-all font-mono">{secreto}</p>
            <p className="mt-1">
              Introduce ese texto a mano en tu app de autenticación.
            </p>
          </details>

          <form onSubmit={confirmarAlta} className="flex flex-col gap-3">
            <div>
              <label className="etiqueta" htmlFor="codigo">
                Código de seis dígitos
              </label>
              <input
                id="codigo"
                className="campo"
                value={codigo}
                onChange={(evento) => establecerCodigo(evento.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={ocupado}
                className="rounded-lg bg-acento px-4 py-2 text-sm font-medium text-white transition hover:bg-acentoSuave disabled:opacity-60"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={cancelarAlta}
                className="rounded-lg border border-borde px-3 py-2 text-sm text-textoSecundario transition hover:text-textoPrincipal"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {error !== "" && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {aviso !== "" && (
        <p className="mt-4 rounded-lg border border-borde px-3 py-2 text-sm text-textoSecundario">
          {aviso}
        </p>
      )}
    </section>
  );
}
