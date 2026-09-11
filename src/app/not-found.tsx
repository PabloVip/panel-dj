import Link from "next/link";

// Página que se muestra cuando la dirección no existe
export default function NoEncontrada() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm rounded-2xl border border-borde bg-superficie p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-acentoSuave">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Esta página no existe</h1>
        <p className="mt-2 text-sm text-textoSecundario">
          Puede que el enlace esté mal escrito o que la pantalla ya no esté ahí.
        </p>

        <Link
          href="/inicio"
          className="mt-6 inline-block rounded-lg bg-acento px-4 py-2 text-sm font-medium text-white transition hover:bg-acentoSuave"
        >
          Volver al resumen
        </Link>
      </section>
    </main>
  );
}
