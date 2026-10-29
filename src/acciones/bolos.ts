"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { ClienteServidor } from "@/lib/supabase/servidor";
import {
  fechaDeHoy,
  formatearFechaCorta,
  formatearRangoHorario,
  sumarDias,
  sumarMeses,
} from "@/lib/formato";
import type { Bolo, Resultado } from "@/lib/tipos";

// Devuelve el usuario de la sesión. Si la sesión ha caducado,
// manda al login en vez de dejar un error a medias en pantalla.
async function exigirUsuario(supabase: ClienteServidor) {
  const datosUsuario = await supabase.auth.getUser();
  const usuario = datosUsuario.data.user;
  if (usuario === null) {
    redirect("/login");
  }
  return usuario;
}

// Convierte un campo del formulario en texto o en null si viene vacío
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

// "23:30" -> 1410 minutos desde medianoche
function aMinutos(hora: string): number {
  const partes = hora.split(":");
  return Number(partes[0]) * 60 + Number(partes[1]);
}

// ¿Se pisan los horarios de dos bolos del mismo día?
// Si alguno no tiene horas puestas se considera que sí, para avisar igual.
function hayCruceHorario(
  inicioA: string | null,
  finA: string | null,
  inicioB: string | null,
  finB: string | null
): boolean {
  if (inicioA === null || finA === null || inicioB === null || finB === null) {
    return true;
  }

  const arranqueA = aMinutos(inicioA);
  const arranqueB = aMinutos(inicioB);

  // Un bolo que acaba antes de la hora a la que empieza cruza la medianoche
  let cierreA = aMinutos(finA);
  if (cierreA <= arranqueA) {
    cierreA = cierreA + 1440;
  }
  let cierreB = aMinutos(finB);
  if (cierreB <= arranqueB) {
    cierreB = cierreB + 1440;
  }

  if (arranqueA < cierreB && arranqueB < cierreA) {
    return true;
  }
  return false;
}

// Calcula todas las fechas de una serie repetida
function calcularFechas(
  primera: string,
  cadencia: string,
  repeticiones: number
): string[] {
  const fechas = [primera];

  let numero = 1;
  while (numero < repeticiones) {
    if (cadencia === "quincenal") {
      fechas.push(sumarDias(primera, 14 * numero));
    } else if (cadencia === "mensual") {
      fechas.push(sumarMeses(primera, numero));
    } else {
      fechas.push(sumarDias(primera, 7 * numero));
    }
    numero = numero + 1;
  }

  return fechas;
}

