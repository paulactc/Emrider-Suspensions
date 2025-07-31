const app = require("./src/app");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Emrider con JWT corriendo en puerto ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔐 JWT activado y validaciones configuradas`);
  console.log(`⏰ Iniciado en: ${new Date().toLocaleString()}`);
});

// Manejo de errores del servidor
process.on("uncaughtException", (error) => {
  console.error("Error no capturado:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Promesa rechazada no manejada en:", promise, "razón:", reason);
  process.exit(1);
});
