const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { sendCitaEmail } = require("../services/emailService");

// POST /api/citas
router.post("/", async (req, res) => {
  const { cif, nombre, fecha, motivo } = req.body;

  if (!fecha || !fecha.trim()) {
    return res.status(400).json({ success: false, message: "La fecha es obligatoria" });
  }
  if (!motivo || !motivo.trim()) {
    return res.status(400).json({ success: false, message: "El motivo es obligatorio" });
  }

  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS citas (
        id     INT AUTO_INCREMENT PRIMARY KEY,
        cif    VARCHAR(20),
        nombre VARCHAR(100),
        fecha  VARCHAR(30) NOT NULL,
        motivo TEXT NOT NULL,
        creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(
      `INSERT INTO citas (cif, nombre, fecha, motivo) VALUES (?, ?, ?, ?)`,
      [cif || null, nombre || null, fecha.trim(), motivo.trim()]
    );

    try {
      await sendCitaEmail({ cif, nombre, fecha: fecha.trim(), motivo: motivo.trim() });
    } catch (emailErr) {
      console.warn("Email de cita no enviado:", emailErr.message);
    }

    res.json({ success: true, message: "Cita solicitada correctamente." });
  } catch (err) {
    console.error("Error guardando cita:", err);
    res.status(500).json({ success: false, message: "Error al enviar la solicitud" });
  }
});

module.exports = router;
