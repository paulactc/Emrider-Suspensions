const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conexion a MySQL establecida correctamente");
    connection.release();

    // Ejecutar migraciones automáticas
    await runMigrations();
  } catch (error) {
    console.error("Error conectando a MySQL:", error.message);
  }
}

// Helper para ejecutar una migración individual sin cortar las demás
async function runSafeMigration(description, fn) {
  try {
    await fn();
    console.log("Migracion:", description);
  } catch (error) {
    console.warn(`Migracion omitida (${description}):`, error.message);
  }
}

// Función para ejecutar migraciones automáticas
async function runMigrations() {
  await runSafeMigration("Tabla cuestionario_clientes verificada", () =>
    pool.execute(`
      CREATE TABLE IF NOT EXISTS cuestionario_clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cif VARCHAR(50) NOT NULL UNIQUE,
        peso DECIMAL(5,2) NULL,
        nivel_pilotaje VARCHAR(50) NULL,
        fecha_ultima_confirmacion DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cuestionario_clientes_cif (cif)
      )
    `)
  );

  await runSafeMigration("Tabla cuestionario_motos verificada", () =>
    pool.execute(`
      CREATE TABLE IF NOT EXISTS cuestionario_motos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        matricula VARCHAR(20) NOT NULL UNIQUE,
        especialidad VARCHAR(50) NULL,
        tipo_conduccion VARCHAR(50) NULL,
        preferencia_rigidez VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cuestionario_motos_matricula (matricula)
      )
    `)
  );

  await runSafeMigration("Tabla servicios_info verificada", () =>
    pool.execute(`
      CREATE TABLE IF NOT EXISTS servicios_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        moto_id VARCHAR(50) NULL,
        cliente_id VARCHAR(50) NULL,
        cif_cliente VARCHAR(50) NULL,
        matricula_moto VARCHAR(20) NULL,
        numero_orden VARCHAR(50) NOT NULL UNIQUE,
        fecha_servicio DATE NULL,
        km_moto INT NULL,
        fecha_proximo_mantenimiento DATE NULL,
        servicio_suspension VARCHAR(100) NOT NULL,
        observaciones TEXT NULL,
        peso_piloto DECIMAL(5,2) NULL,
        disciplina VARCHAR(50) NULL,
        marca VARCHAR(100) NULL,
        modelo VARCHAR(100) NULL,
        año INT NULL,
        referencia VARCHAR(100) NULL,
        status ENUM('draft', 'pending', 'completed') DEFAULT 'pending',
        tipo_suspension ENUM('FF', 'RR') DEFAULT 'FF',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
  );

  await runSafeMigration("Tabla usuarios verificada", () =>
    pool.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        dni VARCHAR(20) NOT NULL UNIQUE,
        telefono VARCHAR(20) NULL,
        rol ENUM('admin', 'cliente') DEFAULT 'cliente',
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
  );

  await runSafeMigration("Tabla sesiones verificada", () =>
    pool.execute(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token_hash VARCHAR(500) NULL,
        ip_address VARCHAR(45) NULL,
        user_agent VARCHAR(500) NULL,
        activa BOOLEAN DEFAULT TRUE,
        fecha_expiracion DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `)
  );

  await runSafeMigration("Tabla password_resets verificada", () =>
    pool.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_password_resets_email (email),
        INDEX idx_password_resets_token (token)
      )
    `)
  );

  await runSafeMigration("Tabla datos_tecnicos verificada", () =>
    pool.execute(`
      CREATE TABLE IF NOT EXISTS datos_tecnicos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        servicio_id INT NULL,
        moto_id VARCHAR(50) NULL,
        cliente_id VARCHAR(50) NULL,
        tipo_suspension ENUM('FF','RR') NOT NULL,
        datos_json JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_datos_tecnicos_moto (moto_id),
        INDEX idx_datos_tecnicos_servicio (servicio_id)
      )
    `)
  );

  // Crear usuario admin por defecto si no existe
  await runSafeMigration("Usuario admin verificado", async () => {
    const [adminExists] = await pool.execute(
      "SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1"
    );
    if (adminExists.length === 0) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("pass", 12);
      await pool.execute(
        `INSERT INTO usuarios (nombre, email, password, dni, rol) VALUES (?, ?, ?, ?, 'admin')`,
        ["Paula", "paula@emrider.es", hashedPassword, "admin"]
      );
      console.log("  -> Usuario admin creado (email: paula@emrider.es, pass: pass)");
    }
  });
}

// Función helper para ejecutar queries (usada por authController)
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error ejecutando query:", error.message);
    return { success: false, error: error.message };
  }
}

// Función helper para ejecutar transacciones (usada por authController)
async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const results = [];
    for (const q of queries) {
      const [result] = await connection.execute(q.query, q.params);
      results.push(result);
    }
    await connection.commit();
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    console.error("Error en transaccion:", error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection, executeQuery, executeTransaction };
