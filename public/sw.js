// Service worker mínimo.
// Su única función es permitir que la web se instale como aplicación
// y que los iconos y estilos carguen rápido. Los datos de los bolos
// NO se guardan en caché: siempre se piden al servidor para que no
// aparezcan bolos desactualizados.

const NOMBRE_CACHE = "panel-dj-v1";
const ESTATICOS = ["/icono-192.png", "/icono-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE).then((cache) => cache.addAll(ESTATICOS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  // Al actualizar la app se borran las cachés antiguas
  evento.waitUntil(
    caches.keys().then((nombres) => {
      const borrados = [];
      for (const nombre of nombres) {
        if (nombre !== NOMBRE_CACHE) {
          borrados.push(caches.delete(nombre));
        }
      }
      return Promise.all(borrados);
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;

  // Solo se cachean imágenes propias; todo lo demás va directo a la red
  if (peticion.method !== "GET") {
    return;
  }

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const esEstatico = ESTATICOS.includes(url.pathname);
  if (esEstatico === false) {
    return;
  }

  evento.respondWith(
    caches.match(peticion).then((respuestaEnCache) => {
      if (respuestaEnCache !== undefined) {
        return respuestaEnCache;
      }
      return fetch(peticion);
    })
  );
});
