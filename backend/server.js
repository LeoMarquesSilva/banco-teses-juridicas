// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Criar app Express
const app = express();

// Configurar CORS para permitir domínios específicos
const allowedOrigins = [
  'http://localhost:3000',
  'https://bibliotecabp.com.br',
  'http://bibliotecabp.com.br',
  'https://leomarquessilva.github.io'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (como apps mobile ou ferramentas de API)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origem bloqueada pelo CORS:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true // Para permitir cookies e cabeçalhos de autenticação
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV === 'production') {
  // Servir os arquivos estáticos da build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Para qualquer rota não-API, retornar o index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Pasta uploads criada com sucesso');
}

// Definir a string de conexão do MongoDB
let MONGODB_URI;

// Verificar se temos MONGO_URI completa
if (process.env.MONGO_URI && (process.env.MONGO_URI.startsWith('mongodb://') || process.env.MONGO_URI.startsWith('mongodb+srv://'))) {
  MONGODB_URI = process.env.MONGO_URI;
  console.log('Usando string de conexão completa do arquivo .env');
} 
// Verificar se temos usuário e senha separados
else if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
  const username = process.env.MONGO_USER;
  const password = encodeURIComponent(process.env.MONGO_PASSWORD);
  MONGODB_URI = `mongodb+srv://${username}:${password}@teses-juridicas.8t5pfe6.mongodb.net/?retryWrites=true&w=majority&appName=teses-juridicas`;
  console.log('Usando credenciais separadas do arquivo .env');
}
// Fallback para credenciais hardcoded
else {
  console.log('Variáveis de conexão não encontradas ou inválidas no arquivo .env, usando credenciais hardcoded');
  const username = 'leonardomarques';
  const password = encodeURIComponent('Jvccf05040@');
  MONGODB_URI = `mongodb+srv://${username}:${password}@teses-juridicas.8t5pfe6.mongodb.net/?retryWrites=true&w=majority&appName=teses-juridicas`;
}

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
