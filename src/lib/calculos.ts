// Cálculos de dinero. Todo pasa por aquí para que el bruto, la comisión
// y el neto se calculen igual en todas las pantallas.

import type { Bolo } from "./tipos";

// Lo que factura el bolo, antes de comisiones
export function brutoDe(bolo: Bolo): number {
  return Number(bolo.precio);
}

// Lo que se lleva el manager en ese bolo
export function comisionDe(bolo: Bolo): number {
  const porcentaje = Number(bolo.comision_porcentaje);
  if (porcentaje <= 0) {
    return 0;
  }
  return (Number(bolo.precio) * porcentaje) / 100;
}

// Lo que te queda a ti
export function netoDe(bolo: Bolo): number {
  return brutoDe(bolo) - comisionDe(bolo);
}

// ¿Este bolo lleva comisión?
export function tieneComision(bolo: Bolo): boolean {
  return Number(bolo.comision_porcentaje) > 0;
}

// Totales de una lista de bolos, sin contar los cancelados
export type Totales = {
  bruto: number;
  comisiones: number;
  neto: number;
  cantidad: number;
};

export function totalesDe(lista: Bolo[]): Totales {
  let bruto = 0;
  let comisiones = 0;
  let cantidad = 0;

  for (const bolo of lista) {
    if (bolo.estado === "cancelado") {
      continue;
    }
    bruto = bruto + brutoDe(bolo);
    comisiones = comisiones + comisionDe(bolo);
    cantidad = cantidad + 1;
  }

  return {
    bruto: bruto,
    comisiones: comisiones,
    neto: bruto - comisiones,
    cantidad: cantidad,
  };
}
