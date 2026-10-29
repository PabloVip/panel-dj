import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para componentes que se ejecutan en el navegador
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}
