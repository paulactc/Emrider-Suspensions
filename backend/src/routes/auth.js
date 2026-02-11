const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

// POST /api/auth/register - Registro de usuario
router.post("/register", AuthController.register);

// POST /api/auth/login - Login
router.post("/login", AuthController.login);

// POST /api/auth/forgot-password - Solicitar recuperacion de contraseña
router.post("/forgot-password", AuthController.requestPasswordReset);

// POST /api/auth/reset-password - Restablecer contraseña con token
router.post("/reset-password", AuthController.resetPassword);

// POST /api/auth/logout - Logout (requiere token)
router.post("/logout", verifyToken, AuthController.logout);

// GET /api/auth/verify - Verificar token
router.get("/verify", verifyToken, AuthController.verifyToken);

module.exports = router;
