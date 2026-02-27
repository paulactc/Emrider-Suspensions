const express = require("express");
const router = express.Router();
const webpush = require("web-push");
const { pool } = require("../config/database");
const gdtallerService = require("../services/gdtallerService");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ─── Helpers ────────────────────────────────────────────────────────────────

// Envía una notificación a todos los dispositivos de un CIF.
// Devuelve cuántas se enviaron con éxito y limpia las caducadas (410).
async function sendToCif(cif, payload) {
  const [rows] = await pool.execute(
    "SELECT * FROM push_subscriptions WHERE cif = ?",
    [cif]
  );
  if (rows.length === 0) return { ok: 0, failed: 0 };

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
        if (e.statusCode === 410) staleIds.push(row.id);
        throw e;
      }
    })
  );

  if (staleIds.length > 0) {
    await pool.execute(
      `DELETE FROM push_subscriptions WHERE id IN (${staleIds.map(() => "?").join(",")})`,
      staleIds
    );
  }

  const ok = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  return { ok, failed };
}

// Reglas de mantenimiento (mismas que en gdtaller.js)
const MAINTENANCE_RULES = [
  {
    id: "aceite",
    label: "Cambio de aceite de motor",
    keywordGroups: [["aceite", "motul"], ["aceite motor"], ["aceite de motor"]],
    meses: 12,
  },
  {
    id: "frenos",
    label: "Cambio de líquido de frenos",
    keywordGroups: [
      ["liquido", "motul"], ["líquido", "motul"],
      ["liquido de frenos"], ["líquido de frenos"],
      ["liquid frenos"], ["dot 4"], ["dot4"], ["dot 5"], ["dot5"],
    ],
    meses: 24,
  },
  {
    id: "refrigerante",
    label: "Cambio de líquido refrigerante",
    keywords: ["refrigerante", "anticongelante", "liquido refrigerante", "líquido refrigerante"],
    meses: 24,
  },
  {
    id: "ff",
    label: "Mantenimiento horquilla delantera (FF)",
    keywordGroups: [
      ["mantenimiento", "ff"], ["modificacion", "ff"], ["modificación", "ff"],
    ],
    meses: 12,
  },
  {
    id: "rr",
    label: "Mantenimiento amortiguador trasero (RR)",
    keywordGroups: [
      ["mantenimiento", "rr"],
      ["mantenimiento", "amortiguador trasero"],
      ["mantenimiento", "cambio de retenes"],
      ["mantenimiento", "cambio retenes"],
    ],
    meses: 12,
  },
];

