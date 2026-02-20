// backend/src/routes/cliente.js
// Clientes vienen de GDTaller (fuente de verdad), solo cuestionario se guarda en MySQL
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const gdtallerService = require("../services/gdtallerService");

// Helper: obtener cuestionarios de forma segura (si MySQL falla, devuelve mapa vacio)
async function getCuestionarioClientesMap() {
  try {
    const [cuestionarios] = await pool.execute(
      `SELECT cif, peso, nivel_pilotaje AS nivelPilotaje, fecha_ultima_confirmacion AS fechaUltimaConfirmacion
       FROM cuestionario_clientes`
    );
    const map = {};
    for (const q of cuestionarios) {
      map[q.cif] = q;
    }
    return map;
  } catch (err) {
    console.warn("MySQL no disponible para cuestionarios de clientes:", err.message);
    return {};
  }
}

// Helper: obtener mapa de nombres de usuarios locales por DNI
async function getNombresUsuariosMap() {
  try {
    const [rows] = await pool.execute(
      `SELECT dni, nombre FROM usuarios WHERE dni IS NOT NULL AND dni != ''`
    );
    const map = {};
    for (const u of rows) {
      if (u.dni) map[u.dni.toLowerCase()] = u.nombre;
    }
    return map;
  } catch (err) {
    console.warn("MySQL no disponible para nombres de usuarios:", err.message);
    return {};
  }
}

// Helper: fusionar nombre local (de usuarios) en el cliente de GDTaller si procede
function mergeNombre(client, nombresMap) {
  if (!client.cif || !nombresMap) return client;
  const localNombre = nombresMap[client.cif.toLowerCase()];
  if (localNombre) {
    return { ...client, nombre: localNombre };
  }
  return client;
}

// Helper: obtener cuestionario de un cliente por CIF de forma segura
async function getCuestionarioByCif(cif) {
  try {
    const [rows] = await pool.execute(
      `SELECT peso, nivel_pilotaje AS nivelPilotaje, fecha_ultima_confirmacion AS fechaUltimaConfirmacion
       FROM cuestionario_clientes WHERE cif = ?`,
      [cif]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.warn("MySQL no disponible para cuestionario cliente:", err.message);
    return null;
  }
}

// GET - Obtener todos los clientes (GDTaller + merge cuestionario local)
router.get("/", async (req, res) => {
  try {
    // Obtener clientes de GDTaller
    const rawClients = await gdtallerService.getClients();
    const clients = rawClients.map(gdtallerService.mapClientFromGDTaller);

    // Intentar merge con cuestionario local (si MySQL falla, se devuelven sin cuestionario)
    const cuestionarioMap = await getCuestionarioClientesMap();

    const merged = clients.map((c) => {
      const q = c.cif ? cuestionarioMap[c.cif] : null;
      return {
        ...c,
        peso: q?.peso || null,
        nivelPilotaje: q?.nivelPilotaje || null,
        fechaUltimaConfirmacion: q?.fechaUltimaConfirmacion || null,
      };
    });

    res.json(merged);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    if (error.message.includes("GDTaller")) {
      return res.status(503).json({ message: "GDTaller no disponible. Intenta de nuevo en unos minutos." });
    }
    res.status(500).json({ message: "Error al obtener los clientes" });
  }
});

// GET - Obtener un cliente por ID (GDTaller clienteID) o CIF
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const rawClients = await gdtallerService.getClients();
    const clients = rawClients.map(gdtallerService.mapClientFromGDTaller);

    let client = clients.find((c) => String(c.id) === String(id));
    if (!client) {
      client = clients.find((c) => c.cif === id);
    }

    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Merge con cuestionario local y nombre local en paralelo
    if (client.cif) {
      const [q, nombresMap] = await Promise.all([
        getCuestionarioByCif(client.cif),
        getNombresUsuariosMap(),
      ]);
      if (q) {
        client.peso = q.peso;
        client.nivelPilotaje = q.nivelPilotaje;
        client.fechaUltimaConfirmacion = q.fechaUltimaConfirmacion;
      }
      client = mergeNombre(client, nombresMap);
    }

    res.json(client);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    if (error.message.includes("GDTaller")) {
      return res.status(503).json({ message: "GDTaller no disponible. Intenta de nuevo en unos minutos." });
    }
    res.status(500).json({ message: "Error al obtener el cliente" });
  }
});

// PUT - Actualizar SOLO datos del cuestionario (peso y nivel de pilotaje) por CIF
router.put("/:id/cuestionario", async (req, res) => {
  try {
    const { id } = req.params;
    const { peso, nivelPilotaje } = req.body;

    if (!peso || !nivelPilotaje) {
      return res.status(400).json({
        message: "Peso y nivel de pilotaje son obligatorios",
      });
    }

    // Resolver el CIF
    let cif = null;
    const rawClients = await gdtallerService.getClients();
    const clients = rawClients.map(gdtallerService.mapClientFromGDTaller);

    let client = clients.find((c) => String(c.id) === String(id));
    if (!client) {
      client = clients.find((c) => c.cif === id);
    }

    if (client && client.cif) {
      cif = client.cif;
    } else {
      return res.status(404).json({ message: "Cliente no encontrado en GDTaller" });
    }

    // UPSERT en cuestionario_clientes
    await pool.execute(
      `INSERT INTO cuestionario_clientes (cif, peso, nivel_pilotaje, fecha_ultima_confirmacion)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE peso = VALUES(peso), nivel_pilotaje = VALUES(nivel_pilotaje), fecha_ultima_confirmacion = NOW()`,
      [cif, peso, nivelPilotaje]
    );

    res.json({
      message: "Datos del cuestionario actualizados exitosamente",
    });
  } catch (error) {
    console.error("Error actualizando datos del cuestionario:", error);
    res.status(500).json({
      message: "Error al actualizar datos del cuestionario",
    });
  }
});

module.exports = router;
