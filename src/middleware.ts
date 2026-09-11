import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Forma de las cookies que Supabase pide guardar
type CookieAGuardar = {
  name: string;
  value: string;
  options?: CookieOptions;
};

// El middleware se ejecuta antes de cada página: refresca la sesión de
// Supabase y bloquea el acceso a las rutas privadas si no hay usuario.
export async function middleware(peticion: NextRequest) {
  // El calendario del móvil se pide sin sesión: su seguridad es la clave
  // secreta que lleva la propia dirección, así que se deja pasar.
  if (peticion.nextUrl.pathname.startsWith("/api/calendario/") === true) {
    return NextResponse.next();
  }

  let respuesta = NextResponse.next({ request: peticion });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return peticion.cookies.getAll();
        },
        setAll(cookiesNuevas: CookieAGuardar[]) {
          for (const cookie of cookiesNuevas) {
            peticion.cookies.set(cookie.name, cookie.value);
          }
          respuesta = NextResponse.next({ request: peticion });
          for (const cookie of cookiesNuevas) {
            respuesta.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    }
  );

  const datosUsuario = await supabase.auth.getUser();
  const usuario = datosUsuario.data.user;

  const ruta = peticion.nextUrl.pathname;
  const esRutaDeLogin = ruta.startsWith("/login");

  if (usuario === null && esRutaDeLogin === false) {
    // Sin sesión no se entra a ninguna parte del panel
    const destino = peticion.nextUrl.clone();
    destino.pathname = "/login";
    return NextResponse.redirect(destino);
  }

  if (usuario !== null && esRutaDeLogin === true) {
    // Con sesión iniciada no tiene sentido ver el login
    const destino = peticion.nextUrl.clone();
    destino.pathname = "/inicio";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  matcher: [
    // Todas las rutas menos los ficheros estáticos y las imágenes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
