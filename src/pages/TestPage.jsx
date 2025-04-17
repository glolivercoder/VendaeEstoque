import React from 'react';
import TestConsole from '../components/TestConsole';
import '../styles/TestConsole.css';

const TestPage = ({ showTestPage, setShowTestPage }) => {
  if (!showTestPage) return null;

  return (
    <div className="test-page-overlay">
      <div className="test-page-container">
        <div className="test-page-header">
          <h1>Página de Testes - PDV Vendas</h1>
          <button className="close-btn" onClick={() => setShowTestPage(false)}>×</button>
        </div>

        <div className="test-page-content">
          <TestConsole />
        </div>
      </div>

    </div>
  );
};

export default TestPage;
