// src/config/api.js

// ✅ Detectar automaticamente o ambiente
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// ✅ URLs base para cada ambiente
const API_URLS = {
  development: 'http://localhost:5000',
  production: 'https://banco-teses-juridicas.onrender.com'
};

// ✅ Selecionar URL baseada no ambiente
export const API_BASE_URL = isDevelopment ? API_URLS.development : API_URLS.production;

// ✅ Log para debug
console.log('🔗 Ambiente detectado:', isDevelopment ? 'DESENVOLVIMENTO' : 'PRODUÇÃO');
console.log('🌐 URL da API:', API_BASE_URL);

// ✅ Configuração padrão do axios
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Para CORS
};

export default API_BASE_URL;