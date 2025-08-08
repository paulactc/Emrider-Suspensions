// backend/src/routes/cliente.js
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

// (Opcional) ping para probar el router
router.get("/ping", (req, res) => res.json({ message: "pong" }));

// GET - Obtener todos los clientes
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
        codigo_postal                    AS codigoPostal,
        provincia                        AS provincia
      FROM clientes
      ORDER BY nombre
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ message: "Error al obtener los clientes" });
  }
});

// GET - Obtener un cliente por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute("SELECT * FROM clientes WHERE id = ?", [
      id,
    ]);
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
    } = req.body;
    if (!nombre || !apellidos) {
      return res
        .status(400)
        .json({ message: "Nombre y apellidos son obligatorios" });
    }
    const query = `
      INSERT INTO clientes 
      (nombre, apellidos, email, telefono, direccion, codigo_postal, poblacion, provincia) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      nombre,
      apellidos,
      email,
      telefono,
      direccion,
      codigo_postal,
      poblacion,
      provincia,
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

// PUT - Actualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellidos,
      email,
      telefono,
      direccion,
      codigo_postal,
      poblacion,
      provincia,
    } = req.body;
    const query = `
      UPDATE clientes 
      SET nombre = ?, apellidos = ?, email = ?, telefono = ?, 
          direccion = ?, codigo_postal = ?, poblacion = ?, provincia = ?
      WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
      nombre,
      apellidos,
      email,
      telefono,
      direccion,
      codigo_postal,
      poblacion,
      provincia,
      id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json({ message: "Cliente actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ message: "Error al actualizar el cliente" });
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
