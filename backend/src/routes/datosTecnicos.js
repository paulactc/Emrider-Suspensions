const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET - Obtener datos tecnicos por moto ID
router.get("/moto/:motoId", async (req, res) => {
  try {
    const { motoId } = req.params;

    const [rows] = await pool.execute(
      `SELECT id, servicio_id, moto_id, cliente_id, tipo_suspension,
              datos_json, created_at, updated_at
       FROM datos_tecnicos
       WHERE moto_id = ?
       ORDER BY created_at DESC`,
      [motoId]
    );

    // Parsear datos_json para cada fila
    const data = rows.map((row) => ({
      ...row,
      datos_json: typeof row.datos_json === "string"
        ? JSON.parse(row.datos_json)
        : row.datos_json,
    }));

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error obteniendo datos tecnicos por moto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los datos tecnicos",
      error: error.message,
    });
  }
});

// GET - Obtener datos tecnicos por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT id, servicio_id, moto_id, cliente_id, tipo_suspension,
              datos_json, created_at, updated_at
       FROM datos_tecnicos
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Datos tecnicos no encontrados",
      });
    }

    const row = rows[0];
    row.datos_json = typeof row.datos_json === "string"
      ? JSON.parse(row.datos_json)
      : row.datos_json;

    res.json({
      success: true,
      data: row,
    });
  } catch (error) {
    console.error("Error obteniendo datos tecnicos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los datos tecnicos",
      error: error.message,
    });
  }
});

// POST - Crear datos tecnicos
router.post("/", async (req, res) => {
  try {
    const {
      servicioId,
      motoId,
      clienteId,
      tipoSuspension,
      ...camposTecnicos
    } = req.body;

    if (!tipoSuspension) {
      return res.status(400).json({
        success: false,
        message: "Tipo de suspension es obligatorio (FF o RR)",
      });
    }

    const datosJson = JSON.stringify(camposTecnicos);

    const [result] = await pool.execute(
      `INSERT INTO datos_tecnicos
       (servicio_id, moto_id, cliente_id, tipo_suspension, datos_json)
       VALUES (?, ?, ?, ?, ?)`,
      [
        servicioId || null,
        motoId || null,
        clienteId || null,
        tipoSuspension,
        datosJson,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Datos tecnicos creados exitosamente",
      data: {
        id: result.insertId,
        tipoSuspension: tipoSuspension,
      },
    });
  } catch (error) {
    console.error("Error creando datos tecnicos:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear los datos tecnicos",
      error: error.message,
    });
  }
});

// PUT - Actualizar datos tecnicos
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      servicioId,
      motoId,
      clienteId,
      tipoSuspension,
      ...camposTecnicos
    } = req.body;

    const [existing] = await pool.execute(
      "SELECT id FROM datos_tecnicos WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Datos tecnicos no encontrados",
      });
    }

    const datosJson = JSON.stringify(camposTecnicos);

    const [result] = await pool.execute(
      `UPDATE datos_tecnicos
       SET servicio_id = ?, moto_id = ?, cliente_id = ?,
           tipo_suspension = ?, datos_json = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        servicioId || null,
        motoId || null,
        clienteId || null,
        tipoSuspension,
        datosJson,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Datos tecnicos actualizados exitosamente",
      data: {
        id: id,
        affectedRows: result.affectedRows,
      },
    });
  } catch (error) {
    console.error("Error actualizando datos tecnicos:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar los datos tecnicos",
      error: error.message,
    });
  }
});

module.exports = router;
