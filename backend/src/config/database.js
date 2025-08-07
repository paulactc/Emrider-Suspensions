const mysql = require("mysql2/promise");
require("dotenv").config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "emrider_db",
  port: process.env.DB_PORT || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  timezone: "+00:00",

  ssl: false,
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión a MySQL establecida correctamente");
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);

    // Probar una consulta simple
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log("🧪 Consulta de prueba exitosa:", rows[0]);

    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message);
    return false;
  }
};

// Función para ejecutar consultas con manejo de errores
const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return { success: true, data: results };
  } catch (error) {
    console.error("Error ejecutando consulta:", error.message);
    return { success: false, error: error.message };
  }
};

// Función para transacciones
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }

    await connection.commit();
    connection.release();

    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error en transacción:", error.message);
    return { success: false, error: error.message };
  }
};

// Función para cerrar el pool (útil para tests)
const closePool = async () => {
  try {
    await pool.end();
    console.log("🔒 Pool de conexiones MySQL cerrado");
  } catch (error) {
    console.error("Error cerrando pool:", error.message);
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction,
  closePool,
  dbConfig,
};
