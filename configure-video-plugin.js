/**
 * Script para configurar o plugin Product Video Gallery for WooCommerce
 * 
 * Este script utiliza a API REST do WordPress para configurar o plugin.
 */

const axios = require('axios');

// Configurações
const wpUrl = 'https://achadinhoshopp.com.br/loja';

// Credenciais WordPress
const credentials = {
  username: 'gloliverx',
  applicationPassword: '0lr4 umHb 8pfx 5Cqf v7KW oq8S'
};

// Configurações do plugin
const pluginSettings = {
  nickx_slider_layout: 'horizontal',
  nickx_slider_responsive: 'on',
  nickx_show_lightbox: 'on',
  nickx_show_zoom: 'on',
  nickx_show_thumb_arrow: 'on',
  nickx_show_gallery_arrow: 'on',
  nickx_arrow_bg_color: '#ffffff',
  nickx_arrow_color: '#6a90e2',
  nickx_gallery_width: '100',
  nickx_gallery_margin: '0',
  nickx_gallery_padding: '0',
  nickx_adaptive_height: 'on',
  nickx_autoplay: 'off',
  nickx_fade: 'off',
  nickx_hide_thumbnails: 'off',
  nickx_hide_thumbnail_mobile: 'off',
  nickx_show_only_product_page: 'on',
  nickx_swipe: 'on',
  nickx_zoom_on_mobile: 'off'
};

// Função para configurar o plugin
async function configureVideoPlugin() {
  console.log('Configurando o plugin Product Video Gallery for WooCommerce...');
  
  try {
    // Configurar autenticação
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString('base64');
    
    // Verificar se o plugin está ativo
    const pluginsResponse = await axios.get(
      `${wpUrl}/wp-json/wp/v2/plugins`,
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    
    const videoPlugin = pluginsResponse.data.find(plugin => 
      plugin.plugin.includes('product-video-gallery') && plugin.status === 'active'
    );
    
    if (!videoPlugin) {
      console.log('O plugin Product Video Gallery for WooCommerce não está ativo.');
      console.log('Por favor, ative o plugin antes de continuar.');
      return;
    }
    
    // Configurar o plugin usando a API de opções do WordPress
    for (const [key, value] of Object.entries(pluginSettings)) {
      await axios.post(
        `${wpUrl}/wp-json/wp/v2/settings`,
        { [key]: value },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`Configuração aplicada: ${key} = ${value}`);
    }
    
    console.log('Plugin configurado com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar o plugin:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Função para adicionar um vídeo de exemplo a um produto
async function addExampleVideo() {
  console.log('Adicionando vídeo de exemplo a um produto...');
  
  try {
    // Configurar autenticação
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString('base64');
    
    // Obter lista de produtos
    const productsResponse = await axios.get(
      `${wpUrl}/wp-json/wc/v3/products?per_page=1`,
      {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      }
    );
    
    if (productsResponse.data.length === 0) {
      console.log('Nenhum produto encontrado.');
      return;
    }
    
    const productId = productsResponse.data[0].id;
    
    // Adicionar vídeo ao produto
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Vídeo de exemplo
    
    await axios.post(
      `${wpUrl}/wp-json/wc/v3/products/${productId}`,
      {
        meta_data: [
          {
            key: 'nickx_product_video_url',
            value: videoUrl
          }
        ]
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`Vídeo adicionado com sucesso ao produto ID: ${productId}`);
  } catch (error) {
    console.error('Erro ao adicionar vídeo de exemplo:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Executar as funções em sequência
async function main() {
  await configureVideoPlugin();
  await addExampleVideo();
  console.log('Processo concluído!');
}

main();
