/**
 * Configuração para integração com n8n
 * Este arquivo contém as configurações necessárias para integrar o PDV Vendas com o n8n
 */

// Obter credenciais do arquivo .env ou usar valores padrão
const {
  // URL base do n8n
  VITE_N8N_BASE_URL: N8N_BASE_URL = 'http://localhost:5679',
  // API Key do n8n
  VITE_N8N_API_KEY: N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWZhMGVkYi1iMTk5LTRmOWYtODY1My0yYWJjZTllMzQyY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ0NTAyNjMxfQ.RZB0tGBnAtQcid8R2VaKqOoqW2OsnutBEmNWmCoCAsk'
} = import.meta.env;

// Configuração dos webhooks do n8n
const N8N_WEBHOOKS = {
  // Webhook para sincronização de produtos
  PRODUCT_SYNC: `${N8N_BASE_URL}/webhook/pdv-vendas/produtos`,
  // Webhook para sincronização de estoque (WooCommerce para PDV Vendas)
  INVENTORY_SYNC_WOO: `${N8N_BASE_URL}/webhook/woocommerce/estoque`,
  // Webhook para sincronização de estoque (PDV Vendas para WooCommerce)
  INVENTORY_SYNC_PDV: `${N8N_BASE_URL}/webhook/pdv-vendas/estoque`,
  // Webhook para gerenciamento de IA
  AI_MANAGER: `${N8N_BASE_URL}/webhook/pdv-vendas/ai-manager`,
  // Webhook para MCP (Management Control Panel)
  MCP: `${N8N_BASE_URL}/webhook/pdv-vendas/mcp`
};

// Configuração da API do n8n
const N8N_API = {
  // URL base da API do n8n
  BASE_URL: N8N_BASE_URL,
  // Endpoint para workflows
  WORKFLOWS_ENDPOINT: '/api/v1/workflows',
  // Headers para autenticação
  HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${N8N_API_KEY}`
  }
};

// Configuração dos fluxos de trabalho do n8n
const N8N_WORKFLOWS = {
  // Fluxo de trabalho para sincronização de produtos
  PRODUCT_SYNC: 'PDV Vendas - Sincronização de Produtos',
  // Fluxo de trabalho para sincronização de estoque (WooCommerce para PDV Vendas)
  INVENTORY_SYNC_WOO: 'PDV Vendas - Sincronização de Estoque (WooCommerce → PDV)',
  // Fluxo de trabalho para sincronização de estoque (PDV Vendas para WooCommerce)
  INVENTORY_SYNC_PDV: 'PDV Vendas - Sincronização de Estoque (PDV → WooCommerce)',
  // Fluxo de trabalho para monitoramento com IA
  MONITORING: 'PDV Vendas - Monitoramento IA',
  // Fluxo de trabalho para gerenciamento com IA
  AI_MANAGER: 'PDV Vendas - IA Manager',
  // Fluxo de trabalho para MCP (Management Control Panel)
  MCP: 'PDV Vendas - MCP'
};

// Exportar configurações
export {
  N8N_BASE_URL,
  N8N_API_KEY,
  N8N_WEBHOOKS,
  N8N_API,
  N8N_WORKFLOWS
};

// Exportar função para verificar se o MCP está disponível
export const checkMcpAvailability = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/webhook-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${N8N_API_KEY}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade do MCP:', error);
    return false;
  }
};

// Exportar configuração padrão
export default {
  baseUrl: N8N_BASE_URL,
  apiKey: N8N_API_KEY,
  webhooks: N8N_WEBHOOKS,
  api: N8N_API,
  workflows: N8N_WORKFLOWS
};
