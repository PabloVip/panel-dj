"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { ClienteServidor } from "@/lib/supabase/servidor";
import { fechaDeHoy, limitesDelMes, nombreMes } from "@/lib/formato";
import type { Resultado } from "@/lib/tipos";

// Devuelve el usuario de la sesión. Si ha caducado, al login.
async function exigirUsuario(supabase: ClienteServidor) {
  const datosUsuario = await supabase.auth.getUser();
  const usuario = datosUsuario.data.user;
  if (usuario === null) {
    redirect("/login");
  }
  return usuario;
}

// "2026-09" -> { desde: "2026-09-01", hasta: "2026-09-30" }
function limitesDeLaClave(clave: string): { desde: string; hasta: string } | null {
  if (/^\d{4}-\d{2}$/.test(clave) === false) {
    return null;
  }

  const anio = Number(clave.slice(0, 4));
  const mes = Number(clave.slice(5, 7));

  if (mes < 1 || mes > 12) {
    return null;
  }

  return limitesDelMes(anio, mes);
}

// Apunta que le has pagado al manager la comisión de un bolo concreto
export async function pagarComision(id: string): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const usuario = await exigirUsuario(supabase);

  const respuesta = await supabase
    .from("bolos")
    .update({ comision_pagada_el: fechaDeHoy() })
    .eq("id", id)
    .eq("usuario_id", usuario.id);

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido apuntar: " + respuesta.error.message };
  }

  revalidarPaginas();
  return { ok: true, mensaje: "Pago apuntado." };
}

// Deshace el apunte de un bolo, por si te has equivocado
export async function quitarPagoComision(id: string): Promise<Resultado> {
  const supabase = await crearClienteServidor();
  const usuario = await exigirUsuario(supabase);

  const respuesta = await supabase
    .from("bolos")
    .update({ comision_pagada_el: null })
    .eq("id", id)
    .eq("usuario_id", usuario.id);

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido deshacer: " + respuesta.error.message };
  }

  revalidarPaginas();
  return { ok: true, mensaje: "Pago deshecho." };
}

// Liquida un mes entero: apunta con la fecha de hoy todas las comisiones
// de ese mes que siguieran pendientes. Las ya pagadas no se tocan, así que
// conservan el día en que se pagaron de verdad.
export async function pagarMes(clave: string): Promise<Resultado> {
  const limites = limitesDeLaClave(clave);
  if (limites === null) {
    return { ok: false, mensaje: "Ese mes no es válido." };
  }

  const supabase = await crearClienteServidor();
  const usuario = await exigirUsuario(supabase);

  const respuesta = await supabase
    .from("bolos")
    .update({ comision_pagada_el: fechaDeHoy() })
    .eq("usuario_id", usuario.id)
    .gte("fecha", limites.desde)
    .lte("fecha", limites.hasta)
    .gt("comision_porcentaje", 0)
    .neq("estado", "cancelado")
    .is("comision_pagada_el", null)
    .select("id");

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido liquidar: " + respuesta.error.message };
  }

  let cuantos = 0;
  if (respuesta.data !== null) {
    cuantos = respuesta.data.length;
  }

  revalidarPaginas();

  if (cuantos === 0) {
    return { ok: true, mensaje: "Ese mes ya estaba pagado." };
  }
  if (cuantos === 1) {
    return { ok: true, mensaje: "Liquidado " + textoDelMes(clave) + ": 1 bolo." };
  }
  return { ok: true, mensaje: "Liquidado " + textoDelMes(clave) + ": " + cuantos + " bolos." };
}

// Deshace la liquidación de un mes entero
export async function quitarPagoMes(clave: string): Promise<Resultado> {
  const limites = limitesDeLaClave(clave);
  if (limites === null) {
    return { ok: false, mensaje: "Ese mes no es válido." };
  }

  const supabase = await crearClienteServidor();
  const usuario = await exigirUsuario(supabase);

  const respuesta = await supabase
    .from("bolos")
    .update({ comision_pagada_el: null })
    .eq("usuario_id", usuario.id)
    .gte("fecha", limites.desde)
    .lte("fecha", limites.hasta)
    .gt("comision_porcentaje", 0)
    .neq("estado", "cancelado");

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido deshacer: " + respuesta.error.message };
  }

  revalidarPaginas();
  return { ok: true, mensaje: textoDelMes(clave) + " vuelve a estar pendiente." };
}

// "2026-09" -> "septiembre de 2026"
function textoDelMes(clave: string): string {
  const anio = clave.slice(0, 4);
  const mes = Number(clave.slice(5, 7));
  return nombreMes(mes).toLowerCase() + " de " + anio;
}

function revalidarPaginas() {
  revalidatePath("/manager");
  revalidatePath("/inicio");
  revalidatePath("/estadisticas");
}
