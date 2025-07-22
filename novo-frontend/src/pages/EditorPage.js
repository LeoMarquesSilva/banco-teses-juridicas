// src/pages/EditorPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SimpleDocumentEditor from '../components/editor/SimpleDocumentEditor';

function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [teses, setTeses] = useState([]);
  
  useEffect(() => {
    // Tentar obter teses do estado de navegação
    if (location.state?.teses && location.state.teses.length > 0) {
      console.log("Teses recebidas via state:", location.state.teses);
      setTeses(location.state.teses);
      return;
    }
    
    // Se não houver teses no state, tentar recuperar do localStorage
    try {
      const savedTeses = localStorage.getItem('selectedTesesForEditor');
      if (savedTeses) {
        const parsedTeses = JSON.parse(savedTeses);
        if (parsedTeses && parsedTeses.length > 0) {
          console.log("Teses recuperadas do localStorage:", parsedTeses);
          setTeses(parsedTeses);
          return;
        }
      }
    } catch (err) {
      console.error("Erro ao recuperar teses do localStorage:", err);
    }
    
    // Se não houver teses, mostrar mensagem (mas não redirecionar automaticamente)
    console.warn("Nenhuma tese foi encontrada para o editor");
  }, [location.state]);
  
  const handleSaveDocument = (document) => {
    // Aqui você pode implementar a lógica para salvar o documento no backend
    console.log("Documento para salvar:", document);
    
    // Exemplo: salvar no localStorage
    localStorage.setItem('savedDocument', JSON.stringify({
      ...document,
      savedAt: new Date().toISOString()
    }));
    
    // Mostrar alerta de sucesso
    alert("Documento salvo com sucesso!");
  };
  
  return (
    <div className="editor-page-container">
      <h1>Editor de Documentos</h1>
      <p className="editor-description">
        {teses && teses.length > 0 
          ? "Edite o documento gerado a partir das teses selecionadas. Use as ferramentas de formatação conforme necessário."
          : "Crie um novo documento ou importe um arquivo DOCX existente."}
      </p>
      
      <SimpleDocumentEditor 
        teses={teses} 
        onSave={handleSaveDocument} 
      />
      
      <div className="editor-footer">
        <button 
          className="back-button"
          onClick={() => navigate('/teses')}
        >
          Voltar para Lista de Teses
        </button>
      </div>
    </div>
  );
}

export default EditorPage;
