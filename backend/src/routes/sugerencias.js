const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { sendSugerenciaEmail } = require("../services/emailService");

// POST /api/sugerencias
router.post("/", async (req, res) => {
  const { mensaje, cif, nombre } = req.body;

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ success: false, message: "El mensaje no puede estar vacío" });
  }

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sugerencias (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        cif         VARCHAR(20),
        nombre      VARCHAR(100),
        mensaje     TEXT NOT NULL,
        fecha       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(
      `INSERT INTO sugerencias (cif, nombre, mensaje) VALUES (?, ?, ?)`,
      [cif || null, nombre || null, mensaje.trim()]
    );

    try {
      await sendSugerenciaEmail({ cif, nombre, mensaje: mensaje.trim() });
    } catch (emailErr) {
      console.warn("Email de sugerencia no enviado:", emailErr.message);
    }

    res.json({ success: true, message: "¡Sugerencia recibida! Gracias por escribirnos." });
  } catch (err) {
    console.error("Error guardando sugerencia:", err);
    res.status(500).json({ success: false, message: "Error al enviar la sugerencia" });
  }
});

module.exports = router;
