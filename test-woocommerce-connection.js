/**
 * Script para testar a conexão com o WooCommerce
 * Este script verifica se as credenciais do WooCommerce estão corretas
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
  }
});

// Função para testar a conexão com o WooCommerce
async function testWooCommerceConnection() {
  try {
    console.log('Testando conexão com o WooCommerce...');
    console.log(`URL da API: ${WOO_API_URL}`);
    console.log(`Consumer Key: ${config.consumer_key.substring(0, 5)}...`);
    console.log(`Consumer Secret: ${config.consumer_secret.substring(0, 5)}...`);

    // Tentar obter informações básicas da loja
    const response = await woocommerceApi.get('/');

    console.log('Conexão com WooCommerce estabelecida com sucesso!');
    console.log(`Status: ${response.status}`);
    console.log(`Namespace: ${response.data.namespace}`);
    console.log(`Rotas disponíveis: ${Object.keys(response.data.routes).length}`);

    return true;
  } catch (error) {
    console.error('Erro ao verificar conexão com WooCommerce:');

    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Dados da resposta:', error.response.data);
    } else {
      console.error(`Mensagem: ${error.message}`);
    }

    // Tentar uma rota alternativa
    try {
      console.log('\nTentando rota alternativa...');
      const response = await woocommerceApi.get('/products/categories');

      console.log('Conexão alternativa estabelecida com sucesso!');
      console.log(`Status: ${response.status}`);
      console.log(`Categorias encontradas: ${response.data.length}`);

      return true;
    } catch (alternativeError) {
      console.error('Erro na conexão alternativa:');

      if (alternativeError.response) {
        console.error(`Status: ${alternativeError.response.status}`);
        console.error('Dados da resposta:', alternativeError.response.data);
      } else {
        console.error(`Mensagem: ${alternativeError.message}`);
      }

      return false;
    }
  }
}

// Executar o teste
testWooCommerceConnection();
