const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const { testConnection } = require("../backend/src/config/database");

// Probar conexión al iniciar el servidor
testConnection();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente" });
});

// Rutas API
app.use("/api/clientes", require("./src/routes/cliente"));
app.use("/api/motos", require("./src/routes/motos"));
//app.use("/api/datos-tecnicos", require("./src/routes/datosTecnicos"));
app.use("/api/questionnaire", require("./src/routes/questionnaire"));
console.log("✅ Rutas registradas:");
console.log("  - /api/clientes");
console.log("  - /api/motos");
console.log("  - /api/questionnaire");

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
