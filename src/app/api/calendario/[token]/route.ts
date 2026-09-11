import { createClient } from "@supabase/supabase-js";

// Calendario suscribible para el móvil.
//
// El iPhone pide esta dirección sin estar identificado, así que la única
// credencial es la clave secreta que va en la propia URL. La consulta se
// hace contra una función de la base de datos que solo devuelve los bolos
// del dueño de esa clave.

type BoloDelCalendario = {
  id: string;
  nombre: string;
  ubicacion: string | null;
  direccion: string | null;
  telefono: string | null;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  precio: number;
  estado: string;
  notas: string | null;
};

// Cuánto se aleja la hora española de la hora universal en ese momento
function desfaseDeMadrid(momento: Date): number {
  const comoEspana = new Date(
    momento.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
  );
  return comoEspana.getTime() - momento.getTime();
}

// Convierte una fecha y hora españolas al formato universal del calendario
function aFormatoIcs(fecha: string, hora: string, sumarUnDia: boolean): string {
  const partesFecha = fecha.split("-");
  const partesHora = hora.split(":");

  let dia = Number(partesFecha[2]);
  if (sumarUnDia === true) {
    dia = dia + 1;
  }

  const tentativa = new Date(
    Date.UTC(
      Number(partesFecha[0]),
      Number(partesFecha[1]) - 1,
      dia,
      Number(partesHora[0]),
      Number(partesHora[1])
    )
  );

  const universal = new Date(tentativa.getTime() - desfaseDeMadrid(tentativa));

  return universal.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
}

// Las líneas del calendario no pueden llevar saltos ni comas sueltas
function escapar(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export async function GET(
  peticion: Request,
  contexto: { params: Promise<{ token: string }> }
) {
  const parametros = await contexto.params;
  const token = parametros.token;

  if (token === undefined || token.length < 24) {
    return new Response("No encontrado", { status: 404 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const respuesta = await supabase.rpc("bolos_del_calendario", {
    p_token: token,
  });

  if (respuesta.error !== null) {
    return new Response("No encontrado", { status: 404 });
  }

  let bolos: BoloDelCalendario[] = [];
  if (respuesta.data !== null) {
    bolos = respuesta.data as BoloDelCalendario[];
  }

  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Panel DJ//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Bolos",
    "X-WR-TIMEZONE:Europe/Madrid",
    // Le pide al móvil que compruebe si hay novedades cada hora
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  const ahora = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  for (const bolo of bolos) {
    lineas.push("BEGIN:VEVENT");
    lineas.push("UID:" + bolo.id + "@panel-dj");
    lineas.push("DTSTAMP:" + ahora);

    if (bolo.hora_inicio === null) {
      // Sin hora se guarda como evento de día completo
      lineas.push("DTSTART;VALUE=DATE:" + bolo.fecha.replace(/-/g, ""));
    } else {
      const inicio = bolo.hora_inicio.slice(0, 5);
      lineas.push("DTSTART:" + aFormatoIcs(bolo.fecha, inicio, false));

      let fin = bolo.hora_fin;
      if (fin === null) {
        // Si no hay hora de fin se le da una hora de duración
        const horas = Number(inicio.slice(0, 2)) + 1;
        fin = String(horas % 24).padStart(2, "0") + ":" + inicio.slice(3, 5);
      }
      const horaFin = fin.slice(0, 5);

      // Un bolo que acaba antes de la hora a la que empieza termina al día siguiente
      const cruzaMedianoche = horaFin <= inicio;
      lineas.push("DTEND:" + aFormatoIcs(bolo.fecha, horaFin, cruzaMedianoche));
    }

    let titulo = bolo.nombre;
    if (bolo.ubicacion !== null && bolo.ubicacion !== "") {
      titulo = bolo.nombre + " · " + bolo.ubicacion;
    }
    lineas.push("SUMMARY:" + escapar(titulo));

    // La dirección completa es lo que permite que Mapas trace la ruta y
    // que el coche pueda navegar al bolo desde el propio calendario
    let lugar = bolo.direccion;
    if (lugar === null || lugar === "") {
      lugar = bolo.ubicacion;
    }
    if (lugar !== null && lugar !== "") {
      lineas.push("LOCATION:" + escapar(lugar));
    }

    const descripcion = [];
    descripcion.push("Caché: " + Number(bolo.precio).toFixed(2) + " EUR");
    if (bolo.telefono !== null && bolo.telefono !== "") {
      descripcion.push("Contacto: " + bolo.telefono);
    }
    if (bolo.notas !== null && bolo.notas !== "") {
      descripcion.push(bolo.notas);
    }
    lineas.push("DESCRIPTION:" + escapar(descripcion.join(" — ")));

    if (bolo.estado === "pendiente") {
      lineas.push("STATUS:TENTATIVE");
    } else {
      lineas.push("STATUS:CONFIRMED");
    }

    // Aviso tres horas antes, que es cuando toca cargar el coche
    if (bolo.hora_inicio !== null) {
      lineas.push("BEGIN:VALARM");
      lineas.push("ACTION:DISPLAY");
      lineas.push("DESCRIPTION:" + escapar(titulo));
      lineas.push("TRIGGER:-PT3H");
      lineas.push("END:VALARM");
    }

    lineas.push("END:VEVENT");
  }

  lineas.push("END:VCALENDAR");

  return new Response(lineas.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
