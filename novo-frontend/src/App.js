// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import TesesList from './components/teses/TesesList';
import ImportarExcel from './components/teses/ImportarExcel';
import TeseDetail from './components/teses/TeseDetail';
import DocumentosManager from './components/documentos/DocumentosManager';
import DocumentEditorWrapper from './components/editor/DocumentEditorWrapper';
import Login from './components/Auth/Login';
import Cadastro from './components/Auth/Cadastro';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          
          <main className="app-container">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              
              {/* Rotas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              
              <Route path="/teses" element={
                <ProtectedRoute>
                  <TesesList />
                </ProtectedRoute>
              } />
              
              <Route path="/tese/:id" element={
                <ProtectedRoute>
                  <TeseDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/importar" element={
                <ProtectedRoute>
                  <ImportarExcel />
                </ProtectedRoute>
              } />
              
              <Route path="/documentos" element={
                <ProtectedRoute>
                  <DocumentosManager />
                </ProtectedRoute>
              } />
              
              <Route path="/editor" element={
                <ProtectedRoute>
                  <DocumentEditorWrapper />
                </ProtectedRoute>
              } />
              
              <Route path="/editor/:docId" element={
                <ProtectedRoute>
                  <DocumentEditorWrapper />
                </ProtectedRoute>
              } />
              
              {/* Redirecionar para login caso a rota não exista */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          
          <Footer />
          
          {/* Configuração do ToastContainer para notificações */}
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
