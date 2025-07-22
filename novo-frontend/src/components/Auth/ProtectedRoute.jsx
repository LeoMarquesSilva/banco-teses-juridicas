// src/components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Função para verificar se o usuário está autenticado
  const isAuthenticated = () => {
    // Verifica se existe um token de autenticação no localStorage ou sessionStorage
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };
  
  // Se não estiver autenticado, redireciona para a página de login
  // e preserva a URL original para redirecionamento após o login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Se estiver autenticado, renderiza o componente filho
  return children;
};

export default ProtectedRoute;