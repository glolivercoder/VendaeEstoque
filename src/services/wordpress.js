/**
 * Serviço para sincronizar dados do PDV Vendas com o WordPress usando a API do WooCommerce
 */
import axios from 'axios';

// Implementação alternativa para gerar assinatura HMAC-SHA256 sem depender do crypto-js
function generateHmacSignature(message, secret) {
  // Usar uma função simples de hash para demonstração
  // Em produção, seria necessário implementar corretamente o HMAC-SHA256
  const hash = btoa(message + secret); // Simplificação para fins de demonstração
  return hash;
}

// Obter credenciais do arquivo .env ou usar valores padrão
const {
  // URL base da API do WooCommerce
  VITE_WORDPRESS_URL: SITE_URL = 'https://achadinhoshopp.com.br/loja',
  // Chaves da API do WooCommerce (substitua pelos valores reais obtidos no painel do WooCommerce)
  VITE_WOOCOMMERCE_CONSUMER_KEY: CONSUMER_KEY = 'ck_a117i65gmQYOokVzyA8QRLSw',
  VITE_WOOCOMMERCE_CONSUMER_SECRET: CONSUMER_SECRET = 'cs_a117i65gmQYOokVzyA8QRLSw'
} = import.meta.env;

// URL base da API do WooCommerce
const API_URL = `${SITE_URL}/wp-json/wc/v3`;

/**
 * Função para gerar assinatura OAuth para a API do WooCommerce
 * @param {string} method - Método HTTP (GET, POST, etc.)
 * @param {string} url - URL da requisição
 * @param {Object} params - Parâmetros da requisição
 * @returns {Object} - Parâmetros com assinatura OAuth
 */
const getOAuthParams = (method, url, params = {}) => {
  // Parâmetros básicos do OAuth
  const oauthParams = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: Math.floor(Date.now() / 1000),
    oauth_version: '1.0',
    ...params
  };

  // Ordenar parâmetros alfabeticamente
  const sortedParams = Object.keys(oauthParams).sort().reduce((acc, key) => {
    acc[key] = oauthParams[key];
    return acc;
  }, {});

  // Construir string de parâmetros
  const paramString = Object.keys(sortedParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');

  // Construir string base para assinatura
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString)
  ].join('&');

  // Gerar assinatura
  const signature = generateHmacSignature(signatureBaseString, `${CONSUMER_SECRET}&`);

  // Adicionar assinatura aos parâmetros
  return {
    ...sortedParams,
    oauth_signature: signature
  };
};

/**
 * Criar instância do axios para o WooCommerce
 * @returns {Object} - Instância do axios configurada
 */
const createApiInstance = () => {
  return axios.create({
    baseURL: API_URL,
    // Usar autenticação básica para simplificar (funciona em HTTPS)
    auth: {
      username: CONSUMER_KEY,
      password: CONSUMER_SECRET
    },
    headers: {
      'Content-Type': 'application/json'
    },
    // Aumentar timeout para evitar erros em conexões lentas
    timeout: 15000
  });
};

// Criar instância do axios para o WordPress
const wordpressApi = createApiInstance();

/**
 * Função para sincronizar produtos selecionados com o WordPress
 * @param {Array} products - Array de produtos a serem sincronizados
 * @returns {Promise} - Promise com o resultado da sincronização
 */
