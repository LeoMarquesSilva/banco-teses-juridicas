import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TeseForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    ano: '',
    universidade: '',
    resumo: '',
    palavrasChave: '',
    areaDoConhecimento: '',
    linkAcesso: ''
  });

  const { titulo, autor, ano, universidade, resumo, palavrasChave, areaDoConhecimento, linkAcesso } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    
    // Converter palavrasChave de string para array
    const teseData = {
      ...formData,
      palavrasChave: palavrasChave.split(',').map(palavra => palavra.trim()),
      ano: parseInt(ano)
    };
    
    try {
      await api.post('/teses', teseData);
      alert('Tese cadastrada com sucesso!');
      navigate('/teses');
    } catch (err) {
      console.error(err.response.data);
      alert('Erro ao cadastrar tese');
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title mb-4">Adicionar Nova Tese</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="titulo" className="form-label">Título</label>
            <input
              type="text"
              className="form-control"
              id="titulo"
              name="titulo"
              value={titulo}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="autor" className="form-label">Autor</label>
            <input
              type="text"
              className="form-control"
              id="autor"
              name="autor"
              value={autor}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="ano" className="form-label">Ano</label>
            <input
              type="number"
              className="form-control"
              id="ano"
              name="ano"
              value={ano}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="universidade" className="form-label">Universidade</label>
            <input
              type="text"
              className="form-control"
              id="universidade"
              name="universidade"
              value={universidade}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="resumo" className="form-label">Resumo</label>
            <textarea
              className="form-control"
              id="resumo"
              name="resumo"
              value={resumo}
              onChange={onChange}
              rows="4"
              required
            ></textarea>
          </div>
          
          <div className="mb-3">
            <label htmlFor="palavrasChave" className="form-label">Palavras-chave (separadas por vírgula)</label>
            <input
              type="text"
              className="form-control"
              id="palavrasChave"
              name="palavrasChave"
              value={palavrasChave}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="areaDoConhecimento" className="form-label">Área do Conhecimento</label>
            <input
              type="text"
              className="form-control"
              id="areaDoConhecimento"
              name="areaDoConhecimento"
              value={areaDoConhecimento}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="linkAcesso" className="form-label">Link de Acesso</label>
            <input
              type="url"
              className="form-control"
              id="linkAcesso"
              name="linkAcesso"
              value={linkAcesso}
              onChange={onChange}
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Cadastrar</button>
        </form>
      </div>
    </div>
  );
};

export default TeseForm;
