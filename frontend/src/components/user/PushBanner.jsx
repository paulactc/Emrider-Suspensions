import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import api from "../../../services/Api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function timeout(ms, promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms)),
  ]);
}

export default function PushBanner() {
  const [estado, setEstado] = useState("idle");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setEstado("no-soportado");
        return;
      }
      if (Notification.permission === "denied") {
        setEstado("denegado");
        return;
      }
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then(async (sub) => {
          if (sub) {
            setEstado("suscrito");
            // Re-registrar silenciosamente en backend por si lo perdió (ej. reinicio)
            try { await api.pushSubscribe(sub); } catch { /* silenciar */ }
          }
        })
        .catch(() => {});
    } catch {
      setEstado("no-soportado");
    }
  }, []);

  const activar = async () => {
    setCargando(true);
    setError(null);
    try {
      // 1. Pedir permiso
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") { setEstado("denegado"); return; }

      // 2. Esperar service worker (máx 8 segundos)
      const reg = await timeout(8000, navigator.serviceWorker.ready);

      // 3. Cancelar suscripción anterior si existe (limpiar stale)
      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) await existingSub.unsubscribe();

      // 4. Obtener clave pública
      const { publicKey } = await timeout(5000, api.getPushVapidKey());

      // 5. Suscribir
      const sub = await timeout(15000, reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey.trim()),
      }));

      // 6. Guardar en backend
      await timeout(5000, api.pushSubscribe(sub));
      setEstado("suscrito");
    } catch (err) {
      console.error("[push]", err.name, err.message, err);
      setError(`${err.name ? err.name + ": " : ""}${err.message || "Error al activar notificaciones"}`);
    } finally {
      setCargando(false);
    }
  };

  if (estado === "no-soportado") return null;

  if (estado === "suscrito") return (
    <div className="client-push-banner client-push-banner--ok">
      <Bell size={15} className="client-push-banner__icon" />
      <span className="client-push-banner__text">Notificaciones activas en este dispositivo</span>
      <button
        className="client-push-banner__btn"
        onClick={activar}
        disabled={cargando}
        style={{ marginLeft: "auto", fontSize: "0.7rem", opacity: 0.6 }}
        title="Reactivar suscripción"
      >
        {cargando ? "..." : "Reactivar"}
      </button>
    </div>
  );

  if (estado === "denegado") return (
    <div className="client-push-banner client-push-banner--blocked">
      <Bell size={15} className="client-push-banner__icon" />
      <span className="client-push-banner__text">Notificaciones bloqueadas — actívalas en ajustes del navegador</span>
    </div>
  );

  return (
    <div className="client-push-banner">
      <Bell size={15} className="client-push-banner__icon" />
      <div style={{ flex: 1 }}>
        <span className="client-push-banner__text">Activa los avisos de revisión en tu móvil</span>
        {error && <div style={{ fontSize: "0.7rem", color: "#f87171", marginTop: "0.2rem" }}>{error}</div>}
      </div>
      <button className="client-push-banner__btn" onClick={activar} disabled={cargando}>
        {cargando ? "Activando..." : "Activar"}
      </button>
    </div>
  );
}
