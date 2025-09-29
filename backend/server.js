const express = require("express");
const cors = require("cors");
const pedidosRoutes = require("./src/routes/pedidosRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pedidos", pedidosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
