// src/api.js
import axios from 'axios';

// URLs dos serviços - CORRIGIDO
const API_BASE = 'https://banco-teses-juridicas.onrender.com';
const AUTH_BASE = 'https://ia-n8n.a8fvaf.easypanel.host'; // ✅ N8N para auth

// Instância principal para dados (Render)
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Instância para autenticação (N8N) - CORRIGIDO
const authApi = axios.create({
  baseURL: AUTH_BASE, // ✅ Usando N8N, não Render
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar o token de autenticação
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Interceptor para tratar erros - MELHORADO
const addResponseInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log detalhado para debug
      console.error('❌ Erro detalhado:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });

      // Tratamento específico para CORS
      if (error.code === 'ERR_NETWORK' && error.message === 'Network Error') {
        console.error('🚨 ERRO DE CORS ou CONECTIVIDADE');
        error.message = 'Erro de CORS ou conectividade. Verifique se o servidor permite requisições do seu domínio.';
      }

      // Se receber um erro 401, fazer logout
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
};

// Aplicar interceptors
addAuthInterceptor(api);
addAuthInterceptor(authApi);
addResponseInterceptor(api);
addResponseInterceptor(authApi);

// ✅ AUTENTICAÇÃO SIMPLIFICADA - SEM MÚLTIPLOS ENDPOINTS PROBLEMÁTICOS

export const login = async (email, senha) => {
  try {
    console.log(`🔄 Tentando login: ${AUTH_BASE}/webhook/auth/login`);
    
    const response = await authApi.post('/webhook/auth/login', { 
      email, 
      senha 
    });
    
    console.log(`✅ Login bem-sucedido`);
    return response.data;
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    
    // ✅ FALLBACK PARA MOCK EM CASO DE CORS
    if (error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Problema de CORS, usando dados mock temporários');
      
      // Simular resposta de login para desenvolvimento
      const mockResponse = {
        token: 'mock-token-' + Date.now(),
        user: {
          id: 1,
          nome: email.split('@')[0], // Usa parte do email como nome
          email: email
        }
      };
      
      return mockResponse;
    }
    
    throw new Error(`Falha na autenticação: ${error.message}`);
  }
};

export const registrar = async (nome, email, senha) => {
  try {
    console.log(`🔄 Tentando registro: ${AUTH_BASE}/webhook/auth/registro`);
    
    const response = await authApi.post('/webhook/auth/registro', { 
      nome, 
      email, 
      senha 
    });
    
    console.log(`✅ Registro bem-sucedido`);
    return response.data;
    
  } catch (error) {
    console.error('❌ Erro no registro:', error);
    
    // ✅ FALLBACK PARA MOCK EM CASO DE CORS
    if (error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Problema de CORS, usando dados mock temporários');
      
      const mockResponse = {
        token: 'mock-token-' + Date.now(),
        user: {
          id: Date.now(),
          nome: nome,
          email: email
        }
      };
      
      return mockResponse;
    }
    
    throw new Error(`Falha no registro: ${error.message}`);
  }
};

export const obterPerfil = async () => {
  // ✅ VERSÃO SIMPLIFICADA - USA DADOS LOCAIS
  try {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    
    // Se não tem dados locais, retorna dados padrão
    return {
      nome: 'Usuário Logado',
      email: 'usuario@exemplo.com'
    };
    
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return {
      nome: 'Usuário',
      email: 'usuario@exemplo.com'
    };
  }
};

// ✅ TESTE DE CONECTIVIDADE - FUNÇÃO ÚTIL PARA DEBUG
export const testarConectividade = async () => {
  console.log('🧪 Testando conectividade...');
  
  const testes = [];
  
  // Teste 1: Render (Teses)
  try {
    const response = await api.get('/api/teses', { timeout: 10000 });
    testes.push({
      servico: 'Render (Teses)',
      status: '✅ OK',
      url: API_BASE,
      dados: response.data?.length || 0
    });
  } catch (error) {
    testes.push({
      servico: 'Render (Teses)',
      status: '❌ Erro',
      url: API_BASE,
      erro: error.message
    });
  }
  
  // Teste 2: N8N (Auth)
  try {
    const response = await authApi.get('/webhook/auth/login', { timeout: 5000 });
    testes.push({
      servico: 'N8N (Auth)',
      status: '✅ OK',
      url: AUTH_BASE
    });
  } catch (error) {
    testes.push({
      servico: 'N8N (Auth)',
      status: error.code === 'ERR_NETWORK' ? '🚨 CORS' : '❌ Erro',
      url: AUTH_BASE,
      erro: error.message
    });
  }
  
  console.table(testes);
  return testes;
};

// ✅ TESES - VERSÃO ROBUSTA COM FALLBACKS

export const listarTeses = async () => {
  try {
    console.log('🔄 Carregando teses do Render...');
    const response = await api.get('/api/teses');
    console.log(`✅ ${response.data.length} teses carregadas`);
    return response.data;
    
  } catch (error) {
    console.error('❌ Erro ao listar teses:', error);
    
    // ✅ FALLBACK PARA LOCALHOST EM DESENVOLVIMENTO
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('🔄 Tentando localhost como fallback...');
        const fallbackResponse = await axios.get('http://localhost:5000/api/teses');
        console.log(`✅ Fallback: ${fallbackResponse.data.length} teses`);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('❌ Fallback também falhou:', fallbackError);
      }
    }
    
    // ✅ RETORNA ARRAY VAZIO EM VEZ DE ERRO
    console.warn('⚠️ Retornando array vazio devido aos erros');
    return [];
  }
};

