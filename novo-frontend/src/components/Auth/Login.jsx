// src/components/Auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';
import logo from '../../assets/images/logo-azul.png';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    lembrar: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(formData.email, formData.senha, formData.lembrar);
      
      if (result.success) {
        // Adicionar um pequeno atraso para que a notificação seja visível antes do redirecionamento
        setTimeout(() => {
          // Redirecionar para a página que o usuário tentou acessar originalmente
          const from = location.state?.from || '/';
          navigate(from);
        }, 1500); // 1.5 segundos de atraso
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(
        'Não foi possível fazer login. Verifique suas credenciais e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <img src={logo} alt="Logo Banco de Teses" className="auth-logo" />
          </Link>
          <h2>Entrar no Sistema</h2>
          <p className="auth-subtitle">
            Acesse sua conta para gerenciar teses e documentos
          </p>
        </div>
        
        {error && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope input-icon"></i>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Seu e-mail"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <div className="input-with-icon">
              <i className="fas fa-lock input-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Sua senha"
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <div className="form-group-inline">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="lembrar"
                name="lembrar"
                checked={formData.lembrar}
                onChange={handleChange}
              />
              <label htmlFor="lembrar">Lembrar-me</label>
            </div>
            <Link to="/recuperar-senha" className="forgot-password">
              Esqueceu a senha?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Entrando...</span>
              </>
            ) : 'Entrar'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="auth-link">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;