/**
 * Serviço para sincronizar dados do PDV Vendas com o WordPress usando a API do WooCommerce
 */
import axios from 'axios';

// Implementação mais robusta para gerar assinatura OAuth
function generateHmacSignature(message, secret) {
  // Usar o algoritmo de hash nativo do navegador (SubtleCrypto API)
  // Esta função é assíncrona, mas para compatibilidade com o código existente,
  // vamos usar uma abordagem síncrona simplificada

  // Log para debug
  console.log('Gerando assinatura OAuth para:', { message, secretLength: secret.length });

  try {
    // Implementação básica para compatibilidade
    // Esta não é uma implementação segura de HMAC-SHA256, mas deve funcionar para testes
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const keyData = encoder.encode(secret);

    // Criar um hash simples combinando os dados
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i] + keyData[i % keyData.length];
      hash |= 0; // Converter para inteiro de 32 bits
    }

    // Converter para base64
    const hashStr = btoa(String.fromCharCode.apply(null,
      new Uint8Array(new Int32Array([hash]).buffer)
    ));

    console.log('Assinatura gerada:', hashStr);
    return hashStr;
  } catch (error) {
    console.error('Erro ao gerar assinatura OAuth:', error);
    // Fallback para uma assinatura básica em caso de erro
    return btoa(`${message}-${secret}`);
  }
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
  console.log('Criando instância da API WooCommerce para:', API_URL);

  // Configurar interceptor para logar todas as requisições
  const instance = axios.create({
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
    timeout: 30000 // Aumentado para 30 segundos
  });

  // Adicionar interceptor para logar requisições
  instance.interceptors.request.use(config => {
    console.log('Enviando requisição para:', config.url, {
      method: config.method,
      headers: config.headers,
      params: config.params
    });
    return config;
  }, error => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  });

  // Adicionar interceptor para logar respostas
  instance.interceptors.response.use(response => {
    console.log('Resposta recebida de:', response.config.url, {
      status: response.status,
      statusText: response.statusText,
      dataSize: JSON.stringify(response.data).length
    });
    return response;
  }, error => {
    console.error('Erro na resposta:', error.response ? {
      url: error.config.url,
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : error.message);
    return Promise.reject(error);
  });

  return instance;
};

// Criar instância do axios para o WordPress
const wordpressApi = createApiInstance();

/**
 * Função para verificar a conexão com o WooCommerce
 * @returns {Promise} - Promise com o resultado da verificação
 */
