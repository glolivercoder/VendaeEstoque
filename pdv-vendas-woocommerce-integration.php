<?php
/**
 * Plugin Name: PDV Vendas WooCommerce Integration
 * Plugin URI: https://achadinhoshopp.com.br/loja/
 * Description: Integração personalizada entre PDV Vendas e WooCommerce, incluindo melhorias visuais e funcionais.
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja/
 * Text Domain: pdv-vendas-woocommerce
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 */

// Impedir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe principal do plugin
 */
class PDV_Vendas_WooCommerce_Integration {
    
    /**
     * Construtor
     */
    public function __construct() {
        // Adicionar estilos e scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_styles_scripts'));
        
        // Adicionar suporte para upload de imagens base64
        add_action('rest_api_init', array($this, 'register_base64_upload_route'));
        
        // Melhorar a exibição de produtos
        add_action('woocommerce_before_shop_loop', array($this, 'add_shop_header'), 5);
        add_action('woocommerce_before_main_content', array($this, 'add_shop_banner'), 10);
        
        // Adicionar campos personalizados para produtos
        add_action('woocommerce_product_options_general_product_data', array($this, 'add_custom_product_fields'));
        add_action('woocommerce_process_product_meta', array($this, 'save_custom_product_fields'));
        
        // Adicionar informações do PDV Vendas na página do produto
        add_action('woocommerce_single_product_summary', array($this, 'add_pdv_vendas_info'), 25);
        
        // Adicionar suporte para múltiplas imagens
        add_filter('woocommerce_product_gallery_attachment_ids', array($this, 'handle_multiple_images'), 10, 2);
        
        // Melhorar a exibição de imagens
        add_filter('woocommerce_placeholder_img_src', array($this, 'custom_placeholder_image'));
        
        // Adicionar footer personalizado
        add_action('wp_footer', array($this, 'add_custom_footer'));
    }
    
    /**
     * Registrar estilos e scripts
     */
    public function enqueue_styles_scripts() {
        // Registrar e enfileirar o CSS personalizado
        wp_register_style(
            'pdv-vendas-woocommerce-style',
            plugin_dir_url(__FILE__) . 'pdv-vendas-woocommerce-style.css',
            array(),
            '1.0.0'
        );
        wp_enqueue_style('pdv-vendas-woocommerce-style');
        
        // Registrar e enfileirar o JavaScript personalizado
        wp_register_script(
            'pdv-vendas-woocommerce-script',
            plugin_dir_url(__FILE__) . 'pdv-vendas-woocommerce-script.js',
            array('jquery'),
            '1.0.0',
            true
        );
        wp_enqueue_script('pdv-vendas-woocommerce-script');
    }
    
