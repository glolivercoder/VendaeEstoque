// Script para testar a integração com o WooCommerce usando a API REST
import axios from 'axios';

// Configurações do WooCommerce
const config = {
  url: 'https://achadinhoshopp.com.br/loja',
  username: 'glolivercoder',
  password: 'Juli@3110'
};

// Função para criar um produto no WooCommerce
const createProduct = async () => {
  try {
    const response = await axios.post(
      `${config.url}/wp-json/wc/v3/products`,
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
      {
        auth: {
          username: config.username,
          password: config.password
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

// Função para listar produtos no WooCommerce
const listProducts = async () => {
  try {
    const response = await axios.get(
      `${config.url}/wp-json/wc/v3/products`,
      {
        auth: {
          username: config.username,
          password: config.password
        },
        params: {
          per_page: 10
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

// Função para verificar o status da API do WooCommerce
const checkApiStatus = async () => {
  try {
    // Tentar acessar a API do WordPress
    const wpResponse = await axios.get(
      `${config.url}/wp-json/`,
      {
        auth: {
          username: config.username,
          password: config.password
        }
      }
    );

    console.log('API do WordPress está acessível:', {
      name: wpResponse.data.name,
      description: wpResponse.data.description,
      url: wpResponse.data.url
    });

    // Tentar acessar a API do WooCommerce
    const wcResponse = await axios.get(
      `${config.url}/wp-json/wc/v3`,
      {
        auth: {
          username: config.username,
          password: config.password
        }
      }
    );

    console.log('API do WooCommerce está acessível:', {
      namespace: wcResponse.data.namespace,
      routes: Object.keys(wcResponse.data.routes).length
    });

    return {
      wordpress: true,
      woocommerce: true
    };
  } catch (error) {
    console.error('Erro ao verificar status da API:', error.response ? error.response.data : error.message);
    return {
      wordpress: false,
      woocommerce: false,
      error: error.response ? error.response.data : error.message
    };
  }
};

// Função para verificar as permissões do usuário
const checkUserPermissions = async () => {
  try {
    const response = await axios.get(
      `${config.url}/wp-json/wp/v2/users/me`,
      {
        auth: {
          username: config.username,
          password: config.password
        }
      }
    );

    console.log('Informações do usuário:', {
      id: response.data.id,
      name: response.data.name,
      roles: response.data.roles
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao verificar permissões do usuário:', error.response ? error.response.data : error.message);
    return null;
  }
};

// Executar testes
const runTests = async () => {
  console.log('Iniciando testes de integração com o WooCommerce...');
  
  // Verificar status da API
  console.log('\n=== Verificando status da API ===');
  await checkApiStatus();
  
  // Verificar permissões do usuário
  console.log('\n=== Verificando permissões do usuário ===');
  await checkUserPermissions();
  
  // Listar produtos
  console.log('\n=== Listando produtos ===');
  await listProducts();
  
  // Criar produto de teste
  console.log('\n=== Criando produto de teste ===');
  await createProduct();
  
  // Listar produtos novamente
  console.log('\n=== Listando produtos após criação ===');
  await listProducts();
  
  console.log('\nTestes concluídos!');
};

// Executar testes
runTests();