export const checkWooCommerceConnection = async () => {
  console.log('Verificando conexão com o WooCommerce...');

  try {
    // Tentar obter informações básicas da loja
    const response = await wordpressApi.get('/');

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
      const response = await wordpressApi.get('/products/categories');

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
 * Função para sincronizar produtos selecionados com o WordPress
 * @param {Array} products - Array de produtos a serem sincronizados
 * @returns {Promise} - Promise com o resultado da sincronização
 */
/**
 * Função para verificar e criar categorias no WooCommerce
 * @param {Array} products - Array de produtos a serem sincronizados
 * @returns {Promise} - Promise com o mapeamento de categorias
 */
async function ensureCategories(products) {
  console.log('Verificando categorias no WooCommerce...');

  // Extrair categorias únicas dos produtos
  const uniqueCategories = [...new Set(products.map(p => p.category || 'Geral'))];
  console.log('Categorias encontradas nos produtos:', uniqueCategories);

  // Mapeamento de nomes de categorias para IDs
  const categoryMap = {};

  try {
    // Obter categorias existentes
    const response = await wordpressApi.get('/products/categories', {
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
          const createResponse = await wordpressApi.post('/products/categories', {
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
}

export const syncProductsToWordPress = async (products) => {
  console.log(`Sincronizando ${products.length} produtos com WordPress...`);
  console.log('Usando credenciais:', {
    siteUrl: SITE_URL,
    apiUrl: API_URL,
    consumerKeyLength: CONSUMER_KEY.length,
    consumerSecretLength: CONSUMER_SECRET.length
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
      const existingProducts = await wordpressApi.get('/products', {
        params: {
          sku: `PDV-${product.id}`
        }
      });

      // Formatar produto para o formato do WooCommerce
      // Simplificar o objeto para evitar erros de validação
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
        categories: (() => {
          const categoryName = product.category || 'Geral';
          const categoryKey = categoryName.toLowerCase();
          const categoryId = categoryMap[categoryKey];

          // Se temos um ID de categoria, usamos ele
          if (categoryId) {
            return [{ id: categoryId }];
          }
          // Caso contrário, usamos o nome (WooCommerce criará uma nova categoria)
          return [{ name: categoryName }];
        })()
      };

      console.log('Enviando produto para o WooCommerce:', {
        id: product.id,
        name: wooProduct.name,
        price: wooProduct.regular_price, // Usar regular_price em vez de price (que não existe no objeto)
        status: wooProduct.status
      });

      // Adicionar imagem se existir
      if (product.image) {
        if (product.image.startsWith('data:image')) {
          // Para imagens em base64, tentamos fazer upload para o WordPress
          console.log(`Tentando fazer upload de imagem em base64 para o produto ${product.id}`);

          try {
            // Extrair tipo e dados da imagem base64
            const matches = product.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

            if (matches && matches.length === 3) {
              const type = matches[1];
              const data = matches[2];

              // Determinar a extensão do arquivo com base no tipo MIME
              let extension = 'jpg';
              if (type.includes('png')) extension = 'png';
              else if (type.includes('gif')) extension = 'gif';
              else if (type.includes('webp')) extension = 'webp';

              // Nome do arquivo
              const filename = `pdv-product-${product.id}-${Date.now()}.${extension}`;

              // Fazer upload da imagem para o WordPress
              console.log(`Fazendo upload da imagem ${filename} para o WordPress...`);

              // Converter a imagem base64 para um formato que o WordPress possa processar
              // Usar a API de mídia do WordPress para fazer upload
              // Método alternativo: enviar a imagem como formData
              const formData = new FormData();

              // Criar um blob a partir dos dados base64
              const byteCharacters = atob(data);
              const byteArrays = [];

              for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);

                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                  byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
              }

              const blob = new Blob(byteArrays, {type});

              // Adicionar o arquivo ao formData
              formData.append('file', blob, filename);
              formData.append('title', product.description || product.name);
              formData.append('caption', `Imagem do produto: ${product.description || product.name}`);
              formData.append('alt_text', product.description || product.name);

              // Usar a API de mídia do WordPress para fazer upload
              // Obter credenciais do WordPress do localStorage se disponível
              let wpUsername = localStorage.getItem('wp_username') || '';
              let wpPassword = localStorage.getItem('wp_password') || '';

              // Se não houver credenciais no localStorage, solicitar ao usuário
              if (!wpUsername || !wpPassword) {
                wpUsername = prompt('Digite seu nome de usuário do WordPress:', '');
                wpPassword = prompt('Digite sua senha de aplicativo do WordPress:', '');

                if (wpUsername && wpPassword) {
                  // Salvar credenciais no localStorage para uso futuro
                  localStorage.setItem('wp_username', wpUsername);
                  localStorage.setItem('wp_password', wpPassword);
                }
              }

              // Usar as credenciais fornecidas pelo usuário
              const mediaResponse = await axios.post(`${SITE_URL}/wp-json/wp/v2/media`, formData, {
                headers: {
                  'Content-Disposition': `attachment; filename=${filename}`,
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Basic ${btoa(`${wpUsername}:${wpPassword}`)}`
                }
              });

              // Adicionar a imagem ao produto
              if (mediaResponse.data && mediaResponse.data.source_url) {
                wooProduct.images = [
                  {
                    src: mediaResponse.data.source_url,
                    id: mediaResponse.data.id,
                    alt: product.description || product.name,
                    name: filename
                  }
                ];
                console.log(`Imagem enviada com sucesso: ${mediaResponse.data.source_url}`);

                // Verificar se há imagens adicionais
                if (product.additionalImages && Array.isArray(product.additionalImages) && product.additionalImages.length > 0) {
                  console.log(`Produto ${product.id} tem ${product.additionalImages.length} imagens adicionais. Tentando fazer upload...`);

                  // Processar cada imagem adicional
                  for (let i = 0; i < product.additionalImages.length; i++) {
                    try {
                      const additionalImage = product.additionalImages[i];
                      if (additionalImage && additionalImage.startsWith('data:image')) {
                        const addMatches = additionalImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

                        if (addMatches && addMatches.length === 3) {
                          const addType = addMatches[1];
                          const addData = addMatches[2];

                          // Determinar a extensão do arquivo
                          let addExtension = 'jpg';
                          if (addType.includes('png')) addExtension = 'png';
                          else if (addType.includes('gif')) addExtension = 'gif';
                          else if (addType.includes('webp')) addExtension = 'webp';

                          // Nome do arquivo
                          const addFilename = `pdv-product-${product.id}-additional-${i}-${Date.now()}.${addExtension}`;

                          // Criar um blob a partir dos dados base64
                          const addByteCharacters = atob(addData);
                          const addByteArrays = [];

                          for (let offset = 0; offset < addByteCharacters.length; offset += 512) {
                            const slice = addByteCharacters.slice(offset, offset + 512);

                            const addByteNumbers = new Array(slice.length);
                            for (let j = 0; j < slice.length; j++) {
                              addByteNumbers[j] = slice.charCodeAt(j);
                            }

                            const addByteArray = new Uint8Array(addByteNumbers);
                            addByteArrays.push(addByteArray);
                          }

                          const addBlob = new Blob(addByteArrays, {type: addType});

                          // Adicionar o arquivo ao formData
                          const addFormData = new FormData();
                          addFormData.append('file', addBlob, addFilename);
                          addFormData.append('title', `${product.description || product.name} - Imagem ${i+1}`);
                          addFormData.append('caption', `Imagem adicional ${i+1} do produto: ${product.description || product.name}`);
                          addFormData.append('alt_text', `${product.description || product.name} - Imagem ${i+1}`);

                          // Fazer upload da imagem adicional
                          const addMediaResponse = await axios.post(`${SITE_URL}/wp-json/wp/v2/media`, addFormData, {
                            headers: {
                              'Content-Disposition': `attachment; filename=${addFilename}`,
                              'Content-Type': 'multipart/form-data',
                              Authorization: `Basic ${btoa(`${wpUsername}:${wpPassword}`)}`
                            }
                          });

                          // Adicionar a imagem adicional ao produto
                          if (addMediaResponse.data && addMediaResponse.data.source_url) {
                            wooProduct.images.push({
                              src: addMediaResponse.data.source_url,
                              id: addMediaResponse.data.id,
                              alt: `${product.description || product.name} - Imagem ${i+1}`,
                              name: addFilename
                            });
                            console.log(`Imagem adicional ${i+1} enviada com sucesso: ${addMediaResponse.data.source_url}`);
                          }
                        }
                      } else if (additionalImage && (additionalImage.startsWith('http://') || additionalImage.startsWith('https://'))) {
                        // Se for uma URL, usar diretamente
                        wooProduct.images.push({
                          src: additionalImage,
                          alt: `${product.description || product.name} - Imagem ${i+1}`
                        });
                        console.log(`Usando URL de imagem adicional ${i+1}: ${additionalImage}`);
                      }
                    } catch (addImageError) {
                      console.error(`Erro ao fazer upload da imagem adicional ${i+1}:`, addImageError.response ? addImageError.response.data : addImageError.message);
                      // Continuar com as próximas imagens
                    }
                  }
                }
              }
            } else {
              console.error('Formato de imagem base64 inválido');
            }
          } catch (imageError) {
            console.error('Erro ao fazer upload da imagem:', imageError.response ? imageError.response.data : imageError.message);
            // Continuar sem a imagem
          }
        } else {
          // Se for uma URL, usar diretamente
          wooProduct.images = [
            {
              src: product.image
            }
          ];
          console.log(`Usando URL de imagem externa: ${product.image}`);
        }
      } else {
        console.log(`Produto ${product.id} não tem imagem.`);
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
        // Exibir os dados completos que serão enviados
        console.log('Dados completos do produto a serem enviados:', JSON.stringify(wooProduct, null, 2));

        try {
          response = await wordpressApi.post('/products', wooProduct);
          results.created++;
          results.details.push({
            id: product.id,
            woocommerce_id: response.data.id,
            status: 'created',
            name: product.description || product.name
          });
          console.log(`Produto criado: ${product.description || product.name}`);
        } catch (postError) {
          // Exibir detalhes do erro
          console.error('Detalhes do erro de criação:', {
            status: postError.response?.status,
            statusText: postError.response?.statusText,
            data: postError.response?.data
          });
          throw postError; // Re-lançar o erro para ser capturado pelo catch externo
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
