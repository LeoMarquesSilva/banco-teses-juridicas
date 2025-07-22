import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const DetalhesTese = () => {
  const { id } = useParams();
  const [tese, setTese] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTese = async () => {
      try {
        const res = await api.get(`/teses/${id}`);
        setTese(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar os detalhes da tese');
        setLoading(false);
      }
    };

    fetchTese();
  }, [id]);

  if (loading) {
    return <div className="d-flex justify-content-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Carregando...</span>
      </div>
    </div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!tese) {
    return <div className="alert alert-warning">Tese não encontrada</div>;
  }

  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-body">
          <h1 className="card-title">{tese.titulo}</h1>
          <div className="card-text">
            <p className="lead">
              <strong>Autor:</strong> {tese.autor}
            </p>
            
            <div className="row mb-3">
              <div className="col-md-4">
                <strong>Ano:</strong> {tese.ano}
              </div>
              <div className="col-md-8">
                <strong>Universidade:</strong> {tese.universidade}
              </div>
            </div>
            
            <div className="mb-3">
              <strong>Área do Conhecimento:</strong> {tese.areaDoConhecimento}
            </div>
            
            <div className="mb-3">
              <strong>Palavras-chave:</strong> {tese.palavrasChave.join(', ')}
            </div>
            
            <div className="mb-4">
              <strong>Resumo:</strong>
              <p className="mt-2">{tese.resumo}</p>
            </div>
            
            {tese.linkAcesso && (
              <div className="mb-3">
                <a href={tese.linkAcesso} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Acessar Documento Completo
                </a>
              </div>
            )}
            
            <div className="text-muted mt-3">
              <small>Cadastrado em: {new Date(tese.dataCadastro).toLocaleDateString('pt-BR')}</small>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <Link to="/teses" className="btn btn-outline-secondary">
          Voltar para a lista
        </Link>
      </div>
    </div>
  );
};

export default DetalhesTese;
