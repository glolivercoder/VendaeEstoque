/**
 * Serviço para integração com o WooCommerce MCP
 * Este serviço fornece funções para interagir com o WooCommerce através do MCP
 */
import axios from 'axios';

// Configuração padrão do WooCommerce MCP
const config = {
  woocommerce: {
    url: 'https://achadinhoshopp.com.br/loja',
    consumer_key: 'ck_d106765e36b9a6af0d22bd22571388ec3ad67378',
    consumer_secret: 'cs_0d5d0255c002e137d48be4da75d5d87363278bd6',
    version: 'wc/v3'
  },
  mcp: {
    url: 'http://localhost:3025',
    version: 'v1'
  },
  webhooks: {
    product_updated: {
      name: 'PDV Vendas - Atualização de Produto',
      topic: 'product.updated',
      delivery_url: 'http://localhost:3000/api/webhooks/woocommerce/estoque'
    },
    product_created: {
      name: 'PDV Vendas - Criação de Produto',
      topic: 'product.created',
      delivery_url: 'http://localhost:3000/api/webhooks/woocommerce/produto'
    },
    order_updated: {
      name: 'PDV Vendas - Atualização de Pedido',
      topic: 'order.updated',
      delivery_url: 'http://localhost:3000/api/webhooks/woocommerce/pedido'
    }
  }
};

// URL base da API do WooCommerce
const WOO_API_URL = `${config.woocommerce.url}/wp-json/${config.woocommerce.version}`;

// URL base do MCP
const MCP_API_URL = `${config.mcp.url}/api/${config.mcp.version}`;

/**
 * Criar instância do axios para o WooCommerce
 */
const woocommerceApi = axios.create({
  baseURL: WOO_API_URL,
  auth: {
    username: config.woocommerce.consumer_key,
    password: config.woocommerce.consumer_secret
  },
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 segundos de timeout
  maxContentLength: 5 * 1024 * 1024, // 5MB
  maxBodyLength: 5 * 1024 * 1024 // 5MB
});

/**
 * Criar instância do axios para o MCP
 */
