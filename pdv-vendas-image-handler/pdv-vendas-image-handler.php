<?php
/**
 * Plugin Name: PDV Vendas Image Handler
 * Plugin URI: https://achadinhoshopp.com.br/loja/
 * Description: Melhora o tratamento de imagens para produtos do PDV Vendas
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja/
 * Text Domain: pdv-vendas-image-handler
 */

// Impedir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class PDV_Vendas_Image_Handler {
    
    /**
     * Construtor
     */
    public function __construct() {
        // Registrar endpoint da API REST
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Filtrar imagens de produtos
        add_filter('woocommerce_product_get_image', array($this, 'filter_product_image'), 10, 2);
        add_filter('woocommerce_product_get_gallery_image_ids', array($this, 'filter_gallery_image_ids'), 10, 2);
        
        // Adicionar suporte para imagens base64
        add_action('init', array($this, 'add_base64_upload_support'));
        
        // Adicionar menu de administração
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Registrar configurações
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    /**
     * Registrar rotas da API REST
     */
    public function register_rest_routes() {
        register_rest_route('pdv-vendas/v1', '/upload-image', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_upload_image'),
            'permission_callback' => array($this, 'check_permission')
        ));
    }
    
    /**
     * Verificar permissão
     */
    public function check_permission() {
        // Verificar se o usuário está autenticado e tem permissão
        return current_user_can('upload_files');
    }
    
    /**
     * Manipular requisição de upload de imagem
     */
    public function handle_upload_image($request) {
        $params = $request->get_params();
        
        if (!isset($params['image'])) {
            return new WP_Error('missing_image', 'O parâmetro image é obrigatório', array('status' => 400));
        }
        
        // Verificar se é uma imagem base64
        if (strpos($params['image'], 'data:image') === 0) {
            $attachment_id = $this->upload_base64_image($params['image'], isset($params['title']) ? $params['title'] : 'PDV Vendas Product');
        } else {
            // É uma URL
            $attachment_id = $this->upload_image_from_url($params['image'], isset($params['title']) ? $params['title'] : 'PDV Vendas Product');
        }
        
        if (is_wp_error($attachment_id)) {
            return $attachment_id;
        }
        
        return array(
            'success' => true,
            'attachment_id' => $attachment_id,
            'url' => wp_get_attachment_url($attachment_id)
        );
    }
    
    /**
     * Fazer upload de imagem base64
     */
    public function upload_base64_image($base64_string, $title = 'PDV Vendas Product') {
        // Extrair dados da string base64
        $upload = $this->decode_base64_image($base64_string);
        
        if (is_wp_error($upload)) {
            return $upload;
        }
        
        // Preparar arquivo para upload
        $file_array = array(
            'name' => $title . '.' . $upload['ext'],
            'tmp_name' => $upload['tmp_name'],
            'error' => 0,
            'size' => filesize($upload['tmp_name'])
        );
        
        // Fazer upload do arquivo
        $attachment_id = media_handle_sideload($file_array, 0, $title);
        
        // Remover arquivo temporário
        @unlink($file_array['tmp_name']);
        
        return $attachment_id;
    }
    
    /**
     * Decodificar imagem base64
     */
    private function decode_base64_image($base64_string) {
        // Verificar se é uma string base64 válida
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64_string, $matches)) {
            return new WP_Error('invalid_base64', 'A string base64 não é uma imagem válida');
        }
        
        // Extrair tipo de imagem
        $image_type = $matches[1];
        
        // Extrair dados
        $base64_string = preg_replace('/^data:image\/(\w+);base64,/', '', $base64_string);
        $base64_string = str_replace(' ', '+', $base64_string);
        $image_data = base64_decode($base64_string);
        
        if ($image_data === false) {
            return new WP_Error('invalid_base64', 'Não foi possível decodificar a string base64');
        }
        
        // Criar arquivo temporário
        $temp_file = wp_tempnam();
        file_put_contents($temp_file, $image_data);
        
        return array(
            'tmp_name' => $temp_file,
            'ext' => $image_type
        );
    }
    
    /**
     * Fazer upload de imagem a partir de URL
     */
    public function upload_image_from_url($url, $title = 'PDV Vendas Product') {
        // Baixar imagem
        $temp_file = download_url($url);
        
        if (is_wp_error($temp_file)) {
            return $temp_file;
        }
        
        // Extrair extensão da URL
        $ext = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION);
        if (empty($ext)) {
            $ext = 'jpg';
        }
        
        // Preparar arquivo para upload
        $file_array = array(
            'name' => $title . '.' . $ext,
            'tmp_name' => $temp_file,
            'error' => 0,
            'size' => filesize($temp_file)
        );
        
        // Fazer upload do arquivo
        $attachment_id = media_handle_sideload($file_array, 0, $title);
        
        // Remover arquivo temporário
        @unlink($temp_file);
        
        return $attachment_id;
    }
    
    /**
     * Filtrar imagem de produto
     */
    public function filter_product_image($image, $product) {
        // Verificar se é um produto do PDV Vendas
        $is_pdv_product = get_post_meta($product->get_id(), '_pdv_vendas_product', true);
        
        if (!$is_pdv_product) {
            return $image;
        }
        
        // Aplicar classes adicionais
        $image = str_replace('class="', 'class="pdv-vendas-product-image ', $image);
        
        return $image;
    }
    
    /**
     * Filtrar IDs de imagens da galeria
     */
    public function filter_gallery_image_ids($gallery_image_ids, $product) {
        // Verificar se é um produto do PDV Vendas
        $is_pdv_product = get_post_meta($product->get_id(), '_pdv_vendas_product', true);
        
        if (!$is_pdv_product || empty($gallery_image_ids)) {
            return $gallery_image_ids;
        }
        
        // Verificar se as imagens existem
        $valid_ids = array();
        foreach ($gallery_image_ids as $image_id) {
            if (wp_get_attachment_url($image_id)) {
                $valid_ids[] = $image_id;
            }
        }
        
        return $valid_ids;
    }
    
    /**
     * Adicionar suporte para upload de imagens base64
     */
    public function add_base64_upload_support() {
        add_filter('upload_mimes', array($this, 'add_base64_mime_types'));
    }
    
    /**
     * Adicionar tipos MIME para base64
     */
    public function add_base64_mime_types($mimes) {
        $mimes['base64'] = 'text/plain';
        return $mimes;
    }
    
    /**
     * Adicionar menu de administração
     */
    public function add_admin_menu() {
        add_submenu_page(
            'options-general.php',
            'PDV Vendas Imagens',
            'PDV Vendas Imagens',
            'manage_options',
            'pdv-vendas-images',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Registrar configurações
     */
    public function register_settings() {
        register_setting('pdv_vendas_images', 'pdv_vendas_image_quality');
        register_setting('pdv_vendas_images', 'pdv_vendas_image_size');
    }
    
    /**
     * Renderizar página de administração
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Salvar configurações
        if (isset($_POST['pdv_vendas_image_quality'])) {
            update_option('pdv_vendas_image_quality', intval($_POST['pdv_vendas_image_quality']));
            update_option('pdv_vendas_image_size', sanitize_text_field($_POST['pdv_vendas_image_size']));
            echo '<div class="notice notice-success is-dismissible"><p>Configurações salvas com sucesso!</p></div>';
        }
        
        $quality = get_option('pdv_vendas_image_quality', 90);
        $size = get_option('pdv_vendas_image_size', 'large');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">Qualidade da Imagem</th>
                        <td>
                            <input type="range" name="pdv_vendas_image_quality" min="60" max="100" value="<?php echo esc_attr($quality); ?>" step="5" oninput="this.nextElementSibling.value = this.value">
                            <output><?php echo esc_html($quality); ?></output>
                            <p class="description">Qualidade das imagens (60-100). Valores mais altos resultam em melhor qualidade, mas arquivos maiores.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Tamanho da Imagem</th>
                        <td>
                            <select name="pdv_vendas_image_size">
                                <option value="thumbnail" <?php selected($size, 'thumbnail'); ?>>Miniatura</option>
                                <option value="medium" <?php selected($size, 'medium'); ?>>Médio</option>
                                <option value="large" <?php selected($size, 'large'); ?>>Grande</option>
                                <option value="full" <?php selected($size, 'full'); ?>>Original</option>
                            </select>
                            <p class="description">Tamanho das imagens exibidas na loja.</p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Salvar Configurações'); ?>
            </form>
            
            <h2>Teste de Upload de Imagem</h2>
            <p>Use esta ferramenta para testar o upload de imagens base64 ou URL.</p>
            
            <div id="pdv-image-tester">
                <div>
                    <label for="image-url">URL da Imagem:</label>
                    <input type="text" id="image-url" class="regular-text">
                    <button type="button" class="button" id="test-url-upload">Testar Upload de URL</button>
                </div>
                
                <div style="margin-top: 15px;">
                    <label for="image-file">Arquivo de Imagem:</label>
                    <input type="file" id="image-file" accept="image/*">
                    <button type="button" class="button" id="test-file-upload">Testar Upload de Arquivo</button>
                </div>
                
                <div id="upload-result" style="margin-top: 20px;"></div>
            </div>
            
            <script>
            jQuery(document).ready(function($) {
                $('#test-url-upload').on('click', function() {
                    var url = $('#image-url').val();
                    if (!url) {
                        alert('Por favor, insira uma URL de imagem.');
                        return;
                    }
                    
                    $('#upload-result').html('<p>Enviando imagem...</p>');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'pdv_test_image_upload',
                            url: url,
                            type: 'url',
                            nonce: '<?php echo wp_create_nonce('pdv_test_image_upload'); ?>'
                        },
                        success: function(response) {
                            if (response.success) {
                                $('#upload-result').html('<p>Upload bem-sucedido!</p><img src="' + response.data.url + '" style="max-width: 300px;">');
                            } else {
                                $('#upload-result').html('<p>Erro: ' + response.data.message + '</p>');
                            }
                        },
                        error: function() {
                            $('#upload-result').html('<p>Erro ao enviar a imagem.</p>');
                        }
                    });
                });
                
                $('#test-file-upload').on('click', function() {
                    var fileInput = $('#image-file')[0];
                    if (!fileInput.files.length) {
                        alert('Por favor, selecione um arquivo de imagem.');
                        return;
                    }
                    
                    var file = fileInput.files[0];
                    var reader = new FileReader();
                    
                    reader.onload = function(e) {
                        var base64 = e.target.result;
                        
                        $('#upload-result').html('<p>Enviando imagem...</p>');
                        
                        $.ajax({
                            url: ajaxurl,
                            type: 'POST',
                            data: {
                                action: 'pdv_test_image_upload',
                                base64: base64,
                                type: 'base64',
                                nonce: '<?php echo wp_create_nonce('pdv_test_image_upload'); ?>'
                            },
                            success: function(response) {
                                if (response.success) {
                                    $('#upload-result').html('<p>Upload bem-sucedido!</p><img src="' + response.data.url + '" style="max-width: 300px;">');
                                } else {
                                    $('#upload-result').html('<p>Erro: ' + response.data.message + '</p>');
                                }
                            },
                            error: function() {
                                $('#upload-result').html('<p>Erro ao enviar a imagem.</p>');
                            }
                        });
                    };
                    
                    reader.readAsDataURL(file);
                });
            });
            </script>
        </div>
        <?php
        
        // Adicionar AJAX handler
        add_action('wp_ajax_pdv_test_image_upload', array($this, 'handle_test_image_upload'));
    }
    
    /**
     * Manipular teste de upload de imagem via AJAX
     */
    public function handle_test_image_upload() {
        // Verificar nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'pdv_test_image_upload')) {
            wp_send_json_error(array('message' => 'Verificação de segurança falhou.'));
        }
        
        // Verificar tipo de upload
        if ($_POST['type'] === 'url' && isset($_POST['url'])) {
            $attachment_id = $this->upload_image_from_url($_POST['url'], 'Teste PDV Vendas');
        } elseif ($_POST['type'] === 'base64' && isset($_POST['base64'])) {
            $attachment_id = $this->upload_base64_image($_POST['base64'], 'Teste PDV Vendas');
        } else {
            wp_send_json_error(array('message' => 'Parâmetros inválidos.'));
        }
        
        if (is_wp_error($attachment_id)) {
            wp_send_json_error(array('message' => $attachment_id->get_error_message()));
        }
        
        wp_send_json_success(array(
            'attachment_id' => $attachment_id,
            'url' => wp_get_attachment_url($attachment_id)
        ));
    }
}

// Iniciar o plugin
new PDV_Vendas_Image_Handler();