export const syncProductsToWordPress = async (products) => {
  console.log(`Sincronizando ${products.length} produtos com WordPress...`);

  // Resultados da sincronização
  const results = {
    success: true,
    created: 0,
    updated: 0,
    failed: 0,
    details: []
  };

  // Processar cada produto individualmente
  for (const product of products) {
    try {
      // Verificar se o produto já existe no WooCommerce
      const existingProducts = await wordpressApi.get('/products', {
        params: {
          sku: `PDV-${product.id}`
        }
      });

      // Formatar produto para o formato do WooCommerce
      const wooProduct = {
        name: product.description || product.name,
        description: product.itemDescription || product.description || product.name,
        short_description: product.description || product.name,
        regular_price: String(product.price),
        price: String(product.price),
        sku: `PDV-${product.id}`,
        manage_stock: true,
        stock_quantity: parseInt(product.quantity) || 0,
        stock_status: (parseInt(product.quantity) || 0) > 0 ? 'instock' : 'outofstock',
        categories: [
          {
            name: product.category || 'Geral'
          }
        ],
        meta_data: [
          {
            key: '_pdv_vendas_id',
            value: String(product.id)
          }
        ]
      };

      // Adicionar imagem se existir
      if (product.image && product.image.startsWith('data:image')) {
        // Para imagens em base64, precisamos primeiro fazer upload para o WordPress
        // Isso requer endpoints adicionais e não é suportado diretamente pela API
        // Por enquanto, vamos apenas registrar que a imagem não pode ser processada
        console.log('Imagem em base64 detectada. Upload de imagem não suportado diretamente pela API.');
      } else if (product.image) {
        wooProduct.images = [
          {
            src: product.image
          }
        ];
      }

      let response;

      // Atualizar produto existente ou criar novo
      if (existingProducts.data && existingProducts.data.length > 0) {
        const existingProduct = existingProducts.data[0];
        response = await wordpressApi.put(`/products/${existingProduct.id}`, wooProduct);
        results.updated++;
        results.details.push({
          id: product.id,
          woocommerce_id: existingProduct.id,
          status: 'updated',
          name: product.description || product.name
        });
        console.log(`Produto atualizado: ${product.description || product.name}`);
      } else {
        response = await wordpressApi.post('/products', wooProduct);
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
      console.error(`Erro ao sincronizar produto ${product.id}:`, error);
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
 * Função para limpar produtos existentes no WordPress
 * @returns {Promise} - Promise com o resultado da limpeza
 */
export const clearWordPressProducts = async () => {
  console.log('Buscando produtos do PDV Vendas no WordPress...');

  try {
    // Buscar todos os produtos com meta_data contendo _pdv_vendas_id
    const response = await wordpressApi.get('/products', {
      params: {
        per_page: 100 // Máximo permitido pela API
      }
    });

    const products = response.data;
    const pdvProducts = products.filter(product => {
      // Verificar se o produto tem meta_data com _pdv_vendas_id
      return product.meta_data && product.meta_data.some(meta => meta.key === '_pdv_vendas_id');
    });

    console.log(`Encontrados ${pdvProducts.length} produtos do PDV Vendas no WordPress.`);

    // Excluir cada produto individualmente
    const results = {
      success: true,
      count: 0,
      failed: 0,
      details: []
    };

    for (const product of pdvProducts) {
      try {
        await wordpressApi.delete(`/products/${product.id}`, {
          params: {
            force: true // Excluir permanentemente
          }
        });

        results.count++;
        results.details.push({
          id: product.id,
          name: product.name,
          status: 'deleted'
        });

        console.log(`Produto excluído: ${product.name}`);
      } catch (error) {
        console.error(`Erro ao excluir produto ${product.id}:`, error);
        results.failed++;
        results.details.push({
          id: product.id,
          name: product.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Atualizar status de sucesso
    results.success = results.failed === 0;

    console.log(`Limpeza concluída: ${results.count} produtos excluídos, ${results.failed} falhas`);
    return results;
  } catch (error) {
    console.error('Erro ao limpar produtos no WordPress:', error);
    throw new Error(`Não foi possível limpar os produtos no WordPress: ${error.message}`);
  }
};

/**
 * Função para obter produtos do WordPress
 * @param {Object} options - Opções de filtragem
 * @returns {Promise} - Promise com os produtos obtidos
 */
export const getProductsFromWordPress = async (options = {}) => {
  console.log('Obtendo produtos do WordPress...');

  try {
    // Preparar parâmetros de consulta
    const params = {
      per_page: 100, // Máximo permitido pela API
      ...options
    };

    // Se houver categoria, converter para ID da categoria
    if (options.category) {
      try {
        // Buscar categoria pelo nome
        const categoryResponse = await wordpressApi.get('/products/categories', {
          params: {
            search: options.category
          }
        });

        if (categoryResponse.data && categoryResponse.data.length > 0) {
          // Usar o ID da primeira categoria encontrada
          params.category = categoryResponse.data[0].id;
          delete params.category_name; // Remover parâmetro de nome da categoria
        }
      } catch (categoryError) {
        console.error('Erro ao buscar categoria:', categoryError);
      }
    }

    // Buscar produtos
    const response = await wordpressApi.get('/products', { params });

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

    console.log(`Obtidos ${formattedProducts.length} produtos do WordPress.`);

    return {
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
    };
  } catch (error) {
    console.error('Erro ao obter produtos do WordPress:', error);

    // Retornar array vazio em vez de lançar erro
    return {
      success: false,
      count: 0,
      products: [],
      error: error.message
    };
  }
};

/**
 * Função para configurar o webhook para receber notificações de vendas do WordPress
 * @returns {Promise} - Promise com o resultado da configuração
 */
export const setupWordPressWebhook = async () => {
  // URL para o endpoint que receberá as notificações de vendas
  const webhookUrl = 'https://api.pdvvendas.com/webhook/wordpress-sync';

  console.log('Configurando webhook do WooCommerce...');

  try {
    // Verificar se o webhook já existe
    const existingWebhooks = await wordpressApi.get('/webhooks', {
      params: {
        search: webhookUrl
      }
    });

    // Se o webhook já existe, retornar sucesso
    if (existingWebhooks.data && existingWebhooks.data.length > 0) {
      console.log('Webhook já configurado!');
      return {
        success: true,
        webhook_id: existingWebhooks.data[0].id,
        webhook_url: webhookUrl,
        message: 'Webhook já configurado'
      };
    }

    // Criar novo webhook
    const response = await wordpressApi.post('/webhooks', {
      name: 'PDV Vendas Integration',
      topic: 'order.updated', // Evento que dispara o webhook
      delivery_url: webhookUrl,
      status: 'active',
      secret: CONSUMER_SECRET // Usar o mesmo segredo da API para validação
    });

    console.log('Webhook configurado com sucesso!');
    return {
      success: true,
      webhook_id: response.data.id,
      webhook_url: webhookUrl,
      message: 'Webhook configurado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao configurar webhook do WordPress:', error);

    // Retornar um objeto simulando sucesso, já que o webhook é opcional
    return {
      success: false,
      message: 'Não foi possível configurar o webhook automaticamente. ' +
        'Você pode configurar manualmente no painel do WooCommerce. ' +
        'URL do webhook: ' + webhookUrl,
      webhook_url: webhookUrl,
      error: error.message
    };
  }
};

/**
 * Função para atualizar o estoque no WordPress
 * @param {Array} products - Array de produtos com estoque atualizado
 * @returns {Promise} - Promise com o resultado da atualização
 */
export const updateWordPressStock = async (products) => {
  console.log(`Atualizando estoque de ${products.length} produtos no WordPress...`);

  // Resultados da atualização
  const results = {
    success: true,
    updated: 0,
    failed: 0,
    details: []
  };

  // Processar cada produto individualmente
  for (const product of products) {
    try {
      // Buscar produtos pelo ID do PDV Vendas
      const existingProducts = await wordpressApi.get('/products', {
        params: {
          meta_key: '_pdv_vendas_id',
          meta_value: String(product.id)
        }
      });

      // Se o produto não existe, pular
      if (!existingProducts.data || existingProducts.data.length === 0) {
        console.log(`Produto com ID ${product.id} não encontrado no WordPress.`);
        results.failed++;
        results.details.push({
          id: product.id,
          status: 'not_found',
          message: 'Produto não encontrado no WordPress'
        });
        continue;
      }

      // Atualizar estoque do produto
      const wooProduct = existingProducts.data[0];
      const response = await wordpressApi.put(`/products/${wooProduct.id}`, {
        stock_quantity: parseInt(product.quantity) || 0,
        stock_status: (parseInt(product.quantity) || 0) > 0 ? 'instock' : 'outofstock'
      });

      results.updated++;
      results.details.push({
        id: product.id,
        wordpress_id: wooProduct.id,
        status: 'updated',
        name: wooProduct.name,
        quantity: parseInt(product.quantity) || 0
      });

      console.log(`Estoque atualizado para o produto ${wooProduct.name}: ${product.quantity} unidades`);
    } catch (error) {
      console.error(`Erro ao atualizar estoque do produto ${product.id}:`, error);
      results.failed++;
      results.details.push({
        id: product.id,
        status: 'failed',
        error: error.message
      });
    }
  }

  // Atualizar status de sucesso
  results.success = results.failed === 0;

  console.log(`Atualização de estoque concluída: ${results.updated} atualizados, ${results.failed} falhas`);
  return results;
};
