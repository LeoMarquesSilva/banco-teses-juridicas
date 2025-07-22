// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { showSuccessToast, showErrorToast } from '../components/CustomToast';
import api from '../api';

// Criar o contexto
export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se há um usuário logado ao iniciar a aplicação
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (storedToken && storedUser) {
          // Configurar o token no header das requisições
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Definir o usuário atual
          setCurrentUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
        // Em caso de erro, limpar os dados de autenticação
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Função para login
  const login = async (email, senha, lembrar = false) => {
    try {
      // Chamar o webhook de login no n8n com a URL correta
      const response = await api.post('/webhook/auth/login', { email, senha });
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // Armazenar o token e os dados do usuário
        const storage = lembrar ? localStorage : sessionStorage;
        storage.setItem('authToken', token);
        storage.setItem('user', JSON.stringify(user));
        
        // Configurar o token para as próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Atualizar o estado
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Mostrar notificação de sucesso
        showSuccessToast('Login realizado com sucesso!');
        
        return { success: true };
      } else {
        // Mostrar notificação de erro
        showErrorToast(response.data.message || 'Credenciais inválidas');
        
        return { 
          success: false, 
          message: response.data.message || 'Credenciais inválidas' 
        };
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      // Verificar se há uma mensagem específica do servidor
      const errorMessage = error.response?.data?.message || 
                          'Não foi possível fazer login. Verifique suas credenciais e tente novamente.';
      
      // Mostrar notificação de erro
      showErrorToast(errorMessage);
      
      return { success: false, message: errorMessage };
    }
  };

  // Função para cadastro
  const register = async (userData) => {
    try {
      // Chamar o webhook de cadastro no n8n com a URL correta
      const response = await api.post('/webhook/auth/register', {
        nome: userData.nome,
        email: userData.email,
        senha: userData.senha,
        instituicao: userData.instituicao,
        cargo: userData.cargo
      });
      
      if (response.data.success) {
        // Mostrar notificação de sucesso
        showSuccessToast('Cadastro realizado com sucesso! Você já pode fazer login.');
        
        return { success: true };
      } else {
        // Mostrar notificação de erro
        showErrorToast(response.data.message || 'Erro ao cadastrar usuário');
        
        return { 
          success: false, 
          message: response.data.message || 'Erro ao cadastrar usuário' 
        };
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      
      // Verificar se há uma mensagem específica do servidor
      const errorMessage = error.response?.data?.message || 
                          'Não foi possível realizar o cadastro. Por favor, tente novamente.';
      
      // Mostrar notificação de erro
      showErrorToast(errorMessage);
      
      return { success: false, message: errorMessage };
    }
  };

  // Função para logout
  const logout = () => {
    // Remover token e dados do usuário
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Remover o token do header das requisições
    delete api.defaults.headers.common['Authorization'];
    
    // Atualizar o estado
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Mostrar notificação de sucesso
    showSuccessToast('Logout realizado com sucesso!');
  };

  // Valores e funções que serão disponibilizados pelo contexto
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  return useContext(AuthContext);
}
