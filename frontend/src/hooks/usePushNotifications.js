import { useState, useEffect } from "react";
import api from "../../services/Api";

function getPermisoInicial() {
  try {
    if (typeof window === "undefined") return "unsupported";
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission;
  } catch {
    return "unsupported";
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [permiso, setPermiso] = useState("default");
  const [suscrito, setSuscrito] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    try {
      setPermiso(getPermisoInicial());
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setSuscrito(true);
        });
      }).catch(() => {});
    } catch {
      // silenciar errores de entorno
    }
  }, []);

  const activar = async () => {
    setCargando(true);
    try {
      if (!("Notification" in window)) {
        alert("Tu navegador no soporta notificaciones");
        return;
      }
      const resultado = await Notification.requestPermission();
      setPermiso(resultado);
      if (resultado !== "granted") return;

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Tu navegador no soporta push notifications");
        return;
      }

      const { publicKey } = await api.getPushVapidKey();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await api.pushSubscribe(sub);
      setSuscrito(true);
    } catch (err) {
      console.error("[push] Error:", err);
    } finally {
      setCargando(false);
    }
  };

  return { permiso, suscrito, cargando, activar };
}