    /**
     * Registrar rota da API para upload de imagens base64
     */
    public function register_base64_upload_route() {
        register_rest_route('pdv-vendas/v1', '/upload-base64', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_base64_upload'),
            'permission_callback' => function () {
                return current_user_can('upload_files');
            }
        ));
    }
    
    /**
     * Manipular upload de imagens base64
     */
    public function handle_base64_upload($request) {
        // Obter parâmetros
        $base64_string = $request->get_param('image');
        $title = $request->get_param('title');
        $product_id = $request->get_param('product_id');
        
        // Verificar se a string base64 foi fornecida
        if (empty($base64_string)) {
            return new WP_Error('missing_image', 'A imagem base64 é obrigatória', array('status' => 400));
        }
        
        // Extrair tipo e dados da imagem base64
        $matches = array();
        preg_match('/^data:([A-Za-z-+\/]+);base64,(.+)$/', $base64_string, $matches);
        
        if (count($matches) !== 3) {
            return new WP_Error('invalid_image', 'Formato de imagem base64 inválido', array('status' => 400));
        }
        
        $mime_type = $matches[1];
        $base64_data = $matches[2];
        $decoded_data = base64_decode($base64_data);
        
        // Determinar a extensão do arquivo com base no tipo MIME
        $extension = 'jpg';
        if (strpos($mime_type, 'png') !== false) $extension = 'png';
        else if (strpos($mime_type, 'gif') !== false) $extension = 'gif';
        else if (strpos($mime_type, 'webp') !== false) $extension = 'webp';
        
        // Nome do arquivo
        $filename = 'pdv-product-' . ($product_id ? $product_id : uniqid()) . '-' . time() . '.' . $extension;
        
        // Obter diretório de upload do WordPress
        $upload_dir = wp_upload_dir();
        $upload_path = $upload_dir['path'] . '/' . $filename;
        $upload_url = $upload_dir['url'] . '/' . $filename;
        
        // Salvar o arquivo
        file_put_contents($upload_path, $decoded_data);
        
        // Preparar dados para a biblioteca de mídia do WordPress
        $attachment = array(
            'post_mime_type' => $mime_type,
            'post_title' => $title ? $title : $filename,
            'post_content' => '',
            'post_status' => 'inherit'
        );
        
        // Inserir o anexo no WordPress
        $attachment_id = wp_insert_attachment($attachment, $upload_path);
        
        // Gerar metadados para o anexo
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload_path);
        wp_update_attachment_metadata($attachment_id, $attachment_data);
        
        // Se um ID de produto foi fornecido, definir a imagem como imagem destacada
        if ($product_id) {
            set_post_thumbnail($product_id, $attachment_id);
            
            // Adicionar à galeria de imagens do produto
            $gallery_ids = get_post_meta($product_id, '_product_image_gallery', true);
            $gallery_ids = $gallery_ids ? $gallery_ids . ',' . $attachment_id : $attachment_id;
            update_post_meta($product_id, '_product_image_gallery', $gallery_ids);
        }
        
        // Retornar resposta
        return array(
            'success' => true,
            'attachment_id' => $attachment_id,
            'url' => $upload_url
        );
    }
    
    /**
     * Adicionar cabeçalho personalizado à página da loja
     */
    public function add_shop_header() {
        // Verificar se estamos na página principal da loja
        if (!is_shop() && !is_product_category()) {
            return;
        }
        
        // Adicionar título personalizado
        echo '<div class="pdv-shop-header">';
        echo '<h1 class="pdv-shop-title">Loja Achadinho Shopp</h1>';
        echo '<p class="pdv-shop-description">Produtos selecionados com o melhor preço e qualidade</p>';
        echo '</div>';
    }
    
    /**
     * Adicionar banner à página da loja
     */
    public function add_shop_banner() {
        // Verificar se estamos na página principal da loja
        if (!is_shop()) {
            return;
        }
        
        // Adicionar banner
        echo '<div class="pdv-main-banner">';
        echo '<img src="' . plugin_dir_url(__FILE__) . 'banner.jpg" alt="Loja Achadinho Shopp" />';
        echo '</div>';
        
        // Adicionar categorias em destaque
        $categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => true,
            'number' => 6
        ));
        
        if (!empty($categories) && !is_wp_error($categories)) {
            echo '<div class="pdv-featured-categories">';
            
            foreach ($categories as $category) {
                $thumbnail_id = get_term_meta($category->term_id, 'thumbnail_id', true);
                $image = $thumbnail_id ? wp_get_attachment_url($thumbnail_id) : wc_placeholder_img_src();
                
                echo '<a href="' . get_term_link($category) . '" class="pdv-category-card">';
                echo '<img src="' . $image . '" alt="' . $category->name . '" />';
                echo '<h4>' . $category->name . '</h4>';
                echo '</a>';
            }
            
            echo '</div>';
        }
        
        // Adicionar título para produtos em destaque
        echo '<h2 class="pdv-featured-products-title">Produtos em Destaque</h2>';
    }
    
    /**
     * Adicionar campos personalizados para produtos
     */
    public function add_custom_product_fields() {
        global $woocommerce, $post;
        
        echo '<div class="options_group">';
        
        // Campo para ID do produto no PDV Vendas
        woocommerce_wp_text_input(array(
            'id' => '_pdv_vendas_product_id',
            'label' => 'ID do Produto no PDV Vendas',
            'desc_tip' => true,
            'description' => 'ID único do produto no sistema PDV Vendas'
        ));
        
        // Campo para código de barras
        woocommerce_wp_text_input(array(
            'id' => '_pdv_vendas_barcode',
            'label' => 'Código de Barras',
            'desc_tip' => true,
            'description' => 'Código de barras do produto'
        ));
        
        // Campo para fornecedor
        woocommerce_wp_text_input(array(
            'id' => '_pdv_vendas_supplier',
            'label' => 'Fornecedor',
            'desc_tip' => true,
            'description' => 'Nome do fornecedor do produto'
        ));
        
        echo '</div>';
    }
    
    /**
     * Salvar campos personalizados
     */
    public function save_custom_product_fields($post_id) {
        // Salvar ID do produto no PDV Vendas
        $pdv_vendas_product_id = isset($_POST['_pdv_vendas_product_id']) ? sanitize_text_field($_POST['_pdv_vendas_product_id']) : '';
        update_post_meta($post_id, '_pdv_vendas_product_id', $pdv_vendas_product_id);
        
        // Salvar código de barras
        $pdv_vendas_barcode = isset($_POST['_pdv_vendas_barcode']) ? sanitize_text_field($_POST['_pdv_vendas_barcode']) : '';
        update_post_meta($post_id, '_pdv_vendas_barcode', $pdv_vendas_barcode);
        
        // Salvar fornecedor
        $pdv_vendas_supplier = isset($_POST['_pdv_vendas_supplier']) ? sanitize_text_field($_POST['_pdv_vendas_supplier']) : '';
        update_post_meta($post_id, '_pdv_vendas_supplier', $pdv_vendas_supplier);
    }
    
    /**
     * Adicionar informações do PDV Vendas na página do produto
     */
    public function add_pdv_vendas_info() {
        global $product;
        
        // Obter dados personalizados
        $pdv_vendas_barcode = get_post_meta($product->get_id(), '_pdv_vendas_barcode', true);
        $pdv_vendas_supplier = get_post_meta($product->get_id(), '_pdv_vendas_supplier', true);
        
        // Exibir informações, se disponíveis
        if ($pdv_vendas_barcode || $pdv_vendas_supplier) {
            echo '<div class="pdv-vendas-product-info">';
            
            if ($pdv_vendas_barcode) {
                echo '<p class="pdv-vendas-barcode"><strong>Código de Barras:</strong> ' . esc_html($pdv_vendas_barcode) . '</p>';
            }
            
            if ($pdv_vendas_supplier) {
                echo '<p class="pdv-vendas-supplier"><strong>Fornecedor:</strong> ' . esc_html($pdv_vendas_supplier) . '</p>';
            }
            
            echo '</div>';
        }
    }
    
    /**
     * Manipular múltiplas imagens
     */
    public function handle_multiple_images($attachment_ids, $product) {
        // Verificar se há um ID de produto do PDV Vendas
        $pdv_vendas_product_id = get_post_meta($product->get_id(), '_pdv_vendas_product_id', true);
        
        if (!$pdv_vendas_product_id) {
            return $attachment_ids;
        }
        
        // Aqui você poderia implementar lógica adicional para buscar imagens do PDV Vendas
        // Por enquanto, apenas retornamos os IDs existentes
        return $attachment_ids;
    }
    
    /**
     * Personalizar imagem placeholder
     */
    public function custom_placeholder_image($src) {
        // Você pode substituir por uma imagem placeholder personalizada
        return $src;
    }
    
    /**
     * Adicionar footer personalizado
     */
    public function add_custom_footer() {
        // Verificar se estamos em uma página do WooCommerce
        if (!is_woocommerce() && !is_cart() && !is_checkout() && !is_account_page()) {
            return;
        }
        
        // Adicionar botão "Voltar ao topo"
        echo '<a href="#" class="pdv-back-to-top">↑</a>';
        
        // Adicionar script para detectar quando o botão deve ser exibido
        echo '<script>
            document.addEventListener("DOMContentLoaded", function() {
                var backToTopButton = document.querySelector(".pdv-back-to-top");
                
                window.addEventListener("scroll", function() {
                    if (window.pageYOffset > 300) {
                        backToTopButton.classList.add("visible");
                    } else {
                        backToTopButton.classList.remove("visible");
                    }
                });
                
                backToTopButton.addEventListener("click", function(e) {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                });
            });
        </script>';
    }
}

// Iniciar o plugin
new PDV_Vendas_WooCommerce_Integration();
