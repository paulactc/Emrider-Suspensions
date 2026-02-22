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

    // Filtrar lineas de este cliente
    const clientLines = lines.filter(
      (l) => String(l.clienteID) === String(clientId)
    );

    // Agrupar por numero de orden
    const ordersMap = {};
    for (const line of clientLines) {
      const key = line.orNum;
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

// GET - Alertas de mantenimiento de motor por cliente (aceite, frenos, refrigerante)
router.get("/maintenance-alerts/:clientId", async (req, res) => {
  const { clientId } = req.params;

  const RULES = [
    {
      id: "aceite",
      label: "Cambio de aceite de motor",
      keywords: ["motul", "aceite motor", "aceite de motor"],
      meses: 12,
    },
    {
      id: "frenos",
      label: "Cambio de líquido de frenos",
      keywords: ["liquido de frenos", "líquido de frenos", "liquid frenos", "frenos motul", "dot 4", "dot4", "dot 5", "dot5"],
      meses: 24,
    },
    {
      id: "refrigerante",
      label: "Cambio de líquido refrigerante",
      keywords: ["refrigerante", "anticongelante", "liquido refrigerante", "líquido refrigerante"],
      meses: 24,
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
          const texto = `${line.desc || ""} ${line.ref || ""} ${line.obs || ""}`.toLowerCase();
          const coincide = rule.keywords.some((kw) => texto.includes(kw.toLowerCase()));
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
