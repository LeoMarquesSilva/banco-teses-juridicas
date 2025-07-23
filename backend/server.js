// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Criar app Express
const app = express();

// Configurar middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Pasta uploads criada com sucesso');
}

// Codificar o @ na senha usando encodeURIComponent
const username = 'leonardomarques';
const password = encodeURIComponent('Jvccf05040@'); // Codifica caracteres especiais na senha
const MONGODB_URI = `mongodb+srv://${username}:${password}@teses-juridicas.8t5pfe6.mongodb.net/?retryWrites=true&w=majority&appName=teses-juridicas`;

// Conectar ao MongoDB com tratamento de erro melhorado
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    console.log('Verifique se a string de conexão está correta e se o IP atual está na lista de IPs permitidos no Atlas');
  });

// Importar rotas
const tesesRoutes = require('./routes/teses');

// Usar rotas
app.use('/api/teses', tesesRoutes);

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota padrão
app.get('/', (req, res) => {
  res.send('API de Teses Jurídicas está funcionando!');
});

// Porta do servidor
const PORT = process.env.PORT || 5000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
