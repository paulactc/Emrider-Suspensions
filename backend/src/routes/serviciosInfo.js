// backend/src/routes/serviciosInfo.js
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const gdtallerService = require("../services/gdtallerService");

// Helper: enriquecer servicios con nombre de cliente y marca/modelo de moto desde GDTaller
async function enrichWithGDTallerData(rows) {
  try {
    // Obtener datos de GDTaller y nombres registrados localmente en paralelo
    const [rawClients, rawVehicles, usuariosRows] = await Promise.all([
      gdtallerService.getClients(),
      gdtallerService.getVehicles(),
      pool.execute(
        `SELECT dni, nombre FROM usuarios WHERE dni IS NOT NULL AND dni != ''`
      ).then(([r]) => r).catch(() => []),
    ]);

    // Mapa de nombres locales: dni (normalizado) → nombre registrado
    const nombreLocalPorDni = {};
    for (const u of usuariosRows) {
      if (u.dni) nombreLocalPorDni[u.dni.replace(/\s+/g, "").toLowerCase()] = u.nombre;
    }

    const clients  = rawClients.map(gdtallerService.mapClientFromGDTaller);
    const vehicles = rawVehicles.map(gdtallerService.mapVehicleFromGDTaller);

    const clientByCif = {};
    const clientById  = {};
    clients.forEach((c) => {
      if (c.cif) clientByCif[c.cif.replace(/\s+/g, "").toLowerCase()] = c;
      if (c.id)  clientById[String(c.id)] = c;
    });

    const vehicleById        = {};
    const vehicleByMatricula = {};
    vehicles.forEach((v) => {
      if (v.id)        vehicleById[String(v.id)] = v;
      if (v.matricula) {
        vehicleByMatricula[v.matricula.replace(/\s+/g, "").toUpperCase()] = v;
      }
    });

    return rows.map((row) => {
      // Buscar cliente en GDTaller
      let client = null;
      const cifNorm = row.cif_cliente ? row.cif_cliente.replace(/\s+/g, "").toLowerCase() : null;
      if (cifNorm) client = clientByCif[cifNorm] || null;
      if (!client && row.cliente_id) client = clientById[String(row.cliente_id)] || null;

      // Prioridad: nombre registrado en la app → nombre GDTaller completo → nombre GDTaller parcial
      const nombreLocal = cifNorm ? (nombreLocalPorDni[cifNorm] || null) : null;
      const nombreGDTaller = client?.nombre_completo || client?.nombre || null;
      const nombre_cliente = nombreLocal || nombreGDTaller || null;

      // Buscar vehículo
      let vehicle = null;
      if (row.moto_id) vehicle = vehicleById[String(row.moto_id)] || null;
      if (!vehicle && row.matricula_moto) {
        vehicle = vehicleByMatricula[row.matricula_moto.replace(/\s+/g, "").toUpperCase()] || null;
      }

      return {
        ...row,
        nombre_cliente,
        moto_marca_gdtaller:  vehicle?.marca  || null,
        moto_modelo_gdtaller: vehicle?.modelo || null,
      };
    });
  } catch (err) {
    console.warn("No se pudo enriquecer con datos de GDTaller:", err.message);
    return rows;
  }
}

// Helper: resolver GDTaller IDs a CIF/matricula
async function resolveIdentifiers({ motoId, clienteId, cif, matricula }) {
  let resolvedCif = cif || null;
  let resolvedMatricula = matricula || null;

  // Si recibimos motoId (GDTaller ID), resolver a matricula
  if (!resolvedMatricula && motoId) {
    const rawVehicles = await gdtallerService.getVehicles();
    const vehicles = rawVehicles.map(gdtallerService.mapVehicleFromGDTaller);
    const vehicle = vehicles.find((v) => String(v.id) === String(motoId));
    if (vehicle) {
      resolvedMatricula = vehicle.matricula;
      if (!resolvedCif) resolvedCif = vehicle.cifPropietario;
    }
  }

  // Si recibimos clienteId (GDTaller ID), resolver a CIF
  if (!resolvedCif && clienteId) {
    const rawClients = await gdtallerService.getClients();
    const clients = rawClients.map(gdtallerService.mapClientFromGDTaller);
    const client = clients.find((c) => String(c.id) === String(clienteId));
    if (client) resolvedCif = client.cif;
  }

  return { cif: resolvedCif, matricula: resolvedMatricula };
}

// GET - Obtener estadísticas de servicios (debe ir antes de /:id)
router.get("/stats/dashboard", async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT
        COUNT(*) as total_servicios,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as borradores,
        SUM(CASE WHEN tipo_suspension = 'FF' THEN 1 ELSE 0 END) as horquillas,
        SUM(CASE WHEN tipo_suspension = 'RR' THEN 1 ELSE 0 END) as amortiguadores
      FROM servicios_info
    `);

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Error obteniendo estadisticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadisticas",
      error: error.message,
    });
  }
});

// GET - Obtener todos los servicios pendientes (sin datos técnicos aún)
router.get("/pending", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id, moto_id, cliente_id, cif_cliente, matricula_moto,
        numero_orden, fecha_servicio, km_moto,
        servicio_suspension, observaciones, marca, modelo, año,
        tipo_suspension, status, created_at
       FROM servicios_info
       WHERE status = 'pending'
       ORDER BY created_at DESC`
    );
    const enriched = await enrichWithGDTallerData(rows);
    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Error obteniendo servicios pendientes:", error);
    res.status(500).json({ success: false, message: "Error al obtener servicios pendientes", error: error.message });
  }
});

