import React, { useState, useEffect } from 'react';
import n8nService from '../services/n8n';
import { N8N_BASE_URL, N8N_WEBHOOKS, N8N_WORKFLOWS } from '../config/n8n-config';

/**
 * Componente para configurações de integração com n8n
 */
const N8nIntegrationSettings = ({ onClose }) => {
  // Estado para armazenar os fluxos de trabalho
  const [workflows, setWorkflows] = useState([]);
  // Estado para armazenar o status de carregamento
  const [loading, setLoading] = useState(true);
  // Estado para armazenar erros
  const [error, setError] = useState(null);
  // Estado para armazenar o status de teste
  const [testStatus, setTestStatus] = useState({
    testing: false,
    success: false,
    message: ''
  });
  // Estado para armazenar o status do MCP
  const [mcpStatus, setMcpStatus] = useState({
    checking: true,
    available: false,
    message: 'Verificando disponibilidade do MCP...'
  });

  // Carregar fluxos de trabalho e verificar MCP ao montar o componente
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        const workflowsData = await n8nService.getWorkflows();
        setWorkflows(workflowsData);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar fluxos de trabalho:', err);
        setError('Não foi possível carregar os fluxos de trabalho do n8n. Verifique se o n8n está em execução e se as credenciais estão corretas.');
      } finally {
        setLoading(false);
      }
    };

    const checkMcp = async () => {
      try {
        setMcpStatus(prev => ({ ...prev, checking: true }));
        const isAvailable = await n8nService.isMcpAvailable();
        setMcpStatus({
          checking: false,
          available: isAvailable,
          message: isAvailable
            ? 'MCP disponível! Você pode criar workflows e credenciais automaticamente.'
            : 'MCP não disponível. Algumas funcionalidades avançadas não estarão disponíveis.'
        });
      } catch (err) {
        console.error('Erro ao verificar MCP:', err);
        setMcpStatus({
          checking: false,
          available: false,
          message: 'Erro ao verificar disponibilidade do MCP.'
        });
      }
    };

    fetchWorkflows();
    checkMcp();
  }, []);

  // Função para testar a conexão com o n8n
  const testConnection = async () => {
    try {
      setTestStatus({ testing: true, success: false, message: 'Testando conexão...' });
      await n8nService.getWorkflows();
      setTestStatus({ testing: false, success: true, message: 'Conexão estabelecida com sucesso!' });
    } catch (err) {
      console.error('Erro ao testar conexão:', err);
      setTestStatus({ testing: false, success: false, message: 'Falha ao conectar com o n8n. Verifique se o serviço está em execução e se as credenciais estão corretas.' });
    }
  };

  // Função para ativar um fluxo de trabalho
  const activateWorkflow = async (id) => {
    try {
      await n8nService.activateWorkflow(id);
      // Atualizar a lista de fluxos de trabalho
      const updatedWorkflows = await n8nService.getWorkflows();
      setWorkflows(updatedWorkflows);
    } catch (err) {
      console.error(`Erro ao ativar fluxo de trabalho ${id}:`, err);
      setError(`Não foi possível ativar o fluxo de trabalho. ${err.message}`);
    }
  };

  // Função para desativar um fluxo de trabalho
  const deactivateWorkflow = async (id) => {
    try {
      await n8nService.deactivateWorkflow(id);
      // Atualizar a lista de fluxos de trabalho
      const updatedWorkflows = await n8nService.getWorkflows();
      setWorkflows(updatedWorkflows);
    } catch (err) {
      console.error(`Erro ao desativar fluxo de trabalho ${id}:`, err);
      setError(`Não foi possível desativar o fluxo de trabalho. ${err.message}`);
    }
  };

  // Função para criar um workflow usando o MCP
  const createWorkflowWithMcp = async (workflowName) => {
    try {
      // Verificar se o MCP está disponível
      if (!mcpStatus.available) {
        alert('O MCP não está disponível. Não é possível criar workflows automaticamente.');
        return;
      }

      // Criar o workflow
      const result = await n8nService.createWorkflowWithMcp({
        name: workflowName,
        type: workflowName.includes('Estoque')
          ? (workflowName.includes('PDV → WooCommerce') ? 'inventory_pdv_to_woo' : 'inventory_woo_to_pdv')
          : (workflowName.includes('Produtos') ? 'product_sync' : 'ai_manager')
      });

      // Atualizar a lista de fluxos de trabalho
      const updatedWorkflows = await n8nService.getWorkflows();
      setWorkflows(updatedWorkflows);

      // Mostrar mensagem de sucesso
      alert(`Workflow "${workflowName}" criado com sucesso!`);
    } catch (err) {
      console.error(`Erro ao criar workflow ${workflowName}:`, err);
      alert(`Não foi possível criar o workflow. ${err.message}`);
    }
  };

  // Renderizar componente
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Configurações de Integração n8n</h2>

      {/* Informações de conexão */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Informações de Conexão</h3>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">URL do n8n:</span>
            <span className="text-gray-800">{N8N_BASE_URL}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <div className="flex items-center">
              {loading ? (
                <span className="text-yellow-500">Verificando...</span>
              ) : error ? (
                <span className="text-red-500">Desconectado</span>
              ) : (
                <span className="text-green-500">Conectado</span>
              )}
              <button
                onClick={testConnection}
                disabled={testStatus.testing}
                className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {testStatus.testing ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>
            {testStatus.message && (
              <span className={`text-sm mt-1 ${testStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                {testStatus.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Webhooks</h3>
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Sincronização de Produtos:</span>
            <span className="text-gray-800 text-sm break-all">{N8N_WEBHOOKS.PRODUCT_SYNC}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Sincronização de Estoque (WooCommerce → PDV):</span>
            <span className="text-gray-800 text-sm break-all">{N8N_WEBHOOKS.INVENTORY_SYNC_WOO}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Sincronização de Estoque (PDV → WooCommerce):</span>
            <span className="text-gray-800 text-sm break-all">{N8N_WEBHOOKS.INVENTORY_SYNC_PDV}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">Gerenciamento de IA:</span>
            <span className="text-gray-800 text-sm break-all">{N8N_WEBHOOKS.AI_MANAGER}</span>
          </div>
        </div>
      </div>

      {/* Status do MCP */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Management Control Panel (MCP)</h3>
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-gray-500 mr-2">Status:</span>
          {mcpStatus.checking ? (
            <span className="text-yellow-500 flex items-center">
              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            </span>
          ) : mcpStatus.available ? (
            <span className="text-green-500 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Disponível
            </span>
          ) : (
            <span className="text-red-500 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
              Indisponível
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{mcpStatus.message}</p>

        {mcpStatus.available && (
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2 text-gray-700">Criar Workflows Automaticamente</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                onClick={() => createWorkflowWithMcp(N8N_WORKFLOWS.PRODUCT_SYNC)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Sincronização de Produtos
              </button>
              <button
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                onClick={() => createWorkflowWithMcp(N8N_WORKFLOWS.INVENTORY_SYNC_PDV)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Sincronização de Estoque (PDV → WooCommerce)
              </button>
              <button
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                onClick={() => createWorkflowWithMcp(N8N_WORKFLOWS.INVENTORY_SYNC_WOO)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Sincronização de Estoque (WooCommerce → PDV)
              </button>
              <button
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
                onClick={() => createWorkflowWithMcp(N8N_WORKFLOWS.AI_MANAGER)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                IA Manager
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fluxos de Trabalho */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Fluxos de Trabalho</h3>

        {loading ? (
          <div className="text-center py-4">
            <svg className="animate-spin h-5 w-5 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Carregando fluxos de trabalho...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
            <p>Nenhum fluxo de trabalho encontrado no n8n.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{workflow.name}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 text-xs rounded-full ${workflow.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {workflow.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {workflow.active ? (
                        <button
                          onClick={() => deactivateWorkflow(workflow.id)}
                          className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Desativar
                        </button>
                      ) : (
                        <button
                          onClick={() => activateWorkflow(workflow.id)}
                          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Ativar
                        </button>
                      )}
                      <a
                        href={`${N8N_BASE_URL}/workflow/${workflow.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Editar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default N8nIntegrationSettings;
