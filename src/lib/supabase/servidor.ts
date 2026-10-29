import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Forma de las cookies que Supabase pide guardar
type CookieAGuardar = {
  name: string;
  value: string;
  options?: CookieOptions;
};

// Tipo del cliente, para poder pasarlo como parámetro en otros ficheros
export type ClienteServidor = Awaited<ReturnType<typeof crearClienteServidor>>;

// Cliente de Supabase para server components y server actions.
// Lee y escribe la sesión en las cookies de la petición.
export async function crearClienteServidor() {
  const almacenCookies = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return almacenCookies.getAll();
        },
        setAll(cookiesNuevas: CookieAGuardar[]) {
          try {
            for (const cookie of cookiesNuevas) {
              almacenCookies.set(cookie.name, cookie.value, cookie.options);
            }
          } catch {
            // Los server components no pueden escribir cookies.
            // El middleware ya se encarga de refrescar la sesión, así que
            // aquí se puede ignorar el error sin problema.
          }
        },
      },
    }
  );
}
