// Script para testar a integração com o WooCommerce usando autenticação básica
import axios from 'axios';

// Configurações do WooCommerce
const config = {
  url: 'https://achadinhoshopp.com.br/loja',
  username: 'glolivercoder',
  password: 'Juli@3110'
};

// Função para listar produtos no WooCommerce
const listProducts = async () => {
  try {
    const response = await axios.get(
      `${config.url}/wp-json/wc/v3/products`,
      {
        auth: {
          username: config.username,
          password: config.password
        }
      }
    );
    
    console.log(`Encontrados ${response.data.length} produtos`);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar produtos:', error.response ? error.response.data : error.message);
    return [];
  }
};

// Função para verificar o status da API do WordPress
const checkWordPressApi = async () => {
  try {
    const response = await axios.get(
      `${config.url}/wp-json/`,
      {
        auth: {
          username: config.username,
          password: config.password
        }
      }
    );
    
    console.log('API do WordPress está acessível');
    return true;
  } catch (error) {
    console.error('Erro ao verificar API do WordPress:', error.response ? error.response.data : error.message);
    return false;
  }
};

// Função para verificar o status da API do WooCommerce
const checkWooCommerceApi = async () => {
  try {
    const response = await axios.get(
      `${config.url}/wp-json/wc/v3`,
      {
        auth: {
          username: config.username,
          password: config.password
        }
      }
    );
    
    console.log('API do WooCommerce está acessível');
    return true;
  } catch (error) {
    console.error('Erro ao verificar API do WooCommerce:', error.response ? error.response.data : error.message);
    return false;
  }
};

// Executar testes
const runTests = async () => {
  console.log('Iniciando testes simples de integração com o WooCommerce...');
  
  // Verificar API do WordPress
  console.log('\n=== Verificando API do WordPress ===');
  await checkWordPressApi();
  
  // Verificar API do WooCommerce
  console.log('\n=== Verificando API do WooCommerce ===');
  await checkWooCommerceApi();
  
  // Listar produtos
  console.log('\n=== Listando produtos ===');
  await listProducts();
  
  console.log('\nTestes concluídos!');
};

// Executar testes
runTests();
