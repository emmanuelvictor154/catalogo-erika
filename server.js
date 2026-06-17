const express = require('express');
const pool = require('./db');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Libera as telas da pasta public

// ==========================================
// CRIAÇÃO AUTOMÁTICA DA TABELA NO RENDER
// ==========================================
pool.query(`
  CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    descricao TEXT,
    imagem_url TEXT,
    disponivel BOOLEAN DEFAULT TRUE
  );
`).then(() => {
  console.log("🚀 Banco de dados pronto e verificado!");
}).catch((erro) => {
  console.error("❌ Erro na tabela:", erro);
});

// ==========================================
// 1. ROTA DE TESTE DO BANCO
// ==========================================
app.get('/teste', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({ status: "Conectado!", hora: resultado.rows });
  } catch (erro) {
    res.status(500).json({ erro: "Erro no banco." });
  }
});

// ==========================================
// 2. ROTA DE CADASTRO (Erika / Admin)
// ==========================================
app.post('/produtos', async (req, res) => {
  try {
    const { nome, categoria, preco, descricao, imagem_url } = req.body;
    await pool.query(
      `INSERT INTO produtos (nome, categoria, preco, descricao, imagem_url) VALUES ($1, $2, $3, $4, $5)`,
      [nome, categoria, preco, descricao, imagem_url]
    );
    res.status(201).json({ mensagem: "Sucesso!" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao cadastrar." });
  }
});

// ==========================================
// 3. ROTA DE LISTAGEM (Cliente / Catálogo)
// ==========================================
app.get('/produtos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos WHERE disponivel = TRUE ORDER BY id DESC');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar." });
  }
});

// ==========================================
// 4. ROTA EXCLUSIVA DE REDIRECIONAMENTO WHATSAPP
// ==========================================
app.get('/enviar-pedido', (req, res) => {
  const texto = req.query.texto || '';
  // Usa o link oficial do WhatsApp com o seu número de Campina Grande
  const urlWhatsApp = "https://whatsapp.com" + encodeURIComponent(texto);
  
  // O servidor força a mudança de página de forma direta e segura
  res.redirect(urlWhatsApp);
});

// ==========================================
// LIGANDO O MOTOR
// ==========================================
const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`✅ Servidor aberto na porta ${PORTA}!`);
});
