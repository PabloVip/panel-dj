"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { ClienteServidor } from "@/lib/supabase/servidor";
import type { Resultado } from "@/lib/tipos";

async function exigirUsuario(supabase: ClienteServidor) {
  const datosUsuario = await supabase.auth.getUser();
  const usuario = datosUsuario.data.user;
  if (usuario === null) {
    redirect("/login");
  }
  return usuario;
}

function textoONulo(valor: FormDataEntryValue | null): string | null {
  if (valor === null) {
    return null;
  }
  const texto = String(valor).trim();
  if (texto === "") {
    return null;
  }
  return texto;
}

// Crea o actualiza una sala
export async function guardarSala(datos: FormData): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const usuario = await exigirUsuario(supabase);

  const nombre = textoONulo(datos.get("nombre"));
  if (nombre === null) {
    return { ok: false, mensaje: "El nombre de la sala es obligatorio." };
  }

  let cache = Number(datos.get("cache_habitual"));
  if (Number.isNaN(cache) === true || cache < 0) {
    cache = 0;
  }

  let comision = Number(datos.get("comision_porcentaje"));
  if (Number.isNaN(comision) === true || comision < 0) {
    comision = 0;
  }
  if (comision > 100) {
    comision = 100;
  }

  const sala = {
    nombre: nombre,
    contacto: textoONulo(datos.get("contacto")),
    telefono: textoONulo(datos.get("telefono")),
    cache_habitual: cache,
    comision_porcentaje: comision,
    notas: textoONulo(datos.get("notas")),
    usuario_id: usuario.id,
  };

  const id = textoONulo(datos.get("id"));

  if (id === null) {
    const respuesta = await supabase.from("salas").insert(sala);
    if (respuesta.error !== null) {
      if (respuesta.error.code === "23505") {
        return { ok: false, mensaje: "Ya tienes una sala con ese nombre." };
      }
      return { ok: false, mensaje: "No se ha podido guardar: " + respuesta.error.message };
    }
  } else {
    const respuesta = await supabase
      .from("salas")
      .update(sala)
      .eq("id", id)
      .eq("usuario_id", usuario.id);
    if (respuesta.error !== null) {
      return { ok: false, mensaje: "No se ha podido actualizar: " + respuesta.error.message };
    }
  }

  revalidatePath("/salas");
  return { ok: true, mensaje: "Sala guardada." };
}

// Borra una sala del fichero (los bolos no se tocan)
export async function borrarSala(id: string): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const usuario = await exigirUsuario(supabase);

  const respuesta = await supabase
    .from("salas")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario.id);

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido borrar: " + respuesta.error.message };
  }

  revalidatePath("/salas");
  return { ok: true, mensaje: "Sala borrada." };
}

// Cambia la clave del calendario: el enlace antiguo deja de funcionar
export async function regenerarTokenCalendario(): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const usuario = await exigirUsuario(supabase);

  // Una clave nueva, larga y aleatoria
  const nuevaClave = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

  const respuesta = await supabase
    .from("ajustes")
    .upsert(
      { usuario_id: usuario.id, token_calendario: nuevaClave },
      { onConflict: "usuario_id" }
    );

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido cambiar la clave: " + respuesta.error.message };
  }

  revalidatePath("/ajustes");
  return { ok: true, mensaje: "Clave nueva generada." };
}
