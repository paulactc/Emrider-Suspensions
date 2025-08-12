// routes/motos.js
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// GET - Obtener motos por CIF (CON CAMPOS DEL CUESTIONARIO CORREGIDOS)
router.get("/by-cif/:cif", async (req, res) => {
  try {
    const { cif } = req.params;
    console.log("🔍 Buscando motos para CIF:", cif);

    const [rows] = await pool.execute(
      `SELECT 
        id, 
        marca, 
        modelo, 
        anio, 
        matricula, 
        bastidor, 
        cif_propietario AS cifPropietario,
        especialidad, 
        tipo_conduccion AS tipoConduccion, 
        preferencia_rigidez AS preferenciaRigidez
       FROM motos
       WHERE cif_propietario = ?
       ORDER BY marca, modelo`,
      [cif]
    );

    console.log(`🏍️ Encontradas ${rows.length} motos para CIF ${cif}`);
    console.log("🔍 Datos de motos obtenidas:", rows); // Para debug
    res.json(rows);
  } catch (e) {
    console.error("Error obteniendo motos por CIF:", e);
    res.status(500).json({ error: "Error obteniendo motos" });
  }
});

// GET - Obtener todas las motos (CON CAMPOS DEL CUESTIONARIO CORREGIDOS)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        marca, 
        modelo, 
        anio, 
        matricula, 
        bastidor, 
        cif_propietario AS cifPropietario,
        especialidad, 
        tipo_conduccion AS tipoConduccion, 
        preferencia_rigidez AS preferenciaRigidez
       FROM motos
       ORDER BY marca, modelo`
    );
    res.json(rows);
  } catch (e) {
    console.error("Error obteniendo todas las motos:", e);
    res.status(500).json({ error: "Error obteniendo motos" });
  }
});

// GET - Obtener moto por ID (CON CAMPOS DEL CUESTIONARIO CORREGIDOS)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        marca, 
        modelo, 
        anio, 
        matricula, 
        bastidor, 
        cif_propietario AS cifPropietario,
        especialidad, 
        tipo_conduccion AS tipoConduccion, 
        preferencia_rigidez AS preferenciaRigidez
       FROM motos
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Moto no encontrada" });
    }

    res.json(rows[0]);
  } catch (e) {
    console.error("Error obteniendo moto por ID:", e);
    res.status(500).json({ error: "Error obteniendo moto" });
  }
});

// POST - Crear nueva moto
router.post("/", async (req, res) => {
  try {
    const {
      marca,
      modelo,
      anio,
      matricula,
      bastidor,
      cifPropietario, // Frontend envía en camelCase
      especialidad,
      tipoConduccion, // Frontend envía en camelCase
      preferenciaRigidez, // Frontend envía en camelCase
    } = req.body;

    if (!marca || !modelo || !cifPropietario) {
      return res.status(400).json({
        message: "Marca, modelo y CIF del propietario son obligatorios",
      });
    }

    const query = `
      INSERT INTO motos 
      (marca, modelo, anio, matricula, bastidor, cif_propietario, especialidad, tipo_conduccion, preferencia_rigidez) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      marca,
      modelo,
      anio,
      matricula,
      bastidor,
      cifPropietario, // Se guarda como cif_propietario en DB
      especialidad,
      tipoConduccion, // Se guarda como tipo_conduccion en DB
      preferenciaRigidez, // Se guarda como preferencia_rigidez en DB
    ]);

    res.status(201).json({
      message: "Moto creada exitosamente",
      motoId: result.insertId,
    });
  } catch (e) {
    console.error("Error creando moto:", e);
    res.status(500).json({ error: "Error creando moto" });
  }
});

// PUT - Actualizar moto (CON CAMPOS DEL CUESTIONARIO CORREGIDOS)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      marca,
      modelo,
      anio,
      matricula,
      bastidor,
      cifPropietario, // Frontend envía en camelCase
      especialidad,
      tipoConduccion, // Frontend envía en camelCase
      preferenciaRigidez, // Frontend envía en camelCase
    } = req.body;

    const query = `
      UPDATE motos 
      SET marca = ?, modelo = ?, anio = ?, matricula = ?, bastidor = ?, 
          cif_propietario = ?, especialidad = ?, tipo_conduccion = ?, preferencia_rigidez = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [
      marca,
      modelo,
      anio,
      matricula,
      bastidor,
      cifPropietario, // Se guarda como cif_propietario en DB
      especialidad,
      tipoConduccion, // Se guarda como tipo_conduccion en DB
      preferenciaRigidez, // Se guarda como preferencia_rigidez en DB
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Moto no encontrada" });
    }

    res.json({ message: "Moto actualizada exitosamente" });
  } catch (e) {
    console.error("Error actualizando moto:", e);
    res.status(500).json({ error: "Error actualizando moto" });
  }
});

// DELETE - Eliminar moto
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM motos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Moto no encontrada" });
    }

    res.json({ message: "Moto eliminada exitosamente" });
  } catch (e) {
    console.error("Error eliminando moto:", e);
    res.status(500).json({ error: "Error eliminando moto" });
  }
});

module.exports = router;
