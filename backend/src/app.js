const express = require("express");
const cors = require("cors");

// Crear la aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
const clienteRoutes = require("./routes/cliente");
app.use("/api/clientes", clienteRoutes);
module.exports = app;

// CRUCIAL: Exportar la app
module.exports = app;
