// Cuentas del manager: agrupa los bolos con comisión por meses, que es
// como se liquida con él, y saca lo que queda por pagar.

import { brutoDe, comisionDe, comisionPagada, tieneComision } from "./calculos";
import { nombreMes } from "./formato";
import type { Bolo } from "./tipos";

export type MesDelManager = {
  clave: string; // "2026-09"
  anio: number;
  mes: number; // 1 = enero
  titulo: string; // "Septiembre 2026"
  bolos: Bolo[];
  // Lo que facturaste ese mes en los bolos que llevan comisión
  bruto: number;
  comision: number;
  pagado: number;
  pendiente: number;
  // true cuando de ese mes no queda nada por pagar
  liquidado: boolean;
  // Fecha del pago más reciente apuntado en el mes
  ultimoPago: string | null;
};

// Solo cuentan los bolos con comisión y que no estén cancelados
export function bolosConComision(lista: Bolo[]): Bolo[] {
  const resultado: Bolo[] = [];

  for (const bolo of lista) {
    if (bolo.estado === "cancelado") {
      continue;
    }
    if (tieneComision(bolo) === false) {
      continue;
    }
    resultado.push(bolo);
  }

  return resultado;
}

// Agrupa por el mes del bolo, del más reciente al más antiguo
export function agruparPorMes(lista: Bolo[]): MesDelManager[] {
  const porClave = new Map<string, MesDelManager>();

  for (const bolo of bolosConComision(lista)) {
    const clave = bolo.fecha.slice(0, 7);

    let grupo = porClave.get(clave);
    if (grupo === undefined) {
      const anio = Number(clave.slice(0, 4));
      const mes = Number(clave.slice(5, 7));

      grupo = {
        clave: clave,
        anio: anio,
        mes: mes,
        titulo: nombreMes(mes) + " " + anio,
        bolos: [],
        bruto: 0,
        comision: 0,
        pagado: 0,
        pendiente: 0,
        liquidado: true,
        ultimoPago: null,
      };
      porClave.set(clave, grupo);
    }

    const comision = comisionDe(bolo);

    grupo.bolos.push(bolo);
    grupo.bruto = grupo.bruto + brutoDe(bolo);
    grupo.comision = grupo.comision + comision;

    if (comisionPagada(bolo) === true) {
      grupo.pagado = grupo.pagado + comision;

      const fechaPago = bolo.comision_pagada_el;
      if (fechaPago !== null) {
        if (grupo.ultimoPago === null || fechaPago > grupo.ultimoPago) {
          grupo.ultimoPago = fechaPago;
        }
      }
    } else {
      grupo.pendiente = grupo.pendiente + comision;
      grupo.liquidado = false;
    }
  }

  const meses = Array.from(porClave.values());

  // Dentro de cada mes, los bolos por fecha
  for (const mes of meses) {
    mes.bolos.sort((uno, otro) => {
      if (uno.fecha < otro.fecha) {
        return -1;
      }
      if (uno.fecha > otro.fecha) {
        return 1;
      }
      return 0;
    });
  }

  meses.sort((uno, otro) => {
    if (uno.clave > otro.clave) {
      return -1;
    }
    if (uno.clave < otro.clave) {
      return 1;
    }
    return 0;
  });

  return meses;
}

export type ResumenManager = {
  // Lo que le debes ahora mismo, de todos los meses juntos
  pendienteTotal: number;
  mesesPendientes: number;
  bolosPendientes: number;
  // El mes más viejo que sigue sin liquidar
  mesMasAntiguo: string | null;
  // Comisión generada en el mes en curso, pagada o no
  comisionEsteMes: number;
  // Lo que le has pagado en lo que va de año, por fecha de pago
  pagadoEsteAnio: number;
};

export function resumenDelManager(
  meses: MesDelManager[],
  hoy: string
): ResumenManager {
  const claveDeEsteMes = hoy.slice(0, 7);
  const anioActual = hoy.slice(0, 4);

  let pendienteTotal = 0;
  let mesesPendientes = 0;
  let bolosPendientes = 0;
  let mesMasAntiguo: string | null = null;
  let comisionEsteMes = 0;
  let pagadoEsteAnio = 0;

  for (const mes of meses) {
    if (mes.clave === claveDeEsteMes) {
      comisionEsteMes = mes.comision;
    }

    if (mes.pendiente > 0) {
      pendienteTotal = pendienteTotal + mes.pendiente;
      mesesPendientes = mesesPendientes + 1;

      // La lista viene de más nuevo a más viejo, así que el último que
      // se ve es el más antiguo
      mesMasAntiguo = mes.titulo;
    }

    for (const bolo of mes.bolos) {
      const fechaPago = bolo.comision_pagada_el;

      if (fechaPago === null) {
        bolosPendientes = bolosPendientes + 1;
      } else if (fechaPago.slice(0, 4) === anioActual) {
        pagadoEsteAnio = pagadoEsteAnio + comisionDe(bolo);
      }
    }
  }

  return {
    pendienteTotal: pendienteTotal,
    mesesPendientes: mesesPendientes,
    bolosPendientes: bolosPendientes,
    mesMasAntiguo: mesMasAntiguo,
    comisionEsteMes: comisionEsteMes,
    pagadoEsteAnio: pagadoEsteAnio,
  };
}
