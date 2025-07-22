import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container py-5">
      <div className="jumbotron">
        <h1 className="display-4">Banco de Teses Jurídicas</h1>
        <p className="lead">
          Bem-vindo ao nosso repositório digital de teses jurídicas. Aqui você pode encontrar e compartilhar trabalhos acadêmicos na área do Direito.
        </p>
        <hr className="my-4" />
        <p>
          Explore nossa coleção de teses ou contribua adicionando novos trabalhos ao nosso banco de dados.
        </p>
        <div className="d-flex gap-2">
          <Link to="/teses" className="btn btn-primary btn-lg">
            Ver Teses
          </Link>
          <Link to="/adicionar" className="btn btn-outline-primary btn-lg">
            Adicionar Tese
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
