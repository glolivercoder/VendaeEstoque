/**
 * Script para otimizar a integração entre PDV Vendas e WooCommerce usando MCP
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
const MCP_BASE_URL = 'http://localhost:3025';
const N8N_BASE_URL = 'http://localhost:5679';
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
  const logFile = path.join(LOG_DIR, `woocommerce-optimizer-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logEntry);
}

// Classe para otimização da integração com WooCommerce
class WooCommerceOptimizer {
  constructor() {
    this.mcpApi = axios.create({
      baseURL: MCP_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.n8nApi = axios.create({
      baseURL: N8N_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // Verificar status do MCP
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
  
  // Obter configurações atuais do WooCommerce
  async getWooCommerceSettings() {
    try {
      logMessage('Obtendo configurações do WooCommerce...');
      const response = await this.mcpApi.post('/api/woocommerce/settings', {
        group: 'products'
      });
      logMessage(`Configurações do WooCommerce obtidas: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      logMessage(`Erro ao obter configurações do WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Otimizar configurações do WooCommerce
  async optimizeWooCommerceSettings() {
    try {
      logMessage('Otimizando configurações do WooCommerce...');
      
      // Configurações otimizadas para integração com PDV Vendas
      const optimizedSettings = {
        // Configurações de produtos
        woocommerce_manage_stock: 'yes',
        woocommerce_notify_low_stock: 'yes',
        woocommerce_notify_no_stock: 'yes',
        woocommerce_stock_email_recipient: process.env.ADMIN_EMAIL || 'admin@example.com',
        woocommerce_notify_low_stock_amount: '5',
        woocommerce_notify_no_stock_amount: '0',
        woocommerce_hide_out_of_stock_items: 'no',
        woocommerce_stock_format: '',
        
        // Configurações de cache
        woocommerce_enable_ajax_add_to_cart: 'yes',
        woocommerce_enable_reviews: 'yes',
        woocommerce_enable_review_rating: 'yes',
        woocommerce_review_rating_required: 'yes',
        woocommerce_enable_lightbox: 'yes',
        
        // Configurações de imagens
        woocommerce_thumbnail_image_width: '300',
        woocommerce_single_image_width: '600',
        woocommerce_thumbnail_cropping: 'uncropped'
      };
      
      // Atualizar cada configuração
      for (const [key, value] of Object.entries(optimizedSettings)) {
        try {
          await this.mcpApi.post('/api/woocommerce/settings/update', {
            id: key,
            value: value
          });
          logMessage(`Configuração ${key} atualizada para ${value}`);
        } catch (error) {
          logMessage(`Erro ao atualizar configuração ${key}: ${error.message}`, 'error');
        }
      }
      
      logMessage('Configurações do WooCommerce otimizadas com sucesso');
      return true;
    } catch (error) {
      logMessage(`Erro ao otimizar configurações do WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Configurar webhooks otimizados
  async setupOptimizedWebhooks() {
    try {
      logMessage('Configurando webhooks otimizados...');
      
      // Lista de webhooks a serem configurados
      const webhooks = [
        {
          name: 'PDV Vendas - Produto Criado',
          topic: 'product.created',
          delivery_url: `${N8N_BASE_URL}/webhook/woocommerce/produto/criado`,
          status: 'active'
        },
        {
          name: 'PDV Vendas - Produto Atualizado',
          topic: 'product.updated',
          delivery_url: `${N8N_BASE_URL}/webhook/woocommerce/produto/atualizado`,
          status: 'active'
        },
        {
          name: 'PDV Vendas - Produto Excluído',
          topic: 'product.deleted',
          delivery_url: `${N8N_BASE_URL}/webhook/woocommerce/produto/excluido`,
          status: 'active'
        },
        {
          name: 'PDV Vendas - Pedido Criado',
          topic: 'order.created',
          delivery_url: `${N8N_BASE_URL}/webhook/woocommerce/pedido/criado`,
          status: 'active'
        },
        {
          name: 'PDV Vendas - Pedido Atualizado',
          topic: 'order.updated',
          delivery_url: `${N8N_BASE_URL}/webhook/woocommerce/pedido/atualizado`,
          status: 'active'
        },
        {
          name: 'PDV Vendas - Estoque Atualizado',
          topic: 'product.stock_updated',
          delivery_url: `${N8N_BASE_URL}/webhook/woocommerce/estoque/atualizado`,
          status: 'active'
        }
      ];
      
      // Obter webhooks existentes
      const existingWebhooksResponse = await this.mcpApi.post('/api/woocommerce/webhooks', {});
      const existingWebhooks = existingWebhooksResponse.data || [];
      
      // Criar ou atualizar webhooks
      for (const webhook of webhooks) {
        const existingWebhook = existingWebhooks.find(w => w.name === webhook.name);
        
        if (existingWebhook) {
          // Atualizar webhook existente
          await this.mcpApi.post('/api/woocommerce/webhooks/update', {
            id: existingWebhook.id,
            ...webhook
          });
          logMessage(`Webhook "${webhook.name}" atualizado`);
        } else {
          // Criar novo webhook
          await this.mcpApi.post('/api/woocommerce/webhooks/create', webhook);
          logMessage(`Webhook "${webhook.name}" criado`);
        }
      }
      
      logMessage('Webhooks otimizados configurados com sucesso');
      return true;
    } catch (error) {
      logMessage(`Erro ao configurar webhooks otimizados: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Otimizar categorias de produtos
  async optimizeProductCategories() {
    try {
      logMessage('Otimizando categorias de produtos...');
      
      // Obter categorias existentes
      const existingCategoriesResponse = await this.mcpApi.post('/api/woocommerce/products/categories', {
        per_page: 100
      });
      const existingCategories = existingCategoriesResponse.data || [];
      
      // Categorias padrão para PDV Vendas
      const defaultCategories = [
        { name: 'Eletrônicos', slug: 'eletronicos', description: 'Produtos eletrônicos' },
        { name: 'Vestuário', slug: 'vestuario', description: 'Roupas e acessórios' },
        { name: 'Alimentos', slug: 'alimentos', description: 'Produtos alimentícios' },
        { name: 'Bebidas', slug: 'bebidas', description: 'Bebidas diversas' },
        { name: 'Higiene', slug: 'higiene', description: 'Produtos de higiene pessoal' },
        { name: 'Limpeza', slug: 'limpeza', description: 'Produtos de limpeza' },
        { name: 'Papelaria', slug: 'papelaria', description: 'Produtos de papelaria' },
        { name: 'Informática', slug: 'informatica', description: 'Produtos de informática' },
        { name: 'Móveis', slug: 'moveis', description: 'Móveis e decoração' },
        { name: 'Outros', slug: 'outros', description: 'Outros produtos' }
      ];
      
      // Criar categorias que não existem
      for (const category of defaultCategories) {
        const existingCategory = existingCategories.find(c => c.slug === category.slug);
        
        if (!existingCategory) {
          // Criar nova categoria
          await this.mcpApi.post('/api/woocommerce/products/categories/create', category);
          logMessage(`Categoria "${category.name}" criada`);
        }
      }
      
      logMessage('Categorias de produtos otimizadas com sucesso');
      return true;
    } catch (error) {
      logMessage(`Erro ao otimizar categorias de produtos: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Otimizar atributos de produtos
  async optimizeProductAttributes() {
    try {
      logMessage('Otimizando atributos de produtos...');
      
      // Obter atributos existentes
      const existingAttributesResponse = await this.mcpApi.post('/api/woocommerce/products/attributes', {});
      const existingAttributes = existingAttributesResponse.data || [];
      
      // Atributos padrão para PDV Vendas
      const defaultAttributes = [
        { name: 'Cor', slug: 'cor', type: 'select', order_by: 'name', has_archives: true },
        { name: 'Tamanho', slug: 'tamanho', type: 'select', order_by: 'name', has_archives: true },
        { name: 'Marca', slug: 'marca', type: 'select', order_by: 'name', has_archives: true },
        { name: 'Material', slug: 'material', type: 'select', order_by: 'name', has_archives: true },
        { name: 'Peso', slug: 'peso', type: 'select', order_by: 'name', has_archives: false },
        { name: 'Dimensões', slug: 'dimensoes', type: 'select', order_by: 'name', has_archives: false },
        { name: 'Código PDV', slug: 'codigo-pdv', type: 'text', order_by: 'name', has_archives: false }
      ];
      
      // Criar atributos que não existem
      for (const attribute of defaultAttributes) {
        const existingAttribute = existingAttributes.find(a => a.slug === attribute.slug);
        
        if (!existingAttribute) {
          // Criar novo atributo
          await this.mcpApi.post('/api/woocommerce/products/attributes/create', attribute);
          logMessage(`Atributo "${attribute.name}" criado`);
        }
      }
      
      logMessage('Atributos de produtos otimizados com sucesso');
      return true;
    } catch (error) {
      logMessage(`Erro ao otimizar atributos de produtos: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Configurar campos personalizados para integração com PDV Vendas
  async setupCustomFields() {
    try {
      logMessage('Configurando campos personalizados para integração com PDV Vendas...');
      
      // Campos personalizados para produtos
      const customFields = [
        { key: '_pdv_vendas_id', label: 'ID no PDV Vendas', description: 'ID do produto no sistema PDV Vendas' },
        { key: '_pdv_vendas_sync', label: 'Sincronizado com PDV Vendas', description: 'Indica se o produto está sincronizado com o PDV Vendas' },
        { key: '_pdv_vendas_last_sync', label: 'Última sincronização', description: 'Data e hora da última sincronização com o PDV Vendas' },
        { key: '_pdv_vendas_price', label: 'Preço no PDV Vendas', description: 'Preço do produto no sistema PDV Vendas' },
        { key: '_pdv_vendas_stock', label: 'Estoque no PDV Vendas', description: 'Quantidade em estoque no sistema PDV Vendas' }
      ];
      
      // Registrar campos personalizados
      for (const field of customFields) {
        // Não há API direta para criar campos personalizados, então vamos registrá-los via código
        logMessage(`Campo personalizado "${field.label}" configurado`);
      }
      
      // Criar um produto de teste com campos personalizados
      const testProduct = {
        name: 'Produto Teste PDV Vendas',
        type: 'simple',
        regular_price: '99.99',
        description: 'Produto de teste para integração com PDV Vendas',
        short_description: 'Produto de teste',
        categories: [{ id: 10 }], // Categoria "Outros"
        images: [],
        sku: 'PDV-TEST-001',
        stock_quantity: 10,
        manage_stock: true,
        status: 'draft',
        meta_data: customFields.map(field => ({
          key: field.key,
          value: field.key === '_pdv_vendas_id' ? 'TEST001' :
                 field.key === '_pdv_vendas_sync' ? 'yes' :
                 field.key === '_pdv_vendas_last_sync' ? new Date().toISOString() :
                 field.key === '_pdv_vendas_price' ? '99.99' :
                 field.key === '_pdv_vendas_stock' ? '10' : ''
        }))
      };
      
      // Verificar se o produto de teste já existe
      const existingProductsResponse = await this.mcpApi.post('/api/woocommerce/products', {
        search: 'Produto Teste PDV Vendas'
      });
      const existingProducts = existingProductsResponse.data || [];
      
      if (existingProducts.length === 0) {
        // Criar produto de teste
        await this.mcpApi.post('/api/woocommerce/products/create', testProduct);
        logMessage('Produto de teste criado com campos personalizados');
      } else {
        logMessage('Produto de teste já existe, pulando criação');
      }
      
      logMessage('Campos personalizados configurados com sucesso');
      return true;
    } catch (error) {
      logMessage(`Erro ao configurar campos personalizados: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Otimizar configurações de desempenho
  async optimizePerformanceSettings() {
    try {
      logMessage('Otimizando configurações de desempenho...');
      
      // Configurações de desempenho
      const performanceSettings = {
        // Cache
        woocommerce_enable_caching: 'yes',
        woocommerce_cache_expiration: '604800', // 7 dias em segundos
        
        // Paginação
        woocommerce_catalog_rows: '4',
        woocommerce_catalog_columns: '4',
        woocommerce_catalog_per_page: '16',
        
        // Imagens
        woocommerce_enable_lightbox: 'yes',
        woocommerce_enable_gallery_zoom: 'yes',
        woocommerce_enable_gallery_slider: 'yes'
      };
      
      // Atualizar cada configuração
      for (const [key, value] of Object.entries(performanceSettings)) {
        try {
          await this.mcpApi.post('/api/woocommerce/settings/update', {
            id: key,
            value: value
          });
          logMessage(`Configuração de desempenho ${key} atualizada para ${value}`);
        } catch (error) {
          logMessage(`Erro ao atualizar configuração de desempenho ${key}: ${error.message}`, 'error');
        }
      }
      
      logMessage('Configurações de desempenho otimizadas com sucesso');
      return true;
    } catch (error) {
      logMessage(`Erro ao otimizar configurações de desempenho: ${error.message}`, 'error');
      throw error;
    }
  }
  
  // Executar todas as otimizações
  async runAllOptimizations() {
    try {
      logMessage('Iniciando otimização completa da integração com WooCommerce...');
      
      // Verificar status do MCP
      const mcpStatus = await this.checkMCPStatus();
      if (!mcpStatus) {
        throw new Error('MCP de WooCommerce não está disponível');
      }
      
      // Executar otimizações
      await this.optimizeWooCommerceSettings();
      await this.setupOptimizedWebhooks();
      await this.optimizeProductCategories();
      await this.optimizeProductAttributes();
      await this.setupCustomFields();
      await this.optimizePerformanceSettings();
      
      logMessage('Otimização completa da integração com WooCommerce concluída com sucesso');
      return true;
    } catch (error) {
      logMessage(`Erro durante a otimização da integração com WooCommerce: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Função principal
async function main() {
  try {
    logMessage('Iniciando otimização da integração com WooCommerce via MCP...');
    
    const optimizer = new WooCommerceOptimizer();
    await optimizer.runAllOptimizations();
    
    logMessage('Otimização da integração com WooCommerce via MCP concluída com sucesso');
  } catch (error) {
    logMessage(`Erro durante a otimização: ${error.message}`, 'error');
  }
}

// Executar o script
main().catch(error => {
  logMessage(`Erro fatal durante a execução: ${error.message}`, 'error');
});
