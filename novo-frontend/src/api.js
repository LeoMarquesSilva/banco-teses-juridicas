// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ia-n8n.a8fvaf.easypanel.host'
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber um erro 401 (não autorizado), fazer logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      // Redirecionar para a página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Função para salvar o texto de uma tese
export const salvarTexto = async (teseId, texto) => {
  try {
    const response = await api.post(`/api/teses/${teseId}/texto`, { texto });
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar texto:', error);
    throw error; // Propagar o erro para tratamento no componente
  }
};

// Função para carregar o texto de uma tese
export const carregarTexto = async (teseId) => {
  try {
    const response = await api.get(`/api/teses/${teseId}/texto`);
    return response.data.texto || '';
  } catch (error) {
    console.error('Erro ao carregar texto:', error);
    return ''; // Retornar string vazia em caso de erro
  }
};

// Função para processar texto com IA
export const processarTextoComIA = async (texto, acao) => {
  try {
    const response = await api.post('/api/ia/processar', { 
      texto, 
      acao // 'resumir', 'revisar', 'sugerir', 'formatar', 'citacao'
    });
    return response.data.resultado;
  } catch (error) {
    console.error('Erro ao processar texto com IA:', error);
    throw new Error('Não foi possível processar o texto com IA. Tente novamente mais tarde.');
  }
};

// Função para login
export const login = async (email, senha) => {
  try {
    const response = await api.post('/api/auth/login', { email, senha });
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

// Função para registro
export const registrar = async (nome, email, senha) => {
  try {
    const response = await api.post('/api/auth/registro', { nome, email, senha });
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar:', error);
    throw error;
  }
};

// Função para obter o perfil do usuário
export const obterPerfil = async () => {
  try {
    const response = await api.get('/api/usuarios/perfil');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    throw error;
  }
};

// Função para listar teses do usuário
export const listarTeses = async () => {
  try {
    const response = await api.get('/api/teses');
    return response.data;
  } catch (error) {
    console.error('Erro ao listar teses:', error);
    return [];
  }
};

// Função para obter detalhes de uma tese
export const obterTese = async (teseId) => {
  try {
    const response = await api.get(`/api/teses/${teseId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter tese:', error);
    throw error;
  }
};

// Função para criar uma nova tese
export const criarTese = async (dadosTese) => {
  try {
    const response = await api.post('/api/teses', dadosTese);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar tese:', error);
    throw error;
  }
};

// Função para atualizar uma tese
export const atualizarTese = async (teseId, dadosTese) => {
  try {
    const response = await api.put(`/api/teses/${teseId}`, dadosTese);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar tese:', error);
    throw error;
  }
};

// Função para excluir uma tese
export const excluirTese = async (teseId) => {
  try {
    const response = await api.delete(`/api/teses/${teseId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir tese:', error);
    throw error;
  }
};

export default api;
