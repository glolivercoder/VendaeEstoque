<?php
/**
 * Plugin Name: PDV Vendas Memory Optimizer
 * Plugin URI: https://achadinhoshopp.com.br/loja/
 * Description: Otimiza as configurações de memória do WordPress para 1024MB e melhora o desempenho do cache para a integração com PDV Vendas.
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja/
 * Text Domain: pdv-vendas-memory-optimizer
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.2
 */

// Impedir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Definir constantes
define('PDV_MEMORY_OPTIMIZER_VERSION', '1.0.0');
define('PDV_MEMORY_OPTIMIZER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PDV_MEMORY_OPTIMIZER_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Classe principal do plugin
 */
class PDV_Vendas_Memory_Optimizer {
    
    /**
     * Instância única da classe (padrão Singleton)
     */
    private static $instance = null;
    
    /**
     * Obter instância única da classe
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Construtor
     */
    private function __construct() {
        // Registrar hooks de ativação e desativação
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Adicionar menu de administração
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Registrar configurações
        add_action('admin_init', array($this, 'register_settings'));
        
        // Adicionar link de configurações na página de plugins
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
        
        // Adicionar notificação de admin se as configurações não estiverem aplicadas
        add_action('admin_notices', array($this, 'admin_notices'));
        
        // Carregar arquivos necessários
        $this->load_dependencies();
        
        // Aplicar configurações de memória
        $this->apply_memory_settings();
    }
    
    /**
     * Carregar dependências
     */
    private function load_dependencies() {
        // Carregar classe de configuração de memória
        require_once PDV_MEMORY_OPTIMIZER_PLUGIN_DIR . 'includes/class-memory-config.php';
        
        // Carregar classe de otimização de cache
        require_once PDV_MEMORY_OPTIMIZER_PLUGIN_DIR . 'includes/class-cache-optimizer.php';
    }
    
    /**
     * Ativação do plugin
     */
    public function activate() {
        // Verificar requisitos mínimos
        if (version_compare(PHP_VERSION, '7.2', '<')) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die('O plugin PDV Vendas Memory Optimizer requer PHP 7.2 ou superior.');
        }
        
        // Aplicar configurações de memória
        $memory_config = new PDV_Vendas_Memory_Config();
        $memory_config->apply_config();
        
        // Criar arquivo de cache de objetos
        $cache_optimizer = new PDV_Vendas_Cache_Optimizer();
        $cache_optimizer->setup_object_cache();
        
        // Salvar opções padrão
        $default_options = array(
            'memory_limit' => '1024M',
            'max_memory_limit' => '1024M',
            'enable_object_cache' => true,
            'optimize_database' => true,
            'optimize_images' => true,
            'last_updated' => current_time('timestamp')
        );
        
        update_option('pdv_memory_optimizer_settings', $default_options);
        
        // Limpar cache
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
        
        // Adicionar flag para mostrar mensagem de boas-vindas
        set_transient('pdv_memory_optimizer_activation_redirect', true, 30);
    }
    
    /**
     * Desativação do plugin
     */
    public function deactivate() {
        // Não remover configurações de memória para evitar problemas
        // Apenas registrar que o plugin foi desativado
        update_option('pdv_memory_optimizer_active', false);
    }
    
    /**
     * Adicionar menu de administração
     */
    public function add_admin_menu() {
        add_options_page(
            'PDV Vendas Memory Optimizer',
            'Memory Optimizer',
            'manage_options',
            'pdv-memory-optimizer',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Registrar configurações
     */
    public function register_settings() {
        register_setting('pdv_memory_optimizer', 'pdv_memory_optimizer_settings', array($this, 'sanitize_settings'));
        
        add_settings_section(
            'pdv_memory_optimizer_section',
            'Configurações de Memória e Cache',
            array($this, 'render_section_description'),
            'pdv_memory_optimizer'
        );
        
        add_settings_field(
            'memory_limit',
            'Limite de Memória (MB)',
            array($this, 'render_memory_limit_field'),
            'pdv_memory_optimizer',
            'pdv_memory_optimizer_section'
        );
        
        add_settings_field(
            'max_memory_limit',
            'Limite de Memória Admin (MB)',
            array($this, 'render_max_memory_limit_field'),
            'pdv_memory_optimizer',
            'pdv_memory_optimizer_section'
        );
        
        add_settings_field(
            'enable_object_cache',
            'Cache de Objetos',
            array($this, 'render_enable_object_cache_field'),
            'pdv_memory_optimizer',
            'pdv_memory_optimizer_section'
        );
        
        add_settings_field(
            'optimize_database',
            'Otimização de Banco de Dados',
            array($this, 'render_optimize_database_field'),
            'pdv_memory_optimizer',
            'pdv_memory_optimizer_section'
        );
        
        add_settings_field(
            'optimize_images',
            'Otimização de Imagens',
            array($this, 'render_optimize_images_field'),
            'pdv_memory_optimizer',
            'pdv_memory_optimizer_section'
        );
    }
    
    /**
     * Sanitizar configurações
     */
    public function sanitize_settings($input) {
        $sanitized_input = array();
        
        // Sanitizar limite de memória
        if (isset($input['memory_limit'])) {
            $memory_limit = intval($input['memory_limit']);
            $sanitized_input['memory_limit'] = max(256, min(2048, $memory_limit)) . 'M';
        } else {
            $sanitized_input['memory_limit'] = '1024M';
        }
        
        // Sanitizar limite de memória admin
        if (isset($input['max_memory_limit'])) {
            $max_memory_limit = intval($input['max_memory_limit']);
            $sanitized_input['max_memory_limit'] = max(256, min(2048, $max_memory_limit)) . 'M';
        } else {
            $sanitized_input['max_memory_limit'] = '1024M';
        }
        
        // Sanitizar cache de objetos
        $sanitized_input['enable_object_cache'] = isset($input['enable_object_cache']) ? (bool) $input['enable_object_cache'] : false;
        
        // Sanitizar otimização de banco de dados
        $sanitized_input['optimize_database'] = isset($input['optimize_database']) ? (bool) $input['optimize_database'] : false;
        
        // Sanitizar otimização de imagens
        $sanitized_input['optimize_images'] = isset($input['optimize_images']) ? (bool) $input['optimize_images'] : false;
        
        // Registrar última atualização
        $sanitized_input['last_updated'] = current_time('timestamp');
        
        // Aplicar novas configurações
        $memory_config = new PDV_Vendas_Memory_Config();
        $memory_config->update_config($sanitized_input);
        
        return $sanitized_input;
    }
    
    /**
     * Renderizar descrição da seção
     */
    public function render_section_description() {
        echo '<p>Configure as opções de memória e cache para otimizar o desempenho do WordPress com o PDV Vendas.</p>';
    }
    
    /**
     * Renderizar campo de limite de memória
     */
    public function render_memory_limit_field() {
        $options = get_option('pdv_memory_optimizer_settings');
        $memory_limit = isset($options['memory_limit']) ? intval($options['memory_limit']) : 1024;
        
        echo '<input type="number" id="memory_limit" name="pdv_memory_optimizer_settings[memory_limit]" value="' . esc_attr($memory_limit) . '" min="256" max="2048" step="128" />';
        echo '<p class="description">Limite de memória em MB para o WordPress. Recomendado: 1024 (1GB)</p>';
    }
    
    /**
     * Renderizar campo de limite de memória admin
     */
    public function render_max_memory_limit_field() {
        $options = get_option('pdv_memory_optimizer_settings');
        $max_memory_limit = isset($options['max_memory_limit']) ? intval($options['max_memory_limit']) : 1024;
        
        echo '<input type="number" id="max_memory_limit" name="pdv_memory_optimizer_settings[max_memory_limit]" value="' . esc_attr($max_memory_limit) . '" min="256" max="2048" step="128" />';
        echo '<p class="description">Limite de memória em MB para o painel administrativo. Recomendado: 1024 (1GB)</p>';
    }
    
    /**
     * Renderizar campo de cache de objetos
     */
    public function render_enable_object_cache_field() {
        $options = get_option('pdv_memory_optimizer_settings');
        $enable_object_cache = isset($options['enable_object_cache']) ? $options['enable_object_cache'] : true;
        
        echo '<input type="checkbox" id="enable_object_cache" name="pdv_memory_optimizer_settings[enable_object_cache]" value="1" ' . checked($enable_object_cache, true, false) . ' />';
        echo '<label for="enable_object_cache">Ativar cache de objetos para melhor desempenho</label>';
    }
    
    /**
     * Renderizar campo de otimização de banco de dados
     */
    public function render_optimize_database_field() {
        $options = get_option('pdv_memory_optimizer_settings');
        $optimize_database = isset($options['optimize_database']) ? $options['optimize_database'] : true;
        
        echo '<input type="checkbox" id="optimize_database" name="pdv_memory_optimizer_settings[optimize_database]" value="1" ' . checked($optimize_database, true, false) . ' />';
        echo '<label for="optimize_database">Otimizar consultas ao banco de dados</label>';
    }
    
    /**
     * Renderizar campo de otimização de imagens
     */
    public function render_optimize_images_field() {
        $options = get_option('pdv_memory_optimizer_settings');
        $optimize_images = isset($options['optimize_images']) ? $options['optimize_images'] : true;
        
        echo '<input type="checkbox" id="optimize_images" name="pdv_memory_optimizer_settings[optimize_images]" value="1" ' . checked($optimize_images, true, false) . ' />';
        echo '<label for="optimize_images">Otimizar carregamento de imagens</label>';
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
            add_settings_error('pdv_memory_optimizer_messages', 'pdv_memory_optimizer_message', 'Configurações salvas com sucesso.', 'updated');
        }
        
        // Mostrar mensagens de erro/sucesso
        settings_errors('pdv_memory_optimizer_messages');
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <form action="options.php" method="post">
                <?php
                settings_fields('pdv_memory_optimizer');
                do_settings_sections('pdv_memory_optimizer');
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
                    <?php wp_nonce_field('pdv_memory_optimizer_apply_recommended', 'pdv_memory_optimizer_nonce'); ?>
                    <input type="hidden" name="action" value="apply_recommended">
                    <button type="submit" class="button button-primary">Aplicar Configurações Recomendadas</button>
                </form>
            </div>
            
            <div style="margin-top: 20px;">
                <h3>Limpar Cache</h3>
                <p>Clique no botão abaixo para limpar todos os caches do WordPress.</p>
                <form method="post" action="">
                    <?php wp_nonce_field('pdv_memory_optimizer_clear_cache', 'pdv_memory_optimizer_clear_cache_nonce'); ?>
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
     * Adicionar link de configurações na página de plugins
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="options-general.php?page=pdv-memory-optimizer">' . __('Configurações', 'pdv-vendas-memory-optimizer') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
    
    /**
     * Mostrar notificações de admin
     */
    public function admin_notices() {
        // Verificar se é a primeira execução após a ativação
        if (get_transient('pdv_memory_optimizer_activation_redirect')) {
            delete_transient('pdv_memory_optimizer_activation_redirect');
            ?>
            <div class="notice notice-success is-dismissible">
                <p><?php _e('O plugin PDV Vendas Memory Optimizer foi ativado com sucesso! <a href="options-general.php?page=pdv-memory-optimizer">Clique aqui</a> para configurar.', 'pdv-vendas-memory-optimizer'); ?></p>
            </div>
            <?php
        }
        
        // Verificar se as configurações de memória estão aplicadas
        if (!defined('WP_MEMORY_LIMIT') || WP_MEMORY_LIMIT !== '1024M') {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p><?php _e('O limite de memória do WordPress não está configurado para 1024MB. <a href="options-general.php?page=pdv-memory-optimizer">Clique aqui</a> para configurar.', 'pdv-vendas-memory-optimizer'); ?></p>
            </div>
            <?php
        }
    }
    
    /**
     * Aplicar configurações de memória
     */
    private function apply_memory_settings() {
        // Obter configurações
        $options = get_option('pdv_memory_optimizer_settings', array(
            'memory_limit' => '1024M',
            'max_memory_limit' => '1024M',
            'enable_object_cache' => true
        ));
        
        // Definir limite de memória
        $memory_limit = isset($options['memory_limit']) ? $options['memory_limit'] : '1024M';
        $max_memory_limit = isset($options['max_memory_limit']) ? $options['max_memory_limit'] : '1024M';
        
        // Tentar definir o limite de memória do PHP
        @ini_set('memory_limit', $memory_limit);
        
        // Definir constantes do WordPress se ainda não estiverem definidas
        if (!defined('WP_MEMORY_LIMIT')) {
            define('WP_MEMORY_LIMIT', $memory_limit);
        }
        
        if (!defined('WP_MAX_MEMORY_LIMIT')) {
            define('WP_MAX_MEMORY_LIMIT', $max_memory_limit);
        }
        
        // Ativar cache de objetos se necessário
        if (isset($options['enable_object_cache']) && $options['enable_object_cache'] && !defined('WP_CACHE')) {
            define('WP_CACHE', true);
        }
    }
}

// Iniciar o plugin
function pdv_vendas_memory_optimizer_init() {
    return PDV_Vendas_Memory_Optimizer::get_instance();
}

// Iniciar o plugin quando o WordPress estiver pronto
add_action('plugins_loaded', 'pdv_vendas_memory_optimizer_init');
