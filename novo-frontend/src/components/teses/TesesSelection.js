// src/components/teses/TesesSelection.js
import React, { useState, useEffect } from 'react';
import './TesesSelection.css';

function TesesSelection({ teses, onDocumentCreate }) {
  const [selectedTeses, setSelectedTeses] = useState([]);
  
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
              <p>{tese.resumo?.substring(0, 100)}...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TesesSelection;
