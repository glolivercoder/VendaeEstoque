/**
 * Script para testar a integração com o WooCommerce
 * Este script cria um produto de teste no WooCommerce com formato simplificado
 */
const axios = require('axios');

// Configuração do WooCommerce
const config = {
  url: 'https://achadinhoshopp.com.br/loja',
  consumer_key: 'ck_d106765e36b9a6af0d22bd22571388ec3ad67378',
  consumer_secret: 'cs_0d5d0255c002e137d48be4da75d5d87363278bd6',
  version: 'wc/v3'
};

// URL base da API do WooCommerce
const WOO_API_URL = `${config.url}/wp-json/${config.version}`;

// Criar instância do axios para o WooCommerce
const woocommerceApi = axios.create({
  baseURL: WOO_API_URL,
  auth: {
    username: config.consumer_key,
    password: config.consumer_secret
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Função para criar um produto de teste
async function createTestProduct() {
  try {
    console.log('Criando produto de teste no WooCommerce...');
    
    // Dados do produto - formato simplificado
    const product = {
      name: 'Produto de Teste PDV Vendas Simplificado',
      type: 'simple',
      regular_price: '19.99',
      description: 'Este é um produto de teste criado pelo PDV Vendas para verificar a integração com o WooCommerce.',
      short_description: 'Produto de teste do PDV Vendas',
      sku: 'PDV-TEST-001',
      manage_stock: true,
      stock_quantity: 10,
      status: 'publish',
      categories: [
        {
          id: 16 // ID da categoria "Sem categoria"
        }
      ],
      meta_data: [
        {
          key: '_pdv_vendas_id',
          value: '9999'
        }
      ]
    };
    
    // Criar o produto
    const response = await woocommerceApi.post('/products', product);
    
    console.log('Produto criado com sucesso!');
    console.log(`ID: ${response.data.id}`);
    console.log(`Nome: ${response.data.name}`);
    console.log(`Preço: ${response.data.price}`);
    console.log(`URL: ${response.data.permalink}`);
    
    return response.data;
  } catch (error) {
    console.error('Erro ao criar produto de teste:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Dados da resposta:', error.response.data);
    } else {
      console.error(`Mensagem: ${error.message}`);
    }
    
    return null;
  }
}

// Executar a função
createTestProduct();
