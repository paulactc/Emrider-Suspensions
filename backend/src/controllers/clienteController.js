const { executeQuery } = require("../config/database");

exports.getAllClientes = async (req, res) => {
  try {
    const { success, data, error } = await executeQuery(
      "SELECT * FROM clientes"
    );

    if (!success) {
      console.error("Error al obtener clientes:", error);
      return res.status(500).json({ error: "Error al obtener clientes" });
    }

    res.json(data);
  } catch (err) {
    console.error("Error inesperado:", err.message);
    res.status(500).json({ error: "Error del servidor" });
  }
};
