<?php
/**
 * Plugin Name: PDV Vendas - Increase WordPress Memory
 * Description: Aumenta o limite de memória do WordPress para 1024MB para melhorar o desempenho do WooCommerce
 * Version: 1.0
 * Author: PDV Vendas
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe para aumentar o limite de memória do WordPress
 */
class PDV_Vendas_Increase_Memory {
    /**
     * Construtor
     */
    public function __construct() {
        // Aumentar limite de memória para PHP
        $this->increase_php_memory();
        
        // Adicionar menu de administração
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Adicionar informações no rodapé do admin
        add_filter('admin_footer_text', array($this, 'add_memory_info'));
    }
    
    /**
     * Aumentar limite de memória do PHP
     */
    public function increase_php_memory() {
        // Definir limite de memória para 1024MB
        @ini_set('memory_limit', '1024M');
        
        // Definir constante WP_MEMORY_LIMIT se ainda não estiver definida
        if (!defined('WP_MEMORY_LIMIT')) {
            define('WP_MEMORY_LIMIT', '1024M');
        }
        
        // Definir constante WP_MAX_MEMORY_LIMIT se ainda não estiver definida
        if (!defined('WP_MAX_MEMORY_LIMIT')) {
            define('WP_MAX_MEMORY_LIMIT', '1024M');
        }
    }
    
