const express = require("express");
const router = express.Router();

// routes/datos-tecnicos.js
router.get("/moto/:motoId", async (req, res) => {
  const { motoId } = req.params;
  const [rows] = await pool.execute(
    `SELECT * FROM datos_tecnicos WHERE moto_id = ? ORDER BY fecha DESC`,
    [motoId]
  );
  res.json(rows);
});
module.exports = router;
