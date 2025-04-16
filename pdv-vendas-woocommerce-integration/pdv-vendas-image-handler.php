<?php
/**
 * Plugin Name: PDV Vendas Image Handler
 * Plugin URI: https://achadinhoshopp.com.br/loja/
 * Description: Melhora o tratamento de imagens para produtos sincronizados do PDV Vendas.
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja/
 * Text Domain: pdv-vendas-image-handler
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
class PDV_Vendas_Image_Handler {
    
    /**
     * Construtor
     */
    public function __construct() {
        // Registrar rota da API para upload de imagens base64
        add_action('rest_api_init', array($this, 'register_api_routes'));
        
        // Melhorar a exibição de imagens
        add_filter('woocommerce_product_get_image', array($this, 'enhance_product_image'), 10, 2);
        add_filter('woocommerce_single_product_image_thumbnail_html', array($this, 'enhance_product_gallery_image'), 10, 2);
        
        // Adicionar suporte para múltiplas imagens
        add_filter('woocommerce_product_gallery_attachment_ids', array($this, 'handle_multiple_images'), 10, 2);
        
        // Adicionar suporte para upload de imagens base64 via API REST do WooCommerce
        add_filter('woocommerce_rest_prepare_product', array($this, 'prepare_product_images'), 10, 3);
        add_filter('woocommerce_rest_pre_insert_product', array($this, 'process_product_images'), 10, 2);
        
        // Adicionar suporte para regeneração de imagens
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'handle_regenerate_images'));
    }
    
    /**
     * Registrar rotas da API
     */
    public function register_api_routes() {
        register_rest_route('pdv-vendas/v1', '/upload-image', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_image_upload'),
            'permission_callback' => function () {
                return current_user_can('upload_files');
            }
        ));
        
        register_rest_route('pdv-vendas/v1', '/upload-base64', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_base64_upload'),
            'permission_callback' => function () {
                return current_user_can('upload_files');
            }
        ));
    }
    
    /**
     * Manipular upload de imagens
     */
    public function handle_image_upload($request) {
        $files = $request->get_file_params();
        
        if (empty($files['file'])) {
            return new WP_Error('no_image', 'Nenhuma imagem enviada', array('status' => 400));
        }
        
        $file = $files['file'];
        $product_id = $request->get_param('product_id');
        $title = $request->get_param('title');
        
        // Verificar se o arquivo é uma imagem
        $file_type = wp_check_filetype_and_ext($file['tmp_name'], $file['name']);
        
        if (!$file_type['type']) {
            return new WP_Error('invalid_image', 'Arquivo não é uma imagem válida', array('status' => 400));
        }
        
        // Fazer upload da imagem
        $upload = wp_handle_upload($file, array('test_form' => false));
        
        if (isset($upload['error'])) {
            return new WP_Error('upload_error', $upload['error'], array('status' => 500));
        }
        
        // Preparar dados para a biblioteca de mídia do WordPress
        $attachment = array(
            'post_mime_type' => $upload['type'],
            'post_title' => $title ? $title : preg_replace('/\.[^.]+$/', '', basename($file['name'])),
            'post_content' => '',
            'post_status' => 'inherit'
        );
        
        // Inserir o anexo no WordPress
        $attachment_id = wp_insert_attachment($attachment, $upload['file']);
        
        if (is_wp_error($attachment_id)) {
            return $attachment_id;
        }
        
        // Gerar metadados para o anexo
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
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
            'url' => wp_get_attachment_url($attachment_id)
        );
    }
    
    /**
     * Manipular upload de imagens base64
     */
    public function handle_base64_upload($request) {
        // Obter parâmetros
        $base64_string = $request->get_param('image');
        $title = $request->get_param('title');
        $product_id = $request->get_param('product_id');
        $is_additional = $request->get_param('is_additional');
        
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
        if ($is_additional) {
            $filename = 'pdv-product-' . ($product_id ? $product_id : uniqid()) . '-additional-' . time() . '.' . $extension;
        }
        
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
        
        if (is_wp_error($attachment_id)) {
            return $attachment_id;
        }
        
        // Gerar metadados para o anexo
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload_path);
        wp_update_attachment_metadata($attachment_id, $attachment_data);
        
        // Se um ID de produto foi fornecido, definir a imagem como imagem destacada ou adicionar à galeria
        if ($product_id) {
            if ($is_additional) {
                // Adicionar à galeria de imagens do produto
                $gallery_ids = get_post_meta($product_id, '_product_image_gallery', true);
                $gallery_ids = $gallery_ids ? $gallery_ids . ',' . $attachment_id : $attachment_id;
                update_post_meta($product_id, '_product_image_gallery', $gallery_ids);
            } else {
                // Definir como imagem destacada
                set_post_thumbnail($product_id, $attachment_id);
            }
        }
        
        // Retornar resposta
        return array(
            'success' => true,
            'attachment_id' => $attachment_id,
            'url' => $upload_url
        );
    }
    
    /**
     * Melhorar a exibição de imagens de produtos
     */
    public function enhance_product_image($html, $product) {
        // Verificar se o produto tem imagem
        if (!$product->get_image_id()) {
            // Verificar se há um ID de produto do PDV Vendas
            $pdv_id = get_post_meta($product->get_id(), '_pdv_vendas_id', true);
            
            if ($pdv_id) {
                // Adicionar classe para estilização específica
                $html = str_replace('class="', 'class="pdv-vendas-placeholder ', $html);
                
                // Adicionar atributo de dados
                $html = str_replace('<img ', '<img data-pdv-id="' . esc_attr($pdv_id) . '" ', $html);
            }
        } else {
            // Adicionar classe para estilização específica
            $html = str_replace('class="', 'class="pdv-vendas-image ', $html);
            
            // Adicionar atributo loading="lazy" se ainda não existir
            if (strpos($html, 'loading=') === false) {
                $html = str_replace('<img ', '<img loading="lazy" ', $html);
            }
        }
        
        return $html;
    }
    
    /**
     * Melhorar a exibição de imagens na galeria de produtos
     */
    public function enhance_product_gallery_image($html, $attachment_id) {
        // Adicionar classe para estilização específica
        $html = str_replace('class="', 'class="pdv-vendas-gallery-image ', $html);
        
        // Adicionar atributo loading="lazy" se ainda não existir
        if (strpos($html, 'loading=') === false) {
            $html = str_replace('<img ', '<img loading="lazy" ', $html);
        }
        
        return $html;
    }
    
    /**
     * Manipular múltiplas imagens
     */
    public function handle_multiple_images($attachment_ids, $product) {
        // Verificar se há um ID de produto do PDV Vendas
        $pdv_id = get_post_meta($product->get_id(), '_pdv_vendas_id', true);
        
        if (!$pdv_id) {
            return $attachment_ids;
        }
        
        // Verificar se há imagens adicionais do PDV Vendas
        $additional_images = get_post_meta($product->get_id(), '_pdv_vendas_additional_images', true);
        
        if (!$additional_images || !is_array($additional_images)) {
            return $attachment_ids;
        }
        
        // Adicionar IDs de anexos adicionais
        foreach ($additional_images as $image_id) {
            if (!in_array($image_id, $attachment_ids)) {
                $attachment_ids[] = $image_id;
            }
        }
        
        return $attachment_ids;
    }
    
    /**
     * Preparar imagens de produtos para a API REST
     */
    public function prepare_product_images($response, $product, $request) {
        // Verificar se há um ID de produto do PDV Vendas
        $pdv_id = get_post_meta($product->get_id(), '_pdv_vendas_id', true);
        
        if (!$pdv_id) {
            return $response;
        }
        
        // Verificar se há imagens adicionais do PDV Vendas
        $additional_images = get_post_meta($product->get_id(), '_pdv_vendas_additional_images', true);
        
        if (!$additional_images || !is_array($additional_images)) {
            return $response;
        }
        
        // Adicionar URLs de imagens adicionais à resposta
        $data = $response->get_data();
        
        if (!isset($data['images'])) {
            $data['images'] = array();
        }
        
        foreach ($additional_images as $image_id) {
            $image_url = wp_get_attachment_url($image_id);
            
            if ($image_url) {
                $data['images'][] = array(
                    'id' => $image_id,
                    'src' => $image_url,
                    'name' => get_the_title($image_id),
                    'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true)
                );
            }
        }
        
        $response->set_data($data);
        
        return $response;
    }
    
    /**
     * Processar imagens de produtos antes de inserir/atualizar
     */
    public function process_product_images($product, $request) {
        // Verificar se há imagens base64 no request
        if (!isset($request['images']) || !is_array($request['images'])) {
            return $product;
        }
        
        // Processar cada imagem
        foreach ($request['images'] as $index => $image) {
            // Verificar se é uma imagem base64
            if (isset($image['src']) && strpos($image['src'], 'data:image') === 0) {
                // Fazer upload da imagem base64
                $upload_result = $this->handle_base64_upload(new WP_REST_Request('POST', '/pdv-vendas/v1/upload-base64'));
                
                if (!is_wp_error($upload_result) && isset($upload_result['url'])) {
                    // Substituir a URL da imagem base64 pela URL da imagem carregada
                    $request['images'][$index]['src'] = $upload_result['url'];
                    
                    // Adicionar ID da imagem
                    $request['images'][$index]['id'] = $upload_result['attachment_id'];
                }
            }
        }
        
        return $product;
    }
    
    /**
     * Adicionar item de menu para regeneração de imagens
     */
    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            'Regenerar Imagens PDV Vendas',
            'Regenerar Imagens PDV',
            'manage_woocommerce',
            'pdv-vendas-regenerate-images',
            array($this, 'render_regenerate_images_page')
        );
    }
    
    /**
     * Renderizar página de regeneração de imagens
     */
    public function render_regenerate_images_page() {
        ?>
        <div class="wrap">
            <h1>Regenerar Imagens PDV Vendas</h1>
            
            <p>Esta ferramenta irá regenerar as miniaturas de imagens para produtos sincronizados do PDV Vendas.</p>
            
            <form method="post" action="">
                <?php wp_nonce_field('pdv_vendas_regenerate_images', 'pdv_vendas_regenerate_images_nonce'); ?>
                
                <p>
                    <label>
                        <input type="checkbox" name="only_pdv_products" value="1" checked="checked" />
                        Apenas produtos do PDV Vendas
                    </label>
                </p>
                
                <p>
                    <label>
                        <input type="checkbox" name="force_regenerate" value="1" />
                        Forçar regeneração (mesmo para imagens existentes)
                    </label>
                </p>
                
                <p class="submit">
                    <input type="submit" name="pdv_vendas_regenerate_images" class="button button-primary" value="Regenerar Imagens" />
                </p>
            </form>
        </div>
        <?php
    }
    
    /**
     * Manipular regeneração de imagens
     */
    public function handle_regenerate_images() {
        if (!isset($_POST['pdv_vendas_regenerate_images'])) {
            return;
        }
        
        if (!isset($_POST['pdv_vendas_regenerate_images_nonce']) || !wp_verify_nonce($_POST['pdv_vendas_regenerate_images_nonce'], 'pdv_vendas_regenerate_images')) {
            wp_die('Verificação de segurança falhou. Por favor, tente novamente.');
        }
        
        // Obter parâmetros
        $only_pdv_products = isset($_POST['only_pdv_products']) && $_POST['only_pdv_products'] == '1';
        $force_regenerate = isset($_POST['force_regenerate']) && $_POST['force_regenerate'] == '1';
        
        // Obter produtos
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => -1,
            'fields' => 'ids'
        );
        
        if ($only_pdv_products) {
            $args['meta_query'] = array(
                array(
                    'key' => '_pdv_vendas_id',
                    'compare' => 'EXISTS'
                )
            );
        }
        
        $product_ids = get_posts($args);
        
        if (empty($product_ids)) {
            wp_redirect(add_query_arg('message', 'no-products', admin_url('admin.php?page=pdv-vendas-regenerate-images')));
            exit;
        }
        
        // Regenerar imagens
        $regenerated = 0;
        
        foreach ($product_ids as $product_id) {
            // Obter imagem destacada
            $thumbnail_id = get_post_thumbnail_id($product_id);
            
            if ($thumbnail_id) {
                // Regenerar miniaturas
                $this->regenerate_thumbnails($thumbnail_id, $force_regenerate);
                $regenerated++;
            }
            
            // Obter imagens da galeria
            $gallery_ids = get_post_meta($product_id, '_product_image_gallery', true);
            
            if ($gallery_ids) {
                $gallery_ids = explode(',', $gallery_ids);
                
                foreach ($gallery_ids as $gallery_id) {
                    // Regenerar miniaturas
                    $this->regenerate_thumbnails($gallery_id, $force_regenerate);
                    $regenerated++;
                }
            }
        }
        
        wp_redirect(add_query_arg('message', 'regenerated-' . $regenerated, admin_url('admin.php?page=pdv-vendas-regenerate-images')));
        exit;
    }
    
    /**
     * Regenerar miniaturas para um anexo
     */
    private function regenerate_thumbnails($attachment_id, $force_regenerate = false) {
        // Verificar se o anexo existe
        $attachment = get_post($attachment_id);
        
        if (!$attachment || $attachment->post_type !== 'attachment') {
            return false;
        }
        
        // Obter caminho do arquivo
        $file_path = get_attached_file($attachment_id);
        
        if (!$file_path || !file_exists($file_path)) {
            return false;
        }
        
        // Regenerar metadados
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        if ($force_regenerate) {
            // Forçar regeneração
            $metadata = wp_generate_attachment_metadata($attachment_id, $file_path);
        } else {
            // Regenerar apenas se necessário
            $metadata = wp_get_attachment_metadata($attachment_id);
            
            if (!$metadata) {
                $metadata = wp_generate_attachment_metadata($attachment_id, $file_path);
            }
        }
        
        // Atualizar metadados
        wp_update_attachment_metadata($attachment_id, $metadata);
        
        return true;
    }
}

// Iniciar o plugin
new PDV_Vendas_Image_Handler();
