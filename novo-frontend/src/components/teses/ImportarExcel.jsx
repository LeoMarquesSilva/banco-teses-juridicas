// frontend/src/components/ImportarExcel.jsx
import React, { useState } from 'react';
import axios from 'axios';
import '../ImportarExcel.css';

const ImportarExcel = () => {
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  const handleFileChange = (e) => {
    setArquivo(e.target.files[0]);
    setErro(null);
    setResultado(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!arquivo) {
      setErro('Por favor, selecione um arquivo Excel');
      return;
    }
    
    // Verificar extensão do arquivo
    const extensao = arquivo.name.split('.').pop().toLowerCase();
    if (extensao !== 'xlsx' && extensao !== 'xls' && extensao !== 'csv') {
      setErro('Por favor, selecione um arquivo Excel válido (.xlsx, .xls) ou CSV');
      return;
    }
    
    setLoading(true);
    setErro(null);
    
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      
      const response = await axios.post(
        'http://localhost:5000/api/teses/importar-excel', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setResultado(response.data);
      // Limpar o input de arquivo
      document.getElementById('arquivo').value = '';
      setArquivo(null);
      
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      setErro(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Erro ao processar o arquivo. Verifique o formato e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="importar-excel">
      <h2>Importar Teses Jurídicas do Excel</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="arquivo">Selecione o arquivo Excel:</label>
          <input
            type="file"
            id="arquivo"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn-importar" 
          disabled={!arquivo || loading}
        >
          {loading ? 'Importando...' : 'Importar Teses'}
        </button>
      </form>
      
      {erro && (
        <div className="mensagem erro">
          <p>{erro}</p>
        </div>
      )}
      
      {resultado && (
        <div className="mensagem sucesso">
          <h3>Importação concluída!</h3>
          <p>Total de registros no arquivo: <strong>{resultado.total}</strong></p>
          <p>Registros inseridos: <strong>{resultado.inseridos}</strong></p>
          <p>Registros atualizados: <strong>{resultado.atualizados}</strong></p>
          {resultado.erros > 0 && (
            <p>Registros com erro: <strong>{resultado.erros}</strong></p>
          )}
          {resultado.invalidos > 0 && (
            <p>Registros inválidos (ignorados): <strong>{resultado.invalidos}</strong></p>
          )}
        </div>
      )}
      
      <div className="instrucoes">
        <h3>Instruções:</h3>
        <ol>
          <li>O arquivo deve estar no formato Excel (.xlsx, .xls) ou CSV</li>
          <li>A primeira linha deve conter os cabeçalhos</li>
          <li>Colunas necessárias: Identificador, Título</li>
          <li>O sistema processará as colunas:
            <ul>
              <li>Identificador</li>
              <li>Título</li>
              <li>Descrição</li>
              <li>Área</li>
              <li>Assunto_separados (separados por ||)</li>
              <li>Profissional_catalogador</li>
              <li>Data</li>
              <li>Ano_e_mês_atualização</li>
              <li>special_item_status</li>
              <li>special_comment_status</li>
              <li>special_document</li>
              <li>link</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default ImportarExcel;