    /**
     * Adicionar menu de administração
     */
    public function add_admin_menu() {
        add_submenu_page(
            'tools.php',
            'Configurações de Memória',
            'Configurações de Memória',
            'manage_options',
            'pdv-vendas-memory',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Página de administração
     */
    public function admin_page() {
        // Verificar se o usuário tem permissão
        if (!current_user_can('manage_options')) {
            wp_die(__('Você não tem permissão para acessar esta página.'));
        }
        
        // Obter informações de memória
        $memory_limit = ini_get('memory_limit');
        $memory_usage = $this->format_memory_size(memory_get_usage());
        $memory_peak = $this->format_memory_size(memory_get_peak_usage());
        $wp_memory_limit = defined('WP_MEMORY_LIMIT') ? WP_MEMORY_LIMIT : 'Não definido';
        $wp_max_memory_limit = defined('WP_MAX_MEMORY_LIMIT') ? WP_MAX_MEMORY_LIMIT : 'Não definido';
        
        // Verificar se o wp-config.php é editável
        $wp_config_path = ABSPATH . 'wp-config.php';
        $is_wp_config_writable = is_writable($wp_config_path);
        
        // Salvar alterações no wp-config.php
        $message = '';
        if (isset($_POST['pdv_vendas_update_wp_config']) && check_admin_referer('pdv_vendas_memory_settings')) {
            if ($is_wp_config_writable) {
                // Ler conteúdo do wp-config.php
                $wp_config_content = file_get_contents($wp_config_path);
                
                // Verificar se as constantes já existem
                $has_wp_memory_limit = strpos($wp_config_content, "define('WP_MEMORY_LIMIT'") !== false || strpos($wp_config_content, 'define("WP_MEMORY_LIMIT"') !== false;
                $has_wp_max_memory_limit = strpos($wp_config_content, "define('WP_MAX_MEMORY_LIMIT'") !== false || strpos($wp_config_content, 'define("WP_MAX_MEMORY_LIMIT"') !== false;
                
                // Adicionar ou atualizar constantes
                if ($has_wp_memory_limit) {
                    // Atualizar WP_MEMORY_LIMIT
                    $wp_config_content = preg_replace(
                        "/(define\s*\(\s*['\"]WP_MEMORY_LIMIT['\"]\s*,\s*)['\"].*?['\"]\s*\)/",
                        "$1'1024M')",
                        $wp_config_content
                    );
                } else {
                    // Adicionar WP_MEMORY_LIMIT
                    $wp_config_content = preg_replace(
                        "/(\/\*\s*That's all, stop editing! Happy publishing\.\s*\*\/)/i",
                        "define('WP_MEMORY_LIMIT', '1024M');\n\n$1",
                        $wp_config_content
                    );
                }
                
                if ($has_wp_max_memory_limit) {
                    // Atualizar WP_MAX_MEMORY_LIMIT
                    $wp_config_content = preg_replace(
                        "/(define\s*\(\s*['\"]WP_MAX_MEMORY_LIMIT['\"]\s*,\s*)['\"].*?['\"]\s*\)/",
                        "$1'1024M')",
                        $wp_config_content
                    );
                } else {
                    // Adicionar WP_MAX_MEMORY_LIMIT
                    $wp_config_content = preg_replace(
                        "/(\/\*\s*That's all, stop editing! Happy publishing\.\s*\*\/)/i",
                        "define('WP_MAX_MEMORY_LIMIT', '1024M');\n\n$1",
                        $wp_config_content
                    );
                }
                
                // Salvar alterações
                if (file_put_contents($wp_config_path, $wp_config_content)) {
                    $message = '<div class="notice notice-success"><p>Configurações de memória atualizadas com sucesso! Recarregue a página para ver as alterações.</p></div>';
                } else {
                    $message = '<div class="notice notice-error"><p>Erro ao salvar as alterações no arquivo wp-config.php.</p></div>';
                }
            } else {
                $message = '<div class="notice notice-error"><p>O arquivo wp-config.php não tem permissão de escrita. Por favor, adicione as seguintes linhas manualmente:</p>
                <pre>define(\'WP_MEMORY_LIMIT\', \'1024M\');\ndefine(\'WP_MAX_MEMORY_LIMIT\', \'1024M\');</pre></div>';
            }
        }
        
        // Exibir página de administração
        ?>
        <div class="wrap">
            <h1>Configurações de Memória do WordPress</h1>
            
            <?php echo $message; ?>
            
            <div class="card">
                <h2>Informações de Memória</h2>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">Limite de Memória PHP:</th>
                        <td><?php echo esc_html($memory_limit); ?></td>
                    </tr>
                    <tr>
                        <th scope="row">Uso Atual de Memória:</th>
                        <td><?php echo esc_html($memory_usage); ?></td>
                    </tr>
                    <tr>
                        <th scope="row">Pico de Uso de Memória:</th>
                        <td><?php echo esc_html($memory_peak); ?></td>
                    </tr>
                    <tr>
                        <th scope="row">WP_MEMORY_LIMIT:</th>
                        <td><?php echo esc_html($wp_memory_limit); ?></td>
                    </tr>
                    <tr>
                        <th scope="row">WP_MAX_MEMORY_LIMIT:</th>
                        <td><?php echo esc_html($wp_max_memory_limit); ?></td>
                    </tr>
                </table>
            </div>
            
            <div class="card">
                <h2>Atualizar Configurações de Memória</h2>
                
                <p>Esta ferramenta irá atualizar o arquivo wp-config.php para definir o limite de memória do WordPress para 1024MB.</p>
                
                <?php if (!$is_wp_config_writable): ?>
                <div class="notice notice-warning">
                    <p>O arquivo wp-config.php não tem permissão de escrita. Você precisará adicionar as seguintes linhas manualmente:</p>
                    <pre>define('WP_MEMORY_LIMIT', '1024M');
define('WP_MAX_MEMORY_LIMIT', '1024M');</pre>
                </div>
                <?php endif; ?>
                
                <form method="post" action="">
                    <?php wp_nonce_field('pdv_vendas_memory_settings'); ?>
                    
                    <p class="submit">
                        <input type="submit" name="pdv_vendas_update_wp_config" class="button button-primary" value="Atualizar Configurações de Memória" <?php echo $is_wp_config_writable ? '' : 'disabled'; ?>>
                    </p>
                </form>
            </div>
            
            <div class="card">
                <h2>Instruções Manuais</h2>
                
                <p>Se você preferir atualizar manualmente as configurações de memória, siga estas instruções:</p>
                
                <ol>
                    <li>Edite o arquivo <code>wp-config.php</code> na raiz do seu site WordPress.</li>
                    <li>Adicione as seguintes linhas antes do comentário "That's all, stop editing! Happy publishing.":</li>
                </ol>
                
                <pre>define('WP_MEMORY_LIMIT', '1024M');
define('WP_MAX_MEMORY_LIMIT', '1024M');</pre>
                
                <p>Você também pode adicionar a seguinte linha ao arquivo <code>.htaccess</code> para aumentar o limite de memória do PHP:</p>
                
                <pre>php_value memory_limit 1024M</pre>
            </div>
        </div>
        <?php
    }
    
    /**
     * Adicionar informações de memória no rodapé do admin
     */
    public function add_memory_info($text) {
        $memory_usage = $this->format_memory_size(memory_get_usage());
        $memory_limit = ini_get('memory_limit');
        
        return $text . ' | Memória: ' . $memory_usage . ' de ' . $memory_limit;
    }
    
    /**
     * Formatar tamanho de memória
     */
    private function format_memory_size($size) {
        $unit = array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
        
        for ($i = 0; $size >= 1024 && $i < count($unit) - 1; $i++) {
            $size /= 1024;
        }
        
        return round($size, 2) . ' ' . $unit[$i];
    }
}

// Iniciar plugin
new PDV_Vendas_Increase_Memory();
