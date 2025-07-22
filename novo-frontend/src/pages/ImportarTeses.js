import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ImportarTeses = () => {
  const navigate = useNavigate();
  const [arquivo, setArquivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [progresso, setProgresso] = useState(0);

  const handleFileChange = (e) => {
    setArquivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!arquivo) {
      setError('Por favor, selecione o arquivo Excel com as teses.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setProgresso(10);
      
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      
      const response = await axios.post('http://localhost:5000/api/teses/importar-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 70) / progressEvent.total);
          setProgresso(10 + percentCompleted);
        }
      });
      
      setProgresso(100);
      setResultado(response.data);
    } catch (err) {
      console.error(err);
      setError('Erro ao importar dados: ' + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Importar Teses Jurídicas</h1>
      
      <div className="card">
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          
          {resultado ? (
            <div className="alert alert-success">
              <h4 className="alert-heading">Importação Concluída!</h4>
              <p>{resultado.msg}</p>
              
              <div className="mt-3">
                <button
                  className="btn btn-primary me-2"
                  onClick={() => navigate('/teses')}
                >
                  Ver Teses Importadas
                </button>
                
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setArquivo(null);
                    setResultado(null);
                  }}
                >
                  Nova Importação
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="arquivo" className="form-label">Arquivo Excel com Teses</label>
                <input
                  type="file"
                  className="form-control"
                  id="arquivo"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
                <div className="form-text">
                  Selecione o arquivo Excel com os dados completos das teses jurídicas.
                </div>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !arquivo}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Importando...
                  </>
                ) : 'Iniciar Importação'}
              </button>
              
              {loading && (
                <div className="mt-3">
                  <div className="progress">
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{ width: `${progresso}%` }}
                      aria-valuenow={progresso}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {progresso}%
                    </div>
                  </div>
                  <small className="text-muted mt-1 d-block">
                    {progresso < 60 ? 'Enviando arquivo...' : 
                     progresso < 100 ? 'Processando dados...' : 
                     'Concluído!'}
                  </small>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
      
      <div className="card mt-4">
        <div className="card-body">
          <h3 className="card-title">Sobre esta importação</h3>
          
          <div className="alert alert-info">
            <p>
              Esta ferramenta importa teses jurídicas a partir de um arquivo Excel com a estrutura específica.
              O arquivo deve conter as seguintes colunas:
            </p>
            <ul className="mb-0">
              <li><strong>Identificador</strong> - Código único da tese</li>
              <li><strong>Título</strong> - Título completo da tese</li>
              <li><strong>Descrição</strong> - Resumo ou descrição da tese</li>
              <li><strong>Área</strong> - Área jurídica (ex: Cível)</li>
              <li><strong>Assunto_separados</strong> - Assuntos separados por ||</li>
              <li><strong>link</strong> - URL para o documento DOCX</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportarTeses;
