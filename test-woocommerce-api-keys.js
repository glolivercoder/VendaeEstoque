// Script para testar a integração com o WooCommerce usando chaves de API
import axios from 'axios';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

// Configurações do WooCommerce
const config = {
  url: 'https://achadinhoshopp.com.br/loja',
  consumerKey: 'ck_a117i65gmQYOokVzyA8QRLSw',
  consumerSecret: 'cs_a117i65gmQYOokVzyA8QRLSw',
  version: 'wc/v3'
};

// Criar instância do OAuth
const oauth = OAuth({
  consumer: {
    key: config.consumerKey,
    secret: config.consumerSecret
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64');
  }
});

// Função para obter cabeçalhos de autenticação
const getAuthHeaders = (url, method) => {
  const request_data = {
    url,
    method
  };
  
  return oauth.toHeader(oauth.authorize(request_data));
};

// Função para listar produtos no WooCommerce
const listProducts = async () => {
  try {
    const url = `${config.url}/wp-json/${config.version}/products`;
    const headers = getAuthHeaders(url, 'GET');
    
    const response = await axios.get(url, { headers });
    
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
    const url = `${config.url}/wp-json/${config.version}/products`;
    const headers = getAuthHeaders(url, 'POST');
    
    const response = await axios.post(
      url,
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
        ],
        images: [
          {
            src: 'https://via.placeholder.com/600x400'
          }
        ]
      },
      { headers }
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
    const url = `${config.url}/wp-json/${config.version}`;
    const headers = getAuthHeaders(url, 'GET');
    
    const response = await axios.get(url, { headers });
    
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
  console.log('Iniciando testes de integração com o WooCommerce usando chaves de API...');
  
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
