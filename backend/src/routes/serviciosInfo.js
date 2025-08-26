// backend/src/routes/serviciosInfo.js
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET - Obtener información de servicio por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Obteniendo servicio ID:", id);

    const [rows] = await pool.execute(
      `SELECT 
        id, moto_id, cliente_id, numero_orden, fecha_servicio, km_moto,
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

    console.log("✅ Servicio encontrado:", rows[0]);
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("❌ Error obteniendo servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el servicio",
      error: error.message,
    });
  }
});

// GET - Obtener información de servicio por moto_id
router.get("/by-moto/:motoId", async (req, res) => {
  try {
    const { motoId } = req.params;
    console.log("🔍 Obteniendo servicios para moto ID:", motoId);

    const [rows] = await pool.execute(
      `SELECT 
        id, moto_id, cliente_id, numero_orden, fecha_servicio, km_moto,
        fecha_proximo_mantenimiento, servicio_suspension, observaciones,
        peso_piloto, disciplina, marca, modelo, año, referencia,
        status, tipo_suspension, created_at, updated_at
       FROM servicios_info 
       WHERE moto_id = ? 
       ORDER BY created_at DESC`,
      [motoId]
    );

    console.log(`✅ Encontrados ${rows.length} servicios para moto ${motoId}`);
    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("❌ Error obteniendo servicios por moto:", error);
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

    console.log("📝 Creando nuevo servicio:", req.body);

    // Validaciones obligatorias
    if (!motoId) {
      return res.status(400).json({
        success: false,
        message: "El ID de la moto es obligatorio",
      });
    }

    if (!numeroOrden || !servicioSuspension) {
      return res.status(400).json({
        success: false,
        message: "Número de orden y tipo de servicio son obligatorios",
      });
    }

    // Verificar que el número de orden no exista
    const [existing] = await pool.execute(
      "SELECT id FROM servicios_info WHERE numero_orden = ?",
      [numeroOrden]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "El número de orden ya existe",
      });
    }

    const query = `
      INSERT INTO servicios_info 
      (moto_id, cliente_id, numero_orden, fecha_servicio, km_moto, 
       fecha_proximo_mantenimiento, servicio_suspension, observaciones,
       peso_piloto, disciplina, marca, modelo, año, referencia, 
       tipo_suspension, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Determinar status basado en si los campos opcionales están completos
    const hasOptionalFields = marca && modelo && año && referencia;
    const status = hasOptionalFields ? "completed" : "pending";

    const [result] = await pool.execute(query, [
      motoId,
      clienteId || null,
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

    console.log("✅ Servicio creado con ID:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Información del servicio creada exitosamente",
      data: {
        id: result.insertId,
        status: status,
        numeroOrden: numeroOrden,
      },
    });
  } catch (error) {
    console.error("❌ Error creando servicio:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "El número de orden ya existe",
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

    console.log("📝 Actualizando servicio ID:", id, "con datos:", req.body);

    // Verificar que el servicio existe
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

    const query = `
      UPDATE servicios_info 
      SET numero_orden = ?, fecha_servicio = ?, km_moto = ?,
          fecha_proximo_mantenimiento = ?, servicio_suspension = ?,
          observaciones = ?, peso_piloto = ?, disciplina = ?,
          marca = ?, modelo = ?, año = ?, referencia = ?,
          status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    // Determinar status basado en completitud
    const hasOptionalFields = marca && modelo && año && referencia;
    const status = hasOptionalFields ? "completed" : "pending";

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

    console.log("✅ Servicio actualizado, rows affected:", result.affectedRows);

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
    console.error("❌ Error actualizando servicio:", error);
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
    console.log("🗑️ Eliminando servicio ID:", id);

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

    console.log("✅ Servicio eliminado");
    res.json({
      success: true,
      message: "Servicio eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el servicio",
      error: error.message,
    });
  }
});

// GET - Obtener estadísticas de servicios
router.get("/stats/dashboard", async (req, res) => {
  try {
    console.log("📊 Obteniendo estadísticas de servicios");

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

    console.log("✅ Estadísticas obtenidas:", stats[0]);
    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
});

module.exports = router;
