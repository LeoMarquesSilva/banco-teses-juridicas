// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, registrar, obterPerfil } from '../api'; // ✅ Importar as funções corretas

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          
          // Verificar se o token ainda é válido
          try {
            const perfil = await obterPerfil();
            setUser(perfil);
          } catch (error) {
            console.warn('Token expirado, fazendo logout...');
            logout();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verificarAuth();
  }, []);

  // Função de login - ✅ CORRIGIDA
  const handleLogin = async (email, senha, lembrarMe = false) => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando login para:', email);
      
      // ✅ USAR A FUNÇÃO login() DO api.js, NÃO A INSTÂNCIA api
      const response = await login(email, senha);
      
      console.log('✅ Resposta do login:', response);

      if (response.success && response.token) {
        const storage = lembrarMe ? localStorage : sessionStorage;
        
        // Salvar token e dados do usuário
        storage.setItem('authToken', response.token);
        storage.setItem('user', JSON.stringify(response.user));
        
        setUser(response.user);
        setIsAuthenticated(true);
        
        console.log('✅ Login realizado com sucesso');
        return { success: true };
      } else {
        throw new Error(response.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao fazer login';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Função de registro - ✅ CORRIGIDA
  const handleRegistro = async (nome, email, senha) => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando registro para:', email);
      
      // ✅ USAR A FUNÇÃO registrar() DO api.js
      const response = await registrar(nome, email, senha);
      
      console.log('✅ Resposta do registro:', response);

      if (response.success) {
        return { 
          success: true, 
          message: response.message || 'Registro realizado com sucesso!' 
        };
      } else {
        throw new Error(response.message || 'Erro no registro');
      }
    } catch (error) {
      console.error('❌ Erro ao fazer registro:', error);
      
      let errorMessage = 'Erro ao fazer registro';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Este email já está cadastrado.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ Logout realizado');
  };

  // Função para atualizar perfil
  const atualizarPerfil = async (novosDados) => {
    try {
      const perfilAtualizado = await obterPerfil();
      setUser(perfilAtualizado);
      
      // Atualizar no storage também
      const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(perfilAtualizado));
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { 
        success: false, 
        error: 'Erro ao atualizar perfil' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login: handleLogin,        // ✅ Função corrigida
    registro: handleRegistro,  // ✅ Função corrigida
    logout,
    atualizarPerfil
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;