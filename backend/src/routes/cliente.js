// backend/src/routes/cliente.js
const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");

router.get("/", clienteController.getAllClientes);

module.exports = router;

router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});
