// Script para testar a integração com o WooCommerce usando axios
const axios = require('axios');

// Configurações do WooCommerce
const config = {
  url: 'https://achadinhoshopp.com.br/loja',
  consumerKey: 'ck_d106765e36b9a6af0d22bd22571388ec3ad67378',
  consumerSecret: 'cs_0d5d0255c002e137d48be4da75d5d87363278bd6',
  version: 'wc/v3'
};

// Função para listar produtos no WooCommerce
const listProducts = async () => {
  try {
    const response = await axios.get(
      `${config.url}/wp-json/${config.version}/products`,
      {
        auth: {
          username: config.consumerKey,
          password: config.consumerSecret
        },
        params: {
          per_page: 20
        }
      }
    );

    console.log(`Encontrados ${response.data.length} produtos:`);
    response.data.forEach(product => {
      console.log(`- ${product.id}: ${product.name} (${product.price})`);
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao listar produtos:', error.response ? error.response.data : error.message);
    return [];
  }
};

// Função para criar um produto no WooCommerce
const createProduct = async () => {
  try {
    const response = await axios.post(
      `${config.url}/wp-json/${config.version}/products`,
      {
        name: 'Produto de Teste PDV Vendas',
        type: 'simple',
        regular_price: '19.99',
        description: 'Este é um produto de teste criado pelo PDV Vendas',
        short_description: 'Produto de teste',
        categories: [
          {
            name: 'PDV Vendas'
          }
        ]
      },
      {
        auth: {
          username: config.consumerKey,
          password: config.consumerSecret
        }
      }
    );

    console.log('Produto criado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar produto:', error.response ? error.response.data : error.message);
    return null;
  }
};

// Função para verificar o status da API do WooCommerce
const checkApiStatus = async () => {
  try {
    const response = await axios.get(
      `${config.url}/wp-json/${config.version}`,
      {
        auth: {
          username: config.consumerKey,
          password: config.consumerSecret
        }
      }
    );

    console.log('API do WooCommerce está acessível:', {
      namespace: response.data.namespace,
      routes: Object.keys(response.data.routes).length
    });

    return true;
  } catch (error) {
    console.error('Erro ao verificar status da API:', error.response ? error.response.data : error.message);
    return false;
  }
};

// Executar testes
const runTests = async () => {
  console.log('Iniciando testes de integração com o WooCommerce usando axios...');

  // Verificar status da API
  console.log('\n=== Verificando status da API ===');
  const apiStatus = await checkApiStatus();

  if (apiStatus) {
    // Listar produtos
    console.log('\n=== Listando produtos ===');
    await listProducts();

    // Criar produto de teste
    console.log('\n=== Criando produto de teste ===');
    await createProduct();

    // Listar produtos novamente
    console.log('\n=== Listando produtos após criação ===');
    await listProducts();
  }

  console.log('\nTestes concluídos!');
};

// Executar testes
runTests();
