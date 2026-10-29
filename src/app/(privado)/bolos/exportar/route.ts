import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { comisionDe, netoDe } from "@/lib/calculos";
import type { Bolo } from "@/lib/tipos";

// Descarga los bolos filtrados en un CSV que abre bien en Excel y en Numbers.
// Se usa punto y coma como separador y coma decimal, que es lo que espera
// Excel en español.

function celda(valor: string | null): string {
  if (valor === null) {
    return '""';
  }
  const limpio = valor.replace(/"/g, '""').replace(/\r?\n/g, " ");
  return '"' + limpio + '"';
}

function numero(valor: number): string {
  return '"' + valor.toFixed(2).replace(".", ",") + '"';
}

function limpiarBusqueda(texto: string): string {
  return texto.replace(/[,()%]/g, " ").trim();
}

export async function GET(peticion: NextRequest) {
  const supabase = await crearClienteServidor();

  const datosUsuario = await supabase.auth.getUser();
  if (datosUsuario.data.user === null) {
    return NextResponse.redirect(new URL("/login", peticion.url));
  }

  const parametros = peticion.nextUrl.searchParams;
  const busqueda = parametros.get("busqueda") ?? "";
  const estado = parametros.get("estado") ?? "";
  const cobro = parametros.get("cobro") ?? "";
  const desde = parametros.get("desde") ?? "";
  const hasta = parametros.get("hasta") ?? "";

  let consulta = supabase.from("bolos").select("*");

  const textoLimpio = limpiarBusqueda(busqueda);
  if (textoLimpio !== "") {
    consulta = consulta.or(
      "nombre.ilike.%" + textoLimpio + "%,ubicacion.ilike.%" + textoLimpio + "%"
    );
  }
  if (estado === "confirmado" || estado === "pendiente" || estado === "cancelado") {
    consulta = consulta.eq("estado", estado);
  }
  if (cobro === "cobrado") {
    consulta = consulta.eq("cobrado", true);
  }
  if (cobro === "pendiente") {
    consulta = consulta.eq("cobrado", false);
  }
  if (desde.length === 10) {
    consulta = consulta.gte("fecha", desde);
  }
  if (hasta.length === 10) {
    consulta = consulta.lte("fecha", hasta);
  }

  const respuesta = await consulta
    .order("fecha", { ascending: true })
    .limit(5000);

  let bolos: Bolo[] = [];
  if (respuesta.data !== null) {
    bolos = respuesta.data as Bolo[];
  }

  const cabecera = [
    "Fecha",
    "Bolo",
    "Ubicación",
    "Hora inicio",
    "Hora fin",
    "Precio",
    "Comisión %",
    "Comisión €",
    "Neto",
    "Estado",
    "Cobrado",
    "Fecha de cobro",
    "Notas",
  ]
    .map((titulo) => celda(titulo))
    .join(";");

  const filas = [cabecera];

  for (const bolo of bolos) {
    let cobrado = "No";
    if (bolo.cobrado === true) {
      cobrado = "Sí";
    }

    let horaInicio = "";
    if (bolo.hora_inicio !== null) {
      horaInicio = bolo.hora_inicio.slice(0, 5);
    }
    let horaFin = "";
    if (bolo.hora_fin !== null) {
      horaFin = bolo.hora_fin.slice(0, 5);
    }

    filas.push(
      [
        celda(bolo.fecha),
        celda(bolo.nombre),
        celda(bolo.ubicacion),
        celda(horaInicio),
        celda(horaFin),
        numero(Number(bolo.precio)),
        numero(Number(bolo.comision_porcentaje)),
        numero(comisionDe(bolo)),
        numero(netoDe(bolo)),
        celda(bolo.estado),
        celda(cobrado),
        celda(bolo.fecha_cobro),
        celda(bolo.notas),
      ].join(";")
    );
  }

  // El BOM al principio hace que Excel respete las tildes
  const contenido = "﻿" + filas.join("\r\n");

  const hoy = new Date().toISOString().slice(0, 10);

  return new NextResponse(contenido, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bolos-' + hoy + '.csv"',
    },
  });
}
