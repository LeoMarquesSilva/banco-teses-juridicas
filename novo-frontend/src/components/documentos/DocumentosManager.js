// src/components/documentos/DocumentosManager.js (alternativa)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DocumentosManager.css';

function DocumentosManager() {
  const [documentos, setDocumentos] = useState([]);
  const [teses, setTeses] = useState([]);
  const [selectedTeses, setSelectedTeses] = useState([]);
  const [teseTexts, setTeseTexts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [currentImportTese, setCurrentImportTese] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar documentos e teses salvos
    const loadData = () => {
      try {
        // Carregar documentos
        const savedDocs = localStorage.getItem('documentos');
        if (savedDocs) {
          setDocumentos(JSON.parse(savedDocs));
        }
        
        // Carregar teses
        const savedTeses = localStorage.getItem('teses');
        if (savedTeses) {
          setTeses(JSON.parse(savedTeses));
        }
        
        // Carregar textos de teses (se existirem)
        const savedTeseTexts = localStorage.getItem('teseTexts');
        if (savedTeseTexts) {
          setTeseTexts(JSON.parse(savedTeseTexts));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const toggleSelection = (tese) => {
    if (selectedTeses.some(item => item.id === tese.id)) {
      setSelectedTeses(selectedTeses.filter(item => item.id !== tese.id));
    } else {
      setSelectedTeses([...selectedTeses, tese]);
    }
  };
  
  const openImportModal = (tese) => {
    setCurrentImportTese(tese);
    setImportModalOpen(true);
  };
  
  const handleImportText = (text) => {
    if (currentImportTese) {
      const updatedTexts = {
        ...teseTexts,
        [currentImportTese.id]: text
      };
      setTeseTexts(updatedTexts);
      localStorage.setItem('teseTexts', JSON.stringify(updatedTexts));
      setImportModalOpen(false);
      setCurrentImportTese(null);
    }
  };

  const handleCreateDocument = () => {
    if (selectedTeses.length === 0) {
      alert('Selecione pelo menos uma tese para criar o documento.');
      return;
    }
    
    // Verificar se todas as teses selecionadas têm texto
    const missingTextTeses = selectedTeses.filter(tese => !teseTexts[tese.id]);
    if (missingTextTeses.length > 0) {
      const confirmContinue = window.confirm(
        `${missingTextTeses.length} tese(s) não têm texto importado. Deseja continuar mesmo assim?`
      );
      if (!confirmContinue) return;
    }
    
    // Adicionar o texto importado a cada tese selecionada
    const tesesWithText = selectedTeses.map(tese => ({
      ...tese,
      texto: teseTexts[tese.id] || "Texto não fornecido"
    }));
    
    navigate('/editor', { state: { teses: tesesWithText } });
  };

  const handleEditDocument = (docId) => {
    navigate(`/editor/${docId}`);
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      const updatedDocs = documentos.filter(doc => doc.id !== docId);
      setDocumentos(updatedDocs);
      localStorage.setItem('documentos', JSON.stringify(updatedDocs));
    }
  };

  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="documentos-manager">
      <div className="documentos-header">
        <h1>Gerenciador de Documentos</h1>
      </div>
      
      <div className="documentos-content">
        <div className="documentos-section">
          <h2>Documentos Salvos</h2>
          {documentos.length === 0 ? (
            <p>Nenhum documento salvo ainda.</p>
          ) : (
            <div className="documentos-list">
              {documentos.map(doc => (
                <div key={doc.id} className="documento-item">
                  <h3>{doc.title}</h3>
                  <p>Criado em: {new Date(doc.createdAt).toLocaleDateString()}</p>
                  <div className="documento-actions">
                    <button onClick={() => handleEditDocument(doc.id)}>Editar</button>
                    <button className="delete" onClick={() => handleDeleteDocument(doc.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="teses-selection-section">
          <h2>Criar Novo Documento</h2>
          <div className="teses-selection">
            <div className="selection-header">
              <h3>Selecione as teses para o documento</h3>
              <button 
                className="create-doc-button"
                onClick={handleCreateDocument}
                disabled={selectedTeses.length === 0}
              >
                Criar Documento ({selectedTeses.length})
              </button>
            </div>
            
            {teses.length === 0 ? (
              <div className="no-teses">Nenhuma tese encontrada. Importe teses primeiro.</div>
            ) : (
              <div className="selection-list">
                {teses.map(tese => {
                  const isSelected = selectedTeses.some(item => item.id === tese.id);
                  const hasImportedText = !!teseTexts[tese.id];
                  
                  return (
                    <div key={tese.id} className="selection-item-container">
                      <div 
                        className={`selection-item ${isSelected ? 'selected' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelection(tese)}
                        />
                        <div className="item-details">
                          <h3>{tese.titulo || 'Tese sem título'}</h3>
                          <p>{(tese.resumo || '').substring(0, 100) || "Sem resumo"}...</p>
                          
                          {tese.arquivo && (
                            <div className="tese-file-link">
                              <a href={tese.arquivo} target="_blank" rel="noopener noreferrer">
                                Ver arquivo original
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="tese-actions">
                          <button 
                            className={`import-text-btn ${hasImportedText ? 'has-text' : ''}`}
                            onClick={() => openImportModal(tese)}
                          >
                            {hasImportedText ? 'Texto Importado ✓' : 'Importar Texto'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de importação de texto */}
      {importModalOpen && currentImportTese && (
        <div className="import-modal-overlay">
          <div className="import-modal">
            <div className="import-modal-header">
              <h3>Importar Texto da Tese</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setImportModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="import-modal-content">
              <p>
                <strong>Tese:</strong> {currentImportTese.titulo || 'Sem título'}
              </p>
              
              <p className="import-instructions">
                Abra o arquivo da tese, copie o texto e cole abaixo:
              </p>
              
              <textarea
                className="import-textarea"
                defaultValue={teseTexts[currentImportTese.id] || ''}
                placeholder="Cole o texto da tese aqui..."
                rows={10}
                id="importTextarea"
              />
              
              <div className="import-modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setImportModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="import-btn"
                  onClick={() => {
                    const text = document.getElementById('importTextarea').value;
                    handleImportText(text);
                  }}
                >
                  Importar Texto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentosManager;
