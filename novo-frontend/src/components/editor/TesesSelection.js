// src/components/teses/TesesSelection.js
import React, { useState, useEffect } from 'react';
import './TesesSelection.css';

function TesesSelection({ onDocumentCreate }) {
  const [teses, setTeses] = useState([]);
  const [selectedTeses, setSelectedTeses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar as teses do localStorage
  useEffect(() => {
    const loadTeses = () => {
      try {
        const savedTeses = localStorage.getItem('teses');
        if (savedTeses) {
          setTeses(JSON.parse(savedTeses));
        }
      } catch (error) {
        console.error('Erro ao carregar teses:', error);
      }
      setIsLoading(false);
    };
    
    loadTeses();
  }, []);
  
  const toggleSelection = (tese) => {
    if (selectedTeses.some(item => item.id === tese.id)) {
      setSelectedTeses(selectedTeses.filter(item => item.id !== tese.id));
    } else {
      setSelectedTeses([...selectedTeses, tese]);
    }
  };
  
  const handleCreateDocument = () => {
    if (selectedTeses.length === 0) {
      alert('Selecione pelo menos uma tese para criar o documento.');
      return;
    }
    
    onDocumentCreate(selectedTeses);
  };
  
  if (isLoading) {
    return <div className="loading">Carregando teses...</div>;
  }
  
  if (teses.length === 0) {
    return <div className="no-teses">Nenhuma tese encontrada. Importe teses primeiro.</div>;
  }
  
  return (
    <div className="teses-selection">
      <div className="selection-header">
        <h2>Selecione as teses para o documento</h2>
        <button 
          className="create-doc-button"
          onClick={handleCreateDocument}
          disabled={selectedTeses.length === 0}
        >
          Criar Documento ({selectedTeses.length})
        </button>
      </div>
      
      <div className="selection-list">
        {teses.map(tese => (
          <div 
            key={tese.id} 
            className={`selection-item ${selectedTeses.some(item => item.id === tese.id) ? 'selected' : ''}`}
            onClick={() => toggleSelection(tese)}
          >
            <input 
              type="checkbox" 
              checked={selectedTeses.some(item => item.id === tese.id)}
              onChange={() => {}} // Controlado pelo onClick do div
            />
            <div className="item-details">
              <h3>{tese.titulo}</h3>
              <p>{tese.resumo?.substring(0, 100) || "Sem resumo"}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TesesSelection;
