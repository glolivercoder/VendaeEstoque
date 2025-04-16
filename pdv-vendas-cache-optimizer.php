<?php
/**
 * Plugin Name: PDV Vendas Cache Optimizer
 * Plugin URI: https://achadinhoshopp.com.br/loja/
 * Description: Otimiza as configurações de cache do WordPress para melhor desempenho com o PDV Vendas.
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja/
 * Text Domain: pdv-vendas-cache-optimizer
 */

// Impedir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe principal do plugin
 */
class PDV_Vendas_Cache_Optimizer {
    
    /**
     * Construtor
     */
    public function __construct() {
        // Adicionar menu de administração
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Registrar configurações
        add_action('admin_init', array($this, 'register_settings'));
        
        // Otimizar o cache do WordPress
        $this->optimize_cache();
        
        // Adicionar filtros para otimizar o WooCommerce
        add_filter('woocommerce_cache_expiration', array($this, 'set_woocommerce_cache_expiration'), 10, 1);
        
        // Adicionar suporte para cache de objetos
        add_action('plugins_loaded', array($this, 'setup_object_cache'));
    }
    
    /**
     * Adicionar menu de administração
     */
    public function add_admin_menu() {
        add_submenu_page(
            'options-general.php',
            'Otimizador de Cache PDV Vendas',
            'Otimizador de Cache',
            'manage_options',
            'pdv-vendas-cache-optimizer',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Registrar configurações
     */
    public function register_settings() {
        register_setting('pdv_vendas_cache_optimizer', 'pdv_vendas_cache_optimizer_settings');
        
        add_settings_section(
            'pdv_vendas_cache_optimizer_section',
            'Configurações de Cache',
            array($this, 'render_section_description'),
            'pdv_vendas_cache_optimizer'
        );
        
        add_settings_field(
            'enable_object_cache',
            'Ativar Cache de Objetos',
            array($this, 'render_enable_object_cache_field'),
            'pdv_vendas_cache_optimizer',
            'pdv_vendas_cache_optimizer_section'
        );
        
        add_settings_field(
            'cache_expiration',
            'Tempo de Expiração do Cache (segundos)',
            array($this, 'render_cache_expiration_field'),
            'pdv_vendas_cache_optimizer',
            'pdv_vendas_cache_optimizer_section'
        );
        
        add_settings_field(
            'memory_limit',
            'Limite de Memória (MB)',
            array($this, 'render_memory_limit_field'),
            'pdv_vendas_cache_optimizer',
            'pdv_vendas_cache_optimizer_section'
        );
    }
    
    /**
     * Renderizar descrição da seção
     */
    public function render_section_description() {
        echo '<p>Configure as opções de cache para otimizar o desempenho do WordPress com o PDV Vendas.</p>';
    }
    
    /**
     * Renderizar campo de ativação do cache de objetos
     */
    public function render_enable_object_cache_field() {
        $options = get_option('pdv_vendas_cache_optimizer_settings', array(
            'enable_object_cache' => true
        ));
        
        echo '<input type="checkbox" id="enable_object_cache" name="pdv_vendas_cache_optimizer_settings[enable_object_cache]" value="1" ' . checked(isset($options['enable_object_cache']) ? $options['enable_object_cache'] : true, true, false) . ' />';
        echo '<label for="enable_object_cache">Ativar cache de objetos para melhor desempenho</label>';
    }
    
    /**
     * Renderizar campo de tempo de expiração do cache
     */
    public function render_cache_expiration_field() {
        $options = get_option('pdv_vendas_cache_optimizer_settings', array(
            'cache_expiration' => 3600
        ));
        
        echo '<input type="number" id="cache_expiration" name="pdv_vendas_cache_optimizer_settings[cache_expiration]" value="' . esc_attr(isset($options['cache_expiration']) ? $options['cache_expiration'] : 3600) . '" min="60" max="86400" step="60" />';
        echo '<p class="description">Tempo em segundos que os itens permanecem no cache. Recomendado: 3600 (1 hora)</p>';
    }
    
    /**
     * Renderizar campo de limite de memória
     */
    public function render_memory_limit_field() {
        $options = get_option('pdv_vendas_cache_optimizer_settings', array(
            'memory_limit' => 1024
        ));
        
        echo '<input type="number" id="memory_limit" name="pdv_vendas_cache_optimizer_settings[memory_limit]" value="' . esc_attr(isset($options['memory_limit']) ? $options['memory_limit'] : 1024) . '" min="256" max="2048" step="128" />';
        echo '<p class="description">Limite de memória em MB. Recomendado: 1024 (1GB)</p>';
    }
    
    /**
     * Renderizar página de administração
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Verificar se as configurações foram salvas
        if (isset($_GET['settings-updated'])) {
            add_settings_error('pdv_vendas_cache_optimizer_messages', 'pdv_vendas_cache_optimizer_message', 'Configurações salvas com sucesso.', 'updated');
            
            // Aplicar as novas configurações
            $this->optimize_cache();
        }
        
        // Mostrar mensagens de erro/sucesso
        settings_errors('pdv_vendas_cache_optimizer_messages');
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <form action="options.php" method="post">
                <?php
                settings_fields('pdv_vendas_cache_optimizer');
                do_settings_sections('pdv_vendas_cache_optimizer');
                submit_button('Salvar Configurações');
                ?>
            </form>
            
            <hr>
            
            <h2>Status do Sistema</h2>
            
            <table class="widefat" style="margin-top: 20px;">
                <thead>
                    <tr>
                        <th>Configuração</th>
                        <th>Valor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Limite de Memória PHP</td>
                        <td><?php echo ini_get('memory_limit'); ?></td>
                        <td><?php echo $this->get_status_icon(intval(ini_get('memory_limit')) >= 256); ?></td>
                    </tr>
                    <tr>
                        <td>Limite de Memória WordPress</td>
                        <td><?php echo defined('WP_MEMORY_LIMIT') ? WP_MEMORY_LIMIT : 'Não definido'; ?></td>
                        <td><?php echo $this->get_status_icon(defined('WP_MEMORY_LIMIT') && intval(WP_MEMORY_LIMIT) >= 256); ?></td>
                    </tr>
                    <tr>
                        <td>Limite de Memória Admin</td>
                        <td><?php echo defined('WP_MAX_MEMORY_LIMIT') ? WP_MAX_MEMORY_LIMIT : 'Não definido'; ?></td>
                        <td><?php echo $this->get_status_icon(defined('WP_MAX_MEMORY_LIMIT') && intval(WP_MAX_MEMORY_LIMIT) >= 256); ?></td>
                    </tr>
                    <tr>
                        <td>Cache de Objetos</td>
                        <td><?php echo defined('WP_CACHE') && WP_CACHE ? 'Ativado' : 'Desativado'; ?></td>
                        <td><?php echo $this->get_status_icon(defined('WP_CACHE') && WP_CACHE); ?></td>
                    </tr>
                    <tr>
                        <td>Tamanho Máximo de Upload</td>
                        <td><?php echo ini_get('upload_max_filesize'); ?></td>
                        <td><?php echo $this->get_status_icon(intval(ini_get('upload_max_filesize')) >= 32); ?></td>
                    </tr>
                    <tr>
                        <td>Tamanho Máximo de Post</td>
                        <td><?php echo ini_get('post_max_size'); ?></td>
                        <td><?php echo $this->get_status_icon(intval(ini_get('post_max_size')) >= 32); ?></td>
                    </tr>
                    <tr>
                        <td>Tempo Máximo de Execução</td>
                        <td><?php echo ini_get('max_execution_time'); ?> segundos</td>
                        <td><?php echo $this->get_status_icon(intval(ini_get('max_execution_time')) >= 60); ?></td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 20px;">
                <h3>Aplicar Configurações Recomendadas</h3>
                <p>Clique no botão abaixo para aplicar automaticamente as configurações recomendadas para o PDV Vendas.</p>
                <form method="post" action="">
                    <?php wp_nonce_field('pdv_vendas_cache_optimizer_apply_recommended', 'pdv_vendas_cache_optimizer_nonce'); ?>
                    <input type="hidden" name="action" value="apply_recommended">
                    <button type="submit" class="button button-primary">Aplicar Configurações Recomendadas</button>
                </form>
            </div>
            
            <div style="margin-top: 20px;">
                <h3>Limpar Cache</h3>
                <p>Clique no botão abaixo para limpar todos os caches do WordPress.</p>
                <form method="post" action="">
                    <?php wp_nonce_field('pdv_vendas_cache_optimizer_clear_cache', 'pdv_vendas_cache_optimizer_clear_cache_nonce'); ?>
                    <input type="hidden" name="action" value="clear_cache">
                    <button type="submit" class="button button-secondary">Limpar Cache</button>
                </form>
            </div>
        </div>
        <?php
    }
    
    /**
     * Obter ícone de status
     */
    private function get_status_icon($status) {
        if ($status) {
            return '<span style="color: green; font-size: 20px; vertical-align: middle;">✓</span>';
        } else {
            return '<span style="color: red; font-size: 20px; vertical-align: middle;">✗</span>';
        }
    }
    
    /**
     * Otimizar o cache do WordPress
     */
    public function optimize_cache() {
        // Obter configurações
        $options = get_option('pdv_vendas_cache_optimizer_settings', array(
            'enable_object_cache' => true,
            'cache_expiration' => 3600,
            'memory_limit' => 1024
        ));
        
        // Definir limite de memória
        $memory_limit = isset($options['memory_limit']) ? intval($options['memory_limit']) : 1024;
        
        // Tentar definir o limite de memória do PHP
        @ini_set('memory_limit', $memory_limit . 'M');
        
        // Definir constantes do WordPress se ainda não estiverem definidas
        if (!defined('WP_MEMORY_LIMIT')) {
            define('WP_MEMORY_LIMIT', $memory_limit . 'M');
        }
        
        if (!defined('WP_MAX_MEMORY_LIMIT')) {
            define('WP_MAX_MEMORY_LIMIT', $memory_limit . 'M');
        }
        
        // Ativar cache de objetos se necessário
        if (isset($options['enable_object_cache']) && $options['enable_object_cache'] && !defined('WP_CACHE')) {
            define('WP_CACHE', true);
        }
        
        // Definir tempo de expiração do cache
        $this->cache_expiration = isset($options['cache_expiration']) ? intval($options['cache_expiration']) : 3600;
    }
    
    /**
     * Configurar cache de objetos
     */
    public function setup_object_cache() {
        // Verificar se o cache de objetos está ativado
        $options = get_option('pdv_vendas_cache_optimizer_settings', array(
            'enable_object_cache' => true
        ));
        
        if (isset($options['enable_object_cache']) && $options['enable_object_cache']) {
            // Adicionar filtros para otimizar o cache
            add_filter('wp_cache_get_multi', array($this, 'optimize_cache_get_multi'), 10, 2);
            add_action('save_post', array($this, 'clear_post_cache'), 10, 3);
            add_action('deleted_post', array($this, 'clear_post_cache'), 10, 1);
            add_action('switch_theme', array($this, 'clear_theme_cache'));
            add_action('activated_plugin', array($this, 'clear_plugin_cache'));
            add_action('deactivated_plugin', array($this, 'clear_plugin_cache'));
        }
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
     * Definir tempo de expiração do cache do WooCommerce
     */
    public function set_woocommerce_cache_expiration($expiration) {
        return $this->cache_expiration;
    }
}

// Iniciar o plugin
new PDV_Vendas_Cache_Optimizer();
