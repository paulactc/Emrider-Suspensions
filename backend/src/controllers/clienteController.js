// backend/src/controllers/clienteController.js
const pool = require("../config/database");

exports.getAllClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query("SELECT * FROM clientes");
    res.json(clientes);
  } catch (err) {
    console.error("Error al obtener clientes:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};
