// Script para testar a integração com o WooCommerce
import axios from 'axios';

// Configurações do WooCommerce
const config = {
  url: 'https://achadinhoshopp.com.br/loja',
  username: 'glolivercoder',
  password: 'Juli@3110'
};

// URL base da API do WooCommerce
const WOO_API_URL = `${config.url}/wp-json/wc/v3`;

// Criar instância do axios para o WooCommerce
const woocommerceApi = axios.create({
  baseURL: WOO_API_URL,
  auth: {
    username: config.username,
    password: config.password
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Função para verificar conexão com o WooCommerce
const checkWooCommerceConnection = async () => {
  console.log('Verificando conexão com o WooCommerce...');

  try {
    // Tentar obter informações básicas da loja
    const response = await woocommerceApi.get('/');

    console.log('Conexão com WooCommerce estabelecida:', {
      status: response.status,
      storeInfo: response.data
    });

    return {
      success: true,
      message: 'Conexão com WooCommerce estabelecida com sucesso!',
      storeInfo: response.data
    };
  } catch (error) {
    console.error('Erro ao verificar conexão com WooCommerce:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);

    // Tentar uma rota alternativa
    try {
      console.log('Tentando rota alternativa...');
      const response = await woocommerceApi.get('/products/categories');

      console.log('Conexão alternativa estabelecida:', {
        status: response.status,
        dataSize: response.data.length
      });

      return {
        success: true,
        message: 'Conexão alternativa com WooCommerce estabelecida!',
        categories: response.data
      };
    } catch (alternativeError) {
      console.error('Erro na conexão alternativa:', alternativeError.response ? {
        status: alternativeError.response.status,
        data: alternativeError.response.data
      } : alternativeError.message);

      return {
        success: false,
        message: 'Não foi possível estabelecer conexão com o WooCommerce.',
        error: error.response ? error.response.data : error.message,
        alternativeError: alternativeError.response ? alternativeError.response.data : alternativeError.message
      };
    }
  }
};

// Função para obter produtos do WooCommerce
const getProductsFromWooCommerce = async () => {
  console.log('Obtendo produtos do WooCommerce...');

  try {
    // Buscar produtos
    const response = await woocommerceApi.get('/products', {
      params: {
        per_page: 10
      }
    });

    console.log(`Obtidos ${response.data.length} produtos do WooCommerce.`);
    console.log('Produtos:', response.data.map(p => ({ id: p.id, name: p.name })));

    return {
      success: true,
      count: response.data.length,
      products: response.data
    };
  } catch (error) {
    console.error('Erro ao obter produtos do WooCommerce:', error.response ? {
      status: error.response.status,
      data: error.response.data
    } : error.message);

    return {
      success: false,
      count: 0,
      products: [],
      error: error.response ? error.response.data : error.message
    };
  }
};

// Executar testes
const runTests = async () => {
  console.log('Iniciando testes de integração com o WooCommerce...');

  try {
    // Verificar conexão
    const connectionResult = await checkWooCommerceConnection();
    console.log('\nResultado da verificação de conexão:', connectionResult);

    if (connectionResult.success) {
      // Obter produtos
      const productsResult = await getProductsFromWooCommerce();
      console.log('\nResultado da obtenção de produtos:', productsResult);
    }
  } catch (error) {
    console.error('Erro ao executar testes:', error);
  }

  console.log('\nTestes concluídos!');
};

// Executar testes
runTests();
