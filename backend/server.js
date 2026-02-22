const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const { testConnection } = require("./src/config/database");

// Probar conexión al iniciar el servidor
testConnection();

// Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente" });
});

// Rutas API
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/clientes", require("./src/routes/cliente"));
app.use("/api/motos", require("./src/routes/motos"));
app.use("/api/questionnaire", require("./src/routes/questionnaire"));

// 🆕 NUEVA RUTA: Información de servicios (para tu flujo secuencial)
app.use("/api/servicios-info", require("./src/routes/serviciosInfo"));

// Datos técnicos (FF/RR)
app.use("/api/datos-tecnicos", require("./src/routes/datosTecnicos"));

// 🆕 NUEVA RUTA: Sincronización con GDTaller API externa
app.use("/api/gdtaller", require("./src/routes/gdtaller"));

// Sugerencias e incidencias de clientes
app.use("/api/sugerencias", require("./src/routes/sugerencias"));

// Solicitudes de recogida de moto
app.use("/api/recogidas", require("./src/routes/recogidas"));

// Citas previas
app.use("/api/citas", require("./src/routes/citas"));

console.log("✅ Rutas registradas:");
console.log("  - /api/clientes");
console.log("  - /api/motos");
console.log("  - /api/questionnaire");
console.log("  - /api/servicios-info");
console.log("  - /api/datos-tecnicos");
console.log("  - 🆕 /api/gdtaller (Sincronización API externa)");

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
