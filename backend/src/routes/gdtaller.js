// backend/src/routes/gdtaller.js
// Rutas de consulta directa a GDTaller (sin sincronización - GDTaller es la fuente de verdad)

const express = require("express");
const router = express.Router();
const gdtallerService = require("../services/gdtallerService");

// GET - Probar conexión con GDTaller
router.get("/test-connection", async (req, res) => {
  try {
    const result = await gdtallerService.testConnection();
    res.json({
      success: true,
      message: "Conexion con GDTaller establecida",
      data: result,
    });
  } catch (error) {
    console.error("Error probando conexion con GDTaller:", error);
    res.status(500).json({
      success: false,
      message: "Error conectando con GDTaller",
      error: error.message,
    });
  }
});

// GET - Debug: ver vehículos RAW de GDTaller para un cliente por CIF
router.get("/debug-vehicles/:cif", async (req, res) => {
  try {
    const { cif } = req.params;
    gdtallerService.clearCache();
    const cifNorm = cif.replace(/\s+/g, "").toLowerCase();

    // Buscar clienteID del cliente
    const rawClients = await gdtallerService.getClients();
    const client = rawClients.find(
      (c) => c.cif && c.cif.replace(/\s+/g, "").toLowerCase() === cifNorm
    );

    // Obtener todos los vehículos raw
    const rawVehicles = await gdtallerService.getVehicles();

    // Filtrar por clienteID (si lo encontramos)
    const byClienteID = client
      ? rawVehicles.filter((v) => String(v.clienteID) === String(client.clienteID))
      : [];

    // Filtrar por cliCif
    const byCliCif = rawVehicles.filter(
      (v) => v.cliCif && v.cliCif.replace(/\s+/g, "").toLowerCase() === cifNorm
    );

    res.json({
      cif_buscado: cif,
      cif_normalizado: cifNorm,
      cliente_encontrado: client || null,
      total_vehiculos_gdtaller: rawVehicles.length,
      muestra_raw_primer_vehiculo: rawVehicles[0] || null,
      vehiculos_por_clienteID: byClienteID,
      vehiculos_por_cliCif: byCliCif,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Debug: ver datos RAW de GDTaller para un cliente por CIF
router.get("/debug-client/:cif", async (req, res) => {
  try {
    const { cif } = req.params;
    gdtallerService.clearCache();
    const rawClients = await gdtallerService.getClients();
    const raw = rawClients.find(
      (c) => c.cif && c.cif.replace(/\s+/g, "").toLowerCase() === cif.toLowerCase()
    );
    if (!raw) {
      return res.json({ found: false, cif, total_clientes: rawClients.length });
    }
    res.json({
      found: true,
      raw_gdtaller: raw,
      mapped: gdtallerService.mapClientFromGDTaller(raw),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener clientes desde GDTaller
router.get("/clients", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const clients = await gdtallerService.getClients({ startDate, endDate });
    const mappedClients = clients.map(gdtallerService.mapClientFromGDTaller);

    res.json({
      success: true,
      count: mappedClients.length,
      data: mappedClients,
    });
  } catch (error) {
    console.error("Error obteniendo clientes de GDTaller:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo clientes de GDTaller",
      error: error.message,
    });
  }
});

// GET - Obtener vehículos desde GDTaller
router.get("/vehicles", async (req, res) => {
  try {
    const { startDate, endDate, clientId } = req.query;
    const vehicles = await gdtallerService.getVehicles({ startDate, endDate, clientId });
    const mappedVehicles = vehicles.map(gdtallerService.mapVehicleFromGDTaller);

    res.json({
      success: true,
      count: mappedVehicles.length,
      data: mappedVehicles,
    });
  } catch (error) {
    console.error("Error obteniendo vehiculos de GDTaller:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo vehiculos de GDTaller",
      error: error.message,
    });
  }
});

// GET - Obtener ordenes de trabajo agrupadas por cliente
router.get("/order-lines/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;

    // Resolver clientId: si no es puramente numérico, puede ser un CIF → buscar clienteID en GDTaller
    let resolvedClientId = clientId;
    if (!/^\d+$/.test(clientId)) {
      try {
        const rawClients = await gdtallerService.getClients();
        const cifNorm = clientId.replace(/\s+/g, "").toLowerCase();
        const found = rawClients.find(
          (c) => c.cif && c.cif.replace(/\s+/g, "").toLowerCase() === cifNorm
        );
        if (found && found.clienteID) {
          resolvedClientId = found.clienteID;
          console.log(`[order-lines] CIF ${clientId} → clienteID ${resolvedClientId}`);
        } else {
          console.warn(`[order-lines] CIF ${clientId} no encontrado en GDTaller`);
        }
      } catch (err) {
        console.warn("[order-lines] Error resolviendo CIF a clienteID:", err.message);
      }
    }

    // No pasar clientId a la API de GDTaller (el filtro server-side no funciona correctamente)
    // Obtenemos todas las lineas y filtramos nosotros
    // Cargar order lines y vehiculos en paralelo para mayor velocidad
    const [lines, vehiclesMap] = await Promise.all([
      gdtallerService.getOrderLines(),
      gdtallerService.getVehicles()
        .then((vehicles) => {
          const map = {};
          for (const v of vehicles) {
            if (v.vehiculoID) map[v.vehiculoID] = v;
          }
          return map;
        })
        .catch((err) => {
          console.warn("No se pudieron obtener vehiculos para enriquecer ordenes:", err.message);
          return {};
        }),
    ]);

    // Filtrar lineas de este cliente (usando clienteID resuelto)
    const clientLines = lines.filter(
      (l) => String(l.clienteID) === String(resolvedClientId)
    );

    // Agrupar por numero de orden (solo ordenes OR..., excluir EC... entregas a cuenta y similares)
    const ordersMap = {};
    for (const line of clientLines) {
      const key = line.orNum;
      if (!key || !key.toUpperCase().startsWith("OR")) continue;
      if (!ordersMap[key]) {
        const vehicle = vehiclesMap[line.vehiculoID] || null;
        ordersMap[key] = {
          orNum: line.orNum,
          orID: line.orID,
          fecha: line.orFecha,
          vehiculoID: line.vehiculoID,
          matricula: line.matricula || (vehicle && vehicle.matricula) || null,
          marca: (vehicle && vehicle.marca) || null,
          modelo: (vehicle && vehicle.modelo) || null,
          kms: line.orKms,
          lineas: [],
          totalBase: 0,
          totalImporte: 0,
        };
      }
      ordersMap[key].lineas.push({
        lineaID: line.lineaID,
        desc: line.desc,
        ref: line.ref,
        obs: line.obs,
        cant: line.cant,
        precio: line.precio,
        dcto: line.dcto,
        base: line.base,
        ivaPct: line.ivaPct,
        ivaImp: line.ivaImp,
        importe: line.importe,
      });
      ordersMap[key].totalBase += parseFloat(line.base) || 0;
      ordersMap[key].totalImporte += parseFloat(line.importe) || 0;
    }

    // Convertir a array y redondear totales
    const orders = Object.values(ordersMap)
      .map((o) => ({
        ...o,
        totalBase: o.totalBase.toFixed(2),
        totalImporte: o.totalImporte.toFixed(2),
      }))
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error obteniendo ordenes del cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo ordenes del cliente",
      error: error.message,
    });
  }
});

// GET - Probar GetVehicules con startDate=2021-01-01 y endDate=hoy (raw, sin mapear)
router.get("/test-vehicules", async (_req, res) => {
  try {
    const startDate = "2021-01-01";
    const endDate = new Date().toISOString().split("T")[0];

    // Llamada directa al servicio para ver la respuesta cruda de GDTALLER
    const gdtallerService = require("../services/gdtallerService");
    const vehicles = await gdtallerService.getVehicles({ startDate, endDate });

    res.json({
      success: true,
      params_enviados: { startDate, endDate, endpoint: "GetVehicules" },
      total_vehiculos: vehicles.length,
      muestra_primeros_3: vehicles.slice(0, 3),
    });
  } catch (error) {
    console.error("Error en test GetVehicules:", error);
    res.status(500).json({
      success: false,
      endpoint: "GetVehicules",
      error: error.message,
    });
  }
});

// Normaliza matrícula: sin espacios, mayúsculas
function normMat(m) {
  return (m || "").replace(/\s+/g, "").toUpperCase();
}

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

// GET - Alertas de mantenimiento de motor por cliente (aceite, frenos, refrigerante)
router.get("/maintenance-alerts/:clientId", async (req, res) => {
  let { clientId } = req.params;

  // Resolver CIF → clienteID numérico si es necesario
  if (!/^\d+$/.test(clientId)) {
    try {
      const rawClients = await gdtallerService.getClients();
      const cifNorm = clientId.replace(/\s+/g, "").toLowerCase();
      const found = rawClients.find(
        (c) => c.cif && c.cif.replace(/\s+/g, "").toLowerCase() === cifNorm
      );
      if (found && found.clienteID) {
        clientId = found.clienteID;
        console.log(`[maintenance-alerts] CIF → clienteID ${clientId}`);
      }
    } catch (err) {
      console.warn("[maintenance-alerts] Error resolviendo CIF:", err.message);
    }
  }

  const RULES = [
    {
      id: "aceite",
      label: "Cambio de aceite de motor",
      keywordGroups: [
        ["aceite", "motul"],
        ["aceite motor"],
        ["aceite de motor"],
      ],
      meses: 12,
    },
    {
      id: "frenos",
      label: "Cambio de líquido de frenos",
      keywordGroups: [
        ["liquido", "motul"],
        ["líquido", "motul"],
        ["liquido de frenos"],
        ["líquido de frenos"],
        ["liquid frenos"],
        ["dot 4"],
        ["dot4"],
        ["dot 5"],
        ["dot5"],
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
      // Ambas palabras de cada grupo deben aparecer en la misma línea de OR
      keywordGroups: [
        ["mantenimiento", "ff"],
        ["modificacion", "ff"],
        ["modificación", "ff"],
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

  try {
    // Cargar líneas y vehículos en paralelo
    const [lines, rawVehicles] = await Promise.all([
      gdtallerService.getOrderLines(),
      gdtallerService.getVehicles().catch(() => []),
    ]);

    // Mapa vehiculoID → matrícula normalizada (para líneas sin matrícula)
    const vehiculoMatMap = {};
    for (const v of rawVehicles) {
      const vid = v.vehiculoID || v.id;
      const mat = normMat(v.matricula);
      if (vid && mat) vehiculoMatMap[String(vid)] = mat;
    }

    const clientLines = lines.filter((l) => String(l.clienteID) === String(clientId));

    console.log(`[maintenance-alerts] clientId=${clientId} → ${clientLines.length} líneas encontradas`);

    // Agrupar líneas por matrícula NORMALIZADA (con fallback a vehiculoID)
    const byMatricula = {};
    for (const line of clientLines) {
      const mat = normMat(line.matricula) || vehiculoMatMap[String(line.vehiculoID)] || "";
      if (!mat) continue;
      if (!byMatricula[mat]) byMatricula[mat] = [];
      byMatricula[mat].push(line);
    }

    console.log(`[maintenance-alerts] matrículas encontradas: ${Object.keys(byMatricula).join(", ")}`);

    const resultado = {};

    for (const [mat, motoLines] of Object.entries(byMatricula)) {
      resultado[mat] = {};

      for (const rule of RULES) {
        let ultimaFecha = null;

        for (const line of motoLines) {
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
          const mesesTranscurridos = (Date.now() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
          resultado[mat][rule.id] = {
            ultimaFecha: ultimaFecha.toISOString().split("T")[0],
            alerta: mesesTranscurridos >= rule.meses,
            label: rule.label,
            meses: rule.meses,
            mesesDesde: Math.floor(mesesTranscurridos),
          };
        } else {
          resultado[mat][rule.id] = null;
        }
      }
    }

    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error("Error calculando alertas de mantenimiento:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Limpiar cache de GDTaller
router.post("/clear-cache", async (req, res) => {
  gdtallerService.clearCache();
  res.json({ success: true, message: "Cache limpiado" });
});

module.exports = router;
