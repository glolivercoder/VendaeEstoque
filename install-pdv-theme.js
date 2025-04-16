/**
 * Script para instalar o tema PDV Vendas no WordPress
 * Este script envia o arquivo CSS para o WordPress e o configura como um tema personalizado
 */
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Configuração do WooCommerce
const config = {
  url: 'https://achadinhoshopp.com.br/loja',
  consumer_key: 'ck_d106765e36b9a6af0d22bd22571388ec3ad67378',
  consumer_secret: 'cs_0d5d0255c002e137d48be4da75d5d87363278bd6'
};

// Função para fazer upload do arquivo CSS
async function uploadThemeCSS() {
  try {
    console.log('Iniciando upload do tema PDV Vendas...');
    
    // Ler o arquivo CSS
    const cssContent = fs.readFileSync('pdv-vendas-theme.css', 'utf8');
    
    // Criar um arquivo PHP que inclui o CSS
    const phpContent = `<?php
/**
 * Plugin Name: PDV Vendas Theme
 * Plugin URI: https://achadinhoshopp.com.br/loja
 * Description: Tema personalizado para o PDV Vendas que mantém o mesmo layout do app
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja
 */

// Adicionar o CSS personalizado
function pdv_vendas_enqueue_styles() {
    wp_enqueue_style('pdv-vendas-theme', plugin_dir_url(__FILE__) . 'pdv-vendas-theme.css', array(), '1.0.0');
}
add_action('wp_enqueue_scripts', 'pdv_vendas_enqueue_styles');

// Adicionar suporte para produtos do PDV Vendas
function pdv_vendas_product_meta() {
    add_meta_box(
        'pdv_vendas_product_meta',
        'PDV Vendas',
        'pdv_vendas_product_meta_callback',
        'product',
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'pdv_vendas_product_meta');

// Callback para exibir o meta box
function pdv_vendas_product_meta_callback($post) {
    // Obter o ID do PDV Vendas
    $pdv_id = get_post_meta($post->ID, '_pdv_vendas_id', true);
    
    echo '<p><strong>ID do PDV Vendas:</strong> ' . ($pdv_id ? $pdv_id : 'Não definido') . '</p>';
}

// Salvar o ID do PDV Vendas
function pdv_vendas_save_product_meta($post_id) {
    if (isset($_POST['_pdv_vendas_id'])) {
        update_post_meta($post_id, '_pdv_vendas_id', sanitize_text_field($_POST['_pdv_vendas_id']));
    }
}
add_action('save_post_product', 'pdv_vendas_save_product_meta');
`;
    
    // Criar um arquivo ZIP com o plugin
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    
    // Adicionar os arquivos ao ZIP
    zip.addFile('pdv-vendas-theme/pdv-vendas-theme.php', Buffer.from(phpContent));
    zip.addFile('pdv-vendas-theme/pdv-vendas-theme.css', Buffer.from(cssContent));
    
    // Salvar o arquivo ZIP
    zip.writeZip('pdv-vendas-theme.zip');
    
    console.log('Arquivo ZIP criado com sucesso!');
    console.log('Para instalar o tema, siga estas etapas:');
    console.log('1. Faça login no painel de administração do WordPress');
    console.log('2. Vá para Plugins > Adicionar Novo > Enviar Plugin');
    console.log('3. Selecione o arquivo pdv-vendas-theme.zip');
    console.log('4. Clique em Instalar Agora');
    console.log('5. Ative o plugin');
    
    return true;
  } catch (error) {
    console.error('Erro ao criar o tema:', error);
    return false;
  }
}

// Executar o script
uploadThemeCSS();
