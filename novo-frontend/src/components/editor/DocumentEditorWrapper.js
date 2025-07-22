// src/components/editor/DocumentEditorWrapper.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleDocumentEditor from './SimpleDocumentEditor';

function DocumentEditorWrapper() {
  const params = useParams();
  const navigate = useNavigate();
  const [documento, setDocumento] = useState(null);
  const [teses, setTeses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const init = async () => {
      // Tentar carregar teses selecionadas do localStorage
      try {
        const selectedTeses = localStorage.getItem('selectedTesesForEditor');
        if (selectedTeses) {
          const parsedTeses = JSON.parse(selectedTeses);
          console.log("Teses carregadas do localStorage:", parsedTeses);
          setTeses(parsedTeses);
          
          // Limpar após carregar
          localStorage.removeItem('selectedTesesForEditor');
        }
      } catch (error) {
        console.error('Erro ao carregar teses selecionadas:', error);
      }
      
      // Se temos um ID de documento, carregue-o
      if (params.docId) {
        try {
          const savedDocs = localStorage.getItem('documentos');
          if (savedDocs) {
            const docs = JSON.parse(savedDocs);
            const doc = docs.find(d => d.id === params.docId);
            if (doc) {
              console.log("Documento carregado:", doc);
              setDocumento(doc);
            } else {
              console.error("Documento não encontrado com ID:", params.docId);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar documento:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    init();
  }, [params.docId]);
  
  const handleSaveDocument = (doc) => {
    try {
      const savedDocs = localStorage.getItem('documentos');
      let docs = savedDocs ? JSON.parse(savedDocs) : [];
      
      if (params.docId) {
        // Atualizar documento existente
        docs = docs.map(d => d.id === params.docId ? {
          ...d,
          title: doc.title,
          content: doc.content,
          updatedAt: new Date().toISOString()
        } : d);
      } else {
        // Criar novo documento
        docs.push({
          id: Date.now().toString(),
          title: doc.title,
          content: doc.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('documentos', JSON.stringify(docs));
      alert('Documento salvo com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      alert('Erro ao salvar documento. Por favor, tente novamente.');
    }
  };
  
  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }
  
  return (
<SimpleDocumentEditor 
      initialContent={documento?.content || ''}
      teses={teses}
      onSave={handleSaveDocument}
    />
  );
}

export default DocumentEditorWrapper;
