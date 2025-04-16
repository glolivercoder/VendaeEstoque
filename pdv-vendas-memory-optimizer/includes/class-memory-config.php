<?php
/**
 * Classe de configuração de memória
 * 
 * Gerencia as configurações de memória do WordPress
 */

// Impedir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class PDV_Vendas_Memory_Config {
    
    /**
     * Construtor
     */
    public function __construct() {
        // Nada a fazer aqui
    }
    
    /**
     * Aplicar configurações
     */
    public function apply_config() {
        // Obter configurações
        $options = get_option('pdv_memory_optimizer_settings', array(
            'memory_limit' => '1024M',
            'max_memory_limit' => '1024M',
            'enable_object_cache' => true
        ));
        
        // Aplicar configurações ao wp-config.php
        $this->update_wp_config($options);
        
        // Tentar definir o limite de memória do PHP
        @ini_set('memory_limit', $options['memory_limit']);
        
        // Registrar que as configurações foram aplicadas
        update_option('pdv_memory_optimizer_active', true);
    }
    
    /**
     * Atualizar configurações
     */
    public function update_config($options) {
        // Atualizar configurações no wp-config.php
        $this->update_wp_config($options);
        
        // Tentar definir o limite de memória do PHP
        @ini_set('memory_limit', $options['memory_limit']);
        
        // Registrar que as configurações foram atualizadas
        update_option('pdv_memory_optimizer_active', true);
    }
    
    /**
     * Atualizar wp-config.php
     */
    private function update_wp_config($options) {
        // Caminho para o arquivo wp-config.php
        $wp_config_path = $this->get_wp_config_path();
        
        if (!$wp_config_path || !is_writable($wp_config_path)) {
            // Não podemos escrever no arquivo wp-config.php
            return false;
        }
        
        // Ler o conteúdo do arquivo
        $wp_config_content = file_get_contents($wp_config_path);
        
        // Preparar as configurações
        $memory_limit = isset($options['memory_limit']) ? $options['memory_limit'] : '1024M';
        $max_memory_limit = isset($options['max_memory_limit']) ? $options['max_memory_limit'] : '1024M';
        $enable_object_cache = isset($options['enable_object_cache']) ? (bool) $options['enable_object_cache'] : true;
        
        // Verificar se as configurações já existem
        $has_memory_limit = preg_match("/define\s*\(\s*['\"]WP_MEMORY_LIMIT['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $wp_config_content);
        $has_max_memory_limit = preg_match("/define\s*\(\s*['\"]WP_MAX_MEMORY_LIMIT['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $wp_config_content);
        $has_cache = preg_match("/define\s*\(\s*['\"]WP_CACHE['\"]\s*,\s*(true|false|[01])\s*\)/", $wp_config_content);
        
        // Preparar as novas configurações
        $config_code = "// Configurações de memória adicionadas pelo PDV Vendas Memory Optimizer\n";
        
        if (!$has_memory_limit) {
            $config_code .= "define('WP_MEMORY_LIMIT', '{$memory_limit}');\n";
        } else {
            $wp_config_content = preg_replace(
                "/define\s*\(\s*['\"]WP_MEMORY_LIMIT['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/",
                "define('WP_MEMORY_LIMIT', '{$memory_limit}')",
                $wp_config_content
            );
        }
        
        if (!$has_max_memory_limit) {
            $config_code .= "define('WP_MAX_MEMORY_LIMIT', '{$max_memory_limit}');\n";
        } else {
            $wp_config_content = preg_replace(
                "/define\s*\(\s*['\"]WP_MAX_MEMORY_LIMIT['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/",
                "define('WP_MAX_MEMORY_LIMIT', '{$max_memory_limit}')",
                $wp_config_content
            );
        }
        
        if (!$has_cache && $enable_object_cache) {
            $config_code .= "define('WP_CACHE', true);\n";
        } else if ($has_cache) {
            $cache_value = $enable_object_cache ? 'true' : 'false';
            $wp_config_content = preg_replace(
                "/define\s*\(\s*['\"]WP_CACHE['\"]\s*,\s*(true|false|[01])\s*\)/",
                "define('WP_CACHE', {$cache_value})",
                $wp_config_content
            );
        }
        
        // Se não há configurações para adicionar, retornar
        if ($has_memory_limit && $has_max_memory_limit && ($has_cache || !$enable_object_cache)) {
            // Salvar o arquivo com as configurações atualizadas
            file_put_contents($wp_config_path, $wp_config_content);
            return true;
        }
        
        // Encontrar a posição para inserir as configurações
        $marker = "/* É isso, pare de editar! Divirta-se. */";
        $pos = strpos($wp_config_content, $marker);
        
        if ($pos === false) {
            $marker = "/* That's all, stop editing! Happy publishing. */";
            $pos = strpos($wp_config_content, $marker);
        }
        
        if ($pos === false) {
            // Não encontramos o marcador, tentar inserir antes do require_once
            $marker = "require_once";
            $pos = strpos($wp_config_content, $marker);
            
            if ($pos === false) {
                // Não conseguimos encontrar um local adequado
                return false;
            }
        }
        
        // Inserir as configurações antes do marcador
        $new_content = substr($wp_config_content, 0, $pos);
        $new_content .= $config_code . "\n";
        $new_content .= substr($wp_config_content, $pos);
        
        // Salvar o arquivo
        return file_put_contents($wp_config_path, $new_content);
    }
    
    /**
     * Obter caminho para o wp-config.php
     */
    private function get_wp_config_path() {
        // Primeiro, verificar no diretório raiz do WordPress
        $wp_config_path = ABSPATH . 'wp-config.php';
        
        if (file_exists($wp_config_path)) {
            return $wp_config_path;
        }
        
        // Se não encontrar, verificar um diretório acima
        $wp_config_path = dirname(ABSPATH) . '/wp-config.php';
        
        if (file_exists($wp_config_path)) {
            return $wp_config_path;
        }
        
        // Não encontramos o arquivo wp-config.php
        return false;
    }
    
    /**
     * Verificar se as configurações estão aplicadas
     */
    public function is_config_applied() {
        // Verificar se as constantes estão definidas
        $memory_limit_ok = defined('WP_MEMORY_LIMIT') && WP_MEMORY_LIMIT === '1024M';
        $max_memory_limit_ok = defined('WP_MAX_MEMORY_LIMIT') && WP_MAX_MEMORY_LIMIT === '1024M';
        
        // Obter configurações
        $options = get_option('pdv_memory_optimizer_settings', array(
            'enable_object_cache' => true
        ));
        
        // Verificar cache de objetos
        $cache_ok = !$options['enable_object_cache'] || (defined('WP_CACHE') && WP_CACHE);
        
        return $memory_limit_ok && $max_memory_limit_ok && $cache_ok;
    }
    
    /**
     * Obter status das configurações
     */
    public function get_config_status() {
        $status = array(
            'memory_limit' => array(
                'value' => defined('WP_MEMORY_LIMIT') ? WP_MEMORY_LIMIT : 'Não definido',
                'ok' => defined('WP_MEMORY_LIMIT') && intval(WP_MEMORY_LIMIT) >= 256
            ),
            'max_memory_limit' => array(
                'value' => defined('WP_MAX_MEMORY_LIMIT') ? WP_MAX_MEMORY_LIMIT : 'Não definido',
                'ok' => defined('WP_MAX_MEMORY_LIMIT') && intval(WP_MAX_MEMORY_LIMIT) >= 256
            ),
            'cache' => array(
                'value' => defined('WP_CACHE') && WP_CACHE ? 'Ativado' : 'Desativado',
                'ok' => defined('WP_CACHE') && WP_CACHE
            ),
            'php_memory_limit' => array(
                'value' => ini_get('memory_limit'),
                'ok' => intval(ini_get('memory_limit')) >= 256
            ),
            'upload_max_filesize' => array(
                'value' => ini_get('upload_max_filesize'),
                'ok' => intval(ini_get('upload_max_filesize')) >= 32
            ),
            'post_max_size' => array(
                'value' => ini_get('post_max_size'),
                'ok' => intval(ini_get('post_max_size')) >= 32
            ),
            'max_execution_time' => array(
                'value' => ini_get('max_execution_time') . ' segundos',
                'ok' => intval(ini_get('max_execution_time')) >= 60
            )
        );
        
        return $status;
    }
}
