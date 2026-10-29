// Todo lo necesario para salir por la puerta hacia un bolo:
// a dónde se va y a quién se llama.

import type { Bolo, Sala } from "./tipos";

// Busca la sala que corresponde a la ubicación de un bolo
export function salaDelBolo(bolo: Bolo, salas: Sala[]): Sala | null {
  if (bolo.ubicacion === null) {
    return null;
  }

  const buscada = bolo.ubicacion.trim().toLowerCase();
  for (const sala of salas) {
    if (sala.nombre.trim().toLowerCase() === buscada) {
      return sala;
    }
  }
  return null;
}

// La dirección que se usa para navegar: la del bolo manda sobre la de la
// sala, y si no hay ninguna se tira del nombre del sitio.
export function direccionDe(bolo: Bolo, salas: Sala[]): string | null {
  if (bolo.direccion !== null && bolo.direccion.trim() !== "") {
    return bolo.direccion.trim();
  }

  const sala = salaDelBolo(bolo, salas);
  if (sala !== null && sala.direccion !== null && sala.direccion.trim() !== "") {
    return sala.direccion.trim();
  }

  if (bolo.ubicacion !== null && bolo.ubicacion.trim() !== "") {
    return bolo.ubicacion.trim();
  }

  return null;
}

// Teléfono al que llamar si surge algo de camino
export function telefonoDe(bolo: Bolo, salas: Sala[]): string | null {
  const sala = salaDelBolo(bolo, salas);
  if (sala === null) {
    return null;
  }
  if (sala.telefono === null || sala.telefono.trim() === "") {
    return null;
  }
  return sala.telefono.trim();
}

// Enlace que abre Apple Maps con la ruta puesta. En el iPhone salta a la
// app, y con el coche conectado la navegación pasa sola a CarPlay.
export function enlaceMapa(direccion: string): string {
  return "https://maps.apple.com/?daddr=" + encodeURIComponent(direccion);
}

// Enlace de llamada. Se quitan espacios y guiones porque algunos
// teléfonos no marcan bien si vienen dentro del número.
export function enlaceTelefono(telefono: string): string {
  return "tel:" + telefono.replace(/[\s.-]/g, "");
}
