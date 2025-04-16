/**
 * Integração direta entre PDV Vendas e WooCommerce usando MCP
 * Este script utiliza o MCP de WooCommerce para sincronizar produtos e estoque
 */
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
dotenv.config();

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração
const N8N_API_KEY = process.env.VITE_N8N_API_KEY;
const N8N_BASE_URL = 'http://localhost:5679';
const MCP_BASE_URL = 'http://localhost:3025';
const LOG_DIR = path.join(__dirname, 'logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Função para registrar logs
function logMessage(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  
  // Registrar no console
  console.log(logEntry);
  
  // Registrar no arquivo de log
  const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}-woocommerce-mcp.log`);
  fs.appendFileSync(logFile, logEntry);
}

// Classe para integração com WooCommerce via MCP
class WooCommerceMCPIntegration {
  constructor() {
    this.n8nApi = axios.create({
      baseURL: N8N_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });
    
    this.mcpApi = axios.create({
      baseURL: MCP_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // Verificar se o MCP está disponível
  async checkMCPStatus() {
    try {
      logMessage('Verificando status do MCP de WooCommerce...');
      const response = await this.mcpApi.get('/status');
      logMessage(`MCP de WooCommerce está online: ${JSON.stringify(response.data)}`);
      return true;
    } catch (error) {
      logMessage(`Erro ao verificar status do MCP de WooCommerce: ${error.message}`, 'error');
      return false;
    }
  }
  
  // Obter lista de produtos do WooCommerce via MCP
  async getWooCommerceProducts() {
    try {
      logMessage('Obtendo produtos do WooCommerce via MCP...');
      const response = await this.mcpApi.post('/api/woocommerce/products', {
        per_page: 100,
        page: 1
      });
      logMessage(`${response.data.length} produtos obtidos do WooCommerce`);
      return response.data;
    } catch (error) {
      logMessage(`Erro ao obter produtos do WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Sincronizar um produto do PDV Vendas para o WooCommerce via MCP
  async syncProductToWooCommerce(product) {
    try {
      logMessage(`Sincronizando produto "${product.nome}" para o WooCommerce via MCP...`);
      
      // Converter o produto do formato PDV Vendas para o formato WooCommerce
      const wooProduct = {
        name: product.nome,
        type: 'simple',
        regular_price: product.preco.toString(),
        description: product.descricao || '',
        short_description: product.descricao_curta || '',
        categories: product.categorias ? product.categorias.map(cat => ({id: cat.id})) : [],
        images: [],
        sku: product.codigo || '',
        stock_quantity: product.estoque || 0,
        manage_stock: true,
        status: 'publish',
        meta_data: [
          {
            key: '_pdv_vendas_product',
            value: 'true'
          },
          {
            key: '_pdv_vendas_id',
            value: product.id.toString()
          }
        ]
      };
      
      // Processar imagens
      if (product.imagens && Array.isArray(product.imagens)) {
        for (const imagem of product.imagens) {
          wooProduct.images.push({
            src: imagem.url,
            name: imagem.nome || `Produto ${product.nome}`,
            alt: imagem.alt || `Produto ${product.nome}`
          });
        }
      }
      
      // Enviar o produto para o WooCommerce via MCP
      const response = await this.mcpApi.post('/api/woocommerce/products/upsert', {
        product: wooProduct,
        lookup_field: 'sku',
        lookup_value: wooProduct.sku
      });
      
      logMessage(`Produto "${product.nome}" sincronizado com sucesso para o WooCommerce (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      logMessage(`Erro ao sincronizar produto "${product.nome}" para o WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Atualizar estoque de um produto no WooCommerce via MCP
  async updateWooCommerceStock(productId, quantity) {
    try {
      logMessage(`Atualizando estoque do produto ${productId} para ${quantity} no WooCommerce via MCP...`);
      
      const response = await this.mcpApi.post('/api/woocommerce/products/update-stock', {
        product_id: productId,
        stock_quantity: quantity
      });
      
      logMessage(`Estoque do produto ${productId} atualizado com sucesso no WooCommerce`);
      return response.data;
    } catch (error) {
      logMessage(`Erro ao atualizar estoque do produto ${productId} no WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Obter estoque de um produto no WooCommerce via MCP
  async getWooCommerceStock(productId) {
    try {
      logMessage(`Obtendo estoque do produto ${productId} no WooCommerce via MCP...`);
      
      const response = await this.mcpApi.post('/api/woocommerce/products/get-stock', {
        product_id: productId
      });
      
      logMessage(`Estoque do produto ${productId} no WooCommerce: ${response.data.stock_quantity}`);
      return response.data;
    } catch (error) {
      logMessage(`Erro ao obter estoque do produto ${productId} no WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Criar um webhook no WooCommerce via MCP
  async createWooCommerceWebhook(topic, deliveryUrl) {
    try {
      logMessage(`Criando webhook no WooCommerce para o tópico "${topic}" com URL de entrega "${deliveryUrl}"...`);
      
      const response = await this.mcpApi.post('/api/woocommerce/webhooks/create', {
        name: `PDV Vendas - ${topic}`,
        topic: topic,
        delivery_url: deliveryUrl,
        status: 'active'
      });
      
      logMessage(`Webhook criado com sucesso no WooCommerce (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      logMessage(`Erro ao criar webhook no WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Configurar webhooks no WooCommerce para integração com o n8n
  async setupWooCommerceWebhooks() {
    try {
      logMessage('Configurando webhooks no WooCommerce para integração com o n8n...');
      
      // Webhook para atualização de produto
      await this.createWooCommerceWebhook(
        'product.updated',
        `${N8N_BASE_URL}/webhook/woocommerce/estoque`
      );
      
      // Webhook para criação de produto
      await this.createWooCommerceWebhook(
        'product.created',
        `${N8N_BASE_URL}/webhook/woocommerce/produto`
      );
      
      // Webhook para atualização de pedido
      await this.createWooCommerceWebhook(
        'order.updated',
        `${N8N_BASE_URL}/webhook/woocommerce/pedido`
      );
      
      logMessage('Webhooks configurados com sucesso no WooCommerce');
      return true;
    } catch (error) {
      logMessage(`Erro ao configurar webhooks no WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Sincronizar todos os produtos do PDV Vendas para o WooCommerce
  async syncAllProducts(products) {
    try {
      logMessage(`Sincronizando ${products.length} produtos do PDV Vendas para o WooCommerce...`);
      
      const results = [];
      for (const product of products) {
        try {
          const result = await this.syncProductToWooCommerce(product);
          results.push(result);
        } catch (error) {
          logMessage(`Erro ao sincronizar produto "${product.nome}": ${error.message}`, 'error');
        }
      }
      
      logMessage(`${results.length} produtos sincronizados com sucesso para o WooCommerce`);
      return results;
    } catch (error) {
      logMessage(`Erro ao sincronizar produtos para o WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Configurar integração completa entre PDV Vendas e WooCommerce
  async setupIntegration() {
    try {
      logMessage('Configurando integração entre PDV Vendas e WooCommerce via MCP...');
      
      // Verificar status do MCP
      const mcpStatus = await this.checkMCPStatus();
      if (!mcpStatus) {
        throw new Error('MCP de WooCommerce não está disponível');
      }
      
      // Configurar webhooks no WooCommerce
      await this.setupWooCommerceWebhooks();
      
      logMessage('Integração entre PDV Vendas e WooCommerce configurada com sucesso');
      return true;
    } catch (error) {
      logMessage(`Erro ao configurar integração entre PDV Vendas e WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Função principal
async function main() {
  try {
    logMessage('Iniciando integração entre PDV Vendas e WooCommerce via MCP...');
    
    const integration = new WooCommerceMCPIntegration();
    await integration.setupIntegration();
    
    logMessage('Integração entre PDV Vendas e WooCommerce via MCP concluída com sucesso');
  } catch (error) {
    logMessage(`Erro durante a integração: ${error.message}`, 'error');
  }
}

// Executar o script
main().catch(error => {
  logMessage(`Erro fatal durante a execução: ${error.message}`, 'error');
});
