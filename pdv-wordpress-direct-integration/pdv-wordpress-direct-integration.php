<?php
/**
 * Plugin Name: PDV Vendas Direct Integration
 * Description: Integração direta entre PDV Vendas e WordPress sem ferramentas externas
 * Version: 1.0
 * Author: PDV Vendas
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Definir constantes
define('PDV_INTEGRATION_DIR', plugin_dir_path(__FILE__));
define('PDV_INTEGRATION_URL', plugin_dir_url(__FILE__));

// Verificar se os diretórios existem e criá-los se necessário
if (!file_exists(PDV_INTEGRATION_DIR . 'includes')) {
    mkdir(PDV_INTEGRATION_DIR . 'includes', 0755, true);
}

if (!file_exists(PDV_INTEGRATION_DIR . 'assets/js')) {
    mkdir(PDV_INTEGRATION_DIR . 'assets/js', 0755, true);
}

if (!file_exists(PDV_INTEGRATION_DIR . 'assets/css')) {
    mkdir(PDV_INTEGRATION_DIR . 'assets/css', 0755, true);
}

// Incluir arquivos
if (file_exists(PDV_INTEGRATION_DIR . 'includes/enqueue-scripts.php')) {
    require_once PDV_INTEGRATION_DIR . 'includes/enqueue-scripts.php';
}

if (file_exists(PDV_INTEGRATION_DIR . 'includes/webhook-handler.php')) {
    require_once PDV_INTEGRATION_DIR . 'includes/webhook-handler.php';
}

class PDV_WordPress_Integration {
    // Credenciais de autenticação
    private $api_key = 'OxCq4oUPrd5hqxPEq1zdjEd4';
    private $username = 'gloliverx';
    private $password = 'OxCq4oUPrd5hqxPEq1zdjEd4';

    // Construtor
    public function __construct() {
        // Registrar endpoints da API REST
        add_action('rest_api_init', array($this, 'register_api_endpoints'));

        // Adicionar menu de administração
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // Registrar shortcode para exibir produtos
        add_shortcode('pdv_vendas_products', array($this, 'products_shortcode'));

        // Hooks para sincronização bidirecional
        add_action('woocommerce_order_status_completed', array($this, 'send_order_to_pdv'));
        add_action('woocommerce_product_set_stock', array($this, 'product_stock_changed'));
    }

    /**
     * Registrar endpoints da API REST
     */
    public function register_api_endpoints() {
        register_rest_route('pdv-vendas/v1', '/sync', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_products'),
            'permission_callback' => array($this, 'verify_auth')
        ));

        register_rest_route('pdv-vendas/v1', '/clear', array(
            'methods' => 'POST',
            'callback' => array($this, 'clear_products'),
            'permission_callback' => array($this, 'verify_auth')
        ));

        register_rest_route('pdv-vendas/v1', '/stock', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_stock'),
            'permission_callback' => array($this, 'verify_auth')
        ));

        register_rest_route('pdv-vendas/v1', '/get-products', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_products'),
            'permission_callback' => array($this, 'verify_auth')
        ));
    }

    /**
     * Verificar autenticação
     */
    public function verify_auth($request) {
        $api_key = $request->get_header('X-PDV-API-Key');
        $username = $request->get_header('X-PDV-Username');
        $password = $request->get_header('X-PDV-Password');

        // Verificar API Key
        if ($api_key && $api_key === $this->api_key) {
            return true;
        }

        // Verificar username e password
        if ($username && $password && $username === $this->username && $password === $this->password) {
            return true;
        }

        return false;
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
            'count' => 0,
            'products' => array()
        );

        foreach ($products as $product) {
            if (empty($product['id'])) {
                continue;
            }

            $product_id = $this->create_or_update_product($product);

            if ($product_id) {
                $result['count']++;
                $result['products'][] = array(
                    'pdv_id' => $product['id'],
                    'wc_id' => $product_id,
                    'status' => 'success'
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
     * Criar ou atualizar produto
     */
    public function create_or_update_product($product) {
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
                'post_content' => !empty($product['itemDescription']) ? $product['itemDescription'] : ''
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
     * Definir imagem em destaque do produto
     */
    public function set_product_image($product_id, $image_url) {
        // Verificar se a imagem já existe na biblioteca de mídia
        $attachment_id = $this->get_attachment_id_from_url($image_url);

        if (!$attachment_id) {
            // Fazer upload da imagem
            $attachment_id = $this->upload_image_from_url($image_url);
        }

        if ($attachment_id) {
            // Definir como imagem em destaque
            set_post_thumbnail($product_id, $attachment_id);
        }
    }

    /**
     * Definir galeria de imagens do produto
     */
    public function set_product_gallery($product_id, $image_urls) {
        $gallery_attachment_ids = array();

        foreach ($image_urls as $image_url) {
            // Verificar se a imagem já existe na biblioteca de mídia
            $attachment_id = $this->get_attachment_id_from_url($image_url);

            if (!$attachment_id) {
                // Fazer upload da imagem
                $attachment_id = $this->upload_image_from_url($image_url);
            }

            if ($attachment_id) {
                $gallery_attachment_ids[] = $attachment_id;
            }
        }

        if (!empty($gallery_attachment_ids)) {
            update_post_meta($product_id, '_product_image_gallery', implode(',', $gallery_attachment_ids));
        }
    }

    /**
     * Obter ID do anexo a partir da URL
     */
    public function get_attachment_id_from_url($url) {
        global $wpdb;

        // Remover parâmetros de consulta
        $url = preg_replace('/\?.*/', '', $url);

        // Obter o nome do arquivo
        $filename = basename($url);

        // Consultar o banco de dados
        $attachment = $wpdb->get_col($wpdb->prepare("SELECT ID FROM $wpdb->posts WHERE guid LIKE %s OR guid LIKE %s;", '%/'.$filename, $url));

        return isset($attachment[0]) ? $attachment[0] : 0;
    }

    /**
     * Fazer upload de imagem a partir da URL
     */
    public function upload_image_from_url($url) {
        // Verificar se a função de mídia está disponível
        if (!function_exists('media_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/image.php');
            require_once(ABSPATH . 'wp-admin/includes/file.php');
            require_once(ABSPATH . 'wp-admin/includes/media.php');
        }

        // Obter o conteúdo da imagem
        $response = wp_remote_get($url);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return 0;
        }

        $image_data = wp_remote_retrieve_body($response);

        if (empty($image_data)) {
            return 0;
        }

        // Obter o nome do arquivo
        $filename = basename($url);

        // Criar arquivo temporário
        $upload = wp_upload_bits($filename, null, $image_data);

        if ($upload['error']) {
            return 0;
        }

        // Obter tipo de arquivo
        $file_type = wp_check_filetype($filename, null);

        // Preparar dados do anexo
        $attachment = array(
            'post_mime_type' => $file_type['type'],
            'post_title' => sanitize_file_name($filename),
            'post_content' => '',
            'post_status' => 'inherit'
        );

        // Inserir anexo
        $attachment_id = wp_insert_attachment($attachment, $upload['file']);

        if (!$attachment_id) {
            return 0;
        }

        // Gerar metadados
        $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
        wp_update_attachment_metadata($attachment_id, $attachment_data);

        return $attachment_id;
    }

    /**
     * Enviar pedido para o PDV Vendas quando uma venda for concluída
     */
    public function send_order_to_pdv($order_id) {
        // Obter URL do webhook do PDV Vendas
        $pdv_webhook_url = get_option('pdv_vendas_webhook_url', '');

        if (empty($pdv_webhook_url)) {
            return;
        }

        $order = wc_get_order($order_id);
        $items = $order->get_items();

        $products_to_update = array();

        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $pdv_id = get_post_meta($product_id, '_pdv_vendas_id', true);

            if ($pdv_id) {
                $product = wc_get_product($product_id);

                $products_to_update[] = array(
                    'id' => $pdv_id,
                    'quantity' => $product->get_stock_quantity(),
                    'sold_quantity' => $item->get_quantity(),
                    'name' => $item->get_name(),
                    'price' => $item->get_total()
                );
            }
        }

        if (!empty($products_to_update)) {
            // Enviar atualização para o PDV Vendas
            wp_remote_post($pdv_webhook_url, array(
                'body' => json_encode(array(
                    'event' => 'order_completed',
                    'order_id' => $order_id,
                    'order_total' => $order->get_total(),
                    'products' => $products_to_update
                )),
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'X-WP-Webhook' => 'pdv-vendas-sale'
                ),
                'timeout' => 30
            ));
        }
    }

    /**
     * Notificar PDV Vendas quando o estoque de um produto for alterado
     */
    public function product_stock_changed($product) {
        // Obter URL do webhook do PDV Vendas
        $pdv_webhook_url = get_option('pdv_vendas_webhook_url', '');

        if (empty($pdv_webhook_url)) {
            return;
        }

        $product_id = $product->get_id();
        $pdv_id = get_post_meta($product_id, '_pdv_vendas_id', true);

        if ($pdv_id) {
            // Enviar atualização para o PDV Vendas
            wp_remote_post($pdv_webhook_url, array(
                'body' => json_encode(array(
                    'event' => 'stock_changed',
                    'product' => array(
                        'id' => $pdv_id,
                        'wordpress_id' => $product_id,
                        'quantity' => $product->get_stock_quantity(),
                        'name' => $product->get_name()
                    )
                )),
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'X-WP-Webhook' => 'pdv-vendas-stock'
                ),
                'timeout' => 30
            ));
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

            $webhook_url = sanitize_text_field($_POST['pdv_vendas_webhook_url']);
            update_option('pdv_vendas_webhook_url', $webhook_url);

            echo '<div class="notice notice-success"><p>Configurações salvas com sucesso!</p></div>';
        }

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
                            <th scope="row"><label for="pdv_vendas_webhook_url">URL do Webhook do PDV Vendas</label></th>
                            <td>
                                <input type="url" id="pdv_vendas_webhook_url" name="pdv_vendas_webhook_url" value="<?php echo esc_attr($webhook_url); ?>" class="regular-text">
                                <p class="description">URL para notificar o aplicativo PDV Vendas quando ocorrer uma venda no WordPress.</p>
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
            </div>

            <div class="card">
                <h2>Endpoints da API</h2>

                <p>URL base: <code><?php echo esc_url(rest_url('pdv-vendas/v1')); ?></code></p>

                <h3>Sincronizar Produtos</h3>
                <p>Endpoint: <code>/sync</code></p>
                <p>Método: <code>POST</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($this->api_key); ?></code></li>
                    <li><code>Content-Type: application/json</code></li>
                </ul>

                <h3>Limpar Produtos</h3>
                <p>Endpoint: <code>/clear</code></p>
                <p>Método: <code>POST</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($this->api_key); ?></code></li>
                </ul>

                <h3>Atualizar Estoque</h3>
                <p>Endpoint: <code>/stock</code></p>
                <p>Método: <code>POST</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($this->api_key); ?></code></li>
                    <li><code>Content-Type: application/json</code></li>
                </ul>

                <h3>Obter Produtos</h3>
                <p>Endpoint: <code>/get-products</code></p>
                <p>Método: <code>GET</code></p>
                <p>Headers:</p>
                <ul>
                    <li><code>X-PDV-API-Key: <?php echo esc_html($this->api_key); ?></code></li>
                </ul>
            </div>
        </div>
        <?php
    }

    /**
     * Shortcode para exibir produtos
     */
    public function products_shortcode($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'limit' => 12,
            'orderby' => 'date',
            'order' => 'desc'
        ), $atts);

        $args = array(
            'post_type' => 'product',
            'posts_per_page' => intval($atts['limit']),
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

        ob_start();

        if ($query->have_posts()) {
            echo '<div class="pdv-vendas-products">';

            while ($query->have_posts()) {
                $query->the_post();
                $product_id = get_the_ID();
                $price = get_post_meta($product_id, '_price', true);
                $stock = get_post_meta($product_id, '_stock', true);

                echo '<div class="pdv-vendas-product">';

                if (has_post_thumbnail()) {
                    echo '<div class="pdv-vendas-product-image">';
                    echo '<a href="' . get_permalink() . '">';
                    the_post_thumbnail('medium');
                    echo '</a>';
                    echo '</div>';
                }

                echo '<div class="pdv-vendas-product-details">';
                echo '<h3 class="pdv-vendas-product-title"><a href="' . get_permalink() . '">' . get_the_title() . '</a></h3>';

                if (!empty($price)) {
                    echo '<div class="pdv-vendas-product-price">' . wc_price($price) . '</div>';
                }

                if (!empty($stock)) {
                    echo '<div class="pdv-vendas-product-stock">Estoque: ' . $stock . '</div>';
                }

                echo '<div class="pdv-vendas-product-description">' . get_the_excerpt() . '</div>';

                echo '<a href="' . get_permalink() . '" class="pdv-vendas-product-button">Ver Detalhes</a>';
                echo '</div>';

                echo '</div>';
            }

            echo '</div>';
        } else {
            echo '<p>Nenhum produto encontrado.</p>';
        }

        wp_reset_postdata();

        return ob_get_clean();
    }
}

// Inicializar o plugin
new PDV_WordPress_Integration();