// Compara keyword contra texto donde '?' es comodín de un carácter
// (GDTaller almacena tildes y ñ como '?' en algunos registros)
function textoContieneKeyword(texto, keyword) {
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const t = norm(texto);
  const k = norm(keyword);
  if (!t.includes("?")) return t.includes(k);
  const n = t.length, m = k.length;
  for (let i = 0; i <= n - m; i++) {
    let ok = true;
    for (let j = 0; j < m; j++) {
      if (t[i + j] !== "?" && t[i + j] !== k[j]) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

// Calcula alertas caducadas para un conjunto de líneas de ordenes de trabajo
function calcularAlertasCaducadas(lines) {
  const alertas = [];

  for (const rule of MAINTENANCE_RULES) {
    let ultimaFecha = null;

    for (const line of lines) {
      const texto = `${line.desc || ""} ${line.ref || ""} ${line.obs || ""}`;
      const coincide = rule.keywords
        ? rule.keywords.some((kw) => textoContieneKeyword(texto, kw))
        : rule.keywordGroups.some((group) =>
            group.every((kw) => textoContieneKeyword(texto, kw))
          );
      if (!coincide || !line.orFecha) continue;
      const fecha = new Date(line.orFecha);
      if (!ultimaFecha || fecha > ultimaFecha) ultimaFecha = fecha;
    }

    if (ultimaFecha) {
      const mesesTranscurridos =
        (Date.now() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      if (mesesTranscurridos >= rule.meses) {
        alertas.push({
          id: rule.id,
          label: rule.label,
          ultimaFecha: ultimaFecha.toISOString().split("T")[0],
          mesesDesde: Math.floor(mesesTranscurridos),
          mesesLimite: rule.meses,
        });
      }
    }
  }

  return alertas;
}

// Lógica principal: comprueba alertas y envía notificaciones individuales
async function checkAndNotify({ dryRun = false } = {}) {
  const log = [];

  // 1. Obtener CIFs únicos suscritos
  const [subs] = await pool.execute(
    "SELECT DISTINCT cif FROM push_subscriptions WHERE cif IS NOT NULL AND cif != ''"
  );
  if (subs.length === 0) {
    log.push("No hay CIFs suscritos con push.");
    return { log, enviadas: 0 };
  }

  // 2. Cargar todas las líneas de GDTaller y el mapa de clientes (clienteID → cif)
  const [allLines, rawClients] = await Promise.all([
    gdtallerService.getOrderLines(),
    gdtallerService.getClients(),
  ]);

  const cifToClienteId = {};
  const cifToNombre = {};
  for (const c of rawClients) {
    const cifNorm = (c.cif || "").replace(/\s+/g, "").toLowerCase();
    if (cifNorm && c.clienteID) {
      cifToClienteId[cifNorm] = String(c.clienteID);
    }
    if (cifNorm) {
      const mapped = gdtallerService.mapClientFromGDTaller(c);
      cifToNombre[cifNorm] = mapped.nombre || mapped.nombre_completo?.split(" ")[0] || null;
    }
  }

  let totalEnviadas = 0;

  for (const { cif } of subs) {
    const cifNorm = cif.replace(/\s+/g, "").toLowerCase();
    const clienteId = cifToClienteId[cifNorm];
    if (!clienteId) {
      log.push(`  [${cif}] No encontrado en GDTaller, omitido.`);
      continue;
    }

    // Líneas de órdenes de este cliente
    const clientLines = allLines.filter(
      (l) => String(l.clienteID) === clienteId
    );

    const alertas = calcularAlertasCaducadas(clientLines);
    if (alertas.length === 0) {
      log.push(`  [${cif}] Sin alertas caducadas.`);
      continue;
    }

    for (const alerta of alertas) {
      // Comprobar si ya enviamos esta notificación hoy
      const [[{ yaEnviado }]] = await pool.execute(
        `SELECT COUNT(*) as yaEnviado FROM push_notif_log
         WHERE cif = ? AND tipo = ? AND sent_date = CURDATE()`,
        [cif, alerta.id]
      );
      if (yaEnviado > 0) {
        log.push(`  [${cif}] ${alerta.id} → ya notificado hoy.`);
        continue;
      }

      const mesesExtra = alerta.mesesDesde - alerta.mesesLimite;
      const tiempoTexto = mesesExtra <= 0
        ? `hace ${alerta.mesesDesde} meses`
        : `con ${mesesExtra} ${mesesExtra === 1 ? "mes" : "meses"} de retraso`;

      const nombre = cifToNombre[cifNorm];
      const saludo = nombre ? `Hola ${nombre}, ` : "";

      const payload = JSON.stringify({
        title: "Taller Emrider · Revisión pendiente",
        body: `${saludo}${alerta.label} — Último servicio ${tiempoTexto}. Contacta con nosotros para programar una cita.`,
        icon: "/images/moto.png",
        badge: "/pwa-64x64.png",
        url: "/cliente",
      });

      if (!dryRun) {
        const { ok } = await sendToCif(cif, payload);
        if (ok > 0) {
          await pool.execute(
            "INSERT IGNORE INTO push_notif_log (cif, tipo) VALUES (?, ?)",
            [cif, alerta.id]
          );
          totalEnviadas++;
          log.push(`  [${cif}] ✓ Notificado: ${alerta.label}`);
        } else {
          log.push(`  [${cif}] ✗ Fallo al enviar: ${alerta.label}`);
        }
      } else {
        log.push(`  [${cif}] [DRY-RUN] Enviaría: ${alerta.label}`);
        totalEnviadas++;
      }
    }
  }

  return { log, enviadas: totalEnviadas };
}

// ─── Rutas ───────────────────────────────────────────────────────────────────

// GET - Devuelve la clave pública VAPID para que el frontend se suscriba
router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST - Guardar suscripción de un dispositivo (acepta cif opcional)
router.post("/subscribe", async (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: "Suscripción inválida" });
  }

  const { endpoint, keys, expirationTime, cif } = subscription;
  const cifNorm = cif ? cif.replace(/\s+/g, "").toLowerCase() : null;

  try {
    await pool.execute(
      `INSERT INTO push_subscriptions (endpoint, endpoint_hash, keys_auth, keys_p256dh, expiration_time, cif)
       VALUES (?, SHA1(?), ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         keys_auth = VALUES(keys_auth),
         keys_p256dh = VALUES(keys_p256dh),
         cif = COALESCE(VALUES(cif), cif),
         updated_at = NOW()`,
      [endpoint, endpoint, keys.auth, keys.p256dh, expirationTime ?? null, cifNorm]
    );

    const [[{ total }]] = await pool.execute(
      "SELECT COUNT(*) as total FROM push_subscriptions"
    );

    console.log(`[push] Suscripción registrada. CIF: ${cifNorm || "anónimo"}. Total: ${total}`);
    res.json({ success: true, total });
  } catch (err) {
    console.error("[push] Error guardando suscripción:", err.message);
    res.status(500).json({ error: "Error guardando suscripción" });
  }
});

// POST - Disparar comprobación y envío de notificaciones de mantenimiento
// ?dry=true para simular sin enviar
router.post("/notify-maintenance", async (req, res) => {
  const dryRun = req.query.dry === "true";
  try {
    console.log(`[push] Iniciando check-and-notify${dryRun ? " [DRY-RUN]" : ""}...`);
    const { log, enviadas } = await checkAndNotify({ dryRun });
    log.forEach((l) => console.log("[push]", l));
    res.json({ success: true, enviadas, dryRun, log });
  } catch (err) {
    console.error("[push] Error en notify-maintenance:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST - Enviar notificación de prueba a todos los dispositivos suscritos
router.post("/send-test", async (req, res) => {
  const { title, body, url } = req.body;
  const payload = JSON.stringify({
    title: title || "Taller Emrider",
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
          if (e.statusCode === 410) staleIds.push(row.id);
          throw e;
        }
      })
    );

    if (staleIds.length > 0) {
      await pool.execute(
        `DELETE FROM push_subscriptions WHERE id IN (${staleIds.map(() => "?").join(",")})`,
        staleIds
      );
    }

    const ok = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");
    failed.forEach((r) => console.error("[push] Error enviando:", r.reason?.message || r.reason));

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
    const [[{ conCif }]] = await pool.execute(
      "SELECT COUNT(*) as conCif FROM push_subscriptions WHERE cif IS NOT NULL"
    );
    res.json({ dispositivos: total, vinculados: conCif });
  } catch (err) {
    res.status(500).json({ error: "Error consultando estado" });
  }
});

// DELETE - Eliminar suscripción de un dispositivo
router.delete("/unsubscribe", async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: "Endpoint requerido" });

  try {
    const [result] = await pool.execute(
      "DELETE FROM push_subscriptions WHERE endpoint_hash = SHA1(?)",
      [endpoint]
    );
    res.json({ success: true, eliminadas: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando suscripción" });
  }
});

// GET - Historial de avisos enviados (para panel admin)
router.get("/notif-log", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT cif, tipo, enviado_at, sent_date
       FROM push_notif_log
       ORDER BY enviado_at DESC
       LIMIT 500`
    );

    if (rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Enriquecer con nombre del cliente desde GDTaller
    const cifsUnicos = [...new Set(rows.map((r) => r.cif))];
    let clienteMap = {};

    try {
      const rawClients = await gdtallerService.getClients();
      for (const c of rawClients) {
        const cifNorm = (c.cif || "").replace(/\s+/g, "").toLowerCase();
        if (cifsUnicos.includes(cifNorm)) {
          const mapped = gdtallerService.mapClientFromGDTaller(c);
          clienteMap[cifNorm] = {
            nombre: mapped.nombre_completo || mapped.nombre || mapped.apellidos || cifNorm,
            telefono: mapped.telefono || null,
            email: mapped.email || null,
          };
        }
      }
    } catch (_) { /* si GDTaller falla, devolvemos sin nombre */ }

    // Etiquetas legibles por tipo de alerta
    const LABELS = {
      aceite: "Cambio de aceite",
      frenos: "Líquido de frenos",
      refrigerante: "Líquido refrigerante",
      ff: "Horquilla delantera (FF)",
      rr: "Amortiguador trasero (RR)",
    };

    const data = rows.map((r) => ({
      cif: r.cif,
      tipo: r.tipo,
      tipoLabel: LABELS[r.tipo] || r.tipo,
      fecha: r.sent_date,
      horaEnvio: r.enviado_at,
      cliente: clienteMap[r.cif] || { nombre: r.cif, telefono: null, email: null },
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("[push] Error en notif-log:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET - Debug: ver suscripciones resumidas
router.get("/debug", async (_req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM push_subscriptions");
    res.json({
      total: rows.length,
      subs: rows.map((row, i) => ({
        i,
        cif: row.cif || "anónimo",
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
module.exports.checkAndNotify = checkAndNotify;
