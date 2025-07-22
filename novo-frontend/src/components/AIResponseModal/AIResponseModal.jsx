// src/components/AIResponseModal/AIResponseModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import './AIResponseModal.css';

const AIResponseModal = ({ 
  isOpen, 
  onClose, 
  result, 
  isProcessing, 
  actionType, 
  onApply 
}) => {
  const [editedResult, setEditedResult] = useState('');
  const panelRef = useRef(null);
  
  // Atualiza o texto editável quando o resultado muda
  useEffect(() => {
    if (result) {
      // Formata o texto para exibição adequada
      const formattedText = result
        .replace(/\\n/g, '\n')  // Garante que quebras de linha sejam preservadas corretamente
        .trim();
      
      setEditedResult(formattedText);
    }
  }, [result]);
  
  // Adiciona efeito de entrada ao painel
  useEffect(() => {
    if (isOpen && panelRef.current) {
      setTimeout(() => {
        panelRef.current.classList.add('panel-active');
        // Adiciona classe ao body para prevenir rolagem
        document.body.classList.add('ai-panel-open');
      }, 10);
    } else {
      document.body.classList.remove('ai-panel-open');
    }
    
    // Cleanup quando o componente for desmontado
    return () => {
      document.body.classList.remove('ai-panel-open');
    };
  }, [isOpen]);

  // Função para fechar o painel com animação
  const closeWithAnimation = () => {
    if (panelRef.current) {
      panelRef.current.classList.remove('panel-active');
      setTimeout(() => {
        onClose();
      }, 300); // Tempo da animação
    } else {
      onClose();
    }
  };

  // Função para copiar o texto para a área de transferência
  const handleCopy = () => {
    navigator.clipboard.writeText(editedResult)
      .then(() => {
        // Feedback visual temporário
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
          const originalText = copyBtn.innerText;
          copyBtn.innerText = '✓ Copiado!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      })
      .catch(err => console.error('Erro ao copiar texto:', err));
  };
  
  // Função para aplicar o texto editado ao editor
  const handleApply = () => {
    onApply(editedResult);
    closeWithAnimation();
  };
  
  // Títulos personalizados baseados no tipo de ação
  const getTitleByAction = () => {
    switch(actionType) {
      case 'resumir': return 'Resumo do Texto';
      case 'revisar': return 'Texto Revisado';
      case 'sugerir': return 'Sugestões de Melhoria';
      case 'formatar': return 'Formatação ABNT';
      case 'citacao': return 'Citações e Referências';
      default: return 'Resultado da IA';
    }
  };
  
  // Ícones para cada tipo de ação
  const getIconByAction = () => {
    switch(actionType) {
      case 'resumir': return '📝';
      case 'revisar': return '✏️';
      case 'sugerir': return '💡';
      case 'formatar': return '📋';
      case 'citacao': return '📚';
      default: return '🤖';
    }
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!isOpen) return null;

  return (
    <div className="ai-panel-overlay">
      <div 
        ref={panelRef}
        className="ai-side-panel"
      >
        <div className="ai-panel-header">
          <div className="ai-panel-title">
            <span className="ai-action-icon">{getIconByAction()}</span>
            <h2>{getTitleByAction()}</h2>
          </div>
          <button 
            className="ai-panel-close" 
            onClick={closeWithAnimation}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <div className="ai-panel-body">
          {isProcessing ? (
            <div className="ai-loading">
              <div className="ai-spinner-container">
                <div className="ai-spinner"></div>
              </div>
              <p>Processando seu texto com IA...</p>
              <span className="ai-loading-subtitle">Isso pode levar alguns segundos</span>
            </div>
          ) : (
            <>
              <div className="ai-editor-container">
                <textarea
                  className="ai-result-editor"
                  value={editedResult}
                  onChange={(e) => setEditedResult(e.target.value)}
                  placeholder="O resultado será exibido aqui..."
                  spellCheck="true"
                />
              </div>
              
              <div className="ai-panel-tip">
                <span className="ai-tip-icon">💡</span>
                <span>Você pode editar o texto antes de aplicá-lo ao documento</span>
              </div>
            </>
          )}
        </div>
        
        <div className="ai-panel-footer">
          <button 
            id="copy-btn"
            className="ai-btn ai-btn-secondary" 
            onClick={handleCopy}
            disabled={isProcessing}
          >
            <span className="ai-btn-icon">📋</span>
            Copiar
          </button>
          <button 
            className="ai-btn ai-btn-primary"
            onClick={handleApply}
            disabled={isProcessing}
          >
            <span className="ai-btn-icon">✓</span>
            Aplicar ao Texto
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIResponseModal;
