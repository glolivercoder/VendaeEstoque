<?php
/**
 * Gerenciador de webhooks entre PDV Vendas e WordPress
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe para gerenciar webhooks
 */
class PDV_WordPress_Webhook_Handler {
    /**
     * Construtor
     */
    public function __construct() {
        // Adicionar endpoint para receber webhooks do PDV Vendas
        add_action('rest_api_init', array($this, 'register_webhook_endpoints'));
        
        // Adicionar hooks para enviar webhooks para o PDV Vendas
        add_action('woocommerce_order_status_completed', array($this, 'send_order_webhook'));
        add_action('woocommerce_product_set_stock', array($this, 'send_stock_webhook'));
    }
    
    /**
     * Registrar endpoints para webhooks
     */
    public function register_webhook_endpoints() {
        register_rest_route('pdv-vendas/v1', '/webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'process_webhook'),
            'permission_callback' => array($this, 'verify_webhook_auth')
        ));
    }
    
    /**
     * Verificar autenticação do webhook
     */
    public function verify_webhook_auth($request) {
        // Verificar cabeçalho de autenticação
        $api_key = $request->get_header('X-PDV-API-Key');
        
        // Chave de API padrão
        $default_api_key = 'OxCq4oUPrd5hqxPEq1zdjEd4';
        
        return $api_key === $default_api_key;
    }
    
    /**
     * Processar webhook recebido do PDV Vendas
     */
    public function process_webhook($request) {
        $params = $request->get_json_params();
        
        if (empty($params['event'])) {
            return new WP_Error('no_event', 'Evento não especificado', array('status' => 400));
        }
        
        $event = $params['event'];
        $result = array(
            'success' => true,
            'message' => 'Webhook processado com sucesso',
            'event' => $event
        );
        
        // Processar diferentes tipos de eventos
        switch ($event) {
            case 'stock_update':
                $result = $this->process_stock_update($params);
                break;
                
            case 'product_sync':
                $result = $this->process_product_sync($params);
                break;
                
            default:
                $result = array(
                    'success' => false,
                    'message' => 'Evento desconhecido: ' . $event,
                    'event' => $event
                );
                break;
        }
        
        return rest_ensure_response($result);
    }
    
    /**
     * Processar atualização de estoque
     */
    private function process_stock_update($params) {
        if (empty($params['products'])) {
            return array(
                'success' => false,
                'message' => 'Nenhum produto fornecido para atualização de estoque'
            );
        }
        
        $products = $params['products'];
        $updated_count = 0;
        $results = array();
        
        foreach ($products as $product) {
            if (empty($product['id'])) {
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
                }
            }
            
            wp_reset_postdata();
        }
        
        return array(
            'success' => true,
            'message' => 'Estoque atualizado com sucesso',
            'updated_count' => $updated_count,
            'results' => $results
        );
    }
    
    /**
     * Processar sincronização de produtos
     */
    private function process_product_sync($params) {
        if (empty($params['products'])) {
            return array(
                'success' => false,
                'message' => 'Nenhum produto fornecido para sincronização'
            );
        }
        
        $products = $params['products'];
        $synced_count = 0;
        $results = array();
        
        // Instanciar a classe principal para usar o método de criação/atualização de produtos
        $integration = new PDV_WordPress_Integration();
        
        foreach ($products as $product) {
            if (empty($product['id'])) {
                continue;
            }
            
            $product_id = $integration->create_or_update_product($product);
            
            if ($product_id) {
                $synced_count++;
                $results[] = array(
                    'status' => 'success',
                    'message' => 'Produto sincronizado',
                    'product_id' => $product_id,
                    'pdv_id' => $product['id']
                );
            }
        }
        
        return array(
            'success' => true,
            'message' => 'Produtos sincronizados com sucesso',
            'synced_count' => $synced_count,
            'results' => $results
        );
    }
    
    /**
     * Enviar webhook de pedido para o PDV Vendas
     */
    public function send_order_webhook($order_id) {
        // Obter URL do webhook do PDV Vendas
        $webhook_url = get_option('pdv_vendas_webhook_url', '');
        
        if (empty($webhook_url)) {
            return;
        }
        
        $order = wc_get_order($order_id);
        $items = $order->get_items();
        
        $products = array();
        
        foreach ($items as $item) {
            $product_id = $item->get_product_id();
            $pdv_id = get_post_meta($product_id, '_pdv_vendas_id', true);
            
            if ($pdv_id) {
                $product = wc_get_product($product_id);
                
                $products[] = array(
                    'id' => $pdv_id,
                    'quantity' => $product->get_stock_quantity(),
                    'sold_quantity' => $item->get_quantity(),
                    'name' => $item->get_name(),
                    'price' => $item->get_total()
                );
            }
        }
        
        if (!empty($products)) {
            // Enviar webhook para o PDV Vendas
            wp_remote_post($webhook_url, array(
                'body' => json_encode(array(
                    'event' => 'order_completed',
                    'order_id' => $order_id,
                    'order_total' => $order->get_total(),
                    'products' => $products
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
     * Enviar webhook de atualização de estoque para o PDV Vendas
     */
    public function send_stock_webhook($product) {
        // Obter URL do webhook do PDV Vendas
        $webhook_url = get_option('pdv_vendas_webhook_url', '');
        
        if (empty($webhook_url)) {
            return;
        }
        
        $product_id = $product->get_id();
        $pdv_id = get_post_meta($product_id, '_pdv_vendas_id', true);
        
        if ($pdv_id) {
            // Enviar webhook para o PDV Vendas
            wp_remote_post($webhook_url, array(
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
}

// Inicializar
new PDV_WordPress_Webhook_Handler();
