<?php
/**
 * Plugin Name: PDV Vendas Integration
 * Description: Integração entre o PDV Vendas e o WordPress
 * Version: 1.0.0
 * Author: Gleidison S. Oliveira
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class PDV_Vendas_Integration {
    // Credenciais de API
    private $api_key = 'a117i65gmQYOokVzyA8QRLSw';
    private $username = 'glolivercoder';
    private $email = 'glolivercoder@gmail.com';

    // URL do webhook
    private $webhook_url = '';

    // Construtor
    public function __construct() {
        // Registrar endpoints da API REST
        add_action('rest_api_init', array($this, 'register_api_routes'));

        // Adicionar cabeçalhos CORS para permitir solicitações de outros domínios
        add_action('init', array($this, 'add_cors_headers'));

        // Carregar webhook URL das opções
        $this->webhook_url = get_option('pdv_vendas_webhook_url', '');

        // Adicionar hook para atualizar o estoque quando um produto é vendido
        add_action('woocommerce_order_status_completed', array($this, 'update_pdv_vendas_stock'));
    }

    /**
     * Adicionar cabeçalhos CORS para permitir solicitações de outros domínios
     */
    public function add_cors_headers() {
        // Verificar se é uma solicitação para a API REST
        if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false) {
            // Permitir solicitações de qualquer origem (em produção, você pode querer restringir isso)
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-API-Key, X-PDV-Username, X-PDV-API-Key');
            header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages');

            // Responder imediatamente às solicitações OPTIONS (preflight)
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                status_header(200);
                exit();
            }
        }
    }

    /**
     * Registrar rotas da API REST
     */
    public function register_api_routes() {
        register_rest_route('pdv-vendas/v1', '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_products'),
            'permission_callback' => array($this, 'check_api_permission')
        ));

        register_rest_route('pdv-vendas/v1', '/clear', array(
            'methods' => 'POST',
            'callback' => array($this, 'clear_products'),
            'permission_callback' => array($this, 'check_api_permission')
        ));

        register_rest_route('pdv-vendas/v1', '/get-products', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_products'),
            'permission_callback' => array($this, 'check_api_permission')
        ));

        register_rest_route('pdv-vendas/v1', '/setup-webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'setup_webhook'),
            'permission_callback' => array($this, 'check_api_permission')
        ));

        register_rest_route('pdv-vendas/v1', '/update-stock', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_stock'),
            'permission_callback' => array($this, 'check_api_permission')
        ));
    }

    /**
     * Verificar permissão da API
     */
    public function check_api_permission($request) {
        // Verificar token JWT
        $auth_header = $request->get_header('Authorization');
        if ($auth_header && strpos($auth_header, 'Bearer ') === 0) {
            // Extrair token
            $token = substr($auth_header, 7);

            // Verificar token JWT (usando o plugin JWT Authentication)
            if (class_exists('\Firebase\JWT\JWT')) {
                try {
                    // Verificar token usando o plugin JWT Authentication
                    $jwt_auth = new \WP_REST_JWT_Auth_Controller();
                    $valid = $jwt_auth->validate_token($token);

                    if (!is_wp_error($valid)) {
                        return true;
                    }
                } catch (\Exception $e) {
                    // Falha na validação do token
                }
            }
        }

        // Verificar autenticação básica
        if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
            $username = $_SERVER['PHP_AUTH_USER'];
            $password = $_SERVER['PHP_AUTH_PW'];

            if ($username === $this->username && $password === $this->api_key) {
                return true;
            }
        }

        // Verificar cabeçalhos personalizados
        $api_key = $request->get_header('X-WP-API-Key');
        $username = $request->get_header('X-PDV-Username');

        if ($api_key === $this->api_key && $username === $this->username) {
            return true;
        }

        // Permitir acesso para desenvolvimento local
        if (strpos($_SERVER['HTTP_ORIGIN'] ?? '', 'localhost') !== false) {
            return true;
        }

        return new WP_Error('rest_forbidden', 'Acesso não autorizado', array('status' => 401));
    }

    /**
     * Sincronizar produtos do PDV Vendas com o WordPress
     */
    public function sync_products($request) {
        $params = $request->get_json_params();

        if (!isset($params['products']) || !is_array($params['products'])) {
            return new WP_Error('invalid_params', 'Parâmetros inválidos', array('status' => 400));
        }

        $products = $params['products'];
        $count = 0;

        foreach ($products as $product) {
            // Verificar se o produto já existe
            $args = array(
                'post_type' => 'product',
                'meta_query' => array(
                    array(
                        'key' => '_pdv_vendas_id',
                        'value' => $product['id']
                    )
                )
            );

            $query = new WP_Query($args);

            if ($query->have_posts()) {
                // Atualizar produto existente
                $query->the_post();
                $post_id = get_the_ID();

                // Atualizar dados do produto
                wp_update_post(array(
                    'ID' => $post_id,
                    'post_title' => $product['description'],
                    'post_content' => $product['itemDescription'] ?? $product['description'],
                    'post_status' => 'publish'
                ));
            } else {
                // Criar novo produto
                $post_id = wp_insert_post(array(
                    'post_title' => $product['description'],
                    'post_content' => $product['itemDescription'] ?? $product['description'],
                    'post_status' => 'publish',
                    'post_type' => 'product'
                ));
            }

            if ($post_id) {
                // Atualizar metadados
                update_post_meta($post_id, '_pdv_vendas_id', $product['id']);
                update_post_meta($post_id, '_price', $product['price']);
                update_post_meta($post_id, '_regular_price', $product['price']);
                update_post_meta($post_id, '_stock', $product['quantity']);
                update_post_meta($post_id, '_stock_status', $product['quantity'] > 0 ? 'instock' : 'outofstock');
                update_post_meta($post_id, '_manage_stock', 'yes');

                // Definir categoria
                if (isset($product['category']) && !empty($product['category'])) {
                    $term = term_exists($product['category'], 'product_cat');

                    if (!$term) {
                        $term = wp_insert_term($product['category'], 'product_cat');
                    }

                    if (!is_wp_error($term)) {
                        wp_set_object_terms($post_id, $term['term_id'], 'product_cat');
                    }
                }

                // Adicionar imagem
                if (isset($product['image']) && !empty($product['image'])) {
                    $this->set_product_image($post_id, $product['image']);
                }

                $count++;
            }
        }

        return array(
            'success' => true,
            'count' => $count,
            'message' => sprintf('%d produtos sincronizados com sucesso', $count)
        );
    }

    /**
     * Definir imagem do produto
     */
    private function set_product_image($post_id, $image_url) {
        // Verificar se a imagem já existe
        $attachment_id = get_post_meta($post_id, '_thumbnail_id', true);

        if ($attachment_id) {
            // Verificar se a URL da imagem é a mesma
            $current_url = wp_get_attachment_url($attachment_id);

            if ($current_url === $image_url) {
                return $attachment_id;
            }
        }

        // Baixar imagem
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

        $attachment_id = wp_insert_attachment($attachment, $file, $post_id);

        if (!is_wp_error($attachment_id)) {
            require_once(ABSPATH . 'wp-admin/includes/image.php');

            $attachment_data = wp_generate_attachment_metadata($attachment_id, $file);
            wp_update_attachment_metadata($attachment_id, $attachment_data);
            set_post_thumbnail($post_id, $attachment_id);

            return $attachment_id;
        }

        return false;
    }

    /**
     * Limpar produtos do PDV Vendas
     */
    public function clear_products($request) {
        $args = array(
            'post_type' => 'product',
            'meta_query' => array(
                array(
                    'key' => '_pdv_vendas_id',
                    'compare' => 'EXISTS'
                )
            ),
            'posts_per_page' => -1
        );

        $query = new WP_Query($args);
        $count = 0;

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();

                wp_delete_post($post_id, true);
                $count++;
            }
        }

        wp_reset_postdata();

        return array(
            'success' => true,
            'count' => $count,
            'message' => sprintf('%d produtos removidos com sucesso', $count)
        );
    }

    /**
     * Obter produtos do WordPress
     */
    public function get_products($request) {
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => -1
        );

        // Filtrar por categoria
        $category = $request->get_param('category');
        if ($category) {
            $args['tax_query'] = array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'name',
                    'terms' => $category
                )
            );
        }

        // Filtrar por ID do PDV Vendas
        $pdv_id = $request->get_param('pdv_id');
        if ($pdv_id) {
            $args['meta_query'] = array(
                array(
                    'key' => '_pdv_vendas_id',
                    'value' => $pdv_id
                )
            );
        }

        $query = new WP_Query($args);
        $products = array();

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();

                $product = array(
                    'id' => get_post_meta($post_id, '_pdv_vendas_id', true),
                    'wordpress_id' => $post_id,
                    'description' => get_the_title(),
                    'itemDescription' => get_the_content(),
                    'price' => get_post_meta($post_id, '_price', true),
                    'quantity' => get_post_meta($post_id, '_stock', true),
                    'image' => get_the_post_thumbnail_url($post_id, 'full')
                );

                // Obter categoria
                $terms = get_the_terms($post_id, 'product_cat');
                if ($terms && !is_wp_error($terms)) {
                    $product['category'] = $terms[0]->name;
                }

                $products[] = $product;
            }
        }

        wp_reset_postdata();

        return array(
            'success' => true,
            'count' => count($products),
            'products' => $products
        );
    }

    /**
     * Configurar webhook
     */
    public function setup_webhook($request) {
        $params = $request->get_json_params();

        if (!isset($params['webhook_url'])) {
            return new WP_Error('invalid_params', 'URL do webhook não fornecida', array('status' => 400));
        }

        $webhook_url = $params['webhook_url'];

        // Salvar URL do webhook
        update_option('pdv_vendas_webhook_url', $webhook_url);
        $this->webhook_url = $webhook_url;

        return array(
            'success' => true,
            'webhook_url' => $webhook_url,
            'message' => 'Webhook configurado com sucesso'
        );
    }

    /**
     * Atualizar estoque
     */
    public function update_stock($request) {
        $params = $request->get_json_params();

        if (!isset($params['products']) || !is_array($params['products'])) {
            return new WP_Error('invalid_params', 'Parâmetros inválidos', array('status' => 400));
        }

        $products = $params['products'];
        $count = 0;

        foreach ($products as $product) {
            if (!isset($product['id']) || !isset($product['quantity'])) {
                continue;
            }

            $args = array(
                'post_type' => 'product',
                'meta_query' => array(
                    array(
                        'key' => '_pdv_vendas_id',
                        'value' => $product['id']
                    )
                )
            );

            $query = new WP_Query($args);

            if ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();

                update_post_meta($post_id, '_stock', $product['quantity']);
                update_post_meta($post_id, '_stock_status', $product['quantity'] > 0 ? 'instock' : 'outofstock');

                $count++;
            }
        }

        wp_reset_postdata();

        return array(
            'success' => true,
            'count' => $count,
            'message' => sprintf('Estoque de %d produtos atualizado com sucesso', $count)
        );
    }

    /**
     * Atualizar estoque no PDV Vendas quando um produto é vendido no WordPress
     */
    public function update_pdv_vendas_stock($order_id) {
        if (empty($this->webhook_url)) {
            return;
        }

        $order = wc_get_order($order_id);
        $products = array();

        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            $pdv_id = get_post_meta($product_id, '_pdv_vendas_id', true);

            if ($pdv_id) {
                $quantity = get_post_meta($product_id, '_stock', true);

                $products[] = array(
                    'id' => $pdv_id,
                    'quantity' => $quantity
                );
            }
        }

        if (!empty($products)) {
            // Enviar atualização para o PDV Vendas
            wp_remote_post($this->webhook_url, array(
                'body' => json_encode(array(
                    'products' => $products,
                    'order_id' => $order_id
                )),
                'headers' => array(
                    'Content-Type' => 'application/json'
                )
            ));
        }
    }
}

// Inicializar o plugin
new PDV_Vendas_Integration();
