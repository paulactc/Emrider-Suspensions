const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET /?mes=M&anio=Y[&operario=nombre]
router.get("/", async (req, res) => {
  try {
    const { mes, anio, operario } = req.query;
    let sql = "SELECT * FROM incidencias_protocolo WHERE 1=1";
    const params = [];

    if (mes) { sql += " AND mes = ?"; params.push(Number(mes)); }
    if (anio) { sql += " AND anio = ?"; params.push(Number(anio)); }
    if (operario) { sql += " AND operario_nombre = ?"; params.push(operario); }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(sql, params);
    res.json({ data: rows });
  } catch (error) {
    console.error("Error obteniendo incidencias:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// POST / — crear incidencia
router.post("/", async (req, res) => {
  try {
    const { operario_nombre, or_numero, moto_marca_modelo, tipo_incidencia, notas, mes, anio } = req.body;

    if (!operario_nombre || !or_numero || !moto_marca_modelo || !tipo_incidencia || !mes || !anio) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const [result] = await pool.execute(
      `INSERT INTO incidencias_protocolo (operario_nombre, or_numero, moto_marca_modelo, tipo_incidencia, notas, mes, anio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [operario_nombre, or_numero, moto_marca_modelo, tipo_incidencia, notas || null, Number(mes), Number(anio)]
    );

    res.status(201).json({ id: result.insertId, message: "Incidencia registrada" });
  } catch (error) {
    console.error("Error creando incidencia:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// DELETE /:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM incidencias_protocolo WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Incidencia no encontrada" });
    }

    res.json({ message: "Incidencia eliminada" });
  } catch (error) {
    console.error("Error eliminando incidencia:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
