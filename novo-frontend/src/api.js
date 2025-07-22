// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ia-n8n.a8fvaf.easypanel.host'
});

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

export default api;
