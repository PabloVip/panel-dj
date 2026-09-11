"use client";

import { useRef, useState, useTransition } from "react";
import { guardarBolo, borrarBolo } from "@/acciones/bolos";
import { fechaDeHoy, formatearEuros, sumarDias } from "@/lib/formato";
import type { Bolo, Sala } from "@/lib/tipos";

type Propiedades = {
  // Si viene un bolo, el formulario edita; si viene null, crea uno nuevo
  bolo: Bolo | null;
  fechaPorDefecto: string;
  // Salas guardadas, para sugerir la ubicación y rellenar el caché
  salas: Sala[];
  alCerrar: () => void;
};

export default function FormularioBolo(props: Propiedades) {
  const [error, establecerError] = useState("");
  const [avisoConflicto, establecerAvisoConflicto] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();

  // Al duplicar se reutilizan los datos del bolo pero se guarda como nuevo
  const [duplicando, establecerDuplicando] = useState(false);

  // Estado de los campos que muestran u ocultan otros campos
  const [cobrado, establecerCobrado] = useState(() => {
    if (props.bolo === null) {
      return false;
    }
    return props.bolo.cobrado;
  });
  const [repetir, establecerRepetir] = useState(false);

  // Precio y comisión se llevan en estado para poder enseñar el neto al momento
  const [precio, establecerPrecio] = useState(() => {
    if (props.bolo === null) {
      return "";
    }
    return String(props.bolo.precio);
  });

  const [conComision, establecerConComision] = useState(() => {
    if (props.bolo === null) {
      return false;
    }
    return Number(props.bolo.comision_porcentaje) > 0;
  });

  const [porcentaje, establecerPorcentaje] = useState(() => {
    if (props.bolo === null || Number(props.bolo.comision_porcentaje) <= 0) {
      return "20";
    }
    return String(props.bolo.comision_porcentaje);
  });

  const [ubicacion, establecerUbicacion] = useState(() => {
    if (props.bolo === null) {
      return "";
    }
    return props.bolo.ubicacion ?? "";
  });

  // Al escribir una ubicación que coincide con una sala guardada se
  // rellena el caché, pero solo si el precio todavía está vacío: nunca
  // se pisa un importe que ya hayas puesto.
  function cambiarUbicacion(valor: string) {
    establecerUbicacion(valor);

    if (precio !== "" && precio !== "0") {
      return;
    }

    const buscada = valor.trim().toLowerCase();
    for (const sala of props.salas) {
      if (sala.nombre.toLowerCase() === buscada) {
        if (Number(sala.cache_habitual) > 0) {
          establecerPrecio(String(sala.cache_habitual));
        }
        if (Number(sala.comision_porcentaje) > 0) {
          establecerConComision(true);
          establecerPorcentaje(String(sala.comision_porcentaje));
        }
        return;
      }
    }
  }

  // Guardamos el último envío por si hay que reenviarlo forzando el guardado
  const ultimoEnvio = useRef<FormData | null>(null);

  // ¿Estamos editando un bolo existente?
  let boloEnEdicion = props.bolo;
  if (duplicando === true) {
    boloEnEdicion = null;
  }

  let fechaInicial = props.fechaPorDefecto;
  if (props.bolo !== null && duplicando === false) {
    fechaInicial = props.bolo.fecha;
  }
  if (props.bolo !== null && duplicando === true) {
    // Por defecto la copia va a la semana siguiente
    fechaInicial = sumarDias(props.bolo.fecha, 7);
  }

  function enviar(datos: FormData) {
    ultimoEnvio.current = datos;
    establecerError("");
    establecerAvisoConflicto("");

    iniciarTransicion(async () => {
      const resultado = await guardarBolo(datos);

      if (resultado.ok === true) {
        props.alCerrar();
        return;
      }

      if (resultado.conflicto === true) {
        establecerAvisoConflicto(resultado.mensaje);
        return;
      }

      establecerError(resultado.mensaje);
    });
  }

  // Reenvía el mismo formulario diciéndole que ignore el solape
  function guardarIgualmente() {
    const datos = ultimoEnvio.current;
    if (datos === null) {
      return;
    }
    datos.set("forzar", "si");
    establecerAvisoConflicto("");

    iniciarTransicion(async () => {
      const resultado = await guardarBolo(datos);
      if (resultado.ok === true) {
        props.alCerrar();
      } else {
        establecerError(resultado.mensaje);
      }
    });
  }

  function alBorrar() {
    if (props.bolo === null) {
      return;
    }
    const identificador = props.bolo.id;

    establecerError("");
    iniciarTransicion(async () => {
      const resultado = await borrarBolo(identificador);
      if (resultado.ok === true) {
        props.alCerrar();
      } else {
        establecerError(resultado.mensaje);
      }
    });
  }

  // Neto que se enseña mientras se rellena el formulario
  let precioCalculado = Number(precio);
  if (Number.isNaN(precioCalculado) === true) {
    precioCalculado = 0;
  }

  let porcentajeCalculado = Number(porcentaje);
  if (Number.isNaN(porcentajeCalculado) === true || conComision === false) {
    porcentajeCalculado = 0;
  }

  const comisionCalculada = (precioCalculado * porcentajeCalculado) / 100;
  const netoCalculado = precioCalculado - comisionCalculada;

  // Valores iniciales de cada campo
  let valorNombre = "";
  let valorHoraInicio = "";
  let valorHoraFin = "";
  let valorEstado = "confirmado";
  let valorNotas = "";
  let valorFechaCobro = fechaDeHoy();
  let titulo = "Nuevo bolo";

  if (props.bolo !== null) {
    valorNombre = props.bolo.nombre;
    valorHoraInicio = (props.bolo.hora_inicio ?? "").slice(0, 5);
    valorHoraFin = (props.bolo.hora_fin ?? "").slice(0, 5);
    valorEstado = props.bolo.estado;
    valorNotas = props.bolo.notas ?? "";
    titulo = "Editar bolo";

    if (props.bolo.fecha_cobro !== null) {
      valorFechaCobro = props.bolo.fecha_cobro;
    }
  }

  if (duplicando === true) {
    titulo = "Duplicar bolo";
  }

  let textoBoton = "Guardar";
  if (pendiente === true) {
    textoBoton = "Guardando...";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
      <section className="my-8 w-full max-w-lg rounded-2xl border border-borde bg-superficie p-6">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button
            type="button"
            onClick={props.alCerrar}
            className="rounded-lg px-2 py-1 text-textoSecundario transition hover:text-textoPrincipal"
          >
            Cerrar
          </button>
        </header>

        <form action={enviar} className="flex flex-col gap-4">
          {boloEnEdicion !== null && (
            <input type="hidden" name="id" value={boloEnEdicion.id} />
          )}

          <div>
            <label className="etiqueta" htmlFor="nombre">
              Nombre del bolo
            </label>
            <input
              id="nombre"
              name="nombre"
              className="campo"
              defaultValue={valorNombre}
              placeholder="Sala Molins - sesión principal"
              required
            />
          </div>

          <div>
            <label className="etiqueta" htmlFor="ubicacion">
              Ubicación
            </label>
            <input
              id="ubicacion"
              name="ubicacion"
              className="campo"
              list="salas-guardadas"
              value={ubicacion}
              onChange={(evento) => cambiarUbicacion(evento.target.value)}
              placeholder="La Murada"
            />
            <datalist id="salas-guardadas">
              {props.salas.map((sala) => (
                <option key={sala.id} value={sala.nombre} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="etiqueta" htmlFor="fecha">
                Fecha
              </label>
              <input
                key={fechaInicial}
                id="fecha"
                name="fecha"
                type="date"
                className="campo"
                defaultValue={fechaInicial}
                required
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="hora_inicio">
                Hora inicio
              </label>
              <input
                id="hora_inicio"
                name="hora_inicio"
                type="time"
                className="campo"
                defaultValue={valorHoraInicio}
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="hora_fin">
                Hora fin
              </label>
              <input
                id="hora_fin"
                name="hora_fin"
                type="time"
                className="campo"
                defaultValue={valorHoraFin}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="precio">
                Precio (€)
              </label>
              <input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                min="0"
                className="campo"
                value={precio}
                onChange={(evento) => establecerPrecio(evento.target.value)}
                placeholder="250"
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="estado">
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                className="campo"
                defaultValue={valorEstado}
              >
                <option value="confirmado">Confirmado</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Comisión del manager */}
          <div className="rounded-xl border border-borde p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={conComision}
                onChange={(evento) => establecerConComision(evento.target.checked)}
                className="h-4 w-4 accent-[#8b5cf6]"
              />
              Este bolo lleva comisión de manager
            </label>

            {conComision === true && (
              <div className="mt-3 flex flex-wrap items-end gap-4">
                <div className="w-28">
                  <label className="etiqueta" htmlFor="comision_porcentaje">
                    Porcentaje
                  </label>
                  <input
                    id="comision_porcentaje"
                    name="comision_porcentaje"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    className="campo"
                    value={porcentaje}
                    onChange={(evento) => establecerPorcentaje(evento.target.value)}
                  />
                </div>

                <p className="pb-2 text-xs text-textoSecundario">
                  Comisión: {formatearEuros(comisionCalculada)}
                  <span className="mt-0.5 block text-sm font-medium text-acentoSuave">
                    Te quedan {formatearEuros(netoCalculado)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Cobro */}
          <div className="rounded-xl border border-borde p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="cobrado"
                checked={cobrado}
                onChange={(evento) => establecerCobrado(evento.target.checked)}
                className="h-4 w-4 accent-[#8b5cf6]"
              />
              Ya cobrado
            </label>

            {cobrado === true && (
              <div className="mt-3">
                <label className="etiqueta" htmlFor="fecha_cobro">
                  Fecha de cobro
                </label>
                <input
                  id="fecha_cobro"
                  name="fecha_cobro"
                  type="date"
                  className="campo"
                  defaultValue={valorFechaCobro}
                />
              </div>
            )}
          </div>

          {/* Repetición: solo al crear bolos nuevos */}
          {boloEnEdicion === null && (
            <div className="rounded-xl border border-borde p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={repetir}
                  onChange={(evento) => establecerRepetir(evento.target.checked)}
                  className="h-4 w-4 accent-[#8b5cf6]"
                />
                Repetir este bolo varias veces
              </label>

              {repetir === true && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="etiqueta" htmlFor="cadencia">
                      Cada
                    </label>
                    <select
                      id="cadencia"
                      name="cadencia"
                      className="campo"
                      defaultValue="semanal"
                    >
                      <option value="semanal">Semana</option>
                      <option value="quincenal">Dos semanas</option>
                      <option value="mensual">Mes</option>
                    </select>
                  </div>
                  <div>
                    <label className="etiqueta" htmlFor="repeticiones">
                      Nº de fechas
                    </label>
                    <input
                      id="repeticiones"
                      name="repeticiones"
                      type="number"
                      min="1"
                      max="52"
                      className="campo"
                      defaultValue="4"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="etiqueta" htmlFor="notas">
              Notas
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={3}
              className="campo"
              defaultValue={valorNotas}
              placeholder="Contacto, equipo de la sala, hora de prueba de sonido..."
            />
          </div>

          {avisoConflicto !== "" && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              <p className="whitespace-pre-line">{avisoConflicto}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={guardarIgualmente}
                  disabled={pendiente}
                  className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs text-amber-100 transition hover:bg-amber-500/30"
                >
                  Guardar de todos modos
                </button>
                <button
                  type="button"
                  onClick={() => establecerAvisoConflicto("")}
                  className="rounded-lg px-3 py-1.5 text-xs text-amber-200/70 transition hover:text-amber-100"
                >
                  Revisar la fecha
                </button>
              </div>
            </div>
          )}

          {error !== "" && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="flex gap-2">
              {boloEnEdicion !== null && (
                <button
                  type="button"
                  onClick={alBorrar}
                  disabled={pendiente}
                  className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
                >
                  Borrar
                </button>
              )}

              {boloEnEdicion !== null && (
                <button
                  type="button"
                  onClick={() => establecerDuplicando(true)}
                  className="rounded-lg border border-borde px-3 py-2 text-sm text-textoSecundario transition hover:text-textoPrincipal"
                >
                  Duplicar
                </button>
              )}
            </span>

            <button
              type="submit"
              disabled={pendiente}
              className="rounded-lg bg-acento px-4 py-2 font-medium text-white transition hover:bg-acentoSuave disabled:opacity-60"
            >
              {textoBoton}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
