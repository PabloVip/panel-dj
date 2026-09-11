// Funciones auxiliares de formato y de cálculo del calendario.
// Todas trabajan con mes en rango 1-12 para que se lea mejor.

const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const NOMBRES_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const NOMBRES_DIAS_LARGOS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

// Devuelve el nombre del mes (1 = Enero)
export function nombreMes(mes: number): string {
  return NOMBRES_MESES[mes - 1];
}

// 1250 -> "1.250,00 €"
export function formatearEuros(valor: number): string {
  const formateador = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  });
  return formateador.format(valor);
}

// "23:30:00" -> "23:30"; si no hay hora devuelve cadena vacía
export function formatearHora(hora: string | null): string {
  if (hora === null) {
    return "";
  }
  if (hora.length < 5) {
    return hora;
  }
  return hora.slice(0, 5);
}

// Rango horario listo para mostrar: "23:30 - 03:00"
export function formatearRangoHorario(
  inicio: string | null,
  fin: string | null
): string {
  const horaInicio = formatearHora(inicio);
  const horaFin = formatearHora(fin);

  if (horaInicio === "" && horaFin === "") {
    return "Sin horario";
  }
  if (horaFin === "") {
    return horaInicio;
  }
  if (horaInicio === "") {
    return "hasta " + horaFin;
  }
  return horaInicio + " - " + horaFin;
}

// Cuántas horas dura un bolo. Si acaba antes de la hora a la que empieza,
// es que termina de madrugada, ya en el día siguiente.
export function duracionEnHoras(inicio: string | null, fin: string | null): number {
  if (inicio === null || fin === null) {
    return 0;
  }

  const partesInicio = inicio.split(":");
  const partesFin = fin.split(":");

  const minutosInicio = Number(partesInicio[0]) * 60 + Number(partesInicio[1]);
  let minutosFin = Number(partesFin[0]) * 60 + Number(partesFin[1]);

  if (minutosFin <= minutosInicio) {
    minutosFin = minutosFin + 1440;
  }

  return (minutosFin - minutosInicio) / 60;
}

// Construye la clave AAAA-MM-DD que usamos como fecha en la base de datos
export function claveFecha(anio: number, mes: number, dia: number): string {
  const mesTexto = String(mes).padStart(2, "0");
  const diaTexto = String(dia).padStart(2, "0");
  return anio + "-" + mesTexto + "-" + diaTexto;
}

// "2026-09-10" -> "10 de septiembre de 2026"
export function formatearFechaLarga(fecha: string): string {
  const partes = fecha.split("-");
  const anio = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  return dia + " de " + nombreMes(mes).toLowerCase() + " de " + anio;
}

// Fecha de hoy en España, en formato AAAA-MM-DD.
// Se calcula con zona horaria fija para que el servidor y el navegador
// muestren siempre el mismo día.
export function fechaDeHoy(): string {
  const formateador = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Madrid",
  });
  return formateador.format(new Date());
}

// Número de días que tiene un mes concreto
export function diasDelMes(anio: number, mes: number): number {
  // El día 0 del mes siguiente es el último día de este mes
  const fecha = new Date(anio, mes, 0);
  return fecha.getDate();
}

// Matriz de semanas para pintar la rejilla del calendario.
// Cada semana tiene 7 posiciones; las que no pertenecen al mes valen null.
export function construirSemanas(anio: number, mes: number): (number | null)[][] {
  const primerDia = new Date(anio, mes - 1, 1);

  // getDay() devuelve 0 para domingo, pero nuestra semana empieza en lunes
  let desplazamiento = primerDia.getDay() - 1;
  if (desplazamiento < 0) {
    desplazamiento = 6;
  }

  const total = diasDelMes(anio, mes);
  const casillas: (number | null)[] = [];

  let hueco = 0;
  while (hueco < desplazamiento) {
    casillas.push(null);
    hueco = hueco + 1;
  }

  let dia = 1;
  while (dia <= total) {
    casillas.push(dia);
    dia = dia + 1;
  }

  while (casillas.length % 7 !== 0) {
    casillas.push(null);
  }

  const semanas: (number | null)[][] = [];
  let posicion = 0;
  while (posicion < casillas.length) {
    semanas.push(casillas.slice(posicion, posicion + 7));
    posicion = posicion + 7;
  }

  return semanas;
}

// Mes anterior y siguiente, controlando el cambio de año
export function mesAnterior(anio: number, mes: number): { anio: number; mes: number } {
  if (mes === 1) {
    return { anio: anio - 1, mes: 12 };
  }
  return { anio: anio, mes: mes - 1 };
}