// Crea un bolo nuevo, una serie de bolos, o actualiza uno existente.
// Si el formulario trae un "id", es una edición.
export async function guardarBolo(datos: FormData): Promise<Resultado> {
  const supabase = await crearClienteServidor();

  const usuario = await exigirUsuario(supabase);

  const nombre = textoONulo(datos.get("nombre"));
  const fecha = textoONulo(datos.get("fecha"));

  if (nombre === null) {
    return { ok: false, mensaje: "El nombre del bolo es obligatorio." };
  }
  if (fecha === null) {
    return { ok: false, mensaje: "La fecha es obligatoria." };
  }

  let precio = Number(datos.get("precio"));
  if (Number.isNaN(precio) === true) {
    precio = 0;
  }

  // Comisión del manager: si la casilla no viene marcada, el campo tampoco
  // llega y la comisión queda en cero
  let comision = Number(datos.get("comision_porcentaje"));
  if (Number.isNaN(comision) === true || comision < 0) {
    comision = 0;
  }
  if (comision > 100) {
    comision = 100;
  }

  let cobrado = false;
  if (datos.get("cobrado") !== null) {
    cobrado = true;
  }

  // La fecha de cobro solo tiene sentido si el bolo está cobrado
  let fechaCobro = textoONulo(datos.get("fecha_cobro"));
  if (cobrado === false) {
    fechaCobro = null;
  }
  if (cobrado === true && fechaCobro === null) {
    fechaCobro = fechaDeHoy();
  }

  const horaInicio = textoONulo(datos.get("hora_inicio"));
  const horaFin = textoONulo(datos.get("hora_fin"));

  const datosComunes = {
    nombre: nombre,
    ubicacion: textoONulo(datos.get("ubicacion")),
    direccion: textoONulo(datos.get("direccion")),
    hora_inicio: horaInicio,
    hora_fin: horaFin,
    precio: precio,
    comision_porcentaje: comision,
    estado: String(datos.get("estado") ?? "pendiente"),
    cobrado: cobrado,
    fecha_cobro: fechaCobro,
    notas: textoONulo(datos.get("notas")),
    usuario_id: usuario.id,
  };

  const id = textoONulo(datos.get("id"));

  // Repetición: solo se aplica al crear bolos nuevos
  const cadencia = String(datos.get("cadencia") ?? "semanal");
  let repeticiones = Number(datos.get("repeticiones"));
  if (Number.isInteger(repeticiones) === false || repeticiones < 1) {
    repeticiones = 1;
  }
  if (repeticiones > 52) {
    repeticiones = 52;
  }
  if (id !== null) {
    repeticiones = 1;
  }

  const fechas = calcularFechas(fecha, cadencia, repeticiones);

  // --- Aviso de solapes ---
  let forzar = false;
  if (datos.get("forzar") !== null) {
    forzar = true;
  }

  if (forzar === false) {
    const consultaExistentes = await supabase
      .from("bolos")
      .select("*")
      .in("fecha", fechas)
      .neq("estado", "cancelado");

    let existentes: Bolo[] = [];
    if (consultaExistentes.data !== null) {
      existentes = consultaExistentes.data as Bolo[];
    }

    const conflictos: string[] = [];
    for (const otro of existentes) {
      if (id !== null && otro.id === id) {
        continue;
      }
      const seCruzan = hayCruceHorario(
        horaInicio,
        horaFin,
        otro.hora_inicio,
        otro.hora_fin
      );
      if (seCruzan === true) {
        conflictos.push(
          formatearFechaCorta(otro.fecha) +
            ": " +
            otro.nombre +
            " (" +
            formatearRangoHorario(otro.hora_inicio, otro.hora_fin) +
            ")"
        );
      }
    }

    if (conflictos.length > 0) {
      let mensaje = "Ya tienes algo esos días:\n" + conflictos.join("\n");
      if (conflictos.length === 1) {
        mensaje = "Ya tienes un bolo ese día:\n" + conflictos[0];
      }
      return { ok: false, conflicto: true, mensaje: mensaje };
    }
  }

  // --- Guardado ---
  if (id === null) {
    const filas = fechas.map((unaFecha) => {
      return { ...datosComunes, fecha: unaFecha };
    });

    const respuesta = await supabase.from("bolos").insert(filas);
    if (respuesta.error !== null) {
      return { ok: false, mensaje: "No se ha podido guardar: " + respuesta.error.message };
    }

    revalidarPaginas();
    if (filas.length === 1) {
      return { ok: true, mensaje: "Bolo guardado." };
    }
    return { ok: true, mensaje: filas.length + " bolos creados." };
  }

  const respuesta = await supabase
    .from("bolos")
    .update({ ...datosComunes, fecha: fecha })
    .eq("id", id)
    .eq("usuario_id", usuario.id);

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido actualizar: " + respuesta.error.message };
  }

  revalidarPaginas();
  return { ok: true, mensaje: "Bolo guardado." };
}

// Borra un bolo del usuario que tiene la sesión abierta
export async function borrarBolo(id: string): Promise<Resultado> {
  const supabase = await crearClienteServidor();

  const usuario = await exigirUsuario(supabase);

  const respuesta = await supabase
    .from("bolos")
    .delete()
    .eq("id", id)
    .eq("usuario_id", usuario.id);

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido borrar: " + respuesta.error.message };
  }

  revalidarPaginas();
  return { ok: true, mensaje: "Bolo borrado." };
}

// Marca un bolo como cobrado con la fecha de hoy
export async function marcarCobrado(id: string): Promise<Resultado> {
  const supabase = await crearClienteServidor();

  const usuario = await exigirUsuario(supabase);

  const respuesta = await supabase
    .from("bolos")
    .update({ cobrado: true, fecha_cobro: fechaDeHoy() })
    .eq("id", id)
    .eq("usuario_id", usuario.id);

  if (respuesta.error !== null) {
    return { ok: false, mensaje: "No se ha podido marcar: " + respuesta.error.message };
  }

  revalidarPaginas();
  return { ok: true, mensaje: "Cobro registrado." };
}

// Refresca todas las pantallas que muestran bolos
function revalidarPaginas() {
  revalidatePath("/inicio");
  revalidatePath("/calendario");
  revalidatePath("/bolos");
  revalidatePath("/cobros");
  revalidatePath("/manager");
  revalidatePath("/estadisticas");
}
