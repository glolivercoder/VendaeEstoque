<?php
/**
 * Script para criar uma página inicial com produtos no WooCommerce
 * 
 * Este script deve ser colocado na raiz do WordPress e executado uma vez.
 * Ele criará uma página "Loja" e a definirá como página inicial.
 */

// Carregar o WordPress
require_once('wp-load.php');

// Verificar se o usuário está logado e tem permissões
if (!current_user_can('manage_options')) {
    die('Você precisa estar logado como administrador para executar este script.');
}

echo '<h1>Configurando a Página Inicial do WooCommerce</h1>';

// Verificar se a página "Loja" já existe
$shop_page = get_page_by_title('Loja');

if (!$shop_page) {
    echo '<p>Criando página "Loja"...</p>';
    
    // Criar a página "Loja"
    $shop_page_id = wp_insert_post(array(
        'post_title'    => 'Loja',
        'post_content'  => '<!-- wp:shortcode -->[products limit="12" columns="4" orderby="date" order="DESC"]<!-- /wp:shortcode -->',
        'post_status'   => 'publish',
        'post_type'     => 'page',
    ));
    
    if (is_wp_error($shop_page_id)) {
        echo '<p>Erro ao criar a página "Loja": ' . $shop_page_id->get_error_message() . '</p>';
    } else {
        echo '<p>Página "Loja" criada com sucesso (ID: ' . $shop_page_id . ')</p>';
        
        // Definir a página como página inicial
        update_option('show_on_front', 'page');
        update_option('page_on_front', $shop_page_id);
        
        echo '<p>Página "Loja" definida como página inicial</p>';
    }
} else {
    echo '<p>A página "Loja" já existe (ID: ' . $shop_page->ID . ')</p>';
    
    // Verificar se a página já está definida como página inicial
    if (get_option('show_on_front') === 'page' && get_option('page_on_front') == $shop_page->ID) {
        echo '<p>A página "Loja" já está definida como página inicial</p>';
    } else {
        // Definir a página como página inicial
        update_option('show_on_front', 'page');
        update_option('page_on_front', $shop_page->ID);
        
        echo '<p>Página "Loja" definida como página inicial</p>';
    }
}

// Verificar configurações do WooCommerce
echo '<h2>Verificando configurações do WooCommerce</h2>';

// Verificar se o WooCommerce está ativo
if (!function_exists('WC')) {
    echo '<p>O WooCommerce não está ativo. Por favor, ative o plugin WooCommerce.</p>';
} else {
    echo '<p>WooCommerce está ativo.</p>';
    
    // Verificar se a página da loja está configurada
    $wc_shop_page_id = wc_get_page_id('shop');
    if ($wc_shop_page_id > 0) {
        echo '<p>Página da loja do WooCommerce configurada (ID: ' . $wc_shop_page_id . ')</p>';
    } else {
        echo '<p>Página da loja do WooCommerce não configurada. Por favor, configure-a em WooCommerce > Configurações > Produtos > Exibição.</p>';
    }
    
    // Verificar se existem produtos
    $products_count = wp_count_posts('product')->publish;
    echo '<p>Número de produtos publicados: ' . $products_count . '</p>';
    
    if ($products_count === 0) {
        echo '<p>Não há produtos publicados. Por favor, adicione alguns produtos.</p>';
    }
}

echo '<h2>Próximos Passos</h2>';
echo '<ol>';
echo '<li>Verifique se a página inicial está exibindo produtos</li>';
echo '<li>Personalize o tema para ficar parecido com o app PDV Vendas</li>';
echo '<li>Configure o menu principal</li>';
echo '<li>Configure os widgets</li>';
echo '</ol>';

echo '<p><a href="' . home_url() . '">Visitar o site</a> | <a href="' . admin_url() . '">Voltar para o painel</a></p>';

// Remover este script por segurança
echo '<p>Por segurança, este script será excluído automaticamente após a execução.</p>';
@unlink(__FILE__);
