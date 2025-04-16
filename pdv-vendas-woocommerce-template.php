<?php
/**
 * Plugin Name: PDV Vendas WooCommerce Template
 * Plugin URI: https://achadinhoshopp.com.br/loja
 * Description: Template personalizado para o WooCommerce que mantém o mesmo layout do app PDV Vendas
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe principal do plugin
 */
class PDV_Vendas_WooCommerce_Template {
    /**
     * Construtor
     */
    public function __construct() {
        // Adicionar estilos CSS
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles'));
        
        // Adicionar suporte para produtos do PDV Vendas
        add_action('add_meta_boxes', array($this, 'add_product_meta_box'));
        add_action('save_post_product', array($this, 'save_product_meta'));
        
        // Personalizar a exibição de produtos
        add_action('woocommerce_before_shop_loop_item_title', array($this, 'custom_product_thumbnail'), 10);
        add_action('woocommerce_shop_loop_item_title', array($this, 'custom_product_title'), 10);
        add_action('woocommerce_after_shop_loop_item_title', array($this, 'custom_product_price'), 10);
        
        // Personalizar a página de produto único
        add_action('woocommerce_before_single_product_summary', array($this, 'custom_single_product_image'), 20);
        add_action('woocommerce_single_product_summary', array($this, 'custom_single_product_meta'), 40);
        
        // Adicionar informações do PDV Vendas na página do produto
        add_action('woocommerce_product_meta_end', array($this, 'display_pdv_vendas_info'));
    }
    
    /**
     * Adicionar estilos CSS
     */
    public function enqueue_styles() {
        wp_enqueue_style('pdv-vendas-template', plugin_dir_url(__FILE__) . 'pdv-vendas-template.css', array(), '1.0.0');
    }
    
    /**
     * Adicionar meta box para produtos do PDV Vendas
     */
    public function add_product_meta_box() {
        add_meta_box(
            'pdv_vendas_product_meta',
            'PDV Vendas',
            array($this, 'product_meta_box_callback'),
            'product',
            'side',
            'default'
        );
    }
    
    /**
     * Callback para exibir o meta box
     */
    public function product_meta_box_callback($post) {
        // Obter o ID do PDV Vendas
        $pdv_id = get_post_meta($post->ID, '_pdv_vendas_id', true);
        
        // Nonce para segurança
        wp_nonce_field('pdv_vendas_save_product_meta', 'pdv_vendas_meta_nonce');
        
        // Exibir campo para ID do PDV Vendas
        echo '<p>';
        echo '<label for="pdv_vendas_id">ID do PDV Vendas:</label>';
        echo '<input type="text" id="pdv_vendas_id" name="_pdv_vendas_id" value="' . esc_attr($pdv_id) . '" class="widefat">';
        echo '</p>';
        
        // Exibir informações adicionais
        echo '<p class="description">Este campo identifica o produto no sistema PDV Vendas.</p>';
    }
    
    /**
     * Salvar metadados do produto
     */
    public function save_product_meta($post_id) {
        // Verificar nonce
        if (!isset($_POST['pdv_vendas_meta_nonce']) || !wp_verify_nonce($_POST['pdv_vendas_meta_nonce'], 'pdv_vendas_save_product_meta')) {
            return;
        }
        
        // Verificar se é autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        // Verificar permissões
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Salvar ID do PDV Vendas
        if (isset($_POST['_pdv_vendas_id'])) {
            update_post_meta($post_id, '_pdv_vendas_id', sanitize_text_field($_POST['_pdv_vendas_id']));
        }
    }
    
    /**
     * Personalizar a exibição da miniatura do produto
     */
    public function custom_product_thumbnail() {
        global $product;
        
        // Adicionar classe personalizada
        echo '<div class="pdv-vendas-product-thumbnail">';
        woocommerce_template_loop_product_thumbnail();
        echo '</div>';
    }
    
    /**
     * Personalizar o título do produto
     */
    public function custom_product_title() {
        global $product;
        
        // Adicionar classe personalizada
        echo '<h2 class="pdv-vendas-product-title">';
        echo get_the_title();
        echo '</h2>';
    }
    
    /**
     * Personalizar o preço do produto
     */
    public function custom_product_price() {
        global $product;
        
        // Adicionar classe personalizada
        echo '<div class="pdv-vendas-product-price">';
        woocommerce_template_loop_price();
        echo '</div>';
    }
    
    /**
     * Personalizar a imagem do produto na página de produto único
     */
    public function custom_single_product_image() {
        global $product;
        
        // Adicionar classe personalizada
        echo '<div class="pdv-vendas-single-product-image">';
        woocommerce_show_product_images();
        echo '</div>';
    }
    
    /**
     * Personalizar os metadados do produto na página de produto único
     */
    public function custom_single_product_meta() {
        global $product;
        
        // Adicionar classe personalizada
        echo '<div class="pdv-vendas-single-product-meta">';
        woocommerce_template_single_meta();
        echo '</div>';
    }
    
    /**
     * Exibir informações do PDV Vendas na página do produto
     */
    public function display_pdv_vendas_info() {
        global $product;
        
        // Obter o ID do PDV Vendas
        $pdv_id = get_post_meta($product->get_id(), '_pdv_vendas_id', true);
        
        if ($pdv_id) {
            echo '<div class="pdv-vendas-info">';
            echo '<span class="pdv-vendas-label">PDV Vendas ID:</span> ';
            echo '<span class="pdv-vendas-value">' . esc_html($pdv_id) . '</span>';
            echo '</div>';
        }
    }
}

// Inicializar o plugin
new PDV_Vendas_WooCommerce_Template();

/**
 * Adicionar CSS personalizado
 */
function pdv_vendas_add_custom_css() {
    ?>
    <style type="text/css">
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
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            color: var(--pdv-dark);
            background-color: var(--pdv-light);
            line-height: 1.5;
        }

        /* Cabeçalho */
        .site-header {
            background-color: var(--pdv-white);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 1rem;
        }

        .site-title {
            font-weight: 700;
            font-size: 1.5rem;
            color: var(--pdv-primary);
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

        /* Classes personalizadas do PDV Vendas */
        .pdv-vendas-product-thumbnail img {
            border-radius: 0.375rem;
            transition: transform 0.2s;
        }

        .pdv-vendas-product-thumbnail img:hover {
            transform: scale(1.05);
        }

        .pdv-vendas-product-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--pdv-dark);
            margin-top: 0.5rem;
        }

        .pdv-vendas-product-price {
            color: var(--pdv-secondary);
            font-weight: 700;
            font-size: 1.125rem;
            margin-top: 0.25rem;
        }

        .pdv-vendas-info {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--pdv-light);
            font-size: 0.875rem;
            color: var(--pdv-gray);
        }

        .pdv-vendas-label {
            font-weight: 600;
        }

        .pdv-vendas-value {
            color: var(--pdv-primary);
        }
    </style>
    <?php
}
add_action('wp_head', 'pdv_vendas_add_custom_css');
