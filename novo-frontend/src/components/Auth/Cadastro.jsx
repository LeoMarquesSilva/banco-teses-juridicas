// src/components/Auth/Cadastro.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';
import logo from '../../assets/images/logo-azul.png';

function Cadastro() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    instituicao: '',
    cargo: '',
    termos: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Limpar erro de validação quando o usuário começa a digitar
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (!formData.senha) {
      errors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      errors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = 'As senhas não coincidem';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.instituicao.trim()) {
      errors.instituicao = 'Instituição é obrigatória';
    }
    
    if (!formData.cargo.trim()) {
      errors.cargo = 'Cargo é obrigatório';
    }
    
    if (!formData.termos) {
      errors.termos = 'Você precisa aceitar os termos para continuar';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setFormStep(2);
    }
  };

  const prevStep = () => {
    setFormStep(1);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formStep === 1) {
      nextStep();
      return;
    }
    
    if (!validateStep2()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        instituicao: formData.instituicao,
        cargo: formData.cargo
      });
      
      if (result.success) {
        // Adicionar um pequeno atraso para que a notificação seja visível antes do redirecionamento
        setTimeout(() => {
          navigate('/login'); // Redirecionar para a página de login após o cadastro
        }, 1500); // 1.5 segundos de atraso
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Erro ao fazer cadastro:', err);
      setError(
        'Não foi possível realizar o cadastro. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'senha') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <img src={logo} alt="Logo Banco de Teses" className="auth-logo" />
          </Link>
          <h2>Criar uma Conta</h2>
          <p className="auth-subtitle">
            {formStep === 1 
              ? 'Preencha seus dados para criar uma conta' 
              : 'Complete seu perfil profissional'}
          </p>
        </div>
        
        {error && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {formStep === 1 ? (
            // Etapa 1: Informações básicas
            <>
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <div className="input-with-icon">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className={validationErrors.nome ? 'error' : ''}
                  />
                </div>
                {validationErrors.nome && (
                  <span className="error-message">{validationErrors.nome}</span>
                )}
              </div>
              
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
                    className={validationErrors.email ? 'error' : ''}
                  />
                </div>
                {validationErrors.email && (
                  <span className="error-message">{validationErrors.email}</span>
                )}
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
                    placeholder="Crie uma senha"
                    className={validationErrors.senha ? 'error' : ''}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('senha')}
                    tabIndex="-1"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {validationErrors.senha && (
                  <span className="error-message">{validationErrors.senha}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar Senha</label>
                <div className="input-with-icon">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    placeholder="Confirme sua senha"
                    className={validationErrors.confirmarSenha ? 'error' : ''}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirmarSenha')}
                    tabIndex="-1"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {validationErrors.confirmarSenha && (
                  <span className="error-message">{validationErrors.confirmarSenha}</span>
                )}
              </div>
              
              <button 
                type="button" 
                className="auth-button"
                onClick={nextStep}
              >
                Continuar
              </button>
            </>
          ) : (
            // Etapa 2: Informações profissionais
            <>
              <div className="form-group">
                <label htmlFor="instituicao">Instituição</label>
                <div className="input-with-icon">
                  <i className="fas fa-building input-icon"></i>
                  <input
                    type="text"
                    id="instituicao"
                    name="instituicao"
                    value={formData.instituicao}
                    onChange={handleChange}
                    placeholder="Sua instituição"
                    className={validationErrors.instituicao ? 'error' : ''}
                  />
                </div>
                {validationErrors.instituicao && (
                  <span className="error-message">{validationErrors.instituicao}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="cargo">Cargo</label>
                <div className="input-with-icon">
                  <i className="fas fa-briefcase input-icon"></i>
                  <input
                    type="text"
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    placeholder="Seu cargo"
                    className={validationErrors.cargo ? 'error' : ''}
                  />
                </div>
                {validationErrors.cargo && (
                  <span className="error-message">{validationErrors.cargo}</span>
                )}
              </div>
              
              <div className="form-group-checkbox">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="termos"
                    name="termos"
                    checked={formData.termos}
                    onChange={handleChange}
                    className={validationErrors.termos ? 'error' : ''}
                  />
                  <label htmlFor="termos">
                    Concordo com os <Link to="/termos" className="auth-link">Termos de Uso</Link> e <Link to="/privacidade" className="auth-link">Política de Privacidade</Link>
                  </label>
                </div>
                {validationErrors.termos && (
                  <span className="error-message">{validationErrors.termos}</span>
                )}
              </div>
              
              <div className="form-buttons">
                <button 
                  type="button" 
                  className="auth-button secondary"
                  onClick={prevStep}
                >
                  Voltar
                </button>
                
                <button 
                  type="submit" 
                  className={`auth-button ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Cadastrando...</span>
                    </>
                  ) : 'Cadastrar'}
                </button>
              </div>
            </>
          )}
        </form>
        
        <div className="auth-footer">
          <p>
            Já tem uma conta?{' '}
            <Link to="/login" className="auth-link">
              Entrar
            </Link>
          </p>
        </div>
        
        <div className="auth-steps">
          <div className={`step ${formStep >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${formStep >= 2 ? 'active' : ''}`}>2</div>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;