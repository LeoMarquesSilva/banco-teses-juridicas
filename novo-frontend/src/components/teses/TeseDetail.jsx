// src/components/teses/TeseDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api'; // ✅ Importar configuração
import './TeseDetail.css';

function TeseDetail() {
  const { id } = useParams();
  const [tese, setTese] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchTese = async () => {
      // Verificar se o ID existe antes de fazer a requisição
      if (!id) {
        setError('ID da tese não fornecido na URL');
        setLoading(false);
        return;
      }

      try {
        console.log(`🔍 Tentando buscar tese com ID: ${id}`);
        console.log(`🌐 URL da API: ${API_BASE_URL}`);
        
        // ✅ Usar URL dinâmica
        const url = `${API_BASE_URL}/api/teses/${id}`;
        console.log(`📡 Fazendo requisição para: ${url}`);
        
        const response = await axios.get(url, {
          timeout: 30000, // 30 segundos
          withCredentials: true
        });
        
        console.log('✅ Tese carregada com sucesso:', response.data);
        setTese(response.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Erro completo:', err);
        console.error('📊 Status da resposta:', err.response?.status);
        console.error('📋 Dados da resposta:', err.response?.data);
        console.error('🔗 URL tentada:', `${API_BASE_URL}/api/teses/${id}`);
        
        let errorMessage = 'Erro desconhecido';
        
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Erro de conexão com o servidor. Verifique sua internet.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Tese não encontrada.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Erro interno do servidor.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = err.message;
        }
        
        setError(`Erro ao carregar detalhes da tese: ${errorMessage}`);
        setLoading(false);
      }
    };

    fetchTese();
  }, [id]);

  // Função para formatar a data
  const formatarData = (dataString) => {
    if (!dataString) return 'Data não disponível';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Função para compartilhar a tese
  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  // Função para copiar o link da tese
  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  // Função para compartilhar no WhatsApp
  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const title = tese ? tese.titulo : 'Tese Jurídica';
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
  };

  // Função para compartilhar no Twitter/X
  const shareOnTwitter = () => {
    const url = window.location.href;
    const title = tese ? tese.titulo : 'Tese Jurídica';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}`)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Carregando detalhes da tese...</p>
      <small>Conectando com: {API_BASE_URL}</small>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <h3>Erro ao carregar a tese</h3>
      <p>{error}</p>
      <details style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <summary>Detalhes técnicos</summary>
        <p>URL da API: {API_BASE_URL}</p>
        <p>ID da tese: {id}</p>
        <p>Ambiente: {process.env.NODE_ENV || 'development'}</p>
      </details>
      <Link to="/teses" className="back-button">← Voltar para a lista</Link>
    </div>
  );

  return (
    <div className="tese-detail-container">
      <div className="tese-detail-header">
        <Link to="/teses" className="back-button">
          <i className="fas fa-arrow-left"></i> Voltar para a lista
        </Link>
      </div>

      <div className="tese-detail-card">
        <div className="tese-header-area">
          {tese.area && <span className="area-badge">{tese.area}</span>}
          <h1 className="tese-title">{tese.titulo}</h1>
          <div className="tese-date">{formatarData(tese.data)}</div>
        </div>
        
        <div className="tese-meta">
          <div className="meta-item">
            <span className="meta-label">Identificador:</span>
            <span className="meta-value">{tese.identificador}</span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Catalogador:</span>
            <span className="meta-value">{tese.profissionalCatalogador || 'Não especificado'}</span>
          </div>
        </div>
        
        <div className="tese-description">
          <h3>Descrição</h3>
          <div className="description-content">
            {tese.descricao ? (
              <p>{tese.descricao}</p>
            ) : (
              <p className="no-content">Nenhuma descrição disponível.</p>
            )}
          </div>
        </div>
        
        {tese.assuntos && tese.assuntos.length > 0 && (
          <div className="tese-assuntos">
            <h3>Assuntos</h3>
            <div className="assuntos-list">
              {tese.assuntos.map((assunto, index) => (
                <span key={index} className="assunto-tag">{assunto}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className="tese-actions">
          {tese.link && (
            <a 
              href={tese.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="action-button download-button"
            >
              <i className="fas fa-file-download"></i> Baixar Documento
            </a>
          )}
          
          <div className="share-container">
            <button className="action-button share-button" onClick={handleShare}>
              <i className="fas fa-share-alt"></i> Compartilhar
            </button>
            
            {showShareOptions && (
              <div className="share-options">
                <button 
                  className="share-option copy-link"
                  onClick={copyToClipboard}
                >
                  <i className="fas fa-link"></i> Copiar Link
                  {copySuccess && <span className="copy-success">Copiado!</span>}
                </button>
                <button 
                  className="share-option whatsapp"
                  onClick={shareOnWhatsApp}
                >
                  <i className="fab fa-whatsapp"></i> WhatsApp
                </button>
                <button 
                  className="share-option twitter"
                  onClick={shareOnTwitter}
                >
                  <i className="fab fa-twitter"></i> Twitter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {tese.atualizacao && (
        <div className="update-info">
          <i className="fas fa-history"></i> Última atualização: {formatarData(tese.atualizacao)}
        </div>
      )}
      
      <div className="related-content">
        <h3>Você também pode gostar</h3>
        <div className="related-placeholder">
          <p>Teses relacionadas serão exibidas aqui</p>
        </div>
      </div>
    </div>
  );
}

export default TeseDetail;