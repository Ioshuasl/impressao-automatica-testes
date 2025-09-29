const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController.js");

// Criar novo pedido
router.post("/", pedidosController.criarPedido);

// Listar pedidos
router.get("/", pedidosController.listarPedidos);

module.exports = router;
