<?php
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
