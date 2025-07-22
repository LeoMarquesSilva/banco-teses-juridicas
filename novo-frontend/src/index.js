//import 'process/browser';
import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Se você tiver este arquivo
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
