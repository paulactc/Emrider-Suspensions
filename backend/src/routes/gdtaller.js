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

// GET - Debug: ver estructura RAW de GetOrderLines (primeras líneas sin mapear)
router.get("/debug-orderlines-sample", async (_req, res) => {
  try {
    gdtallerService.clearCache();
    const lines = await gdtallerService.getOrderLines();
    res.json({
      total_lineas: lines.length,
      campos_disponibles: lines.length > 0 ? Object.keys(lines[0]) : [],
      muestra_primeras_5: lines.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Imputación de horas a operario
// Algunos servicios tienen un tiempo imputable fijo que no coincide con cant.
// ---------------------------------------------------------------------------

function normalizarTexto(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // eliminar tildes
    .toLowerCase();
}

// Servicios con horas fijas: el valor de cant de GDTaller se ignora para estos.
const SERVICIOS_TIEMPO_FIJO = [
  // Recogida de vehículo a domicilio zona 1: 0.74 h
  { test: (t) => t.includes("recogida") && t.includes("domicilio") && t.includes("zona 1"), horas: 0.74 },
  // Neumático delantero: 0.33 h
  { test: (t) => t.includes("neumatico") && t.includes("delantero"), horas: 0.33 },
  // Neumático trasero: 0.77 h
  { test: (t) => t.includes("neumatico") && t.includes("trasero"), horas: 0.77 },
  // Diagnósis avanzada A: 3 h
  { test: (t) => /diagnosis.*avanzada?\s+a\b/.test(t), horas: 3 },
  // Diagnósis avanzada B: 5 h
  { test: (t) => /diagnosis.*avanzada?\s+b\b/.test(t), horas: 5 },
];

/**
 * Devuelve las horas imputables al operario para una línea de GDTaller.
 * Para los servicios de la tabla anterior usa el tiempo fijo definido aquí;
 * para el resto devuelve parseFloat(linea.cant).
 */
function horasImputadas(linea) {
  const texto = normalizarTexto((linea.desc || "") + " " + (linea.ref || ""));
  for (const { test, horas } of SERVICIOS_TIEMPO_FIJO) {
    if (test(texto)) return horas;
  }
  return parseFloat(linea.cant) || 0;
}

// GET - Debug: ver descripciones únicas de líneas para verificar patrones de servicios
// Query params: year, month (opcionales), q (filtro de texto opcional)
router.get("/debug-desc-servicios", async (req, res) => {
  try {
    const hoy = new Date();
    const y = parseInt(req.query.year) || hoy.getFullYear();
    const m = parseInt(req.query.month) || hoy.getMonth() + 1;
    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;
    const q = (req.query.q || "").toLowerCase();

    const lines = await gdtallerService.getOrderLines({ startDate, endDate });

    const mapa = {};
    for (const l of lines) {
      const key = `${l.desc || ""}|||${l.ref || ""}`;
      if (!mapa[key]) {
        const horasFijas = horasImputadas(l);
        const cantOriginal = parseFloat(l.cant) || 0;
        mapa[key] = {
          desc: l.desc || "",
          ref: l.ref || "",
          cant_original: cantOriginal,
          horas_imputadas: horasFijas,
          es_servicio_fijo: horasFijas !== cantOriginal,
          apariciones: 0,
        };
      }
      mapa[key].apariciones++;
    }

    let resultado = Object.values(mapa);
    if (q) resultado = resultado.filter((r) => r.desc.toLowerCase().includes(q) || r.ref.toLowerCase().includes(q));
    resultado.sort((a, b) => b.apariciones - a.apariciones);

    res.json({ periodo: { year: y, month: m }, total: resultado.length, lineas: resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Debug: ver operarios únicos en GetOrderLines
router.get("/debug-operarios", async (_req, res) => {
  try {
    const lines = await gdtallerService.getOrderLines();
    const operariosMap = {};
    for (const l of lines) {
      const key = l.operarioID ?? -1;
      if (!operariosMap[key]) {
        operariosMap[key] = { operarioID: key, operario: l.operario || "", lineas: 0 };
      }
      operariosMap[key].lineas++;
    }
    const operarios = Object.values(operariosMap).sort((a, b) => b.lineas - a.lineas);
    res.json({ total_operarios: operarios.length, operarios });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Líneas de trabajo de un operario por mes/año, con datos del vehículo
// Query params: operarioId, year, month
router.get("/operario-lineas", async (req, res) => {
  try {
    const { operarioId, year, month } = req.query;
    if (!operarioId) return res.status(400).json({ success: false, error: "operarioId requerido" });

    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;

    // GDTaller filtra GetOrderLines por fecha de TRABAJO (cuando se registró la línea),
    // no por orFecha (fecha de apertura de la OR). Esto es lo correcto para imputación
    // de horas: una OR abierta en enero pero trabajada en febrero aparece en febrero.
    const [lines, vehicles] = await Promise.all([
      gdtallerService.getOrderLines({ startDate, endDate }),
      gdtallerService.getVehicles().catch(() => []),
    ]);

    // Mapa vehiculoID → datos del vehículo
    const vehicleMap = {};
    for (const v of vehicles) {
      if (v.vehiculoID) vehicleMap[v.vehiculoID] = v;
    }

    // Filtrar solo por operario — GDTaller ya aplicó el filtro de fecha de trabajo
    const opId = parseInt(operarioId);
    const propias = lines.filter((l) => parseInt(l.operarioID) === opId);

    // Calcular año desde bastidor (VIN)
    function anioDesdeVIN(vin) {
      if (!vin) return null;
      const clean = vin.replace(/[\s-]/g, "").toUpperCase();
      if (clean.length !== 17) return null;
      const map = {
        A:1980,B:1981,C:1982,D:1983,E:1984,F:1985,G:1986,H:1987,J:1988,K:1989,
        L:1990,M:1991,N:1992,P:1993,R:1994,S:1995,T:1996,V:1997,W:1998,X:1999,Y:2000,
        "1":2001,"2":2002,"3":2003,"4":2004,"5":2005,"6":2006,"7":2007,"8":2008,"9":2009,
      };
      let yr = map[clean[9]];
      if (!yr) return null;
      if (yr < 2010 && yr + 30 <= new Date().getFullYear()) yr += 30;
      return yr;
    }

    const lineas = propias.map((l) => {
      const v = vehicleMap[l.vehiculoID] || null;
      return {
        orNum: l.orNum,
        orFecha: l.orFecha ? l.orFecha.substring(0, 10) : null,
        desc: l.desc || "",
        ref: l.ref || "",
        cant: horasImputadas(l),
        precio: parseFloat(l.precio) || 0,
        importe: parseFloat(l.importe) || 0,
        marca: v?.marca || null,
        modelo: v?.modelo || null,
        anio: anioDesdeVIN(v?.bastidor) || null,
        matricula: l.matricula || v?.matricula || null,
      };
    }).sort((a, b) => (a.orFecha || "").localeCompare(b.orFecha || ""));

    const totalHoras = lineas.reduce((s, l) => s + l.cant, 0);
    const totalImporte = lineas.reduce((s, l) => s + l.importe, 0);
    const operarioNombre = propias.length > 0 ? (propias[0].operario?.trim() || `Operario ${opId}`) : `Operario ${opId}`;

    res.json({
      success: true,
      operario: operarioNombre,
      periodo: { year: y, month: m },
      total_horas: Math.round(totalHoras * 100) / 100,
      total_importe: Math.round(totalImporte * 100) / 100,
      lineas,
    });
  } catch (error) {
    console.error("Error en operario-lineas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Horas por operario en un período (resumen, para Ernesto)
// Query params: year, month
router.get("/horas-operario", async (req, res) => {
  try {
    const hoy = new Date();
    const y = parseInt(req.query.year) || hoy.getFullYear();
    const m = parseInt(req.query.month) || hoy.getMonth() + 1;
    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;

    // GDTaller filtra por fecha de trabajo — es la fuente correcta para imputación mensual
    const lines = await gdtallerService.getOrderLines({ startDate, endDate });

    const filtradas = lines.filter((l) => l.operarioID !== undefined);

    const operariosMap = {};
    for (const l of filtradas) {
      const id = l.operarioID ?? -1;
      if (id === -1) continue; // excluir sin asignar
      if (!operariosMap[id]) {
        operariosMap[id] = {
          operarioID: id,
          operario: l.operario?.trim() || `Operario ${id}`,
          ordenes: new Set(),
          lineas: 0,
          totalHoras: 0,
          totalImporte: 0,
        };
      }
      if (l.orNum) operariosMap[id].ordenes.add(l.orNum);
      operariosMap[id].lineas++;
      operariosMap[id].totalHoras += horasImputadas(l);
      operariosMap[id].totalImporte += parseFloat(l.importe) || 0;
    }

    const resultado = Object.values(operariosMap)
      .map((o) => ({
        operarioID: o.operarioID,
        operario: o.operario,
        ordenes: o.ordenes.size,
        lineas: o.lineas,
        totalHoras: Math.round(o.totalHoras * 100) / 100,
        totalImporte: Math.round(o.totalImporte * 100) / 100,
      }))
      .sort((a, b) => b.totalHoras - a.totalHoras);

    res.json({
      success: true,
      periodo: { year: y, month: m },
      operarios: resultado,
    });
  } catch (error) {
    console.error("Error calculando horas por operario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
