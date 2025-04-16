<?php
/**
 * Plugin Name: PDV Vendas Theme
 * Plugin URI: https://achadinhoshopp.com.br/loja
 * Description: Template personalizado para o WooCommerce que mantém o mesmo layout do app PDV Vendas
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja
 * Text Domain: pdv-vendas-theme
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * WC requires at least: 4.0
 * WC tested up to: 8.0
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe principal do plugin
 */
class PDV_Vendas_Theme {
    /**
     * Construtor
     */
    public function __construct() {
        // Definir constantes
        $this->define_constants();
        
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
     * Definir constantes
     */
    private function define_constants() {
        define('PDV_VENDAS_THEME_VERSION', '1.0.0');
        define('PDV_VENDAS_THEME_PATH', plugin_dir_path(__FILE__));
        define('PDV_VENDAS_THEME_URL', plugin_dir_url(__FILE__));
    }
    
    /**
     * Adicionar estilos CSS
     */
    public function enqueue_styles() {
        wp_enqueue_style('pdv-vendas-theme', PDV_VENDAS_THEME_URL . 'assets/css/style.css', array(), PDV_VENDAS_THEME_VERSION);
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
new PDV_Vendas_Theme();
