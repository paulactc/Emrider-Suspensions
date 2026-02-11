const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { executeQuery, executeTransaction } = require("../config/database");
const { sendPasswordResetEmail } = require("../services/emailService");
const gdtallerService = require("../services/gdtallerService");

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
        `SELECT u.*
         FROM usuarios u
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
          email: user.email,
          dni: user.dni,
          rol: user.rol,
          nombre: user.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );

      res.json({
        success: true,
        message: "Login exitoso",
        data: {
          user: {
            id: user.id,
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
        `SELECT u.*
         FROM usuarios u
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

  // Solicitar recuperacion de contraseña
  static async requestPasswordReset(req, res) {
    try {
      const { email, dni } = req.body;

      if (!email && !dni) {
        return res.status(400).json({
          success: false,
          message: "Email o DNI es requerido",
        });
      }

      // Siempre responder lo mismo para no revelar si el email/DNI existe
      const genericResponse = {
        success: true,
        message: "Si el email/DNI existe en nuestro sistema, se ha enviado un enlace de recuperacion",
      };

      // 1. Buscar en tabla usuarios local
      const whereClause = email ? "email = ?" : "dni = ?";
      const searchValue = email || dni;

      const userResult = await executeQuery(
        `SELECT id, email FROM usuarios WHERE ${whereClause} AND activo = TRUE`,
        [searchValue]
      );

      // Email del usuario en tabla usuarios (para actualizar la contraseña)
      let usuarioEmail = null;
      // Email donde enviar el correo de recuperacion (puede ser distinto)
      let sendToEmail = null;

      if (userResult.success && userResult.data.length > 0) {
        usuarioEmail = userResult.data[0].email;
        sendToEmail = userResult.data[0].email;
      } else {
        // 2. Buscar en clientes de GDTaller
        try {
          const rawClients = await gdtallerService.getClients();
          const clients = rawClients.map(gdtallerService.mapClientFromGDTaller);

          const gdClient = email
            ? clients.find((c) => c.email && c.email.toLowerCase() === email.toLowerCase())
            : clients.find((c) => c.cif && c.cif.toLowerCase() === dni.toLowerCase());

          if (gdClient) {
            // Buscar usuario en tabla usuarios por CIF/DNI del cliente GDTaller
            const cifDni = gdClient.cif;
            if (cifDni) {
              const localUser = await executeQuery(
                "SELECT id, email FROM usuarios WHERE dni = ? AND activo = TRUE",
                [cifDni]
              );
              if (localUser.success && localUser.data.length > 0) {
                usuarioEmail = localUser.data[0].email;
                sendToEmail = gdClient.email || localUser.data[0].email;
              }
            }
          }
        } catch (gdError) {
          console.error("Error buscando en GDTaller:", gdError.message);
        }
      }

      if (!usuarioEmail) {
        return res.json(genericResponse);
      }

      // Generar token random y guardar hash en BD
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Invalidar tokens anteriores del mismo usuario
      await executeQuery(
        "UPDATE password_resets SET used = TRUE WHERE email = ? AND used = FALSE",
        [usuarioEmail]
      );

      // Guardar token con el email de usuarios (para el UPDATE de contraseña)
      await executeQuery(
        "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
        [usuarioEmail, tokenHash, expiresAt]
      );

      // Enviar email
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

      try {
        await sendPasswordResetEmail(sendToEmail, resetUrl);
      } catch (emailError) {
        console.error("Error enviando email de recuperacion:", emailError.message);
      }

      res.json(genericResponse);
    } catch (error) {
      console.error("Error en requestPasswordReset:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }

  // Restablecer contraseña con token
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Token y nueva contraseña son requeridos",
        });
      }

      if (newPassword.length < 4) {
        return res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 4 caracteres",
        });
      }

      // Hashear el token recibido para comparar con BD
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // Buscar token valido (no expirado, no usado)
      const tokenResult = await executeQuery(
        "SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()",
        [tokenHash]
      );

      if (!tokenResult.success || tokenResult.data.length === 0) {
        return res.status(400).json({
          success: false,
          message: "El enlace no es valido o ha expirado. Solicita uno nuevo.",
        });
      }

      const resetRecord = tokenResult.data[0];

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar contraseña del usuario
      const updateResult = await executeQuery(
        "UPDATE usuarios SET password = ? WHERE email = ?",
        [hashedPassword, resetRecord.email]
      );

      if (!updateResult.success) {
        return res.status(500).json({
          success: false,
          message: "Error al actualizar la contraseña",
        });
      }

      // Marcar token como usado
      await executeQuery(
        "UPDATE password_resets SET used = TRUE WHERE id = ?",
        [resetRecord.id]
      );

      res.json({
        success: true,
        message: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      console.error("Error en resetPassword:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
}

module.exports = AuthController;