// GET - Obtener todos los servicios finalizados (con datos técnicos guardados)
router.get("/completed", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id, moto_id, cliente_id, cif_cliente, matricula_moto,
        numero_orden, fecha_servicio, km_moto,
        servicio_suspension, observaciones, marca, modelo, año,
        tipo_suspension, status, created_at, updated_at
       FROM servicios_info
       WHERE status = 'completed'
       ORDER BY updated_at DESC`
    );
    const enriched = await enrichWithGDTallerData(rows);
    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error("Error obteniendo servicios completados:", error);
    res.status(500).json({ success: false, message: "Error al obtener servicios completados", error: error.message });
  }
});

// GET - Obtener información de servicio por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT
        id, moto_id, cliente_id, cif_cliente, matricula_moto,
        numero_orden, fecha_servicio, km_moto,
        fecha_proximo_mantenimiento, servicio_suspension, observaciones,
        observaciones_servicio, peso_piloto, disciplina, marca, modelo, año, referencia,
        status, tipo_suspension, datos_tecnicos_json, created_at, updated_at
       FROM servicios_info
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    const row = rows[0];
    if (row.datos_tecnicos_json && typeof row.datos_tecnicos_json === "string") {
      row.datos_tecnicos_json = JSON.parse(row.datos_tecnicos_json);
    }

    res.json({
      success: true,
      data: row,
    });
  } catch (error) {
    console.error("Error obteniendo servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el servicio",
      error: error.message,
    });
  }
});

// GET - Obtener servicios por CIF de cliente (con datos técnicos)
router.get("/by-cif/:cif", async (req, res) => {
  try {
    const { cif } = req.params;

    const [rows] = await pool.execute(
      `SELECT
        id, moto_id, cliente_id, cif_cliente, matricula_moto,
        fecha_servicio, km_moto, fecha_proximo_mantenimiento,
        servicio_suspension, peso_piloto, disciplina, marca, modelo, año, referencia,
        status, tipo_suspension, datos_tecnicos_json, created_at, updated_at
       FROM servicios_info
       WHERE cif_cliente = ? AND datos_tecnicos_json IS NOT NULL
       ORDER BY fecha_servicio DESC`,
      [cif]
    );

    const data = rows.map((row) => ({
      ...row,
      datos_tecnicos_json:
        row.datos_tecnicos_json && typeof row.datos_tecnicos_json === "string"
          ? JSON.parse(row.datos_tecnicos_json)
          : row.datos_tecnicos_json,
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error obteniendo servicios por CIF:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los servicios",
      error: error.message,
    });
  }
});

// GET - Obtener información de servicio por moto (moto_id O matricula_moto)
router.get("/by-moto/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    // Intentar también resolver la matrícula al ID de GDTaller (por si el servicio
    // fue guardado con moto_id numérico y matricula_moto NULL)
    let vehiculoId = null;
    try {
      const rawVehicles = await gdtallerService.getVehicles();
      const vehicles = rawVehicles.map(gdtallerService.mapVehicleFromGDTaller);
      const norm = (s) => (s || "").replace(/\s+/g, "").toUpperCase();
      const found = vehicles.find(
        (v) => norm(v.matricula) === norm(identifier) || String(v.id) === String(identifier)
      );
      if (found) vehiculoId = String(found.id);
    } catch (_) {}

    // Buscar por moto_id (legacy numérico o texto), matricula_moto, o vehiculoId resuelto
    const params = [identifier, identifier];
    let extra = "";
    if (vehiculoId && vehiculoId !== identifier) {
      extra = " OR moto_id = ?";
      params.push(vehiculoId);
    }

    const [rows] = await pool.execute(
      `SELECT
        id, moto_id, cliente_id, cif_cliente, matricula_moto,
        numero_orden, fecha_servicio, km_moto,
        fecha_proximo_mantenimiento, servicio_suspension, observaciones,
        observaciones_servicio, peso_piloto, disciplina, marca, modelo, año, referencia,
        status, tipo_suspension, datos_tecnicos_json, created_at, updated_at
       FROM servicios_info
       WHERE moto_id = ? OR matricula_moto = ?${extra}
       ORDER BY created_at DESC`,
      params
    );

    const data = rows.map((row) => ({
      ...row,
      datos_tecnicos_json:
        row.datos_tecnicos_json && typeof row.datos_tecnicos_json === "string"
          ? JSON.parse(row.datos_tecnicos_json)
          : row.datos_tecnicos_json,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error obteniendo servicios por moto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los servicios",
      error: error.message,
    });
  }
});

// POST - Crear nueva información de servicio
router.post("/", async (req, res) => {
  try {
    const {
      motoId,
      clienteId,
      cif,
      matricula,
      numeroOrden,
      fechaServicio,
      kmMoto,
      fechaProximoMantenimiento,
      servicioSuspension,
      observaciones,
      pesoPiloto,
      disciplina,
      marca,
      modelo,
      año,
      referencia,
      tipoSuspension = "FF",
    } = req.body;

    if (!numeroOrden || !servicioSuspension) {
      return res.status(400).json({
        success: false,
        message: "Numero de orden y tipo de servicio son obligatorios",
      });
    }

    // Resolver identificadores a CIF/matricula
    const resolved = await resolveIdentifiers({ motoId, clienteId, cif, matricula });

    // Verificar que el número de orden no exista
    const [existing] = await pool.execute(
      "SELECT id FROM servicios_info WHERE numero_orden = ?",
      [numeroOrden]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "El numero de orden ya existe",
      });
    }

    const hasOptionalFields = marca && modelo && año && referencia;
    const status = hasOptionalFields ? "completed" : "pending";

    const query = `
      INSERT INTO servicios_info
      (moto_id, cliente_id, cif_cliente, matricula_moto,
       numero_orden, fecha_servicio, km_moto,
       fecha_proximo_mantenimiento, servicio_suspension, observaciones,
       peso_piloto, disciplina, marca, modelo, año, referencia,
       tipo_suspension, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      motoId || null,
      clienteId || null,
      resolved.cif,
      resolved.matricula,
      numeroOrden,
      fechaServicio || null,
      kmMoto || null,
      fechaProximoMantenimiento || null,
      servicioSuspension,
      observaciones || null,
      pesoPiloto || null,
      disciplina || null,
      marca || null,
      modelo || null,
      año || null,
      referencia || null,
      tipoSuspension,
      status,
    ]);

    res.status(201).json({
      success: true,
      message: "Informacion del servicio creada exitosamente",
      data: {
        id: result.insertId,
        status: status,
        numeroOrden: numeroOrden,
      },
    });
  } catch (error) {
    console.error("Error creando servicio:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "El numero de orden ya existe",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el servicio",
      error: error.message,
    });
  }
});