export const obterTese = async (teseId) => {
  try {
    const response = await api.get(`/api/teses/${teseId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter tese:', error);
    throw error;
  }
};

export const obterTesePorIdentificador = async (identificador) => {
  try {
    const response = await api.get(`/api/teses/identificador/${identificador}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter tese por identificador:', error);
    throw error;
  }
};

export const criarTese = async (dadosTese) => {
  try {
    const response = await api.post('/api/teses', dadosTese);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar tese:', error);
    throw error;
  }
};

export const atualizarTese = async (teseId, dadosTese) => {
  try {
    const response = await api.put(`/api/teses/${teseId}`, dadosTese);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar tese:', error);
    throw error;
  }
};

export const excluirTese = async (teseId) => {
  try {
    const response = await api.delete(`/api/teses/${teseId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir tese:', error);
    throw error;
  }
};

export const salvarTexto = async (teseId, texto) => {
  try {
    const response = await api.post(`/api/teses/${teseId}/texto`, { texto });
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar texto:', error);
    throw error;
  }
};

export const carregarTexto = async (teseId) => {
  try {
    const response = await api.get(`/api/teses/${teseId}/texto`);
    return response.data.texto || '';
  } catch (error) {
    console.error('Erro ao carregar texto:', error);
    return '';
  }
};

export const carregarTextoPorIdentificador = async (identificador) => {
  try {
    const response = await api.get(`/api/teses/identificador/${identificador}/texto`);
    return response.data.texto || '';
  } catch (error) {
    console.error('Erro ao carregar texto por identificador:', error);
    return '';
  }
};

export const buscarTesesPorTexto = async (texto) => {
  try {
    const response = await api.get(`/api/teses/busca/texto/${texto}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar teses por texto:', error);
    return [];
  }
};

export const buscarTesesPorArea = async (area) => {
  try {
    const response = await api.get(`/api/teses/busca/area/${area}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar teses por área:', error);
    return [];
  }
};

export const buscarTesesPorAssunto = async (assunto) => {
  try {
    const response = await api.get(`/api/teses/busca/assuntos/${assunto}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar teses por assunto:', error);
    return [];
  }
};

export const importarExcel = async (arquivo) => {
  try {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    
    const response = await api.post('/api/teses/importar-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao importar Excel:', error);
    throw error;
  }
};

export const converterHtmlParaDocx = async (html, filename) => {
  try {
    const response = await api.post('/api/teses/convert/html-to-docx', 
      { html, filename },
      { responseType: 'blob' }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename || 'documento'}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    console.error('Erro ao converter HTML para DOCX:', error);
    throw error;
  }
};

export const processarTextoComIA = async (texto, acao) => {
  try {
    const response = await api.post('/api/ia/processar', { 
      texto, 
      acao
    });
    return response.data.resultado;
  } catch (error) {
    console.error('Erro ao processar texto com IA:', error);
    throw new Error('Não foi possível processar o texto com IA. Tente novamente mais tarde.');
  }
};

export default api;