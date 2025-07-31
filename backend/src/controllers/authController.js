const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { executeQuery, executeTransaction } = require("../config/database");

class AuthController {
  // Registro de usuario
  static async register(req, res) {
    try {
      const {
        nombre,
        email,
        password,
        dni,
        telefono,
        rol = "cliente",
      } = req.body;

      // Validar campos requeridos
      if (!nombre || !email || !password || !dni) {
        return res.status(400).json({
          success: false,
          message: "Nombre, email, password y DNI son requeridos",
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await executeQuery(
        "SELECT id FROM usuarios WHERE email = ? OR dni = ?",
        [email, dni]
      );

      if (existingUser.success && existingUser.data.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Ya existe un usuario con ese email o DNI",
        });
      }

      // Hashear password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Preparar transacción para crear usuario y cliente
      const queries = [
        {
          query: `INSERT INTO usuarios (nombre, email, password, dni, telefono, rol) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
          params: [nombre, email, hashedPassword, dni, telefono, rol],
        },
      ];

      // Si es cliente, también crear registro en tabla clientes
      if (rol === "cliente") {
        queries.push({
          query: `INSERT INTO clientes (usuario_id, dni, nombre, email, telefono) 
                  VALUES (LAST_INSERT_ID(), ?, ?, ?, ?)`,
          params: [dni, nombre, email, telefono],
        });
      }

      const result = await executeTransaction(queries);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Error al registrar usuario",
          error: result.error,
        });
      }

      const userId = result.data[0].insertId;

      // Generar token JWT
      const token = jwt.sign(
        {
          id: userId,
          email,
          dni,
          rol,
          nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          user: {
            id: userId,
            nombre,
            email,
            dni,
            telefono,
            rol,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  // Login de usuario
  static async login(req, res) {
    try {
      const { email, password, dni } = req.body;

      // Permitir login con email o DNI
      if ((!email && !dni) || !password) {
        return res.status(400).json({
          success: false,
          message: "Email/DNI y password son requeridos",
        });
      }

      // Buscar usuario
      const whereClause = email ? "email = ?" : "dni = ?";
      const searchValue = email || dni;

      const userResult = await executeQuery(
        `SELECT u.*, c.id as cliente_id 
         FROM usuarios u 
         LEFT JOIN clientes c ON u.id = c.usuario_id 
         WHERE u.${whereClause} AND u.activo = TRUE`,
        [searchValue]
      );

      if (!userResult.success || userResult.data.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      const user = userResult.data[0];

      // Verificar password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          clienteId: user.cliente_id,
          email: user.email,
          dni: user.dni,
          rol: user.rol,
          nombre: user.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Registrar sesión (opcional)
      await executeQuery(
        `INSERT INTO sesiones (usuario_id, token_hash, ip_address, user_agent, fecha_expiracion) 
         VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
        [
          user.id,
          jwt.sign({ tokenId: user.id }, process.env.JWT_SECRET),
          req.ip,
          req.get("User-Agent"),
        ]
      );

      res.json({
        success: true,
        message: "Login exitoso",
        data: {
          user: {
            id: user.id,
            clienteId: user.cliente_id,
            nombre: user.nombre,
            email: user.email,
            dni: user.dni,
            telefono: user.telefono,
            rol: user.rol,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const userId = req.user.id;

      // Desactivar sesiones del usuario
      await executeQuery(
        "UPDATE sesiones SET activa = FALSE WHERE usuario_id = ?",
        [userId]
      );

      res.json({
        success: true,
        message: "Logout exitoso",
      });
    } catch (error) {
      console.error("Error en logout:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }

  // Verificar token
  static async verifyToken(req, res) {
    try {
      const user = req.user; // Viene del middleware de auth

      // Obtener datos actualizados del usuario
      const userResult = await executeQuery(
        `SELECT u.*, c.id as cliente_id 
         FROM usuarios u 
         LEFT JOIN clientes c ON u.id = c.usuario_id 
         WHERE u.id = ? AND u.activo = TRUE`,
        [user.id]
      );

      if (!userResult.success || userResult.data.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      }

      const userData = userResult.data[0];

      res.json({
        success: true,
        data: {
          user: {
            id: userData.id,
            clienteId: userData.cliente_id,
            nombre: userData.nombre,
            email: userData.email,
            dni: userData.dni,
            telefono: userData.telefono,
            rol: userData.rol,
          },
        },
      });
    } catch (error) {
      console.error("Error verificando token:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