const mcpApi = axios.create({
  baseURL: MCP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

/**
 * Verificar e criar categorias no WooCommerce
 * @param {Array} products - Array de produtos a serem sincronizados
 * @returns {Promise<Object>} Mapeamento de categorias
 */
const ensureCategories = async (products) => {
  console.log('Verificando categorias no WooCommerce...');

  // Extrair categorias únicas dos produtos
  const uniqueCategories = [...new Set(products.map(p => p.category || 'Geral'))];
  console.log('Categorias encontradas nos produtos:', uniqueCategories);

  // Mapeamento de nomes de categorias para IDs
  const categoryMap = {};

  try {
    // Obter categorias existentes
    const response = await woocommerceApi.get('/products/categories', {
      params: {
        per_page: 100
      }
    });

    const existingCategories = response.data;
    console.log(`Encontradas ${existingCategories.length} categorias existentes no WooCommerce`);

    // Mapear categorias existentes
    existingCategories.forEach(category => {
      categoryMap[category.name.toLowerCase()] = category.id;
    });

    // Criar categorias que não existem
    for (const categoryName of uniqueCategories) {
      const categoryKey = categoryName.toLowerCase();

      if (!categoryMap[categoryKey]) {
        console.log(`Criando nova categoria: ${categoryName}`);

        try {
          const createResponse = await woocommerceApi.post('/products/categories', {
            name: categoryName
          });

          categoryMap[categoryKey] = createResponse.data.id;
          console.log(`Categoria criada com sucesso: ${categoryName} (ID: ${createResponse.data.id})`);
        } catch (error) {
          console.error(`Erro ao criar categoria ${categoryName}:`, error.response ? error.response.data : error.message);
          // Usar categoria padrão se falhar
          categoryMap[categoryKey] = 0; // ID 0 indica usar a categoria padrão
        }
      } else {
        console.log(`Categoria já existe: ${categoryName} (ID: ${categoryMap[categoryKey]})`);
      }
    }

    return categoryMap;
  } catch (error) {
    console.error('Erro ao verificar categorias:', error.response ? error.response.data : error.message);
    // Retornar mapa vazio em caso de erro
    return {};
  }
};

/**
 * Sincronizar produtos com o WooCommerce
 * @param {Array} products - Array de produtos a serem sincronizados
 * @returns {Promise<Object>} Resultado da sincronização
 */
export const syncProductsToWooCommerce = async (products) => {
  console.log(`Sincronizando ${products.length} produtos com WordPress...`);
  console.log('Usando credenciais:', {
    siteUrl: config.woocommerce.url,
    apiUrl: WOO_API_URL,
    consumerKeyLength: config.woocommerce.consumer_key.length,
    consumerSecretLength: config.woocommerce.consumer_secret.length
  });

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

  // Verificar e criar categorias
  const categoryMap = await ensureCategories(products);
  console.log('Mapeamento de categorias:', categoryMap);

  // Processar cada produto individualmente
  for (const product of products) {
    try {
      // Verificar se o produto já existe no WooCommerce
      const existingProducts = await woocommerceApi.get('/products', {
        params: {
          sku: `PDV-${product.id}`
        }
      });

      // Formatar produto para o formato do WooCommerce - versão simplificada
      const wooProduct = {
        name: product.description || product.name,
        type: 'simple',
        regular_price: String(product.price),
        description: product.itemDescription || product.description || product.name,
        short_description: product.description || product.name,
        sku: `PDV-${product.id}`,
        manage_stock: true,
        stock_quantity: parseInt(product.quantity) || 0,
        status: 'publish',
        categories: []
      };

      // Adicionar categoria se existir no mapeamento
      const categoryName = product.category || 'Geral';
      const categoryKey = categoryName.toLowerCase();
      const categoryId = categoryMap[categoryKey];

      if (categoryId) {
        wooProduct.categories = [{ id: categoryId }];
      } else {
        wooProduct.categories = [{ name: categoryName }];
      }

      // Adicionar metadados básicos
      wooProduct.meta_data = [
        {
          key: '_pdv_vendas_id',
          value: String(product.id)
        }
      ];

      console.log('Enviando produto para o WooCommerce:', {
        id: product.id,
        name: wooProduct.name,
        price: wooProduct.regular_price,
        status: wooProduct.status
      });

      // Adicionar imagem padrão para todos os produtos
      wooProduct.images = [
        {
          src: 'https://via.placeholder.com/800x600?text=PDV+Vendas+Produto'
        }
      ];
      console.log(`Usando imagem padrão para o produto ${product.id}`);

      let response;

      // Atualizar produto existente ou criar novo
      if (existingProducts.data && existingProducts.data.length > 0) {
        const existingProduct = existingProducts.data[0];
        console.log(`Enviando requisição para: /products/${existingProduct.id}`, {
          method: 'put',
          headers: woocommerceApi.defaults.headers,
          params: undefined
        });

        try {
          // Criar um objeto extremamente simplificado para evitar erros
          const simplifiedProduct = {
            name: wooProduct.name,
            regular_price: wooProduct.regular_price,
            description: wooProduct.description,
            sku: wooProduct.sku,
            images: wooProduct.images
          };

          console.log('Enviando produto extremamente simplificado para atualização:', simplifiedProduct);

          response = await woocommerceApi.put(`/products/${existingProduct.id}`, simplifiedProduct);
          console.log(`Resposta recebida de: /products/${existingProduct.id}`, {
            status: response.status,
            statusText: response.statusText,
            dataSize: JSON.stringify(response.data).length
          });

          results.updated++;
          results.details.push({
            id: product.id,
            woocommerce_id: existingProduct.id,
            status: 'updated',
            name: product.description || product.name
          });
          console.log(`Produto atualizado: ${product.description || product.name}`);
        } catch (error) {
          console.error(`Erro na resposta:`, {
            url: `/products/${existingProduct.id}`,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          });
          throw error;
        }
      } else {
        console.log(`Enviando requisição para: /products`, {
          method: 'post',
          headers: woocommerceApi.defaults.headers,
          params: undefined
        });

        try {
          // Criar um objeto extremamente simplificado para evitar erros
          const simplifiedProduct = {
            name: wooProduct.name,
            regular_price: wooProduct.regular_price,
            description: wooProduct.description,
            sku: wooProduct.sku,
            images: wooProduct.images,
            type: 'simple',
            status: 'publish'
          };

          console.log('Enviando produto extremamente simplificado:', simplifiedProduct);

          response = await woocommerceApi.post('/products', simplifiedProduct);
          console.log(`Resposta recebida de: /products`, {
            status: response.status,
            statusText: response.statusText,
            dataSize: JSON.stringify(response.data).length
          });

          results.created++;
          results.details.push({
            id: product.id,
            woocommerce_id: response.data.id,
            status: 'created',
            name: product.description || product.name
          });
          console.log(`Produto criado: ${product.description || product.name}`);
        } catch (error) {
          console.error(`Erro na resposta:`, {
            url: '/products',
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          });
          throw error;
        }
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
    console.error('Erro ao obter produtos do WooCommerce:', error);

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
 * Atualizar estoque no WooCommerce
 * @param {Array} products - Array de produtos com estoque atualizado
 * @returns {Promise<Object>} Resultado da atualização
 */
export const updateWooCommerceStock = async (products) => {
  console.log(`Atualizando estoque de ${products.length} produtos no WooCommerce...`);

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
      const existingProducts = await woocommerceApi.get('/products', {
        params: {
          meta_key: '_pdv_vendas_id',
          meta_value: String(product.id)
        }
      });

      // Se o produto não existe, pular
      if (!existingProducts.data || existingProducts.data.length === 0) {
        console.log(`Produto com ID ${product.id} não encontrado no WooCommerce.`);
        results.failed++;
        results.details.push({
          id: product.id,
          status: 'not_found',
          message: 'Produto não encontrado no WooCommerce'
        });
        continue;
      }

      // Atualizar estoque do produto
      const wooProduct = existingProducts.data[0];
      const response = await woocommerceApi.put(`/products/${wooProduct.id}`, {
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

/**
 * Configurar webhooks no WooCommerce
 * @returns {Promise<Object>} Resultado da configuração
 */
export const setupWooCommerceWebhooks = async () => {
  console.log('Configurando webhooks do WooCommerce...');

  // Resultados da configuração
  const results = {
    success: true,
    created: 0,
    updated: 0,
    failed: 0,
    details: []
  };

  // Webhooks a serem configurados
  const webhooks = [
    {
      name: config.webhooks.product_updated.name,
      topic: config.webhooks.product_updated.topic,
      delivery_url: config.webhooks.product_updated.delivery_url
    },
    {
      name: config.webhooks.product_created.name,
      topic: config.webhooks.product_created.topic,
      delivery_url: config.webhooks.product_created.delivery_url
    },
    {
      name: config.webhooks.order_updated.name,
      topic: config.webhooks.order_updated.topic,
      delivery_url: config.webhooks.order_updated.delivery_url
    }
  ];

  // Obter webhooks existentes
  try {
    const existingWebhooks = await woocommerceApi.get('/webhooks');

    // Processar cada webhook
    for (const webhook of webhooks) {
      try {
        // Verificar se o webhook já existe
        const existingWebhook = existingWebhooks.data.find(w =>
          w.delivery_url === webhook.delivery_url && w.topic === webhook.topic
        );

        if (existingWebhook) {
          // Atualizar webhook existente
          await woocommerceApi.put(`/webhooks/${existingWebhook.id}`, {
            ...webhook,
            status: 'active'
          });

          results.updated++;
          results.details.push({
            name: webhook.name,
            topic: webhook.topic,
            delivery_url: webhook.delivery_url,
            status: 'updated'
          });

          console.log(`Webhook atualizado: ${webhook.name}`);
        } else {
          // Criar novo webhook
          const response = await woocommerceApi.post('/webhooks', {
            ...webhook,
            status: 'active'
          });

          results.created++;
          results.details.push({
            name: webhook.name,
            topic: webhook.topic,
            delivery_url: webhook.delivery_url,
            status: 'created',
            id: response.data.id
          });

          console.log(`Webhook criado: ${webhook.name}`);
        }
      } catch (error) {
        console.error(`Erro ao configurar webhook ${webhook.name}:`, error);
        results.failed++;
        results.details.push({
          name: webhook.name,
          topic: webhook.topic,
          delivery_url: webhook.delivery_url,
          status: 'failed',
          error: error.message
        });
      }
    }
  } catch (error) {
    console.error('Erro ao obter webhooks existentes:', error);
    results.success = false;
    return {
      success: false,
      message: 'Não foi possível obter webhooks existentes',
      error: error.message
    };
  }

  // Atualizar status de sucesso
  results.success = results.failed === 0;

  console.log(`Configuração de webhooks concluída: ${results.created} criados, ${results.updated} atualizados, ${results.failed} falhas`);
  return results;
};

// Exportar funções
export default {
  checkWooCommerceConnection,
  syncProductsToWooCommerce,
  getProductsFromWooCommerce,
  updateWooCommerceStock,
  setupWooCommerceWebhooks
};