// PUT - Actualizar información de servicio
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numeroOrden,
      fechaServicio,
      kmMoto,
      fechaProximoMantenimiento,
      servicioSuspension,
      observaciones,
      observacionesServicio,
      pesoPiloto,
      disciplina,
      marca,
      modelo,
      año,
      referencia,
      datosTecnicosJson,
    } = req.body;

    const [existing] = await pool.execute(
      "SELECT id FROM servicios_info WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    // Construir SET dinámico para no sobreescribir campos no enviados
    const setClauses = [];
    const params = [];

    if (numeroOrden !== undefined) { setClauses.push("numero_orden = ?"); params.push(numeroOrden); }
    if (fechaServicio !== undefined) { setClauses.push("fecha_servicio = ?"); params.push(fechaServicio || null); }
    if (kmMoto !== undefined) { setClauses.push("km_moto = ?"); params.push(kmMoto || null); }
    if (fechaProximoMantenimiento !== undefined) { setClauses.push("fecha_proximo_mantenimiento = ?"); params.push(fechaProximoMantenimiento || null); }
    if (servicioSuspension !== undefined) { setClauses.push("servicio_suspension = ?"); params.push(servicioSuspension); }
    if (observaciones !== undefined) { setClauses.push("observaciones = ?"); params.push(observaciones || null); }
    if (observacionesServicio !== undefined) { setClauses.push("observaciones_servicio = ?"); params.push(observacionesServicio || null); }
    if (pesoPiloto !== undefined) { setClauses.push("peso_piloto = ?"); params.push(pesoPiloto || null); }
    if (disciplina !== undefined) { setClauses.push("disciplina = ?"); params.push(disciplina || null); }
    if (marca !== undefined) { setClauses.push("marca = ?"); params.push(marca || null); }
    if (modelo !== undefined) { setClauses.push("modelo = ?"); params.push(modelo || null); }
    if (año !== undefined) { setClauses.push("año = ?"); params.push(año || null); }
    if (referencia !== undefined) { setClauses.push("referencia = ?"); params.push(referencia || null); }
    if (datosTecnicosJson !== undefined) {
      setClauses.push("datos_tecnicos_json = ?");
      params.push(JSON.stringify(datosTecnicosJson));
      setClauses.push("status = 'completed'");
    }

    if (setClauses.length === 0) {
      return res.json({ success: true, message: "Sin cambios", data: { id } });
    }

    setClauses.push("updated_at = NOW()");
    params.push(id);

    const [result] = await pool.execute(
      `UPDATE servicios_info SET ${setClauses.join(", ")} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: "Servicio actualizado exitosamente",
      data: {
        id: id,
        affectedRows: result.affectedRows,
      },
    });
  } catch (error) {
    console.error("Error actualizando servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el servicio",
      error: error.message,
    });
  }
});

// DELETE - Eliminar servicio
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM servicios_info WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Servicio eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el servicio",
      error: error.message,
    });
  }
});

module.exports = router;
