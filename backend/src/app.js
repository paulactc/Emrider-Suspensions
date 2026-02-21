const express = require("express");
const cors = require("cors");

// Crear la aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de cliente
const clienteRoutes = require("./routes/cliente");
app.use("/api/clientes", clienteRoutes);

// Ruta de motos
const motosRoutes = require("./routes/motos");
app.use("/api/motos", motosRoutes);

// Ruta de GDTaller (sincronización con API externa)
const gdtallerRoutes = require("./routes/gdtaller");
app.use("/api/gdtaller", gdtallerRoutes);

// Sugerencias e incidencias de clientes
const sugerenciasRoutes = require("./routes/sugerencias");
app.use("/api/sugerencias", sugerenciasRoutes);

// CRUCIAL: Exportar la app
module.exports = app;
