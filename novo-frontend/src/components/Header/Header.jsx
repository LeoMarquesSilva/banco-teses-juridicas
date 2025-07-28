// src/components/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';
import logoBranco from '../../assets/images/logo-branco.png';
import logoAzul from '../../assets/images/logo-azul.png';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Detectar scroll para aplicar efeito de vidro fosco
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fechar o menu ao clicar fora dele
  useEffect(() => {
    const closeMenus = (e) => {
      if (userMenuOpen && !e.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', closeMenus);
    return () => document.removeEventListener('click', closeMenus);
  }, [userMenuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  // ✅ FUNÇÃO CORRIGIDA - obter as iniciais do nome do usuário
  const getUserInitials = () => {
    if (!currentUser) return '?';
    
    const userName = currentUser.nome || currentUser.name || '';
    if (!userName) return '?';
    
    const nameParts = userName.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // ✅ FUNÇÃO AUXILIAR - obter nome do usuário
  const getUserName = () => {
    return currentUser?.nome || currentUser?.name || 'Usuário';
  };

  return (
    <header className={`app-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-backdrop"></div>
      <div className="header-container">
        <Link to="/" className="logo-link">
          <img 
            src={scrolled ? logoAzul : logoBranco} 
            alt="Logo Banco de Teses" 
            className="logo" 
          />
        </Link>

        <div className="header-right">
          <button 
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Menu principal"
          >
            <span className="menu-icon"></span>
          </button>

          <nav className={`main-nav ${menuOpen ? 'active' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-home"></i>
                  Início
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/teses" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-book"></i>
                  Teses
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/documentos" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-file-alt"></i>
                  Documentos
                </NavLink>
              </li>
              {isAuthenticated && (
                <li className="nav-item">
                  <NavLink to="/importar" className="nav-link" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-upload"></i>
                    Importar
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {isAuthenticated ? (
            <div className="user-menu-container">
              <button className="user-button" onClick={toggleUserMenu}>
                <div className="user-avatar">
                  {getUserInitials()}
                </div>
                {/* ✅ LINHA 127 CORRIGIDA */}
                <span className="user-name">{getUserName().split(' ')[0]}</span>
                <i className="fas fa-chevron-down"></i>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar large">
                      {getUserInitials()}
                    </div>
                    <div className="user-details">
                      {/* ✅ LINHA 136 CORRIGIDA */}
                      <h4 className="user-fullname">{getUserName()}</h4>
                      <p className="user-email">{currentUser?.email || ''}</p>
                    </div>
                  </div>
                  <ul className="user-menu">
                    <li>
                      <Link to="/perfil" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <i className="fas fa-user"></i>
                        Meu Perfil
                      </Link>
                    </li>
                    <li>
                      <Link to="/configuracoes" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <i className="fas fa-cog"></i>
                        Configurações
                      </Link>
                    </li>
                    <div className="divider"></div>
                    <li>
                      <button className="user-menu-item logout" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Sair
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login">Entrar</Link>
              <Link to="/cadastro" className="auth-button register">Cadastrar</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;