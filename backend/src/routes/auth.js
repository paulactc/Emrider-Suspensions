const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { verifyToken, verifyRole } = require("../middleware/auth");
const { executeQuery } = require("../config/database");

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

// PUT /api/auth/usuarios/:id/operario - Asignar operario_id a un usuario (solo admin)
router.put("/usuarios/:id/operario", verifyToken, verifyRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { operario_id } = req.body;
  const result = await executeQuery(
    "UPDATE usuarios SET operario_id = ? WHERE id = ?",
    [operario_id ?? null, id]
  );
  if (!result.success) {
    return res.status(500).json({ success: false, message: "Error actualizando operario_id" });
  }
  res.json({ success: true, message: "operario_id actualizado" });
});

// GET /api/auth/usuarios - Listar usuarios (solo admin)
router.get("/usuarios", verifyToken, verifyRole(["admin"]), async (_req, res) => {
  const result = await executeQuery(
    "SELECT id, nombre, email, dni, rol, operario_id, activo FROM usuarios ORDER BY id"
  );
  if (!result.success) {
    return res.status(500).json({ success: false, message: "Error obteniendo usuarios" });
  }
  res.json({ success: true, data: result.data });
});

module.exports = router;
