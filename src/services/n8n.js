/**
 * Serviço para integração com n8n
 * Este serviço fornece funções para interagir com o n8n
 */
import axios from 'axios';
import { N8N_API, N8N_WEBHOOKS, checkMcpAvailability } from '../config/n8n-config';

/**
 * Classe para integração com n8n
 */
class N8nService {
  /**
   * Construtor
   */
  constructor() {
    this.api = axios.create({
      baseURL: N8N_API.BASE_URL,
      headers: N8N_API.HEADERS
    });
  }

  /**
   * Obter todos os fluxos de trabalho
   * @returns {Promise<Array>} Lista de fluxos de trabalho
   */
  async getWorkflows() {
    try {
      const response = await this.api.get(N8N_API.WORKFLOWS_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter fluxos de trabalho do n8n:', error);
      throw new Error('Não foi possível obter os fluxos de trabalho do n8n');
    }
  }

  /**
   * Obter um fluxo de trabalho pelo ID
   * @param {string} id ID do fluxo de trabalho
   * @returns {Promise<Object>} Fluxo de trabalho
   */
  async getWorkflowById(id) {
    try {
      const response = await this.api.get(`${N8N_API.WORKFLOWS_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao obter fluxo de trabalho ${id} do n8n:`, error);
      throw new Error(`Não foi possível obter o fluxo de trabalho ${id} do n8n`);
    }
  }

  /**
   * Obter um fluxo de trabalho pelo nome
   * @param {string} name Nome do fluxo de trabalho
   * @returns {Promise<Object>} Fluxo de trabalho
   */
  async getWorkflowByName(name) {
    try {
      const workflows = await this.getWorkflows();
      const workflow = workflows.find(w => w.name === name);

      if (!workflow) {
        throw new Error(`Fluxo de trabalho '${name}' não encontrado`);
      }

      return workflow;
    } catch (error) {
      console.error(`Erro ao obter fluxo de trabalho '${name}' do n8n:`, error);
      throw new Error(`Não foi possível obter o fluxo de trabalho '${name}' do n8n`);
    }
  }

  /**
   * Ativar um fluxo de trabalho
   * @param {string} id ID do fluxo de trabalho
   * @returns {Promise<Object>} Resultado da ativação
   */
  async activateWorkflow(id) {
    try {
      const response = await this.api.post(`${N8N_API.WORKFLOWS_ENDPOINT}/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao ativar fluxo de trabalho ${id} do n8n:`, error);
      throw new Error(`Não foi possível ativar o fluxo de trabalho ${id} do n8n`);
    }
  }

  /**
   * Desativar um fluxo de trabalho
   * @param {string} id ID do fluxo de trabalho
   * @returns {Promise<Object>} Resultado da desativação
   */
  async deactivateWorkflow(id) {
    try {
      const response = await this.api.post(`${N8N_API.WORKFLOWS_ENDPOINT}/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao desativar fluxo de trabalho ${id} do n8n:`, error);
      throw new Error(`Não foi possível desativar o fluxo de trabalho ${id} do n8n`);
    }
  }

  /**
   * Executar um fluxo de trabalho
   * @param {string} id ID do fluxo de trabalho
   * @param {Object} data Dados para execução
   * @returns {Promise<Object>} Resultado da execução
   */
  async executeWorkflow(id, data = {}) {
    try {
      const response = await this.api.post(`${N8N_API.WORKFLOWS_ENDPOINT}/${id}/execute`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao executar fluxo de trabalho ${id} do n8n:`, error);
      throw new Error(`Não foi possível executar o fluxo de trabalho ${id} do n8n`);
    }
  }

  /**
   * Sincronizar produtos com o WordPress/WooCommerce
   * @param {Array} products Lista de produtos para sincronizar
   * @returns {Promise<Object>} Resultado da sincronização
   */
  async syncProductsToWordPress(products) {
    try {
      const response = await axios.post(N8N_WEBHOOKS.PRODUCT_SYNC, products);
      return response.data;
    } catch (error) {
      console.error('Erro ao sincronizar produtos com o WordPress:', error);
      throw new Error('Não foi possível sincronizar os produtos com o WordPress');
    }
  }

  /**
   * Sincronizar estoque com o WordPress/WooCommerce
   * @param {Array} inventory Dados de estoque para sincronizar
   * @returns {Promise<Object>} Resultado da sincronização
   */
  async syncInventoryToWordPress(inventory) {
    try {
      const response = await axios.post(N8N_WEBHOOKS.INVENTORY_SYNC_PDV, inventory);
      return response.data;
    } catch (error) {
      console.error('Erro ao sincronizar estoque com o WordPress:', error);
      throw new Error('Não foi possível sincronizar o estoque com o WordPress');
    }
  }

  /**
   * Consultar a IA para análise ou sugestões
   * @param {string} message Mensagem para a IA
   * @returns {Promise<Object>} Resposta da IA
   */
  async askAI(message) {
    try {
      const response = await axios.post(N8N_WEBHOOKS.AI_MANAGER, { message });
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar a IA:', error);
      throw new Error('Não foi possível consultar a IA');
    }
  }

  /**
   * Verificar se o MCP está disponível
   * @returns {Promise<boolean>} True se o MCP estiver disponível, false caso contrário
   */
  async isMcpAvailable() {
    return await checkMcpAvailability();
  }

  /**
   * Usar o MCP para criar workflows
   * @param {Object} workflowData Dados do workflow
   * @returns {Promise<Object>} Resultado da criação do workflow
   */
  async createWorkflowWithMcp(workflowData) {
    try {
      const response = await axios.post(N8N_WEBHOOKS.MCP, {
        action: 'createWorkflow',
        data: workflowData
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar workflow com MCP:', error);
      throw new Error('Não foi possível criar o workflow com o MCP');
    }
  }

  /**
   * Usar o MCP para criar credenciais
   * @param {Object} credentialData Dados da credencial
   * @returns {Promise<Object>} Resultado da criação da credencial
   */
  async createCredentialWithMcp(credentialData) {
    try {
      const response = await axios.post(N8N_WEBHOOKS.MCP, {
        action: 'createCredential',
        data: credentialData
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar credencial com MCP:', error);
      throw new Error('Não foi possível criar a credencial com o MCP');
    }
  }
}

// Criar instância do serviço
const n8nService = new N8nService();

// Exportar serviço
export default n8nService;
