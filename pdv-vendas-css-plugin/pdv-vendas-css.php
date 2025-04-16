<?php
/**
 * Plugin Name: PDV Vendas CSS
 * Plugin URI: https://achadinhoshopp.com.br/loja
 * Description: Adiciona estilos CSS personalizados para manter o mesmo layout do app PDV Vendas
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Adicionar estilos CSS personalizados
 */
function pdv_vendas_enqueue_styles() {
    // Registrar e enfileirar o CSS
    wp_register_style('pdv-vendas-css', false);
    wp_enqueue_style('pdv-vendas-css');
    
    // Adicionar o CSS inline
    wp_add_inline_style('pdv-vendas-css', pdv_vendas_get_custom_css());
}
add_action('wp_enqueue_scripts', 'pdv_vendas_enqueue_styles');

/**
 * Obter o CSS personalizado
 */
function pdv_vendas_get_custom_css() {
    return '
    /* Cores principais */
    :root {
        --pdv-primary: #3b82f6;
        --pdv-primary-hover: #2563eb;
        --pdv-secondary: #10b981;
        --pdv-secondary-hover: #059669;
        --pdv-danger: #ef4444;
        --pdv-danger-hover: #dc2626;
        --pdv-warning: #f59e0b;
        --pdv-warning-hover: #d97706;
        --pdv-info: #3b82f6;
        --pdv-info-hover: #2563eb;
        --pdv-light: #f3f4f6;
        --pdv-dark: #1f2937;
        --pdv-gray: #6b7280;
        --pdv-white: #ffffff;
    }

    /* Estilos gerais */
    body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        color: var(--pdv-dark);
        background-color: var(--pdv-light);
        line-height: 1.5;
    }

    /* Botões */
    .button,
    .woocommerce a.button,
    .woocommerce button.button,
    .woocommerce input.button,
    .woocommerce #respond input#submit {
        background-color: var(--pdv-primary);
        color: var(--pdv-white);
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-weight: 500;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
    }

    .button:hover,
    .woocommerce a.button:hover,
    .woocommerce button.button:hover,
    .woocommerce input.button:hover,
    .woocommerce #respond input#submit:hover {
        background-color: var(--pdv-primary-hover);
        color: var(--pdv-white);
    }

    /* Botão de adicionar ao carrinho */
    .woocommerce a.button.add_to_cart_button,
    .woocommerce button.button.alt {
        background-color: var(--pdv-secondary);
    }

    .woocommerce a.button.add_to_cart_button:hover,
    .woocommerce button.button.alt:hover {
        background-color: var(--pdv-secondary-hover);
    }

    /* Produtos */
    .woocommerce ul.products li.product,
    .woocommerce-page ul.products li.product {
        background-color: var(--pdv-white);
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .woocommerce ul.products li.product:hover,
    .woocommerce-page ul.products li.product:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .woocommerce ul.products li.product .woocommerce-loop-product__title,
    .woocommerce-page ul.products li.product .woocommerce-loop-product__title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--pdv-dark);
        padding-top: 0.5rem;
    }

    .woocommerce ul.products li.product .price,
    .woocommerce-page ul.products li.product .price {
        color: var(--pdv-secondary);
        font-weight: 700;
        font-size: 1.125rem;
    }

    /* Imagens de produto */
    .woocommerce ul.products li.product a img,
    .woocommerce-page ul.products li.product a img {
        border-radius: 0.375rem;
        margin-bottom: 0.75rem;
    }

    /* Página de produto único */
    .woocommerce div.product div.images img {
        border-radius: 0.5rem;
    }

    .woocommerce div.product .product_title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--pdv-dark);
    }

    .woocommerce div.product p.price,
    .woocommerce div.product span.price {
        color: var(--pdv-secondary);
        font-weight: 700;
        font-size: 1.5rem;
    }
    ';
}

/**
 * Adicionar link para o PDV Vendas no menu de administração
 */
function pdv_vendas_add_admin_menu() {
    add_menu_page(
        'PDV Vendas',
        'PDV Vendas',
        'manage_options',
        'pdv-vendas',
        'pdv_vendas_admin_page',
        'dashicons-store',
        30
    );
}
add_action('admin_menu', 'pdv_vendas_add_admin_menu');

/**
 * Exibir página de administração
 */
function pdv_vendas_admin_page() {
    ?>
    <div class="wrap">
        <h1>PDV Vendas</h1>
        <p>Este plugin adiciona estilos CSS personalizados para manter o mesmo layout do app PDV Vendas.</p>
        
        <h2>Instruções</h2>
        <p>Para integrar o PDV Vendas com o WooCommerce, siga estas etapas:</p>
        
        <ol>
            <li>Certifique-se de que o WooCommerce está configurado corretamente.</li>
            <li>Verifique se as chaves de API do WooCommerce estão configuradas corretamente:
                <ul>
                    <li>Consumer Key: <code>ck_d106765e36b9a6af0d22bd22571388ec3ad67378</code></li>
                    <li>Consumer Secret: <code>cs_0d5d0255c002e137d48be4da75d5d87363278bd6</code></li>
                </ul>
            </li>
            <li>No PDV Vendas, selecione os produtos que deseja exportar.</li>
            <li>Clique no botão <strong>Exportar para Site</strong>.</li>
            <li>Escolha o método <strong>WooCommerce</strong>.</li>
            <li>Clique em <strong>Sincronizar Produtos Selecionados</strong>.</li>
        </ol>
        
        <p>Os produtos selecionados serão enviados para o WooCommerce e aparecerão no site com o layout do PDV Vendas.</p>
    </div>
    <?php
}
