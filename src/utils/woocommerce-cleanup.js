/**
 * Utilitário para limpar produtos na lixeira do WooCommerce
 * Este script pode ser executado para limpar produtos na lixeira que podem estar causando conflitos
 */
import axios from 'axios';

// Obter credenciais do arquivo .env ou usar valores padrão
const {
  // URL base da API do WooCommerce
  VITE_WORDPRESS_URL: SITE_URL = 'https://achadinhoshopp.com.br/loja',
  // Chaves da API do WooCommerce
  VITE_WOOCOMMERCE_CONSUMER_KEY: CONSUMER_KEY = 'ck_40b4a1a674084d504579a2ba2d51530c260d3645',
  VITE_WOOCOMMERCE_CONSUMER_SECRET: CONSUMER_SECRET = 'cs_8fa4b36ab57ddb02415e4fc346451791ab1782f9'
} = import.meta.env;

// URL base da API do WooCommerce
const API_URL = `${SITE_URL}/wp-json/wc/v3`;

// Criar instância do axios para o WooCommerce
const woocommerceApi = axios.create({
  baseURL: API_URL,
  auth: {
    username: CONSUMER_KEY,
    password: CONSUMER_SECRET
  }
});

/**
 * Limpar produtos na lixeira do WooCommerce
 * @returns {Promise<Object>} - Resultado da limpeza
 */
export const cleanupTrashProducts = async () => {
  console.log('Buscando produtos na lixeira do WooCommerce...');
  
  try {
    // Buscar produtos na lixeira
    const response = await woocommerceApi.get('/products', {
      params: {
        status: 'trash',
        per_page: 100 // Máximo permitido pela API
      }
    });
    
    const trashProducts = response.data;
    console.log(`Encontrados ${trashProducts.length} produtos na lixeira.`);
    
    if (trashProducts.length === 0) {
      return {
        success: true,
        message: 'Nenhum produto na lixeira para limpar.',
        count: 0
      };
    }
    
    // Excluir permanentemente cada produto na lixeira
    const results = {
      success: true,
      count: 0,
      failed: 0,
      details: []
    };
    
    for (const product of trashProducts) {
      try {
        console.log(`Excluindo permanentemente o produto ${product.id} (${product.name})...`);
        
        // Excluir permanentemente o produto
        await woocommerceApi.delete(`/products/${product.id}`, {
          params: {
            force: true
          }
        });
        
        results.count++;
        results.details.push({
          id: product.id,
          name: product.name,
          status: 'deleted'
        });
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
    
    console.log(`Limpeza concluída: ${results.count} produtos excluídos permanentemente, ${results.failed} falhas`);
    return results;
  } catch (error) {
    console.error('Erro ao limpar produtos na lixeira:', error);
    throw new Error(`Não foi possível limpar os produtos na lixeira: ${error.message}`);
  }
};

/**
 * Limpar metadados órfãos de produtos do PDV Vendas
 * @returns {Promise<Object>} - Resultado da limpeza
 */
export const cleanupOrphanedMetadata = async () => {
  console.log('Esta função requer acesso direto ao banco de dados do WordPress.');
  console.log('Por favor, execute o seguinte SQL no phpMyAdmin ou outro cliente SQL:');
  console.log(`
    DELETE FROM wp_postmeta 
    WHERE meta_key = '_pdv_vendas_id' 
    AND post_id NOT IN (SELECT ID FROM wp_posts WHERE post_type = 'product');
  `);
  
  return {
    success: true,
    message: 'Instruções para limpeza de metadados órfãos fornecidas.',
    requiresManualAction: true
  };
};

export default {
  cleanupTrashProducts,
  cleanupOrphanedMetadata
};
