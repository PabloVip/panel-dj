"use client";

import { useEffect } from "react";

// Registra el service worker cuando la app carga en el navegador.
// Sin esto la aplicación no se puede instalar en el móvil.
export default function RegistroServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator === false) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Si falla el registro la web sigue funcionando igual,
      // simplemente no se puede instalar.
    });
  }, []);

  return null;
}
