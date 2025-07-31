const express = require("express");
const cors = require("cors");

// Crear la aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "API Emrider funcionando correctamente",
    version: "1.0.0",
  });
});

// CRUCIAL: Exportar la app
module.exports = app;
