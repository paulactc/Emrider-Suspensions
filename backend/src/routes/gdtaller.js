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
    const lines = await gdtallerService.getOrderLines();

    // Obtener datos de vehiculos para enriquecer las ordenes
    let vehiclesMap = {};
    try {
      const vehicles = await gdtallerService.getVehicles();
      for (const v of vehicles) {
        if (v.vehiculoID) vehiclesMap[v.vehiculoID] = v;
      }
    } catch (err) {
      console.warn("No se pudieron obtener vehiculos para enriquecer ordenes:", err.message);
    }

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

// POST - Limpiar cache de GDTaller
router.post("/clear-cache", async (req, res) => {
  gdtallerService.clearCache();
  res.json({ success: true, message: "Cache limpiado" });
});

module.exports = router;
