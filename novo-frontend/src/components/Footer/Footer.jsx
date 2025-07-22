// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logo from '../../assets/images/logo.png';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="main-footer">
      <div className="footer-top-pattern"></div>
      <div className="footer-gradient-bar"></div>
      
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="Logo Banco de Teses" />
              <h3>Banco de Teses Jurídicas</h3>
            </div>
            <p className="footer-tagline">
              Plataforma interna de gestão de conhecimento jurídico
            </p>
            <div className="footer-social">
              <a href="#" className="social-icon" aria-label="Intranet">
                <i className="fas fa-globe"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Email">
                <i className="fas fa-envelope"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Teams">
                <i className="fas fa-users"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-navigation">
            <div className="footer-section">
              <h4>Navegação</h4>
              <ul>
                <li><Link to="/">Início</Link></li>
                <li><Link to="/teses">Teses</Link></li>
                <li><Link to="/importar">Importar</Link></li>
                <li><Link to="/documentos">Documentos</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Suporte</h4>
              <ul>
                <li><Link to="/ajuda">Ajuda</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/contato">Contato TI</Link></li>
                <li><Link to="/manual">Manual do Usuário</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Contato</h4>
              <ul className="contact-info">
                <li>
                  <i className="fas fa-envelope"></i>
                  <span>leonardo.marques@bismarchipires.com.br</span>
                  
                </li>
                   <li>
                  <i className="fas fa-envelope"></i>
                  <span>controladoria@bismarchipires.com.br</span>
                  
                </li>
                <li>
                  <i className="fas fa-phone"></i>
                  <span>Ramal: 207</span>
                </li>
                <li>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Operações Legais - 1º andar</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-divider">
          <span className="divider-icon">
            <i className="fas fa-balance-scale"></i>
          </span>
        </div>
        
        <div className="footer-legal">
          <p>Este sistema é de uso exclusivo dos colaboradores da Bismarchi | Pires Sociedade de Advogados.</p>
          <p>Todas as informações contidas são confidenciais e protegidas por sigilo profissional.</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">&copy; {currentYear} Bismarchi | Pires Sociedade de Advogados</p>
          <p className="developer-info">Site desenvolvido pela equipe de Operações Legais do BP</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
