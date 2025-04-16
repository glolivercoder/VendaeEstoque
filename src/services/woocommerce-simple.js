/**
 * Serviço para integração com o WooCommerce - Versão Simplificada
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
    console.error('Erro ao verificar conexão com WooCommerce:', error.message);

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
      console.error('Erro na conexão alternativa:', alternativeError.message);

      return {
        success: false,
        message: 'Não foi possível estabelecer conexão com o WooCommerce.',
        error: error.message,
        alternativeError: alternativeError.message
      };
    }
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
      // Verificar se o produto já existe no WooCommerce
      const existingProducts = await woocommerceApi.get('/products', {
        params: {
          sku: `PDV-${product.id}`
        }
      });

      // Criar um objeto extremamente simplificado para evitar erros
      const simplifiedProduct = {
        name: product.description || product.name,
        regular_price: String(product.price),
        description: product.itemDescription || product.description || product.name,
        sku: `PDV-${product.id}`,
        type: 'simple',
        status: 'publish',
        images: [
          {
            src: 'https://via.placeholder.com/800x600?text=PDV+Vendas+Produto'
          }
        ]
      };

      let response;

      // Atualizar produto existente ou criar novo
      if (existingProducts.data && existingProducts.data.length > 0) {
        const existingProduct = existingProducts.data[0];
        console.log(`Atualizando produto existente: ${existingProduct.id}`);

        response = await woocommerceApi.put(`/products/${existingProduct.id}`, simplifiedProduct);

        results.updated++;
        results.details.push({
          id: product.id,
          woocommerce_id: existingProduct.id,
          status: 'updated',
          name: product.description || product.name
        });
        console.log(`Produto atualizado: ${product.description || product.name}`);
      } else {
        console.log(`Criando novo produto: ${product.description || product.name}`);

        response = await woocommerceApi.post('/products', simplifiedProduct);

        results.created++;
        results.details.push({
          id: product.id,
          woocommerce_id: response.data.id,
          status: 'created',
          name: product.description || product.name
        });
        console.log(`Produto criado: ${product.description || product.name}`);
      }
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
 * @param {Object} options - Opções de filtragem
 * @returns {Promise<Object>} Produtos obtidos
 */
export const getProductsFromWooCommerce = async (options = {}) => {
  console.log('Obtendo produtos do WooCommerce...');

  try {
    // Preparar parâmetros de consulta
    const params = {
      per_page: 100, // Máximo permitido pela API
      ...options
    };

    // Buscar produtos
    const response = await woocommerceApi.get('/products', { params });

    // Filtrar produtos do PDV Vendas
    const products = response.data.filter(product => {
      // Se estamos buscando por ID do PDV Vendas
      if (options.pdv_id) {
        return product.meta_data && product.meta_data.some(meta =>
          meta.key === '_pdv_vendas_id' && meta.value === String(options.pdv_id)
        );
      }

      // Caso contrário, retornar todos os produtos do PDV Vendas
      return product.meta_data && product.meta_data.some(meta => meta.key === '_pdv_vendas_id');
    });

    // Converter para o formato esperado pelo PDV Vendas
    const formattedProducts = products.map(product => {
      // Encontrar o ID do PDV Vendas nos metadados
      const pdvIdMeta = product.meta_data.find(meta => meta.key === '_pdv_vendas_id');
      const pdvId = pdvIdMeta ? pdvIdMeta.value : null;

      return {
        id: pdvId,
        wordpress_id: product.id,
        description: product.name,
        itemDescription: product.description,
        price: parseFloat(product.price),
        quantity: product.stock_quantity || 0,
        category: product.categories && product.categories.length > 0 ? product.categories[0].name : 'Geral',
        image: product.images && product.images.length > 0 ? product.images[0].src : ''
      };
    });

    console.log(`Obtidos ${formattedProducts.length} produtos do WooCommerce.`);

    return {
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
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
