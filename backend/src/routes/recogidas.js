const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { sendRecogidaEmail } = require("../services/emailService");

// POST /api/recogidas
router.post("/", async (req, res) => {
  const { cif, nombre, fecha, lugar } = req.body;

  if (!fecha || !fecha.trim()) {
    return res.status(400).json({ success: false, message: "La fecha es obligatoria" });
  }
  if (!lugar || !lugar.trim()) {
    return res.status(400).json({ success: false, message: "El lugar de recogida es obligatorio" });
  }

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS recogidas (
        id     INT AUTO_INCREMENT PRIMARY KEY,
        cif    VARCHAR(20),
        nombre VARCHAR(100),
        fecha  VARCHAR(30) NOT NULL,
        lugar  TEXT NOT NULL,
        creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(
      `INSERT INTO recogidas (cif, nombre, fecha, lugar) VALUES (?, ?, ?, ?)`,
      [cif || null, nombre || null, fecha.trim(), lugar.trim()]
    );

    try {
      await sendRecogidaEmail({ cif, nombre, fecha: fecha.trim(), lugar: lugar.trim() });
    } catch (emailErr) {
      console.warn("Email de recogida no enviado:", emailErr.message);
    }

    res.json({ success: true, message: "Solicitud de recogida enviada correctamente." });
  } catch (err) {
    console.error("Error guardando recogida:", err);
    res.status(500).json({ success: false, message: "Error al enviar la solicitud" });
  }
});

module.exports = router;
