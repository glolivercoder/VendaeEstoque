/**
 * Script para testar a API do WooCommerce diretamente no navegador
 * Cole este script no console do navegador com o PDV Vendas aberto
 */

// Configurações da API
const SITE_URL = localStorage.getItem('wp_site_url') || 'https://achadinhoshopp.com.br/loja';
const CONSUMER_KEY = localStorage.getItem('wc_consumer_key') || 'ck_40b4a1a674084d504579a2ba2d51530c260d3645';
const CONSUMER_SECRET = localStorage.getItem('wc_consumer_secret') || 'cs_8fa4b36ab57ddb02415e4fc346451791ab1782f9';

// Função para testar a conexão com a API do WooCommerce
async function testWooCommerceAPI() {
  console.log('Testando conexão com a API do WooCommerce...');
  console.log(`URL: ${SITE_URL}`);
  console.log(`Consumer Key: ${CONSUMER_KEY.substring(0, 5)}...`);
  console.log(`Consumer Secret: ${CONSUMER_SECRET.substring(0, 5)}...`);

  try {
    // Testar conexão básica
    const response = await fetch(`${SITE_URL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`);
    
    if (!response.ok) {
      throw new Error(`Erro na conexão: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Conexão bem-sucedida!');
    console.log(`Produtos encontrados: ${data.length}`);
    
    // Testar criação de produto mínimo
    await testCreateMinimalProduct();
    
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
  }
}

// Função para testar a criação de um produto mínimo
async function testCreateMinimalProduct() {
  console.log('\nTestando criação de produto mínimo...');
  
  // Produto de teste com apenas os campos obrigatórios
  const product = {
    name: 'Produto Mínimo de Teste - ' + new Date().toISOString(),
    type: 'simple',
    regular_price: '9.99',
    status: 'draft'
  };
  
  console.log('Dados do produto:', product);
  
  try {
    // Fazer requisição POST para criar o produto
    const response = await fetch(`${SITE_URL}/wp-json/wc/v3/products?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });
    
    // Verificar resposta
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Erro ao criar produto:', response.status, response.statusText);
      console.error('Resposta:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        console.error('Detalhes do erro:', errorData);
      } catch (e) {
        console.error('Não foi possível analisar a resposta como JSON');
      }
      
      return;
    }
    
    // Analisar resposta
    const data = JSON.parse(responseText);
    console.log('Produto criado com sucesso!');
    console.log('ID:', data.id);
    console.log('Nome:', data.name);
    
    // Excluir o produto de teste
    await deleteProduct(data.id);
    
  } catch (error) {
    console.error('Erro ao criar produto:', error);
  }
}

// Função para excluir um produto
async function deleteProduct(productId) {
  console.log(`\nExcluindo produto de teste (ID: ${productId})...`);
  
  try {
    const response = await fetch(`${SITE_URL}/wp-json/wc/v3/products/${productId}?force=true&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao excluir produto: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Produto excluído com sucesso!');
    
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
  }
}

// Executar o teste
testWooCommerceAPI();
