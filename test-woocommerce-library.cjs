// Script para testar a integração com o WooCommerce usando a biblioteca oficial
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

// Configurar a API do WooCommerce
const api = new WooCommerceRestApi({
  url: 'https://achadinhoshopp.com.br/loja',
  consumerKey: 'ck_a117i65gmQYOokVzyA8QRLSw',
  consumerSecret: 'cs_a117i65gmQYOokVzyA8QRLSw',
  version: 'wc/v3'
});

// Função para listar produtos
const listProducts = async () => {
  try {
    const response = await api.get('products', {
      per_page: 20
    });
    
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

// Função para criar um produto
const createProduct = async () => {
  try {
    const response = await api.post('products', {
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
    });
    
    console.log('Produto criado com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar produto:', error.response ? error.response.data : error.message);
    return null;
  }
};

// Função para verificar o status da API
const checkApiStatus = async () => {
  try {
    const response = await api.get('');
    
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
  console.log('Iniciando testes de integração com o WooCommerce usando a biblioteca oficial...');
  
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
