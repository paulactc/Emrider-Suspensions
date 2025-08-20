// backend/src/routes/cliente.js
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// (Opcional) ping para probar el router
router.get("/ping", (req, res) => res.json({ message: "pong" }));

// GET - Obtener todos los clientes (CON CAMPOS DEL CUESTIONARIO CORREGIDOS)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        id,
        nombre,
        apellidos,
        telefono,
        cif,
        direccion                        AS direccion,
        localidad                        AS poblacion,
        codigo_postal                    AS codigo_postal,
        provincia                        AS provincia,
        peso,
        nivel_pilotaje                   AS nivelPilotaje,
        fecha_ultima_confirmacion        AS fechaUltimaConfirmacion
      FROM clientes
      ORDER BY nombre
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener los clientes" });
  }
});

// GET - Obtener un cliente por ID (CON CAMPOS DEL CUESTIONARIO CORREGIDOS)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `
      SELECT 
        id, nombre, apellidos, telefono, cif, direccion, 
        localidad AS poblacion, 
        codigo_postal AS codigo_postal, 
        provincia,
        peso, 
        nivel_pilotaje AS nivelPilotaje, 
        fecha_ultima_confirmacion AS fechaUltimaConfirmacion
      FROM clientes 
      WHERE id = ?
    `,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({ message: "Error al obtener el cliente" });
  }
});

// POST - Crear nuevo cliente
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      email,
      telefono,
      direccion,
      codigo_postal,
      poblacion,
      provincia,
      cif,
      peso,
      nivelPilotaje, // Frontend envía en camelCase
    } = req.body;

    if (!nombre || !apellidos) {
      return res
        .status(400)
        .json({ message: "Nombre y apellidos son obligatorios" });
    }

    const query = `
      INSERT INTO clientes 
      (nombre, apellidos, email, telefono, direccion, codigo_postal, localidad, provincia, cif, peso, nivel_pilotaje, fecha_ultima_confirmacion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await pool.execute(query, [
      nombre,
      apellidos,
      email,
      telefono,
      direccion,
      codigo_postal,
      poblacion, // Nota: El campo en DB es 'localidad'
      provincia,
      cif,
      peso,
      nivelPilotaje, // Se guarda como nivel_pilotaje en DB
    ]);

    res.status(201).json({
      message: "Cliente creado exitosamente",
      clienteId: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ message: "Error al crear el cliente" });
  }
});

// PUT - Actualizar cliente (SOLO DATOS BÁSICOS - SIN PESO NI NIVEL PILOTAJE)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📝 Datos recibidos para actualizar cliente:", req.body);
    console.log("🆔 ID del cliente:", id);

    const {
      nombre,
      apellidos,
      telefono,
      direccion,
      codigo_postal,
      poblacion, // ✅ Frontend envía "poblacion"
      provincia,
      cif,
    } = req.body;

    // ✅ Validaciones básicas
    if (!nombre || !apellidos) {
      return res.status(400).json({
        message: "Nombre y apellidos son obligatorios",
      });
    }

    // ✅ SOLO actualizar datos básicos del cliente (NO peso ni nivelPilotaje)
    const query = `
      UPDATE clientes 
      SET nombre = ?, 
          apellidos = ?, 
          telefono = ?, 
          direccion = ?, 
          codigo_postal = ?, 
          localidad = ?,           
          provincia = ?, 
          cif = ?
      WHERE id = ?
    `;

    // ✅ Parámetros en el MISMO ORDEN que la query SQL
    const [result] = await pool.execute(query, [
      nombre,
      apellidos,
      telefono,
      direccion,
      codigo_postal,
      poblacion, // ✅ Se mapea a "localidad" en DB
      provincia,
      cif,
      id, // ✅ ID va al final
    ]);

    console.log("✅ Resultado de la actualización:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    res.json({
      message: "Cliente actualizado exitosamente",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error detallado al actualizar cliente:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    });

    res.status(500).json({
      message: "Error al actualizar el cliente",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// PUT - Actualizar SOLO datos del cuestionario (peso y nivel de pilotaje)
router.put("/:id/cuestionario", async (req, res) => {
  try {
    const { id } = req.params;
    const { peso, nivelPilotaje } = req.body;

    console.log("📝 Actualizando datos del cuestionario para cliente:", id);
    console.log("🏋️ Peso:", peso, "🏍️ Nivel pilotaje:", nivelPilotaje);

    // ✅ Validaciones específicas del cuestionario
    if (!peso || !nivelPilotaje) {
      return res.status(400).json({
        message: "Peso y nivel de pilotaje son obligatorios",
      });
    }

    const query = `
      UPDATE clientes 
      SET peso = ?, 
          nivel_pilotaje = ?, 
          fecha_ultima_confirmacion = NOW()
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [peso, nivelPilotaje, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cliente no encontrado",
      });
    }

    res.json({
      message: "Datos del cuestionario actualizados exitosamente",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Error actualizando datos del cuestionario:", error);
    res.status(500).json({
      message: "Error al actualizar datos del cuestionario",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// DELETE - Eliminar cliente
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM clientes WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ message: "Error al eliminar el cliente" });
  }
});

module.exports = router;
