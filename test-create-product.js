/**
 * Script para testar a criação de um produto no WooCommerce
 */
import axios from 'axios';

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
  },
  timeout: 30000 // 30 segundos de timeout
});

/**
 * Testar criação de produto
 */
async function testCreateProduct() {
  console.log('Testando criação de produto no WooCommerce...');
  console.log('URL da API:', WOO_API_URL);

  try {
    // Criar produto de teste
    const testProduct = {
      name: 'Produto de Teste PDV Vendas',
      regular_price: '99.99',
      description: 'Este é um produto de teste criado pelo script de teste.',
      sku: `PDV-TEST-${Date.now()}`,
      images: [
        {
          src: 'https://via.placeholder.com/800x600?text=Produto+Teste'
        }
      ],
      type: 'simple',
      status: 'publish'
    };

    console.log('Enviando produto:', testProduct);

    const response = await woocommerceApi.post('/products', testProduct);

    console.log('\n✅ Produto criado com sucesso!');
    console.log('ID do produto:', response.data.id);
    console.log('Nome do produto:', response.data.name);
    console.log('Preço:', response.data.regular_price);
    console.log('SKU:', response.data.sku);
    console.log('Status:', response.data.status);

    if (response.data.images && response.data.images.length > 0) {
      console.log('URL da imagem:', response.data.images[0].src);
    }

    console.log('\nLink do produto:', response.data.permalink);

    return response.data;
  } catch (error) {
    console.error('\n❌ Erro ao criar produto:');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else if (error.request) {
      console.error('Sem resposta do servidor.');
    } else {
      console.error('Erro:', error.message);
    }

    throw error;
  }
}

// Executar o teste
testCreateProduct()
  .then(product => {
    console.log('\nProduto criado e disponível em:', product.permalink);
  })
  .catch(error => {
    console.error('\nFalha ao criar produto:', error.message);
    process.exit(1);
  });
