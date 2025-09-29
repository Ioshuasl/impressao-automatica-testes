const axios = require("axios");

// Simulando banco em memória
let pedidos = [];

// Configuração do print-agent
const PRINT_AGENT_URL = "http://localhost:4000/print"; // ou IP da máquina do restaurante

const criarPedido = async (req, res) => {
  try {
    const { restauranteId, printerName, cliente, itens, valorTotal } = req.body;

    // Validação dos campos obrigatórios
    if (!restauranteId || !printerName || !cliente || !itens || valorTotal === undefined) {
      return res.status(400).json({ 
        error: "restauranteId, printerName, cliente, itens e valorTotal são obrigatórios" 
      });
    }

    // Cria novo pedido em memória
    const novoPedido = {
      id: pedidos.length + 1,
      restauranteId,
      printerName,
      cliente,
      itens,
      valorTotal,
      criadoEm: new Date(),
    };

    pedidos.push(novoPedido);

    // Envia para o print-agent
    try {
      await axios.post(PRINT_AGENT_URL, {
        printerName,
        cliente,
        itens,
        valorTotal
      });
      console.log(`Pedido #${novoPedido.id} enviado para impressão.`);
    } catch (err) {
      console.error("Erro ao enviar pedido para o print-agent:", err.message);
    }

    res.status(201).json(novoPedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listarPedidos = (req, res) => {
    res.json(pedidos);
};

module.exports = {
    criarPedido,
    listarPedidos,
};
