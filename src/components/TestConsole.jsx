import React, { useState, useRef, useEffect } from 'react';
import { runSalesTests, runDateTests, runReportTests } from '../utils/testRunner';
import '../styles/TestConsole.css';

const TestConsole = () => {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTest, setActiveTest] = useState(null);
  const consoleRef = useRef(null);

  // Função para adicionar logs ao console
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, { message, type, timestamp }]);
  };

  // Função para limpar o console
  const clearLogs = () => {
    setLogs([]);
  };

  // Função para executar o teste de vendas
  const handleRunSalesTest = async () => {
    setIsRunning(true);
    setActiveTest('sales');
    addLog('Iniciando teste de vendas...', 'info');

    try {
      // Substituir console.log para capturar os logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      console.log = (...args) => {
        originalConsoleLog(...args);
        addLog(args.join(' '), 'info');
      };

      console.error = (...args) => {
        originalConsoleError(...args);
        addLog(args.join(' '), 'error');
      };

      const result = await runSalesTests();

      // Restaurar console.log
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      addLog('Teste de vendas concluído com sucesso!', 'success');
    } catch (error) {
      addLog(`Erro no teste de vendas: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
      setActiveTest(null);
    }
  };

  // Função para executar o teste de datas
  const handleRunDateTest = async () => {
    setIsRunning(true);
    setActiveTest('dates');
    addLog('Iniciando teste de datas...', 'info');

    try {
      // Substituir console.log para capturar os logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      console.log = (...args) => {
        originalConsoleLog(...args);
        addLog(args.join(' '), 'info');
      };

      console.error = (...args) => {
        originalConsoleError(...args);
        addLog(args.join(' '), 'error');
      };

      const result = await runDateTests();

      // Restaurar console.log
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      if (result.success) {
        addLog('Teste de datas concluído com sucesso!', 'success');
      } else {
        addLog(`Teste de datas falhou: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`Erro no teste de datas: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
      setActiveTest(null);
    }
  };

  // Função para executar o teste de relatórios
  const handleRunReportTest = async () => {
    setIsRunning(true);
    setActiveTest('reports');
    addLog('Iniciando teste de relatórios...', 'info');

    try {
      // Substituir console.log para capturar os logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      console.log = (...args) => {
        originalConsoleLog(...args);
        addLog(args.join(' '), 'info');
      };

      console.error = (...args) => {
        originalConsoleError(...args);
        addLog(args.join(' '), 'error');
      };

      const result = await runReportTests();

      // Restaurar console.log
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      if (result.success) {
        addLog('Teste de relatórios concluído com sucesso!', 'success');
      } else {
        addLog(`Teste de relatórios falhou: ${result.error}`, 'error');
      }
    } catch (error) {
      addLog(`Erro no teste de relatórios: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
      setActiveTest(null);
    }
  };

  // Função para executar todos os testes
  const handleRunAllTests = async () => {
    clearLogs();
    setIsRunning(true);
    addLog('=== INICIANDO TODOS OS TESTES ===', 'info');

    try {
      await handleRunSalesTest();
      await handleRunDateTest();
      await handleRunReportTest();

      addLog('=== TODOS OS TESTES CONCLUÍDOS ===', 'success');
    } catch (error) {
      addLog(`Erro ao executar todos os testes: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Rolar para o final do console quando novos logs forem adicionados
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="test-console">
      <div className="test-header">
        <h2>Console de Testes - PDV Vendas</h2>
        <div className="test-buttons">
          <button
            onClick={handleRunSalesTest}
            disabled={isRunning}
            className={activeTest === 'sales' ? 'active' : ''}
          >
            Teste de Vendas
          </button>
          <button
            onClick={handleRunDateTest}
            disabled={isRunning}
            className={activeTest === 'dates' ? 'active' : ''}
          >
            Teste de Datas
          </button>
          <button
            onClick={handleRunReportTest}
            disabled={isRunning}
            className={activeTest === 'reports' ? 'active' : ''}
          >
            Teste de Relatórios
          </button>
          <button
            onClick={handleRunAllTests}
            disabled={isRunning}
            className="run-all-btn"
          >
            Executar Todos
          </button>
          <button
            onClick={clearLogs}
            disabled={isRunning}
            className="clear-btn"
          >
            Limpar Console
          </button>
        </div>
      </div>

      <div className="console-container" ref={consoleRef}>
        {logs.map((log, index) => (
          <div key={index} className={`log-entry ${log.type}`}>
            <span className="timestamp">[{log.timestamp}]</span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}

        {isRunning && (
          <div className="loading-indicator">
            Executando testes... Por favor, aguarde.
          </div>
        )}

        {logs.length === 0 && !isRunning && (
          <div className="empty-console">
            Console vazio. Clique em um dos botões acima para executar testes.
          </div>
        )}
      </div>

    </div>
  );
};

export default TestConsole;
