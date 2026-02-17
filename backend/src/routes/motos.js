// backend/src/routes/motos.js
// Motos vienen de GDTaller (fuente de verdad), solo cuestionario se guarda en MySQL
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const gdtallerService = require("../services/gdtallerService");

// Helper: obtener cuestionarios de motos de forma segura (si MySQL falla, devuelve mapa vacío)
async function getCuestionarioMotosMap() {
  try {
    const [rows] = await pool.execute(
      `SELECT matricula, especialidad, tipo_conduccion AS tipoConduccion, preferencia_rigidez AS preferenciaRigidez
       FROM cuestionario_motos`
    );
    const map = {};
    for (const r of rows) {
      map[r.matricula] = r;
    }
    return map;
  } catch (err) {
    console.warn("MySQL no disponible para cuestionarios de motos:", err.message);
    return {};
  }
}

// Helper: obtener cuestionario de una moto por matrícula de forma segura
async function getCuestionarioByMatricula(matricula) {
  try {
    const [rows] = await pool.execute(
      `SELECT especialidad, tipo_conduccion AS tipoConduccion, preferencia_rigidez AS preferenciaRigidez
       FROM cuestionario_motos WHERE matricula = ?`,
      [matricula]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.warn("MySQL no disponible para cuestionario moto:", err.message);
    return null;
  }
}

// Helper: merge vehículo GDTaller con cuestionario local
function mergeVehicleWithCuestionario(vehicle, cuestionarioMap) {
  const q = vehicle.matricula ? cuestionarioMap[vehicle.matricula] : null;
  return {
    ...vehicle,
    especialidad: q?.especialidad || null,
    tipoConduccion: q?.tipoConduccion || null,
    preferenciaRigidez: q?.preferenciaRigidez || null,
  };
}

// Helper: obtener motos desde servicios_info local (fallback cuando GDTaller no está disponible)
async function getMotosFromLocalDB(cif) {
  try {
    const [rows] = await pool.execute(
      `SELECT
        matricula_moto AS matricula,
        marca, modelo, año AS anio,
        moto_id AS id,
        cif_cliente,
        MAX(fecha_servicio) AS ultimoServicio,
        MAX(fecha_proximo_mantenimiento) AS fechaProximoMantenimiento,
        GROUP_CONCAT(DISTINCT tipo_suspension) AS tiposSuspension,
        MAX(status) AS ultimoStatus
       FROM servicios_info
       WHERE LOWER(cif_cliente) = LOWER(?)
       GROUP BY matricula_moto, marca, modelo, año, moto_id, cif_cliente
       ORDER BY MAX(fecha_servicio) DESC`,
      [cif]
    );
    return rows.map((r) => ({
      id: r.id || r.matricula || `local-${r.matricula}`,
      matricula: r.matricula || "",
      marca: r.marca || "Sin marca",
      modelo: r.modelo || "Sin modelo",
      anio: r.anio || null,
      cifPropietario: r.cif_cliente,
      ultimoServicio: r.ultimoServicio,
      fechaProximoMantenimiento: r.fechaProximoMantenimiento,
      tiposSuspension: r.tiposSuspension,
      ultimoStatus: r.ultimoStatus,
      fuenteLocal: true,
    }));
  } catch (err) {
    console.warn("Error consultando motos locales:", err.message);
    return [];
  }
}

// GET - Obtener motos por CIF (GDTaller + merge cuestionario local, con fallback a BD local)
router.get("/by-cif/:cif", async (req, res) => {
  try {
    const { cif } = req.params;
    let vehicles = [];
    let fromLocal = false;

    // Intentar obtener de GDTaller primero
    try {
      vehicles = await gdtallerService.getVehiclesByCif(cif);
    } catch (gdError) {
      console.warn("GDTaller no disponible, usando datos locales:", gdError.message);
      vehicles = await getMotosFromLocalDB(cif);
      fromLocal = true;
    }

    // Si GDTaller devolvió vacío, intentar también con datos locales
    if (!fromLocal && vehicles.length === 0) {
      const localMotos = await getMotosFromLocalDB(cif);
      if (localMotos.length > 0) {
        vehicles = localMotos;
        fromLocal = true;
      }
    }

    const cuestionarioMap = await getCuestionarioMotosMap();
    const merged = vehicles.map((v) => mergeVehicleWithCuestionario(v, cuestionarioMap));

    res.json(merged);
  } catch (error) {
    console.error("Error obteniendo motos por CIF:", error);
    // Último intento: datos locales
    try {
      const localMotos = await getMotosFromLocalDB(req.params.cif);
      return res.json(localMotos);
    } catch (localErr) {
      console.error("Error también en fallback local:", localErr);
    }
    res.status(500).json({ error: "Error obteniendo motos" });
  }
});

// GET - Obtener todas las motos (GDTaller + merge cuestionario local)
router.get("/", async (req, res) => {
  try {
    const rawVehicles = await gdtallerService.getVehicles();
    const vehicles = rawVehicles.map(gdtallerService.mapVehicleFromGDTaller);
    const cuestionarioMap = await getCuestionarioMotosMap();

    const merged = vehicles.map((v) => mergeVehicleWithCuestionario(v, cuestionarioMap));

    res.json(merged);
  } catch (error) {
    console.error("Error obteniendo todas las motos:", error);
    if (error.message.includes("GDTaller")) {
      return res.status(503).json({ error: "GDTaller no disponible. Intenta de nuevo en unos minutos." });
    }
    res.status(500).json({ error: "Error obteniendo motos" });
  }
});

// GET - Obtener moto por ID (GDTaller vehiculoID) o matrícula
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar en todos los vehículos de GDTaller
    const rawVehicles = await gdtallerService.getVehicles();
    const vehicles = rawVehicles.map(gdtallerService.mapVehicleFromGDTaller);

    let vehicle = vehicles.find((v) => String(v.id) === String(id));
    if (!vehicle) {
      vehicle = vehicles.find((v) => v.matricula === id);
    }

    if (!vehicle) {
      return res.status(404).json({ message: "Moto no encontrada" });
    }

    // Merge con cuestionario local (si MySQL falla, se devuelve sin cuestionario)
    if (vehicle.matricula) {
      const q = await getCuestionarioByMatricula(vehicle.matricula);
      if (q) {
        vehicle.especialidad = q.especialidad;
        vehicle.tipoConduccion = q.tipoConduccion;
        vehicle.preferenciaRigidez = q.preferenciaRigidez;
      }
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Error obteniendo moto por ID:", error);
    if (error.message.includes("GDTaller")) {
      return res.status(503).json({ error: "GDTaller no disponible. Intenta de nuevo en unos minutos." });
    }
    res.status(500).json({ error: "Error obteniendo moto" });
  }
});

module.exports = router;
