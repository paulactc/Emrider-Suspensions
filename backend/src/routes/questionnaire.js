// questionnaire.js - Rutas para el cuestionario
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");

console.log("🔥 QUESTIONNAIRE ROUTE LOADED"); // ← Mover DESPUÉS de declarar router

// Endpoint para guardar respuestas del cuestionario
router.post("/", async (req, res) => {
  console.log("🔥 POST /questionnaire CALLED");
  const { cliente, motocicletas } = req.body;

  try {
    console.log("📝 Guardando cuestionario:", { cliente, motocicletas });

    // Actualizar datos del cliente
    const updateClienteQuery = `
      UPDATE clientes 
      SET peso = ?, 
          nivel_pilotaje = ?, 
          fecha_ultima_confirmacion = NOW()
      WHERE id = ?
    `;

    await pool.execute(updateClienteQuery, [
      cliente.peso,
      cliente.nivelPilotaje,
      cliente.id,
    ]);

    // Actualizar datos de motocicletas
    for (const moto of motocicletas) {
      const updateMotoQuery = `
        UPDATE motos 
        SET especialidad = ?, 
            tipo_conduccion = ?, 
            preferencia_rigidez = ?
        WHERE id = ?
      `;

      await pool.execute(updateMotoQuery, [
        moto.especialidad,
        moto.tipoConduccion,
        moto.preferenciaRigidez,
        moto.id,
      ]);
    }

    res.json({
      success: true,
      message: "Cuestionario guardado correctamente",
    });
  } catch (error) {
    console.error("Error guardando cuestionario:", error);
    res.status(500).json({
      success: false,
      message: "Error al guardar el cuestionario",
      error: error.message,
    });
  }
});

// Endpoint para verificar estado del cuestionario
router.get("/status/:id", async (req, res) => {
  console.log("🔥 GET /questionnaire/status/:id CALLED");
  const { id } = req.params;

  try {
    console.log("🔍 Verificando estado del cuestionario para cliente:", id);

    const query = `
      SELECT peso, nivel_pilotaje, fecha_ultima_confirmacion 
      FROM clientes 
      WHERE id = ?
    `;

    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const cliente = rows[0];
    const ahora = new Date();
    const unAnoAtras = new Date(
      ahora.getFullYear() - 1,
      ahora.getMonth(),
      ahora.getDate()
    );

    const necesitaCuestionario =
      !cliente.peso ||
      !cliente.nivel_pilotaje ||
      !cliente.fecha_ultima_confirmacion ||
      new Date(cliente.fecha_ultima_confirmacion) < unAnoAtras;

    const tipoRequerido =
      !cliente.peso || !cliente.nivel_pilotaje ? "first-time" : "confirmation";

    console.log("📊 Estado del cuestionario:", {
      clienteId: id,
      necesitaCuestionario,
      tipoRequerido,
      datosCliente: cliente,
    });

    res.json({
      necesitaCuestionario,
      tipoRequerido,
      datosCliente: cliente,
    });
  } catch (error) {
    console.error("Error verificando estado del cuestionario:", error);
    res.status(500).json({
      message: "Error del servidor",
      error: error.message,
    });
  }
});

module.exports = router;
