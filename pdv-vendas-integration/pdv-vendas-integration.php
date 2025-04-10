<?php
/**
 * Plugin Name: PDV Vendas Integration
 * Description: Integração entre o aplicativo PDV Vendas e o WordPress
 * Version: 1.0.0
 * Author: Gleidison S. Oliveira
 * Author URI: https://achadinhoshopp.com.br
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class PDV_Vendas_Integration {

    /**
     * Construtor
     */
    public function __construct() {
        // Registrar endpoints da API REST
        add_action('rest_api_init', array($this, 'register_api_endpoints'));

        // Adicionar menu de administração
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // Adicionar scripts e estilos
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));

        // Adicionar shortcode para exibir produtos
        add_shortcode('pdv_vendas_products', array($this, 'products_shortcode'));
    }

    /**
     * Registrar endpoints da API REST
     */
    public function register_api_endpoints() {
        register_rest_route('pdv-vendas/v1', '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_products'),
            'permission_callback' => array($this, 'api_permissions_check')
        ));

        register_rest_route('pdv-vendas/v1', '/clear', array(
            'methods' => 'POST',
            'callback' => array($this, 'clear_products'),
            'permission_callback' => array($this, 'api_permissions_check')
        ));

        register_rest_route('pdv-vendas/v1', '/stock', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_stock'),
            'permission_callback' => array($this, 'api_permissions_check')
        ));

        register_rest_route('pdv-vendas/v1', '/get-products', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_products'),
            'permission_callback' => array($this, 'api_permissions_check')
        ));

        register_rest_route('pdv-vendas/v1', '/sales-webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'process_sales_webhook'),
            'permission_callback' => array($this, 'api_permissions_check')
        ));
    }

    /**
     * Verificar permissões da API
     */
    public function api_permissions_check($request) {
        // Verificar a chave de API
        $api_key = $request->get_header('X-PDV-API-Key');
        $stored_api_key = get_option('pdv_vendas_api_key', '');

        if (empty($stored_api_key)) {
            // Se não houver chave configurada, usar a chave padrão
            $stored_api_key = 'OxCq4oUPrd5hqxPEq1zdjEd4';
        }

        // Verificar credenciais de usuário
        $username = $request->get_header('X-PDV-Username');
        $password = $request->get_header('X-PDV-Password');

        // Se as credenciais de usuário forem fornecidas, verificá-las
        if (!empty($username) && !empty($password)) {
            // Verificar se as credenciais correspondem às configuradas
            $stored_username = 'gloliverx';
            $stored_password = 'OxCq4oUPrd5hqxPEq1zdjEd4';

            return ($username === $stored_username && $password === $stored_password);
        }

        // Se não houver credenciais de usuário, verificar apenas a chave de API
        return $api_key === $stored_api_key;
    }

    /**
     * Sincronizar produtos
     */
    public function sync_products($request) {
        $params = $request->get_json_params();

        if (empty($params['products'])) {
            return new WP_Error('no_products', 'Nenhum produto enviado', array('status' => 400));
        }

        $products = $params['products'];
        $result = array(
            'success' => true,
            'message' => 'Produtos sincronizados com sucesso',
            'count' => count($products),
            'products' => array()
        );

        foreach ($products as $product) {
            $product_id = $this->create_or_update_product($product);

            if ($product_id) {
                $result['products'][] = array(
                    'id' => $product_id,
                    'name' => $product['description'],
                    'status' => 'success'
                );
            } else {
                $result['products'][] = array(
                    'name' => $product['description'],
                    'status' => 'error'
                );
            }
        }

        return rest_ensure_response($result);
    }

    /**
     * Limpar produtos
     */
    public function clear_products($request) {
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => -1,
            'meta_query' => array(
                array(
                    'key' => '_pdv_vendas_product',
                    'value' => '1',
                    'compare' => '='
                )
            )
        );

        $query = new WP_Query($args);
        $deleted_count = 0;

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                wp_delete_post(get_the_ID(), true);
                $deleted_count++;
            }
        }

        wp_reset_postdata();

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Produtos limpos com sucesso',
            'deleted_count' => $deleted_count
        ));
    }

    /**
     * Atualizar estoque
     */
    public function update_stock($request) {
        $params = $request->get_json_params();

        if (empty($params['products'])) {
            return new WP_Error('no_products', 'Nenhum produto enviado', array('status' => 400));
        }

        $products = $params['products'];
        $updated_count = 0;
        $results = array();

        foreach ($products as $product) {
            if (empty($product['id'])) {
                $results[] = array(
                    'status' => 'error',
                    'message' => 'ID do produto não fornecido',
                    'product' => $product
                );
                continue;
            }

            // Buscar o produto pelo ID do PDV
            $args = array(
                'post_type' => 'product',
                'posts_per_page' => 1,
                'meta_query' => array(
                    array(
                        'key' => '_pdv_vendas_id',
                        'value' => $product['id'],
                        'compare' => '='
                    )
                )
            );

            $query = new WP_Query($args);

            if ($query->have_posts()) {
                $query->the_post();
                $product_id = get_the_ID();

                // Atualizar estoque
                if (isset($product['quantity'])) {
                    update_post_meta($product_id, '_stock', $product['quantity']);
                    update_post_meta($product_id, '_stock_status', $product['quantity'] > 0 ? 'instock' : 'outofstock');

                    $updated_count++;
                    $results[] = array(
                        'status' => 'success',
                        'message' => 'Estoque atualizado',
                        'product_id' => $product_id,
                        'pdv_id' => $product['id'],
                        'quantity' => $product['quantity']
                    );
                } else {
                    $results[] = array(
                        'status' => 'error',
                        'message' => 'Quantidade não fornecida',
                        'product_id' => $product_id,
                        'pdv_id' => $product['id']
                    );
                }
            } else {
                $results[] = array(
                    'status' => 'error',
                    'message' => 'Produto não encontrado',
                    'pdv_id' => $product['id']
                );
            }

            wp_reset_postdata();
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Estoque atualizado com sucesso',
            'updated_count' => $updated_count,
            'results' => $results
        ));
    }

    /**
     * Obter produtos
     */
    public function get_products($request) {
        $category = $request->get_param('category');
        $limit = $request->get_param('limit') ? intval($request->get_param('limit')) : -1;

        $args = array(
            'post_type' => 'product',
            'posts_per_page' => $limit,
            'meta_query' => array(
                array(
                    'key' => '_pdv_vendas_product',
                    'value' => '1',
                    'compare' => '='
                )
            )
        );

        if (!empty($category)) {
            $args['tax_query'] = array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'name',
                    'terms' => $category
                )
            );
        }

        $query = new WP_Query($args);
        $products = array();

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $product_id = get_the_ID();

                $product = array(
                    'id' => get_post_meta($product_id, '_pdv_vendas_id', true),
                    'wordpress_id' => $product_id,
                    'description' => get_the_title(),
                    'itemDescription' => get_the_content(),
                    'price' => get_post_meta($product_id, '_price', true),
                    'quantity' => get_post_meta($product_id, '_stock', true),
                    'category' => wp_get_post_terms($product_id, 'product_cat', array('fields' => 'names'))
                );

                // Adicionar URL da imagem em destaque
                if (has_post_thumbnail($product_id)) {
                    $product['image'] = get_the_post_thumbnail_url($product_id, 'full');
                }

                // Adicionar URLs das imagens da galeria
                $gallery_ids = get_post_meta($product_id, '_product_image_gallery', true);
                if (!empty($gallery_ids)) {
                    $gallery_ids = explode(',', $gallery_ids);
                    $product['additionalImages'] = array();

                    foreach ($gallery_ids as $gallery_id) {
                        $product['additionalImages'][] = wp_get_attachment_url($gallery_id);
                    }
                }

                $products[] = $product;
            }
        }

        wp_reset_postdata();

        return rest_ensure_response(array(
            'success' => true,
            'count' => count($products),
            'products' => $products
        ));
    }

    /**
     * Processar webhook de vendas
     */
    public function process_sales_webhook($request) {
        $params = $request->get_json_params();

        if (empty($params['order_id'])) {
            return new WP_Error('no_order_id', 'ID do pedido não fornecido', array('status' => 400));
        }

        $order_id = $params['order_id'];
        $order = wc_get_order($order_id);

        if (!$order) {
            return new WP_Error('invalid_order', 'Pedido inválido', array('status' => 400));
        }

        // Processar apenas pedidos concluídos
        if ($order->get_status() !== 'completed') {
            return rest_ensure_response(array(
                'success' => false,
                'message' => 'Pedido não está concluído',
                'order_id' => $order_id,
                'status' => $order->get_status()
            ));
        }

        // Obter itens do pedido
        $items = $order->get_items();
        $processed_items = array();

        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $pdv_id = get_post_meta($product_id, '_pdv_vendas_id', true);

            if (!empty($pdv_id)) {
                $processed_items[] = array(
                    'pdv_id' => $pdv_id,
                    'wordpress_id' => $product_id,
                    'name' => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'total' => $item->get_total()
                );
            }
        }

        // Enviar notificação para o webhook configurado
        $webhook_url = get_option('pdv_vendas_webhook_url', '');

        if (!empty($webhook_url)) {
            $response = wp_remote_post($webhook_url, array(
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'X-WP-Webhook' => 'pdv-vendas-sale'
                ),
                'body' => json_encode(array(
                    'order_id' => $order_id,
                    'order_date' => $order->get_date_created()->date('Y-m-d H:i:s'),
                    'order_total' => $order->get_total(),
                    'customer' => array(
                        'name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
                        'email' => $order->get_billing_email(),
                        'phone' => $order->get_billing_phone()
                    ),
                    'items' => $processed_items
                ))
            ));

            if (is_wp_error($response)) {
                return rest_ensure_response(array(
                    'success' => false,
                    'message' => 'Erro ao enviar notificação para o webhook',
                    'error' => $response->get_error_message()
                ));
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Webhook de venda processado com sucesso',
            'order_id' => $order_id,
            'items_count' => count($processed_items),
            'items' => $processed_items
        ));
    }

    /**
     * Criar ou atualizar produto
     */
    private function create_or_update_product($product) {
        // Verificar se o produto já existe
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => 1,
            'meta_query' => array(
                array(
                    'key' => '_pdv_vendas_id',
                    'value' => $product['id'],
                    'compare' => '='
                )
            )
        );

        $query = new WP_Query($args);
        $product_id = 0;

        if ($query->have_posts()) {
            // Atualizar produto existente
            $query->the_post();
            $product_id = get_the_ID();

            $post_data = array(
                'ID' => $product_id,
                'post_title' => $product['description'],
                'post_content' => !empty($product['itemDescription']) ? $product['itemDescription'] : '',
                'post_status' => 'publish'
            );

            wp_update_post($post_data);
        } else {
            // Criar novo produto
            $post_data = array(
                'post_title' => $product['description'],
                'post_content' => !empty($product['itemDescription']) ? $product['itemDescription'] : '',
                'post_status' => 'publish',
                'post_type' => 'product'
            );

            $product_id = wp_insert_post($post_data);
        }

        if ($product_id) {
            // Atualizar meta dados
            update_post_meta($product_id, '_pdv_vendas_product', '1');
            update_post_meta($product_id, '_pdv_vendas_id', $product['id']);
            update_post_meta($product_id, '_price', $product['price']);
            update_post_meta($product_id, '_regular_price', $product['price']);
            update_post_meta($product_id, '_stock', $product['quantity']);
            update_post_meta($product_id, '_stock_status', $product['quantity'] > 0 ? 'instock' : 'outofstock');
            update_post_meta($product_id, '_manage_stock', 'yes');

            // Adicionar categoria
            if (!empty($product['category'])) {
                $term = term_exists($product['category'], 'product_cat');

                if (!$term) {
                    $term = wp_insert_term($product['category'], 'product_cat');
                }

                if (!is_wp_error($term)) {
                    wp_set_object_terms($product_id, $term['term_id'], 'product_cat');
                }
            }

            // Adicionar imagem em destaque
            if (!empty($product['image'])) {
                $this->set_product_image($product_id, $product['image']);
            }

            // Adicionar imagens adicionais
            if (!empty($product['additionalImages']) && is_array($product['additionalImages'])) {
                $this->set_product_gallery($product_id, $product['additionalImages']);
            }
        }

        return $product_id;
    }

    /**
     * Definir imagem do produto
     */
    private function set_product_image($product_id, $image_url) {
        // Verificar se a imagem já existe
        $existing_attachment_id = get_post_thumbnail_id($product_id);

        if ($existing_attachment_id) {
            // Verificar se a URL da imagem é a mesma
            $existing_image_url = wp_get_attachment_url($existing_attachment_id);

            if ($existing_image_url === $image_url) {
                return $existing_attachment_id;
            }
        }

        // Baixar a imagem
        $upload_dir = wp_upload_dir();
        $image_data = file_get_contents($image_url);

        if ($image_data === false) {
            return false;
        }

        $filename = basename($image_url);

        if (wp_mkdir_p($upload_dir['path'])) {
            $file = $upload_dir['path'] . '/' . $filename;
        } else {
            $file = $upload_dir['basedir'] . '/' . $filename;
        }

        file_put_contents($file, $image_data);

        $wp_filetype = wp_check_filetype($filename, null);

        $attachment = array(
            'post_mime_type' => $wp_filetype['type'],
            'post_title' => sanitize_file_name($filename),
            'post_content' => '',
            'post_status' => 'inherit'
        );

        $attachment_id = wp_insert_attachment($attachment, $file, $product_id);

        if (!is_wp_error($attachment_id)) {
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            $attachment_data = wp_generate_attachment_metadata($attachment_id, $file);
            wp_update_attachment_metadata($attachment_id, $attachment_data);
            set_post_thumbnail($product_id, $attachment_id);

            return $attachment_id;
        }

        return false;
    }

    /**
     * Definir galeria de imagens do produto
     */
    private function set_product_gallery($product_id, $image_urls) {
        $gallery_attachment_ids = array();

        foreach ($image_urls as $image_url) {
            // Baixar a imagem
            $upload_dir = wp_upload_dir();
            $image_data = file_get_contents($image_url);

            if ($image_data === false) {
                continue;
            }

            $filename = basename($image_url);

            if (wp_mkdir_p($upload_dir['path'])) {
                $file = $upload_dir['path'] . '/' . $filename;
            } else {
                $file = $upload_dir['basedir'] . '/' . $filename;
            }

            file_put_contents($file, $image_data);

            $wp_filetype = wp_check_filetype($filename, null);

            $attachment = array(
                'post_mime_type' => $wp_filetype['type'],
                'post_title' => sanitize_file_name($filename),
                'post_content' => '',
                'post_status' => 'inherit'
            );

            $attachment_id = wp_insert_attachment($attachment, $file, $product_id);

            if (!is_wp_error($attachment_id)) {
                require_once(ABSPATH . 'wp-admin/includes/image.php');
                $attachment_data = wp_generate_attachment_metadata($attachment_id, $file);
                wp_update_attachment_metadata($attachment_id, $attachment_data);
                $gallery_attachment_ids[] = $attachment_id;
            }
        }

        if (!empty($gallery_attachment_ids)) {
            update_post_meta($product_id, '_product_image_gallery', implode(',', $gallery_attachment_ids));
        }
    }

    /**
     * Adicionar menu de administração
     */
    public function add_admin_menu() {
        add_menu_page(
            'PDV Vendas Integration',
            'PDV Vendas',
            'manage_options',
            'pdv-vendas-integration',
            array($this, 'admin_page'),
            'dashicons-cart',
            30
        );
    }

    /**
     * Página de administração
     */
    public function admin_page() {
        // Salvar configurações
        if (isset($_POST['pdv_vendas_save_settings'])) {
            check_admin_referer('pdv_vendas_settings');

            $api_key = sanitize_text_field($_POST['pdv_vendas_api_key']);
            update_option('pdv_vendas_api_key', $api_key);

            $webhook_url = sanitize_text_field($_POST['pdv_vendas_webhook_url']);
            update_option('pdv_vendas_webhook_url', $webhook_url);

            echo '<div class="notice notice-success"><p>Configurações salvas com sucesso!</p></div>';
        }

        $api_key = get_option('pdv_vendas_api_key', 'OxCq4oUPrd5hqxPEq1zdjEd4');
        $webhook_url = get_option('pdv_vendas_webhook_url', '');
        ?>
        <div class="wrap">
            <h1>PDV Vendas Integration</h1>

            <div class="card">
                <h2>Configurações</h2>

                <form method="post" action="">
                    <?php wp_nonce_field('pdv_vendas_settings'); ?>

                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="pdv_vendas_api_key">Chave de API</label></th>
                            <td>
                                <input type="text" id="pdv_vendas_api_key" name="pdv_vendas_api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text">
                                <p class="description">Chave de API para autenticação com o aplicativo PDV Vendas.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="pdv_vendas_webhook_url">URL do Webhook</label></th>
                            <td>
                                <input type="url" id="pdv_vendas_webhook_url" name="pdv_vendas_webhook_url" value="<?php echo esc_attr($webhook_url); ?>" class="regular-text">
                                <p class="description">URL para notificar o aplicativo PDV Vendas quando ocorrer uma venda no WordPress. Deixe em branco para desativar.</p>
                            </td>
                        </tr>
                    </table>

                    <p class="submit">
                        <input type="submit" name="pdv_vendas_save_settings" class="button button-primary" value="Salvar Configurações">
                    </p>
                </form>
            </div>

            <div class="card">
                <h2>Instruções</h2>

                <p>Para exibir os produtos do PDV Vendas em qualquer página ou post, use o shortcode:</p>
                <code>[pdv_vendas_products]</code>

                <p>Você também pode especificar a categoria:</p>
                <code>[pdv_vendas_products category="Ferramentas"]</code>

                <p>Ou limitar o número de produtos:</p>
                <code>[pdv_vendas_products limit="10"]</code>

                <p>Ou ordenar por preço, nome, etc:</p>
                <code>[pdv_vendas_products orderby="price" order="desc"]</code>
            </div>

            <div class="card">
                <h2>Endpoints da API</h2>

                <p>URL base: <code><?php echo esc_url(rest_url('pdv-vendas/v1')); ?></code></p>

                <h3>Sincronizar Produtos</h3>
                <p>Endpoint: <code>/sync</code></p>
                <p>Método: <code>POST</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($api_key); ?></code></li>
                    <li><code>Content-Type: application/json</code></li>
                </ul>

                <h3>Limpar Produtos</h3>
                <p>Endpoint: <code>/clear</code></p>
                <p>Método: <code>POST</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($api_key); ?></code></li>
                </ul>

                <h3>Atualizar Estoque</h3>
                <p>Endpoint: <code>/stock</code></p>
                <p>Método: <code>POST</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($api_key); ?></code></li>
                    <li><code>Content-Type: application/json</code></li>
                </ul>
                <p>Corpo da requisição:</p>
                <pre><code>{
  "products": [
    {
      "id": "123",
      "quantity": 10
    },
    {
      "id": "456",
      "quantity": 5
    }
  ]
}</code></pre>

                <h3>Obter Produtos</h3>
                <p>Endpoint: <code>/get-products</code></p>
                <p>Método: <code>GET</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($api_key); ?></code></li>
                </ul>
                <p>Parâmetros opcionais:</p>
                <ul>
                    <li><code>category</code>: Filtrar por categoria</li>
                    <li><code>limit</code>: Limitar o número de produtos retornados</li>
                </ul>

                <h3>Webhook de Vendas</h3>
                <p>Endpoint: <code>/sales-webhook</code></p>
                <p>Método: <code>POST</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($api_key); ?></code></li>
                    <li><code>Content-Type: application/json</code></li>
                </ul>
                <p>Corpo da requisição:</p>
                <pre><code>{
  "order_id": "123"
}</code></pre>
            </div>
        </div>
        <?php
    }

    /**
     * Adicionar scripts e estilos de administração
     */
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_pdv-vendas-integration') {
            return;
        }

        wp_enqueue_style('pdv-vendas-admin', plugins_url('assets/css/admin.css', __FILE__));
        wp_enqueue_script('pdv-vendas-admin', plugins_url('assets/js/admin.js', __FILE__), array('jquery'), '1.0.0', true);
    }

    /**
     * Adicionar scripts e estilos de frontend
     */
    public function enqueue_frontend_scripts() {
        wp_enqueue_style('pdv-vendas-frontend', plugins_url('assets/css/frontend.css', __FILE__));
        wp_enqueue_script('pdv-vendas-frontend', plugins_url('assets/js/frontend.js', __FILE__), array('jquery'), '1.0.0', true);
    }

    /**
     * Shortcode para exibir produtos
     */
    public function products_shortcode($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'limit' => -1,
            'orderby' => 'date',
            'order' => 'desc',
            'columns' => 3
        ), $atts);

        $args = array(
            'post_type' => 'product',
            'posts_per_page' => $atts['limit'],
            'orderby' => $atts['orderby'],
            'order' => $atts['order'],
            'meta_query' => array(
                array(
                    'key' => '_pdv_vendas_product',
                    'value' => '1',
                    'compare' => '='
                )
            )
        );

        if (!empty($atts['category'])) {
            $args['tax_query'] = array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'name',
                    'terms' => $atts['category']
                )
            );
        }

        $query = new WP_Query($args);
        $output = '';

        if ($query->have_posts()) {
            $output .= '<div class="pdv-vendas-products columns-' . esc_attr($atts['columns']) . '">';

            while ($query->have_posts()) {
                $query->the_post();
                $product_id = get_the_ID();
                $price = get_post_meta($product_id, '_price', true);
                $stock = get_post_meta($product_id, '_stock', true);

                $output .= '<div class="pdv-vendas-product">';

                if (has_post_thumbnail()) {
                    $output .= '<div class="pdv-vendas-product-image">';
                    $output .= '<a href="' . get_permalink() . '">' . get_the_post_thumbnail($product_id, 'medium') . '</a>';
                    $output .= '</div>';
                }

                $output .= '<div class="pdv-vendas-product-details">';
                $output .= '<h3 class="pdv-vendas-product-title"><a href="' . get_permalink() . '">' . get_the_title() . '</a></h3>';

                if (!empty($price)) {
                    $output .= '<div class="pdv-vendas-product-price">' . wc_price($price) . '</div>';
                }

                if (!empty($stock)) {
                    $output .= '<div class="pdv-vendas-product-stock">';
                    $output .= '<span class="stock-label">Estoque:</span> ';
                    $output .= '<span class="stock-value">' . esc_html($stock) . '</span>';
                    $output .= '</div>';
                }

                $output .= '<div class="pdv-vendas-product-description">' . get_the_excerpt() . '</div>';

                $output .= '<div class="pdv-vendas-product-actions">';
                $output .= '<a href="' . get_permalink() . '" class="pdv-vendas-product-button">Ver Detalhes</a>';
                $output .= '</div>';

                $output .= '</div>'; // .pdv-vendas-product-details
                $output .= '</div>'; // .pdv-vendas-product
            }

            $output .= '</div>'; // .pdv-vendas-products
        } else {
            $output .= '<p class="pdv-vendas-no-products">Nenhum produto encontrado.</p>';
        }

        wp_reset_postdata();

        return $output;
    }
}

// Inicializar o plugin
$pdv_vendas_integration = new PDV_Vendas_Integration();
