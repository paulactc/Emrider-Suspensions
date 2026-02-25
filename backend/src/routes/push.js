const express = require("express");
const router = express.Router();
const webpush = require("web-push");
const { pool } = require("../config/database");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// GET - Devuelve la clave pública VAPID para que el frontend se suscriba
router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST - Guardar suscripción de un dispositivo
router.post("/subscribe", async (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: "Suscripción inválida" });
  }

  const { endpoint, keys, expirationTime } = subscription;

  try {
    await pool.execute(
      `INSERT INTO push_subscriptions (endpoint, endpoint_hash, keys_auth, keys_p256dh, expiration_time)
       VALUES (?, SHA1(?), ?, ?, ?)
       ON DUPLICATE KEY UPDATE keys_auth=VALUES(keys_auth), keys_p256dh=VALUES(keys_p256dh), updated_at=NOW()`,
      [endpoint, endpoint, keys.auth, keys.p256dh, expirationTime ?? null]
    );

    const [[{ total }]] = await pool.execute(
      "SELECT COUNT(*) as total FROM push_subscriptions"
    );

    console.log(`[push] Suscripción registrada. Total: ${total}`);
    res.json({ success: true, total });
  } catch (err) {
    console.error("[push] Error guardando suscripción:", err.message);
    res.status(500).json({ error: "Error guardando suscripción" });
  }
});

// POST - Enviar notificación de prueba a todos los dispositivos suscritos
router.post("/send-test", async (req, res) => {
  const { title, body, url } = req.body;
  const payload = JSON.stringify({
    title: title || "EmRider Garage",
    body: body || "¡Las notificaciones push funcionan!",
    url: url || "/",
  });

  try {
    const [rows] = await pool.execute("SELECT * FROM push_subscriptions");

    if (rows.length === 0) {
      return res.status(404).json({ error: "No hay dispositivos suscritos todavía" });
    }

    const staleIds = [];

    const results = await Promise.allSettled(
      rows.map(async (row) => {
        const sub = {
          endpoint: row.endpoint,
          keys: { auth: row.keys_auth, p256dh: row.keys_p256dh },
        };
        if (row.expiration_time) sub.expirationTime = row.expiration_time;

        try {
          return await webpush.sendNotification(sub, payload);
        } catch (e) {
          if (e.statusCode === 410) {
            staleIds.push(row.id);
          }
          throw e;
        }
      })
    );

    // Limpiar suscripciones caducadas (410 Gone)
    if (staleIds.length > 0) {
      await pool.execute(
        `DELETE FROM push_subscriptions WHERE id IN (${staleIds.map(() => "?").join(",")})`,
        staleIds
      );
      console.log(`[push] Eliminadas ${staleIds.length} suscripciones caducadas`);
    }

    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");
    failed.forEach((r) => console.error("[push] Error enviando:", r.reason?.message || r.reason));

    console.log(`[push] Enviadas: ${ok} ok, ${failed.length} fallidas`);
    res.json({ success: true, enviadas: ok, fallidas: failed.length });
  } catch (err) {
    console.error("[push] Error en send-test:", err.message);
    res.status(500).json({ error: "Error enviando notificaciones" });
  }
});

// GET - Ver cuántos dispositivos están suscritos
router.get("/status", async (_req, res) => {
  try {
    const [[{ total }]] = await pool.execute(
      "SELECT COUNT(*) as total FROM push_subscriptions"
    );
    res.json({ dispositivos: total });
  } catch (err) {
    console.error("[push] Error en status:", err.message);
    res.status(500).json({ error: "Error consultando estado" });
  }
});

// DELETE - Eliminar suscripción de un dispositivo
router.delete("/unsubscribe", async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: "Endpoint requerido" });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM push_subscriptions WHERE endpoint_hash = SHA1(?)",
      [endpoint]
    );
    res.json({ success: true, eliminadas: result.affectedRows });
  } catch (err) {
    console.error("[push] Error en unsubscribe:", err.message);
    res.status(500).json({ error: "Error eliminando suscripción" });
  }
});

// GET - Debug: ver endpoints de suscripciones (solo primeros chars)
router.get("/debug", async (_req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM push_subscriptions");
    res.json({
      total: rows.length,
      subs: rows.map((row, i) => ({
        i,
        endpoint: row.endpoint?.slice(0, 60) + "...",
        hasAuth: !!row.keys_auth,
        hasP256dh: !!row.keys_p256dh,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
