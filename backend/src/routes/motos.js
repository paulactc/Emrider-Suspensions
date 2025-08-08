// routes/motos.js
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

router.get("/by-cif/:cif", async (req, res) => {
  try {
    const { cif } = req.params;
    const [rows] = await pool.execute(
      `SELECT id, marca, modelo, anio, matricula, bastidor
       FROM motos
       WHERE cif_propietario = ?
       ORDER BY marca, modelo`,
      [cif]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error obteniendo motos" });
  }
});

module.exports = router;
