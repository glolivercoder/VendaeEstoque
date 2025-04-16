/**
 * Script para testar a integração com o MCP de WooCommerce
 */
import axios from 'axios';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração
const MCP_BASE_URL = 'http://localhost:3025';

// Função para testar a conexão com o MCP de WooCommerce
async function testMCPConnection() {
  try {
    console.log('Testando conexão com o MCP de WooCommerce...');
    
    const response = await axios.get(`${MCP_BASE_URL}/status`);
    
    console.log('Conexão com o MCP de WooCommerce bem-sucedida:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`Erro ao conectar com o MCP de WooCommerce: ${error.message}`);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    return false;
  }
}

// Função para testar a obtenção de produtos do WooCommerce via MCP
async function testGetProducts() {
  try {
    console.log('Testando obtenção de produtos do WooCommerce via MCP...');
    
    const response = await axios.post(`${MCP_BASE_URL}/api/woocommerce/products`, {
      per_page: 10,
      page: 1
    });
    
    console.log(`${response.data.length} produtos obtidos do WooCommerce:`);
    console.log(JSON.stringify(response.data.slice(0, 2), null, 2)); // Mostrar apenas os 2 primeiros produtos
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao obter produtos do WooCommerce: ${error.message}`);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    return [];
  }
}

// Função para testar a criação de um produto no WooCommerce via MCP
async function testCreateProduct() {
  try {
    console.log('Testando criação de produto no WooCommerce via MCP...');
    
    const testProduct = {
      name: 'Produto de Teste MCP',
      type: 'simple',
      regular_price: '99.99',
      description: 'Este é um produto de teste criado via MCP',
      short_description: 'Produto de teste MCP',
      categories: [],
      images: [
        {
          src: 'https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png',
          name: 'Imagem de teste',
          alt: 'Imagem de teste'
        }
      ],
      sku: 'TESTE-MCP-001',
      stock_quantity: 10,
      manage_stock: true,
      status: 'publish'
    };
    
    const response = await axios.post(`${MCP_BASE_URL}/api/woocommerce/products/create`, testProduct);
    
    console.log('Produto criado com sucesso no WooCommerce:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao criar produto no WooCommerce: ${error.message}`);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    return null;
  }
}

// Função para testar a atualização de estoque no WooCommerce via MCP
async function testUpdateStock(productId) {
  try {
    console.log(`Testando atualização de estoque do produto ${productId} no WooCommerce via MCP...`);
    
    const response = await axios.post(`${MCP_BASE_URL}/api/woocommerce/products/update-stock`, {
      product_id: productId,
      stock_quantity: 5
    });
    
    console.log('Estoque atualizado com sucesso no WooCommerce:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar estoque no WooCommerce: ${error.message}`);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    return null;
  }
}

// Função para testar a criação de um webhook no WooCommerce via MCP
async function testCreateWebhook() {
  try {
    console.log('Testando criação de webhook no WooCommerce via MCP...');
    
    const response = await axios.post(`${MCP_BASE_URL}/api/woocommerce/webhooks/create`, {
      name: 'Teste MCP',
      topic: 'product.updated',
      delivery_url: 'http://localhost:5679/webhook/woocommerce/teste',
      status: 'active'
    });
    
    console.log('Webhook criado com sucesso no WooCommerce:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error(`Erro ao criar webhook no WooCommerce: ${error.message}`);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    return null;
  }
}

// Função principal
async function main() {
  try {
    console.log('Iniciando testes de integração com o MCP de WooCommerce...');
    
    // Testar conexão com o MCP
    const connected = await testMCPConnection();
    if (!connected) {
      console.error('Não foi possível conectar ao MCP de WooCommerce. Encerrando testes.');
      return;
    }
    
    // Testar obtenção de produtos
    const products = await testGetProducts();
    
    // Testar criação de produto
    const newProduct = await testCreateProduct();
    
    // Se o produto foi criado com sucesso, testar atualização de estoque
    if (newProduct && newProduct.id) {
      await testUpdateStock(newProduct.id);
    }
    
    // Testar criação de webhook
    await testCreateWebhook();
    
    console.log('Testes de integração com o MCP de WooCommerce concluídos com sucesso');
  } catch (error) {
    console.error(`Erro durante os testes: ${error.message}`);
  }
}

// Executar o script
main().catch(error => {
  console.error(`Erro fatal durante a execução: ${error.message}`);
});
