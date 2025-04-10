<?php
/**
 * Carregar scripts e estilos do plugin
 */

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe para gerenciar scripts e estilos
 */
class PDV_WordPress_Scripts {
    /**
     * Construtor
     */
    public function __construct() {
        // Adicionar scripts e estilos no frontend
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        
        // Adicionar scripts e estilos no admin
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Adicionar script de sincronização no PDV Vendas
        add_action('wp_footer', array($this, 'add_pdv_sync_script'));
    }
    
    /**
     * Carregar scripts e estilos no frontend
     */
    public function enqueue_frontend_scripts() {
        // Registrar e carregar CSS
        wp_register_style(
            'pdv-vendas-sync',
            plugin_dir_url(dirname(__FILE__)) . 'assets/css/pdv-sync.css',
            array(),
            '1.0.0'
        );
        
        wp_enqueue_style('pdv-vendas-sync');
    }
    
    /**
     * Carregar scripts e estilos no admin
     */
    public function enqueue_admin_scripts($hook) {
        // Carregar apenas na página do plugin
        if ($hook != 'toplevel_page_pdv-vendas-integration') {
            return;
        }
        
        // Registrar e carregar CSS
        wp_register_style(
            'pdv-vendas-admin',
            plugin_dir_url(dirname(__FILE__)) . 'assets/css/pdv-sync.css',
            array(),
            '1.0.0'
        );
        
        wp_enqueue_style('pdv-vendas-admin');
    }
    
    /**
     * Adicionar script de sincronização no PDV Vendas
     */
    public function add_pdv_sync_script() {
        // Verificar se estamos na página do PDV Vendas
        if (!isset($_GET['pdv_sync']) || $_GET['pdv_sync'] !== '1') {
            return;
        }
        
        // URL do script
        $script_url = plugin_dir_url(dirname(__FILE__)) . 'assets/js/pdv-sync.js';
        
        // Adicionar script
        echo '<script type="text/javascript" src="' . esc_url($script_url) . '"></script>';
    }
}

// Inicializar
new PDV_WordPress_Scripts();
