/**
 * Print Agent - usando pdf-to-printer
 * Suporta estrutura de pedidos com cliente, itens e valor total
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const { print, getPrinters } = require("pdf-to-printer");
const PDFDocument = require("pdfkit");
const app = express();

app.use(express.json());

const PRINTERS_FILE = path.join(__dirname, "printers.json");

// Atualiza impressoras locais
async function updatePrinters() {
  try {
    const printers = await getPrinters();
    fs.writeFileSync(PRINTERS_FILE, JSON.stringify(printers, null, 2));
    console.log("Impressoras detectadas:");
    printers.forEach((p, i) => {
      console.log(` ${i + 1}. ${p.name}${p.isDefault ? " (padrão)" : ""}`);
    });
    return printers;
  } catch (err) {
    console.error("Erro ao listar impressoras:", err);
    return [];
  }
}

// Atualiza impressoras ao iniciar
updatePrinters();

/**
 * GET /printers - lista impressoras
 */
app.get("/printers", (req, res) => {
  try {
    const data = fs.readFileSync(PRINTERS_FILE, "utf-8");
    const printers = JSON.parse(data);
    res.json(printers);
  } catch (err) {
    res.status(500).json({ error: "Não foi possível carregar impressoras" });
  }
});

/**
 * Gera PDF temporário do texto
 */
function generatePDF(content) {
  return new Promise((resolve, reject) => {
    const tempPath = path.join(__dirname, `pedido_${Date.now()}.pdf`);
    const doc = new PDFDocument({ margin: 10, size: "A4" });
    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);

    doc.fontSize(14).text("PEDIDO", { align: "center", underline: true });
    doc.moveDown();

    // Imprime cliente
    doc.fontSize(12).text(`Cliente: ${content.cliente.nome}`);
    doc.text(`Telefone: ${content.cliente.telefone}`);
    doc.moveDown();

    // Imprime itens
    doc.text("Itens:");
    content.itens.forEach(item => {
      doc.text(
        `${item.quantidade}x ${item.produto} - R$${item.valor.toFixed(2)}`
      );
    });
    doc.moveDown();

    // Valor total
    doc.text(`Valor total: R$${content.valorTotal.toFixed(2)}`, { bold: true });

    doc.end();

    stream.on("finish", () => resolve(tempPath));
    stream.on("error", (err) => reject(err));
  });
}

/**
 * POST /print - imprime pedido
 * Body JSON:
 * {
 *   "printerName": "Nome da impressora",
 *   "cliente": { "nome": "...", "telefone": "..." },
 *   "itens": [ { "produto": "...", "quantidade": 1, "valor": 0.0 } ],
 *   "valorTotal": 0.0
 * }
 */
app.post("/print", async (req, res) => {
  const { printerName, cliente, itens, valorTotal } = req.body;

  if (!printerName || !cliente || !itens || valorTotal === undefined) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const pedido = { cliente, itens, valorTotal };

  try {
    const pdfPath = await generatePDF(pedido);
    await print(pdfPath, { printer: printerName });
    fs.unlinkSync(pdfPath);

    console.log(`Pedido enviado para impressora: ${printerName}`);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao imprimir:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Print Agent rodando na porta ${PORT}`);
  console.log(`Acesse http://localhost:${PORT}/printers para ver impressoras`);
});
