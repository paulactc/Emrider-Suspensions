const jwt = require("jsonwebtoken");
const { executeQuery } = require("../config/database");

// Middleware para verificar JWT
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario existe y está activo
    const userResult = await executeQuery(
      "SELECT id, nombre, email, dni, rol, activo FROM usuarios WHERE id = ?",
      [decoded.id]
    );

    if (!userResult.success || userResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const user = userResult.data[0];

    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: "Usuario desactivado",
      });
    }

    // Agregar usuario a la request
    req.user = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      dni: user.dni,
      rol: user.rol,
      clienteId: decoded.clienteId,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    console.error("Error en middleware de auth:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

// Middleware para verificar roles
const verifyRole = (roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !roles.includes(user.rol)) {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    next();
  };
};

module.exports = { verifyToken, verifyRole };
