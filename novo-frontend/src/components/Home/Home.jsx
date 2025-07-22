// src/components/Home/Home.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  useEffect(() => {
    // Animação dos números nas estatísticas
    const animateStats = () => {
      const stats = document.querySelectorAll('.stat-number');
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const startTime = Date.now();
        
        const updateStat = () => {
          const currentTime = Date.now();
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const value = Math.floor(progress * target);
          
          if (stat.textContent.includes('+')) {
            stat.textContent = `${value}+`;
          } else if (stat.textContent.includes('%')) {
            stat.textContent = `${value}%`;
          } else {
            stat.textContent = value;
          }
          
          if (progress < 1) {
            requestAnimationFrame(updateStat);
          }
        };
        
        updateStat();
      });
    };
    
    // Iniciar animações quando os elementos entrarem na viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('stats-container')) {
            animateStats();
          }
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) observer.observe(statsContainer);
    
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
      if (statsContainer) observer.unobserve(statsContainer);
    };
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-gradient"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-highlight">Banco de Teses</span> Jurídicas
          </h1>
          <p className="hero-description">
            Uma plataforma completa para profissionais do Direito organizarem, 
            pesquisarem e criarem documentos jurídicos com eficiência e precisão.
          </p>
          <div className="hero-actions">
            <Link to="/teses" className="btn-primary">
              Explorar Teses
              <i className="fas fa-arrow-right"></i>
            </Link>
            <Link to="/documentos" className="btn-secondary">
              Gerenciar Documentos
            </Link>
          </div>
        </div>
        <div className="hero-stats stats-container">
          <div className="stat-item">
            <span className="stat-number" data-target="5000">0+</span>
            <span className="stat-label">Teses Catalogadas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" data-target="20">0+</span>
            <span className="stat-label">Áreas do Direito</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" data-target="99">0%</span>
            <span className="stat-label">Satisfação</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header animate-on-scroll">
          <h2 className="section-title">Por que usar nossa plataforma?</h2>
          <p className="section-subtitle">
            Ferramentas poderosas desenvolvidas especificamente para profissionais do direito
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card animate-on-scroll">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">
                <i className="fas fa-search"></i>
              </div>
            </div>
            <div className="feature-content">
              <h3>Pesquisa Inteligente</h3>
              <p>Encontre rapidamente as teses mais relevantes com nosso sistema de busca avançado por palavras-chave, temas e jurisprudência.</p>
            </div>
          </div>

          <div className="feature-card animate-on-scroll">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">
                <i className="fas fa-database"></i>
              </div>
            </div>
            <div className="feature-content">
              <h3>Banco de Dados Completo</h3>
              <p>Acesse milhares de teses jurídicas organizadas por área do direito, tribunal, data e relevância.</p>
            </div>
          </div>

          <div className="feature-card animate-on-scroll">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">
                <i className="fas fa-file-alt"></i>
              </div>
            </div>
            <div className="feature-content">
              <h3>Editor Avançado</h3>
              <p>Crie e edite documentos jurídicos com ferramentas específicas para citações, referências e formatação profissional.</p>
            </div>
          </div>

          <div className="feature-card animate-on-scroll">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">
                <i className="fas fa-upload"></i>
              </div>
            </div>
            <div className="feature-content">
              <h3>Importação Simplificada</h3>
              <p>Importe facilmente dados de planilhas Excel e outros formatos para alimentar sua base de conhecimento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="workflow-section">
        <div className="workflow-gradient"></div>
        <div className="section-header light animate-on-scroll">
          <h2 className="section-title">Como funciona</h2>
          <p className="section-subtitle">
            Um processo simples para otimizar seu trabalho jurídico
          </p>
        </div>

        <div className="workflow-steps">
          <div className="workflow-step animate-on-scroll">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Pesquise</h3>
              <p>Encontre teses relevantes para seu caso usando nossa pesquisa avançada</p>
            </div>
          </div>
          
          <div className="workflow-connector"></div>
          
          <div className="workflow-step animate-on-scroll">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Selecione</h3>
              <p>Escolha as teses mais adequadas para fundamentar seu documento</p>
            </div>
          </div>
          
          <div className="workflow-connector"></div>
          
          <div className="workflow-step animate-on-scroll">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Crie</h3>
              <p>Elabore seu documento jurídico com nosso editor especializado</p>
            </div>
          </div>
          
          <div className="workflow-connector"></div>
          
          <div className="workflow-step animate-on-scroll">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Exporte</h3>
              <p>Salve ou compartilhe seu documento em diversos formatos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header animate-on-scroll">
          <h2 className="section-title">O que dizem nossos usuários</h2>
          <p className="section-subtitle">
            Profissionais do direito que transformaram sua prática com nossa plataforma
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card animate-on-scroll">
            <div className="testimonial-content">
              <div className="quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>
              <p>"Esta plataforma revolucionou minha forma de trabalhar. A organização das teses e a facilidade de pesquisa me economizam horas de trabalho toda semana."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="author-info">
                <h4>Dra. Ana Silveira</h4>
                <p>Advogada Tributarista</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card animate-on-scroll">
            <div className="testimonial-content">
              <div className="quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>
              <p>"A funcionalidade de importação de dados me permitiu migrar todo meu acervo de teses para a plataforma em questão de minutos. Simplesmente incrível!"</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="author-info">
                <h4>Dr. Carlos Mendes</h4>
                <p>Procurador Federal</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card animate-on-scroll">
            <div className="testimonial-content">
              <div className="quote-icon">
                <i className="fas fa-quote-left"></i>
              </div>
              <p>"O editor de documentos com citações automáticas e formatação jurídica tornou a produção de peças processuais muito mais eficiente em nosso escritório."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="author-info">
                <h4>Dra. Patrícia Oliveira</h4>
                <p>Sócia de Escritório de Advocacia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-gradient"></div>
        <div className="cta-content animate-on-scroll">
          <h2>Pronto para otimizar seu trabalho jurídico?</h2>
          <p>Acesse nossa base completa de teses e comece a criar documentos mais fundamentados e eficientes.</p>
          <div className="cta-buttons">
            <Link to="/teses" className="btn-primary btn-large">
              Começar Agora
              <i className="fas fa-arrow-right"></i>
            </Link>
            <Link to="/importar" className="btn-outline btn-large">
              Importar Dados
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