export function mesSiguiente(anio: number, mes: number): { anio: number; mes: number } {
  if (mes === 12) {
    return { anio: anio + 1, mes: 1 };
  }
  return { anio: anio, mes: mes + 1 };
}

// ---------------------------------------------------------------
// Utilidades de fechas sueltas (siempre en formato AAAA-MM-DD)
// Se trabaja en UTC para que no haya saltos de día por la zona horaria.
// ---------------------------------------------------------------

// Convierte "2026-09-10" en un Date situado a las 12:00 UTC
function aFecha(clave: string): Date {
  const partes = clave.split("-");
  const anio = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  return new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0));
}

// Convierte un Date de vuelta a "AAAA-MM-DD"
function aClave(fecha: Date): string {
  return claveFecha(
    fecha.getUTCFullYear(),
    fecha.getUTCMonth() + 1,
    fecha.getUTCDate()
  );
}

// Suma (o resta, con números negativos) días a una fecha
export function sumarDias(clave: string, dias: number): string {
  const fecha = aFecha(clave);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return aClave(fecha);
}

// Suma meses manteniendo el día. Si ese día no existe en el mes destino
// (por ejemplo el 31 en un mes de 30), se usa el último día del mes.
export function sumarMeses(clave: string, meses: number): string {
  const partes = clave.split("-");
  const anio = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);

  const totalMeses = mes - 1 + meses;
  const anioDestino = anio + Math.floor(totalMeses / 12);
  let mesDestino = totalMeses % 12;
  if (mesDestino < 0) {
    mesDestino = mesDestino + 12;
  }
  mesDestino = mesDestino + 1;

  const ultimoDia = diasDelMes(anioDestino, mesDestino);
  let diaDestino = dia;
  if (diaDestino > ultimoDia) {
    diaDestino = ultimoDia;
  }

  return claveFecha(anioDestino, mesDestino, diaDestino);
}

// Día de la semana: 0 = lunes ... 6 = domingo
export function indiceDiaSemana(clave: string): number {
  const fecha = aFecha(clave);
  let indice = fecha.getUTCDay() - 1;
  if (indice < 0) {
    indice = 6;
  }
  return indice;
}

// Nombre largo del día: "Jueves"
export function nombreDiaLargo(clave: string): string {
  return NOMBRES_DIAS_LARGOS[indiceDiaSemana(clave)];
}

// Lunes de la semana a la que pertenece esa fecha
export function inicioDeSemana(clave: string): string {
  return sumarDias(clave, -indiceDiaSemana(clave));
}

// Las siete fechas de la semana que empieza en ese lunes
export function diasDeLaSemana(lunes: string): string[] {
  const dias: string[] = [];
  let contador = 0;
  while (contador < 7) {
    dias.push(sumarDias(lunes, contador));
    contador = contador + 1;
  }
  return dias;
}

// Diferencia en días entre dos fechas (positiva si "hasta" es posterior)
export function diasDeDiferencia(desde: string, hasta: string): number {
  const milisegundos = aFecha(hasta).getTime() - aFecha(desde).getTime();
  return Math.round(milisegundos / 86400000);
}

// "Hoy", "Mañana", "En 5 días", "Hace 3 días"
export function textoRelativo(clave: string, hoy: string): string {
  const diferencia = diasDeDiferencia(hoy, clave);

  if (diferencia === 0) {
    return "Hoy";
  }
  if (diferencia === 1) {
    return "Mañana";
  }
  if (diferencia === -1) {
    return "Ayer";
  }
  if (diferencia > 1) {
    return "En " + diferencia + " días";
  }
  return "Hace " + Math.abs(diferencia) + " días";
}

// "Jue 10 sept" — cabecera corta para agenda y vista de semana
export function formatearFechaCorta(clave: string): string {
  const partes = clave.split("-");
  const dia = Number(partes[2]);
  const mes = Number(partes[1]);
  const nombreDia = NOMBRES_DIAS[indiceDiaSemana(clave)];
  return nombreDia + " " + dia + " " + nombreMes(mes).slice(0, 3).toLowerCase();
}

// Primer y último día del mes en formato AAAA-MM-DD (para filtrar en Supabase)
export function limitesDelMes(anio: number, mes: number): { desde: string; hasta: string } {
  const desde = claveFecha(anio, mes, 1);
  const hasta = claveFecha(anio, mes, diasDelMes(anio, mes));
  return { desde: desde, hasta: hasta };
}
