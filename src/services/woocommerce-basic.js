/**
 * Serviço para integração com o WooCommerce - Versão Básica
 * Este serviço fornece funções para interagir com o WooCommerce
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
 * Verificar conexão com o WooCommerce
 * @returns {Promise<Object>} Resultado da verificação
 */
export const checkWooCommerceConnection = async () => {
  console.log('Verificando conexão com o WooCommerce...');

  try {
    // Tentar obter informações básicas da loja
    const response = await woocommerceApi.get('/products/categories');

    console.log('Conexão com WooCommerce estabelecida:', {
      status: response.status,
      dataSize: response.data.length
    });

    return {
      success: true,
      message: 'Conexão com WooCommerce estabelecida com sucesso!',
      categories: response.data
    };
  } catch (error) {
    console.error('Erro ao verificar conexão com WooCommerce:', error.message);

    return {
      success: false,
      message: 'Não foi possível estabelecer conexão com o WooCommerce.',
      error: error.message
    };
  }
};

/**
 * Sincronizar produtos com o WooCommerce
 * @param {Array} products - Array de produtos a serem sincronizados
 * @returns {Promise<Object>} Resultado da sincronização
 */
export const syncProductsToWooCommerce = async (products) => {
  console.log(`Sincronizando ${products.length} produtos com o WooCommerce...`);

  // Resultados da sincronização
  const results = {
    success: true,
    created: 0,
    updated: 0,
    failed: 0,
    details: []
  };

  // Verificar conexão com o WooCommerce antes de prosseguir
  const connectionCheck = await checkWooCommerceConnection();
  if (!connectionCheck.success) {
    console.error('Falha na conexão com o WooCommerce. Sincronização cancelada.');
    return {
      success: false,
      message: 'Falha na conexão com o WooCommerce. Verifique as credenciais e a conexão com a internet.',
      connectionError: connectionCheck,
      created: 0,
      updated: 0,
      failed: products.length,
      details: products.map(product => ({
        id: product.id,
        status: 'connection_failed',
        name: product.description || product.name,
        error: 'Falha na conexão com o WooCommerce'
      }))
    };
  }

  console.log('Conexão com WooCommerce verificada. Prosseguindo com a sincronização...');

  // Processar cada produto individualmente
  for (const product of products) {
    try {
      // Criar um objeto extremamente simplificado para evitar erros
      const simplifiedProduct = {
        name: product.description || product.name,
        regular_price: String(product.price),
        description: product.itemDescription || product.description || product.name,
        type: 'simple',
        status: 'publish'
      };

      // Criar novo produto
      console.log(`Criando novo produto: ${simplifiedProduct.name}`);
      const response = await woocommerceApi.post('/products', simplifiedProduct);

      results.created++;
      results.details.push({
        id: product.id,
        woocommerce_id: response.data.id,
        status: 'created',
        name: product.description || product.name
      });
      console.log(`Produto criado: ${product.description || product.name}`);
    } catch (error) {
      console.error(`Erro ao sincronizar produto ${product.id}:`, error.message);
      results.failed++;
      results.details.push({
        id: product.id,
        status: 'failed',
        name: product.description || product.name,
        error: error.message
      });
    }
  }

  // Atualizar status de sucesso
  results.success = results.failed === 0;

  console.log(`Sincronização concluída: ${results.created} criados, ${results.updated} atualizados, ${results.failed} falhas`);
  return results;
};

/**
 * Obter produtos do WooCommerce
 * @returns {Promise<Object>} Produtos obtidos
 */
export const getProductsFromWooCommerce = async () => {
  console.log('Obtendo produtos do WooCommerce...');

  try {
    // Buscar produtos
    const response = await woocommerceApi.get('/products', { 
      params: {
        per_page: 100 // Máximo permitido pela API
      }
    });

    console.log(`Obtidos ${response.data.length} produtos do WooCommerce.`);

    return {
      success: true,
      count: response.data.length,
      products: response.data
    };
  } catch (error) {
    console.error('Erro ao obter produtos do WooCommerce:', error.message);

    // Retornar array vazio em vez de lançar erro
    return {
      success: false,
      count: 0,
      products: [],
      error: error.message
    };
  }
};

// Exportar funções
export default {
  checkWooCommerceConnection,
  syncProductsToWooCommerce,
  getProductsFromWooCommerce
};
