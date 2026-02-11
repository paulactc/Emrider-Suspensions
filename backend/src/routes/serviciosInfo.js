// backend/src/routes/serviciosInfo.js
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const gdtallerService = require("../services/gdtallerService");

// Helper: resolver GDTaller IDs a CIF/matricula
async function resolveIdentifiers({ motoId, clienteId, cif, matricula }) {
  let resolvedCif = cif || null;
  let resolvedMatricula = matricula || null;

  // Si recibimos motoId (GDTaller ID), resolver a matricula
  if (!resolvedMatricula && motoId) {
    const rawVehicles = await gdtallerService.getVehicles();
    const vehicles = rawVehicles.map(gdtallerService.mapVehicleFromGDTaller);
    const vehicle = vehicles.find((v) => String(v.id) === String(motoId));
    if (vehicle) {
      resolvedMatricula = vehicle.matricula;
      if (!resolvedCif) resolvedCif = vehicle.cifPropietario;
    }
  }

  // Si recibimos clienteId (GDTaller ID), resolver a CIF
  if (!resolvedCif && clienteId) {
    const rawClients = await gdtallerService.getClients();
    const clients = rawClients.map(gdtallerService.mapClientFromGDTaller);
    const client = clients.find((c) => String(c.id) === String(clienteId));
    if (client) resolvedCif = client.cif;
  }

  return { cif: resolvedCif, matricula: resolvedMatricula };
}

// GET - Obtener estadísticas de servicios (debe ir antes de /:id)
router.get("/stats/dashboard", async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT
        COUNT(*) as total_servicios,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as borradores,
        SUM(CASE WHEN tipo_suspension = 'FF' THEN 1 ELSE 0 END) as horquillas,
        SUM(CASE WHEN tipo_suspension = 'RR' THEN 1 ELSE 0 END) as amortiguadores
      FROM servicios_info
    `);

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Error obteniendo estadisticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadisticas",
      error: error.message,
    });
  }
});

// GET - Obtener información de servicio por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT
        id, moto_id, cliente_id, cif_cliente, matricula_moto,
        numero_orden, fecha_servicio, km_moto,
        fecha_proximo_mantenimiento, servicio_suspension, observaciones,
        peso_piloto, disciplina, marca, modelo, año, referencia,
        status, tipo_suspension, created_at, updated_at
       FROM servicios_info
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error obteniendo servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el servicio",
      error: error.message,
    });
  }
});

// GET - Obtener información de servicio por moto (moto_id O matricula_moto)
router.get("/by-moto/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    // Buscar por moto_id (legacy) O matricula_moto (nuevo)
    const [rows] = await pool.execute(
      `SELECT
        id, moto_id, cliente_id, cif_cliente, matricula_moto,
        numero_orden, fecha_servicio, km_moto,
        fecha_proximo_mantenimiento, servicio_suspension, observaciones,
        peso_piloto, disciplina, marca, modelo, año, referencia,
        status, tipo_suspension, created_at, updated_at
       FROM servicios_info
       WHERE moto_id = ? OR matricula_moto = ?
       ORDER BY created_at DESC`,
      [identifier, identifier]
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error obteniendo servicios por moto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los servicios",
      error: error.message,
    });
  }
});

// POST - Crear nueva información de servicio
router.post("/", async (req, res) => {
  try {
    const {
      motoId,
      clienteId,
      cif,
      matricula,
      numeroOrden,
      fechaServicio,
      kmMoto,
      fechaProximoMantenimiento,
      servicioSuspension,
      observaciones,
      pesoPiloto,
      disciplina,
      marca,
      modelo,
      año,
      referencia,
      tipoSuspension = "FF",
    } = req.body;

    if (!numeroOrden || !servicioSuspension) {
      return res.status(400).json({
        success: false,
        message: "Numero de orden y tipo de servicio son obligatorios",
      });
    }

    // Resolver identificadores a CIF/matricula
    const resolved = await resolveIdentifiers({ motoId, clienteId, cif, matricula });

    // Verificar que el número de orden no exista
    const [existing] = await pool.execute(
      "SELECT id FROM servicios_info WHERE numero_orden = ?",
      [numeroOrden]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "El numero de orden ya existe",
      });
    }

    const hasOptionalFields = marca && modelo && año && referencia;
    const status = hasOptionalFields ? "completed" : "pending";

    const query = `
      INSERT INTO servicios_info
      (moto_id, cliente_id, cif_cliente, matricula_moto,
       numero_orden, fecha_servicio, km_moto,
       fecha_proximo_mantenimiento, servicio_suspension, observaciones,
       peso_piloto, disciplina, marca, modelo, año, referencia,
       tipo_suspension, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      motoId || null,
      clienteId || null,
      resolved.cif,
      resolved.matricula,
      numeroOrden,
      fechaServicio || null,
      kmMoto || null,
      fechaProximoMantenimiento || null,
      servicioSuspension,
      observaciones || null,
      pesoPiloto || null,
      disciplina || null,
      marca || null,
      modelo || null,
      año || null,
      referencia || null,
      tipoSuspension,
      status,
    ]);

    res.status(201).json({
      success: true,
      message: "Informacion del servicio creada exitosamente",
      data: {
        id: result.insertId,
        status: status,
        numeroOrden: numeroOrden,
      },
    });
  } catch (error) {
    console.error("Error creando servicio:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "El numero de orden ya existe",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el servicio",
      error: error.message,
    });
  }
});

// PUT - Actualizar información de servicio
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numeroOrden,
      fechaServicio,
      kmMoto,
      fechaProximoMantenimiento,
      servicioSuspension,
      observaciones,
      pesoPiloto,
      disciplina,
      marca,
      modelo,
      año,
      referencia,
    } = req.body;

    const [existing] = await pool.execute(
      "SELECT id FROM servicios_info WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    const hasOptionalFields = marca && modelo && año && referencia;
    const status = hasOptionalFields ? "completed" : "pending";

    const query = `
      UPDATE servicios_info
      SET numero_orden = ?, fecha_servicio = ?, km_moto = ?,
          fecha_proximo_mantenimiento = ?, servicio_suspension = ?,
          observaciones = ?, peso_piloto = ?, disciplina = ?,
          marca = ?, modelo = ?, año = ?, referencia = ?,
          status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [
      numeroOrden,
      fechaServicio || null,
      kmMoto || null,
      fechaProximoMantenimiento || null,
      servicioSuspension,
      observaciones || null,
      pesoPiloto || null,
      disciplina || null,
      marca || null,
      modelo || null,
      año || null,
      referencia || null,
      status,
      id,
    ]);

    res.json({
      success: true,
      message: "Servicio actualizado exitosamente",
      data: {
        id: id,
        status: status,
        affectedRows: result.affectedRows,
      },
    });
  } catch (error) {
    console.error("Error actualizando servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el servicio",
      error: error.message,
    });
  }
});

// DELETE - Eliminar servicio
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM servicios_info WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Servicio eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el servicio",
      error: error.message,
    });
  }
});

module.exports = router;
