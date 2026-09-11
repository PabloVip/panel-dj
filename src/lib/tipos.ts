// Tipos compartidos por toda la aplicación

export type EstadoBolo = "pendiente" | "confirmado" | "cancelado";

export type Bolo = {
  id: string;
  usuario_id: string;
  nombre: string;
  ubicacion: string | null;
  fecha: string; // formato AAAA-MM-DD
  hora_inicio: string | null; // formato HH:MM:SS
  hora_fin: string | null;
  precio: number;
  // Porcentaje que se lleva el manager en ese bolo (0 = sin comisión)
  comision_porcentaje: number;
  estado: EstadoBolo;
  cobrado: boolean;
  fecha_cobro: string | null;
  notas: string | null;
  creado_en: string;
};

// Una sala o sitio donde tocas, con su contacto y su caché habitual
export type Sala = {
  id: string;
  usuario_id: string;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  cache_habitual: number;
  comision_porcentaje: number;
  notas: string | null;
  creado_en: string;
};

// Respuesta que devuelven las server actions al formulario
export type Resultado = {
  ok: boolean;
  mensaje: string;
  // Cuando es true, el guardado se ha parado porque hay otro bolo
  // ese mismo día y el formulario debe pedir confirmación
  conflicto?: boolean;
};
