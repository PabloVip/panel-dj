// Colores y etiquetas de los estados de un bolo, en un solo sitio
// para que el calendario, la lista y la agenda se vean igual.

export function colorEstado(estado: string): string {
  if (estado === "confirmado") {
    return "bg-acento";
  }
  if (estado === "pendiente") {
    return "bg-amber-400";
  }
  return "bg-neutral-500";
}

export function etiquetaEstado(estado: string): string {
  if (estado === "confirmado") {
    return "Confirmado";
  }
  if (estado === "pendiente") {
    return "Pendiente";
  }
  return "Cancelado";
}

// Clases de la pastilla de estado
export function clasesEtiquetaEstado(estado: string): string {
  if (estado === "confirmado") {
    return "bg-acento/15 text-acentoSuave";
  }
  if (estado === "pendiente") {
    return "bg-amber-500/15 text-amber-300";
  }
  return "bg-neutral-500/15 text-neutral-400";
}
