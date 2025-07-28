// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

// Criar app Express
const app = express();

// ✅ CONFIGURAÇÃO COMPLETA DO CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'https://localhost:3000',
  'https://bibliotecabp.com.br',
  'http://bibliotecabp.com.br',
  'https://leomarquessilva.github.io',
  'http://www.tesesbp.bibliotecabp.com.br',
  'https://www.tesesbp.bibliotecabp.com.br',
  'http://tesesbp.bibliotecabp.com.br',
  'https://tesesbp.bibliotecabp.com.br',
  'https://banco-teses-juridicas.onrender.com'
];

// ✅ CONFIGURAÇÃO CORS ROBUSTA
const corsOptions = {
  origin: function(origin, callback) {
    console.log('🔍 Verificando origem:', origin);
    
    // ✅ Permitir requisições sem origin (Postman, apps mobile, etc.)
    if (!origin) {
      console.log('✅ Requisição sem origem permitida');
      return callback(null, true);
    }
    
    // ✅ Verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origem permitida:', origin);
      callback(null, true);
    } else {
      console.error('❌ Origem bloqueada pelo CORS:', origin);
      console.log('📋 Origens permitidas:', allowedOrigins);
      
      // ✅ MODO DESENVOLVIMENTO: Permitir todas as origens
      if (process.env.NODE_ENV === 'development') {
        console.log('🚧 Modo desenvolvimento: permitindo origem');
        callback(null, true);
      } else {
        callback(new Error('Não permitido pelo CORS'));
      }
    }
  },
  credentials: true, // ✅ Permitir cookies e headers de autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // ✅ Cache do preflight por 24 horas
};

// ✅ APLICAR CORS
app.use(cors(corsOptions));

// ✅ MIDDLEWARE ADICIONAL PARA CORS (fallback)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // ✅ Headers CORS manuais como backup
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,X-Access-Token');
  res.header('Access-Control-Expose-Headers', 'Authorization');

  // ✅ Responder imediatamente para OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight OPTIONS respondido para:', origin);
    return res.status(200).end();
  }

  next();
});

// ✅ MIDDLEWARE DE PARSING
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ MIDDLEWARE DE LOG
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || 'sem-origem';
  console.log(`[${timestamp}] ${req.method} ${req.path} - Origem: ${origin}`);
  next();
});

// ✅ Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Pasta uploads criada com sucesso');
}

// ✅ CONFIGURAÇÃO DO MONGODB
let MONGODB_URI;

// Verificar se temos MONGO_URI completa
if (process.env.MONGO_URI && (process.env.MONGO_URI.startsWith('mongodb://') || process.env.MONGO_URI.startsWith('mongodb+srv://'))) {
  MONGODB_URI = process.env.MONGO_URI;
  console.log('✅ Usando string de conexão completa do arquivo .env');
} 
// Verificar se temos usuário e senha separados
else if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
  const username = process.env.MONGO_USER;
  const password = encodeURIComponent(process.env.MONGO_PASSWORD);
  MONGODB_URI = `mongodb+srv://${username}:${password}@teses-juridicas.8t5pfe6.mongodb.net/?retryWrites=true&w=majority&appName=teses-juridicas`;
  console.log('✅ Usando credenciais separadas do arquivo .env');
}
// Fallback para credenciais hardcoded
else {
  console.log('⚠️ Variáveis de conexão não encontradas no .env, usando credenciais hardcoded');
  const username = 'leonardomarques';
  const password = encodeURIComponent('Jvccf05040@');
  MONGODB_URI = `mongodb+srv://${username}:${password}@teses-juridicas.8t5pfe6.mongodb.net/?retryWrites=true&w=majority&appName=teses-juridicas`;
}

// ✅ CONECTAR AO MONGODB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas');
    console.log('🔗 Database:', MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'MongoDB Local');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    console.log('🔧 Verifique:');
    console.log('   - String de conexão está correta');
    console.log('   - IP atual está na lista de IPs permitidos no Atlas');
    console.log('   - Credenciais estão corretas');
  });

// ✅ ROTAS DE HEALTH CHECK E TESTE
app.get('/', (req, res) => {
  res.json({
    message: 'API de Teses Jurídicas está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/cors-test', (req, res) => {
  const origin = req.headers.origin;
  res.json({
    message: 'CORS funcionando!',
    origin: origin,
    allowed: allowedOrigins.includes(origin),
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// ✅ IMPORTAR E USAR ROTAS
const tesesRoutes = require('./routes/teses');
app.use('/api/teses', tesesRoutes);

// ✅ Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ PRODUÇÃO: Servir arquivos estáticos
if (process.env.NODE_ENV === 'production') {
  // Servir os arquivos estáticos da build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Para qualquer rota não-API, retornar o index.html
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// ✅ MIDDLEWARE DE TRATAMENTO DE ERROS
app.use((error, req, res, next) => {
  console.error('❌ Erro no servidor:', error);
  
  if (error.message === 'Não permitido pelo CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origem não permitida',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }

  res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// ✅ MIDDLEWARE PARA ROTAS NÃO ENCONTRADAS
app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ✅ PORTA DO SERVIDOR
const PORT = process.env.PORT || 5000;

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 CORS test: http://localhost:${PORT}/api/cors-test`);
  console.log(`📋 Origens CORS permitidas:`, allowedOrigins.length);
  allowedOrigins.forEach(origin => console.log(`   ✅ ${origin}`));
});

module.exports = app;