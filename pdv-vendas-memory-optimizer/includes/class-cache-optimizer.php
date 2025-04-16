<?php
/**
 * Classe de otimização de cache
 * 
 * Gerencia as configurações de cache do WordPress
 */

// Impedir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class PDV_Vendas_Cache_Optimizer {
    
    /**
     * Construtor
     */
    public function __construct() {
        // Adicionar hooks para otimização de cache
        add_action('init', array($this, 'init_cache_optimization'));
        
        // Adicionar hooks para otimização de banco de dados
        add_action('admin_init', array($this, 'maybe_optimize_database'));
        
        // Adicionar hooks para otimização de imagens
        add_filter('wp_get_attachment_image_attributes', array($this, 'optimize_image_attributes'), 10, 3);
        
        // Adicionar hooks para limpeza de cache
        add_action('admin_post_pdv_clear_cache', array($this, 'clear_cache'));
    }
    
    /**
     * Inicializar otimização de cache
     */
    public function init_cache_optimization() {
        // Obter configurações
        $options = get_option('pdv_memory_optimizer_settings', array(
            'enable_object_cache' => true,
            'optimize_database' => true,
            'optimize_images' => true
        ));
        
        // Verificar se a otimização de cache está ativada
        if (!$options['enable_object_cache']) {
            return;
        }
        
        // Adicionar filtros para otimizar o cache
        add_filter('wp_cache_get_multi', array($this, 'optimize_cache_get_multi'), 10, 2);
        add_action('save_post', array($this, 'clear_post_cache'), 10, 3);
        add_action('deleted_post', array($this, 'clear_post_cache'), 10, 1);
        add_action('switch_theme', array($this, 'clear_theme_cache'));
        add_action('activated_plugin', array($this, 'clear_plugin_cache'));
        add_action('deactivated_plugin', array($this, 'clear_plugin_cache'));
        
        // Adicionar filtros para otimizar o WooCommerce
        if (class_exists('WooCommerce')) {
            add_filter('woocommerce_cache_expiration', array($this, 'set_woocommerce_cache_expiration'), 10, 1);
            add_action('woocommerce_update_product', array($this, 'clear_product_cache'), 10, 1);
            add_action('woocommerce_delete_product', array($this, 'clear_product_cache'), 10, 1);
        }
    }
    
    /**
     * Configurar cache de objetos
     */
    public function setup_object_cache() {
        // Verificar se o cache de objetos está ativado
        $options = get_option('pdv_memory_optimizer_settings', array(
            'enable_object_cache' => true
        ));
        
        if (!$options['enable_object_cache']) {
            return;
        }
        
        // Verificar se o arquivo object-cache.php já existe
        $object_cache_file = WP_CONTENT_DIR . '/object-cache.php';
        
        if (file_exists($object_cache_file)) {
            // Fazer backup do arquivo existente
            copy($object_cache_file, $object_cache_file . '.bak');
        }
        
        // Copiar o arquivo object-cache.php para o diretório wp-content
        copy(PDV_MEMORY_OPTIMIZER_PLUGIN_DIR . 'includes/object-cache.php', $object_cache_file);
        
        // Definir permissões
        chmod($object_cache_file, 0644);
    }
    
    /**
     * Otimizar cache_get_multi
     */
    public function optimize_cache_get_multi($results, $keys) {
        // Implementação personalizada para otimizar o cache_get_multi
        return $results;
    }
    
    /**
     * Limpar cache de post
     */
    public function clear_post_cache($post_id, $post = null, $update = null) {
        if (function_exists('wp_cache_delete')) {
            wp_cache_delete($post_id, 'posts');
            wp_cache_delete('get_pages', 'posts');
            
            // Limpar cache relacionado ao WooCommerce se for um produto
            if (function_exists('wc_get_product') && get_post_type($post_id) === 'product') {
                wp_cache_delete($post_id, 'products');
                wp_cache_delete('wc_product_' . $post_id, 'products');
            }
        }
    }
    
    /**
     * Limpar cache de tema
     */
    public function clear_theme_cache() {
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
    }
    
    /**
     * Limpar cache de plugin
     */
    public function clear_plugin_cache() {
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
    }
    
    /**
     * Limpar cache de produto
     */
    public function clear_product_cache($product_id) {
        if (function_exists('wp_cache_delete')) {
            wp_cache_delete($product_id, 'products');
            wp_cache_delete('wc_product_' . $product_id, 'products');
        }
    }
    
    /**
     * Definir tempo de expiração do cache do WooCommerce
     */
    public function set_woocommerce_cache_expiration($expiration) {
        // Definir tempo de expiração para 1 hora (3600 segundos)
        return 3600;
    }
    
    /**
     * Otimizar atributos de imagem
     */
    public function optimize_image_attributes($attr, $attachment, $size) {
        // Obter configurações
        $options = get_option('pdv_memory_optimizer_settings', array(
            'optimize_images' => true
        ));
        
        // Verificar se a otimização de imagens está ativada
        if (!$options['optimize_images']) {
            return $attr;
        }
        
        // Adicionar atributo loading="lazy" se ainda não existir
        if (!isset($attr['loading'])) {
            $attr['loading'] = 'lazy';
        }
        
        // Adicionar atributo decoding="async" se ainda não existir
        if (!isset($attr['decoding'])) {
            $attr['decoding'] = 'async';
        }
        
        return $attr;
    }
    
    /**
     * Otimizar banco de dados
     */
    public function maybe_optimize_database() {
        // Obter configurações
        $options = get_option('pdv_memory_optimizer_settings', array(
            'optimize_database' => true
        ));
        
        // Verificar se a otimização de banco de dados está ativada
        if (!$options['optimize_database']) {
            return;
        }
        
        // Verificar se é hora de otimizar o banco de dados (uma vez por semana)
        $last_optimization = get_option('pdv_memory_optimizer_last_db_optimization', 0);
        $week_in_seconds = 7 * 24 * 60 * 60;
        
        if (time() - $last_optimization < $week_in_seconds) {
            return;
        }
        
        // Otimizar tabelas do banco de dados
        $this->optimize_database();
        
        // Registrar a data da otimização
        update_option('pdv_memory_optimizer_last_db_optimization', time());
    }
    
    /**
     * Otimizar banco de dados
     */
    private function optimize_database() {
        global $wpdb;
        
        // Limpar revisões de posts
        $wpdb->query("DELETE FROM $wpdb->posts WHERE post_type = 'revision'");
        
        // Limpar posts auto-salvos
        $wpdb->query("DELETE FROM $wpdb->posts WHERE post_status = 'auto-draft'");
        
        // Limpar comentários spam
        $wpdb->query("DELETE FROM $wpdb->comments WHERE comment_approved = 'spam'");
        
        // Limpar comentários na lixeira
        $wpdb->query("DELETE FROM $wpdb->comments WHERE comment_approved = 'trash'");
        
        // Limpar meta dados órfãos
        $wpdb->query("DELETE FROM $wpdb->postmeta WHERE post_id NOT IN (SELECT ID FROM $wpdb->posts)");
        $wpdb->query("DELETE FROM $wpdb->commentmeta WHERE comment_id NOT IN (SELECT comment_ID FROM $wpdb->comments)");
        $wpdb->query("DELETE FROM $wpdb->termmeta WHERE term_id NOT IN (SELECT term_id FROM $wpdb->terms)");
        
        // Otimizar tabelas
        $tables = $wpdb->get_results("SHOW TABLES", ARRAY_N);
        
        if ($tables) {
            foreach ($tables as $table) {
                $wpdb->query("OPTIMIZE TABLE $table[0]");
            }
        }
    }
    
    /**
     * Limpar cache
     */
    public function clear_cache() {
        // Verificar nonce
        if (!isset($_POST['pdv_memory_optimizer_clear_cache_nonce']) || !wp_verify_nonce($_POST['pdv_memory_optimizer_clear_cache_nonce'], 'pdv_memory_optimizer_clear_cache')) {
            wp_die('Verificação de segurança falhou.');
        }
        
        // Limpar cache do WordPress
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
        
        // Limpar cache de transients
        $this->clear_transients();
        
        // Limpar cache do WooCommerce
        if (class_exists('WooCommerce')) {
            if (function_exists('wc_cache_helper_clear_cache_data')) {
                wc_cache_helper_clear_cache_data();
            }
            
            if (function_exists('wc_delete_product_transients')) {
                wc_delete_product_transients();
            }
            
            if (function_exists('wc_delete_shop_order_transients')) {
                wc_delete_shop_order_transients();
            }
        }
        
        // Redirecionar de volta para a página de configurações
        wp_redirect(add_query_arg('cache-cleared', '1', admin_url('options-general.php?page=pdv-memory-optimizer')));
        exit;
    }
    
    /**
     * Limpar transients
     */
    private function clear_transients() {
        global $wpdb;
        
        // Limpar transients normais
        $wpdb->query("DELETE FROM $wpdb->options WHERE option_name LIKE '%_transient_%'");
        
        // Limpar transients de sites (multisite)
        if (is_multisite()) {
            $wpdb->query("DELETE FROM $wpdb->sitemeta WHERE meta_key LIKE '%_site_transient_%'");
        }
    }
}
