// questionnaire.js - Rutas para el cuestionario
// Guarda en cuestionario_clientes / cuestionario_motos (por CIF / matricula)
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const gdtallerService = require("../services/gdtallerService");

// Helper: resolver un identificador (GDTaller ID o CIF) a un CIF real
async function resolveClientCif(identifier) {
  // Intentar como CIF directamente
  const rawClients = await gdtallerService.getClients();
  const clients = rawClients.map(gdtallerService.mapClientFromGDTaller);

  // Buscar por ID de GDTaller
  let client = clients.find((c) => String(c.id) === String(identifier));
  if (client && client.cif) return client.cif;

  // Buscar por CIF
  client = clients.find((c) => c.cif === identifier);
  if (client && client.cif) return client.cif;

  return null;
}

// Helper: resolver un identificador (GDTaller ID o matrícula) a una matrícula real
async function resolveVehicleMatricula(identifier) {
  const rawVehicles = await gdtallerService.getVehicles();
  const vehicles = rawVehicles.map(gdtallerService.mapVehicleFromGDTaller);

  // Buscar por ID de GDTaller
  let vehicle = vehicles.find((v) => String(v.id) === String(identifier));
  if (vehicle && vehicle.matricula) return vehicle.matricula;

  // Buscar por matrícula
  vehicle = vehicles.find((v) => v.matricula === identifier);
  if (vehicle && vehicle.matricula) return vehicle.matricula;

  return null;
}

// POST - Guardar respuestas del cuestionario
router.post("/", async (req, res) => {
  const { cliente, motocicletas } = req.body;

  try {
    console.log("Guardando cuestionario:", { cliente, motocicletas });

    // Resolver CIF del cliente
    const cif = await resolveClientCif(cliente.id);
    if (!cif) {
      return res.status(404).json({
        success: false,
        message: "No se pudo resolver el CIF del cliente",
      });
    }

    // UPSERT datos del cliente en cuestionario_clientes
    await pool.execute(
      `INSERT INTO cuestionario_clientes (cif, peso, nivel_pilotaje, fecha_ultima_confirmacion)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE peso = VALUES(peso), nivel_pilotaje = VALUES(nivel_pilotaje), fecha_ultima_confirmacion = NOW()`,
      [cif, cliente.peso, cliente.nivelPilotaje]
    );

    console.log(`Cliente CIF ${cif} actualizado: peso=${cliente.peso}, nivel=${cliente.nivelPilotaje}`);

    // UPSERT datos de cada motocicleta en cuestionario_motos
    for (const moto of motocicletas) {
      const matricula = await resolveVehicleMatricula(moto.id);
      if (!matricula) {
        console.warn(`No se pudo resolver matricula para moto ID ${moto.id}, saltando...`);
        continue;
      }

      await pool.execute(
        `INSERT INTO cuestionario_motos (matricula, especialidad, tipo_conduccion, preferencia_rigidez)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE especialidad = VALUES(especialidad), tipo_conduccion = VALUES(tipo_conduccion), preferencia_rigidez = VALUES(preferencia_rigidez)`,
        [matricula, moto.especialidad, moto.tipoConduccion, moto.preferenciaRigidez]
      );

      console.log(`Moto matricula ${matricula} actualizada:`, {
        especialidad: moto.especialidad,
        tipoConduccion: moto.tipoConduccion,
        preferenciaRigidez: moto.preferenciaRigidez,
      });
    }

    res.json({
      success: true,
      message: "Cuestionario guardado correctamente",
    });
  } catch (error) {
    console.error("Error guardando cuestionario:", error);
    res.status(500).json({
      success: false,
      message: "Error al guardar el cuestionario",
      error: error.message,
    });
  }
});

// GET - Verificar estado del cuestionario
router.get("/status/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Resolver el CIF del cliente
    const cif = await resolveClientCif(id);
    if (!cif) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    let cliente = { peso: null, nivelPilotaje: null, fechaUltimaConfirmacion: null };
    try {
      const [rows] = await pool.execute(
        `SELECT peso, nivel_pilotaje AS nivelPilotaje, fecha_ultima_confirmacion AS fechaUltimaConfirmacion
         FROM cuestionario_clientes WHERE cif = ?`,
        [cif]
      );
      if (rows.length > 0) cliente = rows[0];
    } catch (err) {
      console.warn("MySQL no disponible para status cuestionario:", err.message);
    }

    const ahora = new Date();
    const unAnoAtras = new Date(ahora.getFullYear() - 1, ahora.getMonth(), ahora.getDate());

    const necesitaCuestionario =
      !cliente.peso ||
      !cliente.nivelPilotaje ||
      !cliente.fechaUltimaConfirmacion ||
      new Date(cliente.fechaUltimaConfirmacion) < unAnoAtras;

    const tipoRequerido =
      !cliente.peso || !cliente.nivelPilotaje ? "first-time" : "confirmation";

    res.json({
      necesitaCuestionario,
      tipoRequerido,
      datosCliente: cliente,
    });
  } catch (error) {
    console.error("Error verificando estado del cuestionario:", error);
    res.status(500).json({
      message: "Error del servidor",
      error: error.message,
    });
  }
});

module.exports = router;
