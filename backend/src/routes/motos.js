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

// GET - Obtener motos por CIF (GDTaller + merge cuestionario local)
router.get("/by-cif/:cif", async (req, res) => {
  try {
    const { cif } = req.params;

    const vehicles = await gdtallerService.getVehiclesByCif(cif);
    const cuestionarioMap = await getCuestionarioMotosMap();

    const merged = vehicles.map((v) => mergeVehicleWithCuestionario(v, cuestionarioMap));

    res.json(merged);
  } catch (error) {
    console.error("Error obteniendo motos por CIF:", error);
    if (error.message.includes("GDTaller")) {
      return res.status(503).json({ error: "GDTaller no disponible. Intenta de nuevo en unos minutos." });
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
