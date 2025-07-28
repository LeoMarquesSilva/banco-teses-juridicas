// src/components/teses/TesesList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarTeses } from '../../api'; // ✅ USANDO A API CORRIGIDA
import mammoth from 'mammoth';
import './TesesList.css';

function TesesList() {
  const navigate = useNavigate();
  const [teses, setTeses] = useState([]);
  const [filteredTeses, setFilteredTeses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilters, setAreaFilters] = useState([]);

  // Lista de áreas únicas para os filtros
  const [areas, setAreas] = useState([]);

  // Estados para seleção de teses e importação de texto
  const [selectedTeses, setSelectedTeses] = useState([]);
  const [teseTexts, setTeseTexts] = useState({});
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [currentImportTese, setCurrentImportTese] = useState(null);

  // Referência para input de arquivo
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTeses = async () => {
      try {
        console.log('🔄 Carregando teses...');
        setLoading(true);
        setError(null);
        
        // ✅ USANDO A FUNÇÃO DA API CORRIGIDA
        const data = await listarTeses();
        
        console.log('✅ Dados recebidos:', data);
        
        // ✅ VERIFICAÇÃO DE DADOS
        if (!Array.isArray(data)) {
          console.warn('⚠️ Dados não são um array:', data);
          setTeses([]);
          setFilteredTeses([]);
        } else {
          setTeses(data);
          setFilteredTeses(data);
          
          // Extrair áreas únicas para os filtros
          const uniqueAreas = [...new Set(data
            .filter(tese => tese.area) // Filtrar valores nulos/undefined
            .map(tese => tese.area))];
          
          setAreas(uniqueAreas);
          console.log(`✅ ${data.length} teses carregadas, ${uniqueAreas.length} áreas únicas`);
        }
        
        // Carregar textos de teses (se existirem)
        try {
          const savedTeseTexts = localStorage.getItem('teseTexts');
          if (savedTeseTexts) {
            setTeseTexts(JSON.parse(savedTeseTexts));
            console.log('✅ Textos de teses carregados do localStorage');
          }
        } catch (err) {
          console.error('❌ Erro ao carregar textos de teses:', err);
        }
        
      } catch (err) {
        console.error('❌ Erro ao carregar teses:', err);
        setError(`Erro ao carregar teses: ${err.message}`);
        
        // ✅ EM CASO DE ERRO, AINDA ASSIM TENTAR CARREGAR DADOS LOCAIS
        try {
          const savedTeseTexts = localStorage.getItem('teseTexts');
          if (savedTeseTexts) {
            setTeseTexts(JSON.parse(savedTeseTexts));
          }
        } catch (localErr) {
          console.error('❌ Erro ao carregar dados locais:', localErr);
        }
        
      } finally {
        setLoading(false);
      }
    };

    fetchTeses();
  }, []);

  // Função para aplicar filtros
  useEffect(() => {
    let result = teses;
    
    // Filtrar por termo de pesquisa (título)
    if (searchTerm) {
      result = result.filter(tese => 
        tese.titulo && tese.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por área (múltipla escolha)
    if (areaFilters.length > 0) {
      result = result.filter(tese => areaFilters.includes(tese.area));
    }
    
    setFilteredTeses(result);
  }, [teses, searchTerm, areaFilters]);

  // Função para alternar filtro de área
  const toggleAreaFilter = (area) => {
    if (areaFilters.includes(area)) {
      setAreaFilters(areaFilters.filter(a => a !== area));
    } else {
      setAreaFilters([...areaFilters, area]);
    }
  };

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setAreaFilters([]);
  };

  // Função para extrair o ano da data
  const getAno = (dataString) => {
    if (!dataString) return 'N/A';
    try {
      return new Date(dataString).getFullYear();
    } catch (e) {
      return 'N/A';
    }
  };

  // Funções para seleção de teses
  const toggleSelection = (tese) => {
    if (selectedTeses.some(item => item._id === tese._id)) {
      setSelectedTeses(selectedTeses.filter(item => item._id !== tese._id));
    } else {
      setSelectedTeses([...selectedTeses, tese]);
    }
  };

  // Função para processar texto importado e preservar formatação
  const processImportedText = (text) => {
    if (!text) return '';
    
    // Preservar parágrafos e formatação básica
    let processed = text;
    
    // Definir fonte Times New Roman tamanho 12 para todo o conteúdo
    processed = '<div style="font-family: \'Times New Roman\', Times, serif; font-size: 12pt;">' + processed + '</div>';
    
    // Adicionar recuo de 5cm na primeira linha de cada parágrafo e outras formatações
    processed = processed.replace(/<p/g, '<p style="margin-bottom: 1.5em; text-align: justify; line-height: 1.5; text-indent: 5cm !important;"');
    
    // Preservar quebras de linha
    processed = processed.replace(/\n/g, '<br />');
    
    // Preservar múltiplos espaços
    processed = processed.replace(/ {2,}/g, (match) => {
      return '&nbsp;'.repeat(match.length);
    });
    
    // Garantir que títulos tenham espaçamento adequado (sem recuo)
    processed = processed.replace(/<h1/g, '<h1 style="margin-top: 2em; margin-bottom: 1em; font-size: 16pt; font-weight: bold; font-family: \'Times New Roman\', Times, serif; text-indent: 0 !important;"');
    processed = processed.replace(/<h2/g, '<h2 style="margin-top: 1.5em; margin-bottom: 0.8em; font-size: 14pt; font-weight: bold; font-family: \'Times New Roman\', Times, serif; text-indent: 0 !important;"');
    processed = processed.replace(/<h3/g, '<h3 style="margin-top: 1.2em; margin-bottom: 0.6em; font-size: 13pt; font-weight: bold; font-family: \'Times New Roman\', Times, serif; text-indent: 0 !important;"');
    
    // Preservar sublinhados
    processed = processed.replace(/<u>/g, '<span style="text-decoration: underline;">');
    processed = processed.replace(/<\/u>/g, '</span>');
    
    // Adicionar estilo para texto sublinhado que pode vir do Word
    processed = processed.replace(/text-decoration: underline;/g, 'text-decoration: underline;');
    
    // Melhorar formatação de tabelas (sem recuo)
    processed = processed.replace(/<table/g, '<table style="border-collapse: collapse; width: 100%; margin-bottom: 1.5em; font-family: \'Times New Roman\', Times, serif; font-size: 12pt;"');
    processed = processed.replace(/<td/g, '<td style="border: 1px solid black; padding: 8pt; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 0 !important;"');
    processed = processed.replace(/<th/g, '<th style="border: 1px solid black; padding: 8pt; background-color: #f2f2f2; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 0 !important;"');
    
    // Melhorar formatação de listas (sem recuo)
    processed = processed.replace(/<ul/g, '<ul style="margin-bottom: 1.5em; margin-left: 2em; font-family: \'Times New Roman\', Times, serif; font-size: 12pt;"');
    processed = processed.replace(/<ol/g, '<ol style="margin-bottom: 1.5em; margin-left: 2em; font-family: \'Times New Roman\', Times, serif; font-size: 12pt;"');
    processed = processed.replace(/<li/g, '<li style="margin-bottom: 0.5em; font-family: \'Times New Roman\', Times, serif; font-size: 12pt; text-indent: 0 !important;"');
    
    return processed;
  };

  // Função para criar documento com as teses selecionadas
  const handleCreateDocument = () => {
    if (selectedTeses.length === 0) {
      alert("Por favor, selecione pelo menos uma tese para criar o documento.");
      return;
    }
    
    // Adicionar o texto importado a cada tese selecionada
    const tesesWithText = selectedTeses.map(tese => ({
      ...tese,
      texto: teseTexts[tese._id] || "Texto não fornecido"
    }));
    
    console.log("✅ Teses selecionadas para o documento:", tesesWithText);
    
    // Salvar no localStorage como backup
    localStorage.setItem('selectedTesesForEditor', JSON.stringify(tesesWithText));
    
    // Navegar para o editor com as teses selecionadas
    navigate('/editor', { state: { teses: tesesWithText } });
  };

  // Funções para importação de texto
  const openImportModal = (tese) => {
    setCurrentImportTese(tese);
    setImportModalOpen(true);
  };

  const handleImportText = (text) => {
    if (currentImportTese) {
      // Processar o texto para preservar formatação
      const processedText = processImportedText(text);
      
      const updatedTexts = {
        ...teseTexts,
        [currentImportTese._id]: processedText
      };
      setTeseTexts(updatedTexts);
      localStorage.setItem('teseTexts', JSON.stringify(updatedTexts));
      setImportModalOpen(false);
      setCurrentImportTese(null);
      
      console.log(`✅ Texto importado para tese: ${currentImportTese.titulo}`);
    }
  };

  // Função para importar documento Word
  const handleImportWordDocument = async (event) => {
    const file = event.target.files[0];
    if (!file || !currentImportTese) return;
    
    try {
      console.log('🔄 Importando documento Word...');
      const arrayBuffer = await file.arrayBuffer();
      
      const options = {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Normal'] => p:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em"
        ],
        preserveDocumentStyle: true
      };
      
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      
      // Processar o HTML resultante para melhorar a formatação
      const processedHtml = processImportedText(result.value);
      
      // Atualizar o texto no textarea
      const textarea = document.getElementById('importTextarea');
      if (textarea) {
        textarea.value = processedHtml;
        
        // Também atualizar a visualização para o usuário ver as alterações
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
      }
      
      console.log('✅ Documento Word importado com sucesso');
      
    } catch (error) {
      console.error("❌ Erro ao importar documento Word:", error);
      alert("Erro ao importar o documento. Por favor, tente novamente.");
    }
    
    // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função para criar documento (chama handleCreateDocument)
  const createDocument = () => {
    handleCreateDocument();
  };

  // Função para selecionar todas as teses
  const selectAllTeses = () => {
    if (selectedTeses.length === filteredTeses.length) {
      // Se todas já estão selecionadas, desmarcar todas
      setSelectedTeses([]);
    } else {
      // Caso contrário, selecionar todas as teses filtradas
      setSelectedTeses([...filteredTeses]);
    }
  };

  // ✅ FUNÇÃO PARA TENTAR RECARREGAR TESES
  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    
    try {
      console.log('🔄 Tentando recarregar teses...');
      const data = await listarTeses();
      
      if (Array.isArray(data)) {
        setTeses(data);
        setFilteredTeses(data);
        
        const uniqueAreas = [...new Set(data
          .filter(tese => tese.area)
          .map(tese => tese.area))];
        setAreas(uniqueAreas);
        
        console.log(`✅ Recarga bem-sucedida: ${data.length} teses`);
      }
      
    } catch (err) {
      console.error('❌ Falha na recarga:', err);
      setError(`Erro ao recarregar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ RENDERIZAÇÃO COM TRATAMENTO DE ESTADOS
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando teses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>❌ Erro ao Carregar Teses</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="retry-button">
              🔄 Tentar Novamente
            </button>
            <button onClick={() => setError(null)} className="dismiss-button">
              ✖ Dispensar Erro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teses-container">
      <h2>Banco de Teses Jurídicas</h2>
      
      {/* ✅ INDICADOR DE STATUS */}
      <div className="status-bar">
        <span className="status-indicator">
          {teses.length > 0 ? '🟢 Conectado' : '🟡 Dados Limitados'}
        </span>
        <span className="teses-count">
          {teses.length} teses disponíveis
        </span>
      </div>
      
      {/* Seção de filtros */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Pesquisar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          {/* Filtro de Área com checkboxes */}
          <div className="filter-group filter-checkboxes">
            <label className="filter-label">Área:</label>
            <div className="checkbox-container">
              {areas.map(area => (
                <div className="checkbox-item" key={area}>
                  <input
                    type="checkbox"
                    id={`area-${area}`}
                    checked={areaFilters.includes(area)}
                    onChange={() => toggleAreaFilter(area)}
                  />
                  <label htmlFor={`area-${area}`}>{area}</label>
                </div>
              ))}
            </div>
          </div>
          
          <button className="clear-filters" onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>
      </div>
      
      {/* Botão para criar documento (aparece quando há teses selecionadas) */}
      {selectedTeses.length > 0 && (
        <div className="create-document-bar">
          <button className="create-document-btn" onClick={createDocument}>
            Criar Documento com {selectedTeses.length} Tese(s) Selecionada(s)
          </button>
        </div>
      )}
      
      {/* Tabela de teses */}
      {filteredTeses.length === 0 ? (
        <div className="no-results">
          <p>
            {teses.length === 0 
              ? "Nenhuma tese disponível no momento." 
              : "Nenhuma tese encontrada com os filtros atuais."
            }
          </p>
          {areaFilters.length > 0 || searchTerm ? (
            <button onClick={clearFilters}>Limpar filtros</button>
          ) : (
            <button onClick={handleRetry}>🔄 Recarregar</button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="teses-table">
            <thead>
              <tr>
                <th className="selection-column">
                  <input 
                    type="checkbox" 
                    checked={selectedTeses.length === filteredTeses.length && filteredTeses.length > 0}
                    onChange={selectAllTeses}
                  />
                </th>
                <th>Título</th>
                <th>Catalogador</th>
                <th>Ano</th>
                <th>Área</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeses.map((tese) => {
                const isSelected = selectedTeses.some(item => item._id === tese._id);
                const hasImportedText = !!teseTexts[tese._id];
                
                return (
                  <tr key={tese._id} className={isSelected ? 'selected-row' : ''}>
                    <td className="selection-column">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelection(tese)}
                      />
                    </td>
                    <td>
                      <Link to={`/tese/${tese._id}`} className="tese-link">
                        {tese.titulo}
                      </Link>
                    </td>
                    <td>{tese.profissionalCatalogador || 'N/A'}</td>
                    <td>{getAno(tese.data)}</td>
                    <td>{tese.area || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/tese/${tese._id}`} 
                          className="view-button"
                          title={tese.link ? "Ver detalhes e baixar documento" : "Ver detalhes"}
                        >
                          <i className="fas fa-eye"></i> {tese.link ? "Ver/Baixar" : "Ver"}
                        </Link>
                        <button 
                          className={`import-text-button ${hasImportedText ? 'has-text' : ''}`}
                          onClick={() => openImportModal(tese)}
                        >
                          {hasImportedText ? 'Texto ✓' : 'Importar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="results-count">
        Exibindo {filteredTeses.length} de {teses.length} teses
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
              
              <div className="import-options">
                <p className="import-instructions">
                  Escolha uma das opções para importar o texto:
                </p>
                
                <div className="import-buttons">
                  <button 
                    className="import-word-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Importar arquivo DOCX
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImportWordDocument}
                    accept=".docx"
                    style={{ display: 'none' }}
                  />
                  
                  <span className="or-divider">ou</span>
                  
                  <p>Cole o texto diretamente:</p>
                </div>
              </div>
              
              <textarea
                className="import-textarea"
                defaultValue={teseTexts[currentImportTese._id] || ''}
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
      
      {/* Informação sobre o download na página de detalhes */}
      <div className="download-info">
        <p><i className="fas fa-info-circle"></i> Para baixar um documento, clique em "Ver/Baixar" para acessar a página de detalhes da tese.</p>
      </div>
    </div>
  );
}

export default TesesList;