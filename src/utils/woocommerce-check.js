/**
 * Utilitário para verificar a configuração do WooCommerce
 * Este script pode ser executado para verificar se o WooCommerce está configurado corretamente
 * para exibir os produtos na loja.
 */
import axios from 'axios';

// Obter credenciais do arquivo .env ou usar valores padrão
const {
  // URL base da API do WooCommerce
  VITE_WORDPRESS_URL: SITE_URL = 'https://achadinhoshopp.com.br/loja',
  // Chaves da API do WooCommerce
  VITE_WOOCOMMERCE_CONSUMER_KEY: CONSUMER_KEY = 'ck_a117i65gmQYOokVzyA8QRLSw',
  VITE_WOOCOMMERCE_CONSUMER_SECRET: CONSUMER_SECRET = 'cs_a117i65gmQYOokVzyA8QRLSw'
} = import.meta.env;

// URL base da API do WooCommerce
const API_URL = `${SITE_URL}/wp-json/wc/v3`;

/**
 * Verificar a configuração do WooCommerce
 */
export async function checkWooCommerceConfig() {
  console.log('Verificando configuração do WooCommerce...');
  
  const results = {
    success: true,
    issues: [],
    recommendations: []
  };
  
  try {
    // 1. Verificar conexão com a API
    console.log('Verificando conexão com a API do WooCommerce...');
    
    try {
      const response = await axios.get(`${API_URL}/products`, {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        }
      });
      
      console.log(`Conexão com a API estabelecida. ${response.data.length} produtos encontrados.`);
    } catch (error) {
      results.success = false;
      results.issues.push({
        type: 'api_connection',
        message: 'Não foi possível conectar à API do WooCommerce',
        details: error.response ? error.response.data : error.message
      });
      
      results.recommendations.push(
        'Verifique se as credenciais da API estão corretas no arquivo .env',
        'Verifique se o WooCommerce está ativado no WordPress',
        'Verifique se a API REST do WooCommerce está habilitada'
      );
    }
    
    // 2. Verificar configurações de visibilidade de produtos
    console.log('Verificando configurações de visibilidade de produtos...');
    
    try {
      const settingsResponse = await axios.get(`${API_URL}/settings/products`, {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        }
      });
      
      const settings = settingsResponse.data;
      
      // Verificar configurações relevantes
      const catalogVisibilitySetting = settings.find(s => s.id === 'woocommerce_catalog_visibility');
      if (catalogVisibilitySetting && catalogVisibilitySetting.value !== 'visible') {
        results.issues.push({
          type: 'catalog_visibility',
          message: 'A visibilidade do catálogo não está configurada como "Mostrar produtos e preços"',
          details: catalogVisibilitySetting
        });
        
        results.recommendations.push(
          'Acesse WooCommerce > Configurações > Produtos > Geral e defina "Visibilidade do catálogo" como "Mostrar produtos e preços"'
        );
      }
      
      console.log('Configurações de visibilidade verificadas.');
    } catch (error) {
      results.issues.push({
        type: 'settings_check',
        message: 'Não foi possível verificar as configurações de produtos',
        details: error.response ? error.response.data : error.message
      });
    }
    
    // 3. Verificar produtos do PDV Vendas
    console.log('Verificando produtos do PDV Vendas...');
    
    try {
      const productsResponse = await axios.get(`${API_URL}/products`, {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        },
        params: {
          per_page: 100
        }
      });
      
      const products = productsResponse.data;
      
      // Filtrar produtos do PDV Vendas
      const pdvProducts = products.filter(product => {
        return product.meta_data && product.meta_data.some(meta => meta.key === '_pdv_vendas_id');
      });
      
      console.log(`Encontrados ${pdvProducts.length} produtos do PDV Vendas no WooCommerce.`);
      
      // Verificar status dos produtos
      const draftProducts = pdvProducts.filter(p => p.status !== 'publish');
      if (draftProducts.length > 0) {
        results.issues.push({
          type: 'product_status',
          message: `${draftProducts.length} produtos do PDV Vendas não estão publicados`,
          details: draftProducts.map(p => ({ id: p.id, name: p.name, status: p.status }))
        });
        
        results.recommendations.push(
          'Acesse o painel do WordPress e publique os produtos manualmente',
          'Verifique se o código de sincronização está definindo o status como "publish"'
        );
      }
      
      // Verificar visibilidade dos produtos
      const hiddenProducts = pdvProducts.filter(p => p.catalog_visibility !== 'visible');
      if (hiddenProducts.length > 0) {
        results.issues.push({
          type: 'product_visibility',
          message: `${hiddenProducts.length} produtos do PDV Vendas não estão visíveis no catálogo`,
          details: hiddenProducts.map(p => ({ id: p.id, name: p.name, visibility: p.catalog_visibility }))
        });
        
        results.recommendations.push(
          'Acesse o painel do WordPress e defina a visibilidade dos produtos como "visível"',
          'Verifique se o código de sincronização está definindo catalog_visibility como "visible"'
        );
      }
    } catch (error) {
      results.issues.push({
        type: 'products_check',
        message: 'Não foi possível verificar os produtos',
        details: error.response ? error.response.data : error.message
      });
    }
    
    // 4. Verificar configurações de permalinks
    console.log('Verificando configurações de permalinks...');
    
    try {
      const permalinksResponse = await axios.get(`${SITE_URL}/wp-json/wp/v2/settings`, {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        }
      });
      
      const permalinks = permalinksResponse.data;
      
      if (permalinks.permalink_structure === '') {
        results.issues.push({
          type: 'permalinks',
          message: 'A estrutura de permalinks está configurada como "Simples"',
          details: permalinks
        });
        
        results.recommendations.push(
          'Acesse Configurações > Links Permanentes e escolha uma estrutura diferente de "Simples"'
        );
      }
    } catch (error) {
      // Ignorar erros de permalinks, pois pode não ter permissão para acessar
      console.log('Não foi possível verificar as configurações de permalinks.');
    }
    
    // 5. Verificar tema
    console.log('Verificando tema...');
    
    try {
      const themeResponse = await axios.get(`${SITE_URL}/wp-json/wp/v2/themes`, {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        }
      });
      
      const themes = themeResponse.data;
      const activeTheme = Object.values(themes).find(theme => theme.status === 'active');
      
      if (activeTheme) {
        console.log(`Tema ativo: ${activeTheme.name}`);
        
        // Verificar se o tema é compatível com WooCommerce
        if (!activeTheme.tags || !activeTheme.tags.includes('woocommerce')) {
          results.issues.push({
            type: 'theme_compatibility',
            message: 'O tema ativo pode não ser totalmente compatível com o WooCommerce',
            details: activeTheme
          });
          
          results.recommendations.push(
            'Considere usar um tema compatível com WooCommerce, como Storefront, Astra ou OceanWP'
          );
        }
      }
    } catch (error) {
      // Ignorar erros de tema, pois pode não ter permissão para acessar
      console.log('Não foi possível verificar o tema.');
    }
    
    // Resultado final
    if (results.issues.length === 0) {
      console.log('Nenhum problema encontrado na configuração do WooCommerce!');
      results.recommendations.push(
        'A configuração do WooCommerce parece estar correta. Se os produtos ainda não estiverem aparecendo, verifique o cache do site.'
      );
    } else {
      console.log(`Encontrados ${results.issues.length} problemas na configuração do WooCommerce.`);
      results.success = false;
    }
    
    return results;
  } catch (error) {
    console.error('Erro ao verificar configuração do WooCommerce:', error);
    
    return {
      success: false,
      issues: [
        {
          type: 'general_error',
          message: 'Erro geral ao verificar configuração do WooCommerce',
          details: error.message
        }
      ],
      recommendations: [
        'Verifique se o WordPress e o WooCommerce estão instalados e ativos',
        'Verifique se o site está acessível',
        'Verifique as credenciais da API no arquivo .env'
      ]
    };
  }
}

// Exportar função para uso em componentes
export default checkWooCommerceConfig;
