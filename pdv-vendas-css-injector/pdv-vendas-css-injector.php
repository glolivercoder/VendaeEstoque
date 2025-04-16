<?php
/**
 * Plugin Name: PDV Vendas CSS Injector
 * Plugin URI: https://achadinhoshopp.com.br/loja/
 * Description: Permite a injeção de CSS personalizado para produtos do PDV Vendas via API REST
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja/
 * Text Domain: pdv-vendas-css-injector
 */

// Impedir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class PDV_Vendas_CSS_Injector {
    
    /**
     * Construtor
     */
    public function __construct() {
        // Registrar endpoint da API REST
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Adicionar CSS ao frontend
        add_action('wp_head', array($this, 'output_custom_css'));
        
        // Adicionar menu de administração
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Registrar configurações
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    /**
     * Registrar rotas da API REST
     */
    public function register_rest_routes() {
        register_rest_route('pdv-vendas/v1', '/inject-css', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_inject_css'),
            'permission_callback' => array($this, 'check_permission')
        ));
    }
    
    /**
     * Verificar permissão
     */
    public function check_permission() {
        // Verificar se o usuário está autenticado e tem permissão
        return current_user_can('manage_options');
    }
    
    /**
     * Manipular requisição de injeção de CSS
     */
    public function handle_inject_css($request) {
        $params = $request->get_params();
        
        if (!isset($params['css'])) {
            return new WP_Error('missing_css', 'O parâmetro CSS é obrigatório', array('status' => 400));
        }
        
        // Sanitizar o CSS
        $css = wp_strip_all_tags($params['css']);
        
        // Salvar o CSS
        update_option('pdv_vendas_custom_css', $css);
        
        return array(
            'success' => true,
            'message' => 'CSS injetado com sucesso'
        );
    }
    
    /**
     * Exibir CSS personalizado no frontend
     */
    public function output_custom_css() {
        $css = get_option('pdv_vendas_custom_css', '');
        
        if (!empty($css)) {
            echo '<style id="pdv-vendas-custom-css">' . $css . '</style>';
        }
    }
    
    /**
     * Adicionar menu de administração
     */
    public function add_admin_menu() {
        add_submenu_page(
            'options-general.php',
            'PDV Vendas CSS',
            'PDV Vendas CSS',
            'manage_options',
            'pdv-vendas-css',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Registrar configurações
     */
    public function register_settings() {
        register_setting('pdv_vendas_css', 'pdv_vendas_custom_css');
    }
    
    /**
     * Renderizar página de administração
     */
    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Salvar configurações
        if (isset($_POST['pdv_vendas_custom_css'])) {
            update_option('pdv_vendas_custom_css', wp_strip_all_tags($_POST['pdv_vendas_custom_css']));
            echo '<div class="notice notice-success is-dismissible"><p>CSS salvo com sucesso!</p></div>';
        }
        
        $css = get_option('pdv_vendas_custom_css', '');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">CSS Personalizado</th>
                        <td>
                            <textarea name="pdv_vendas_custom_css" rows="20" class="large-text code"><?php echo esc_textarea($css); ?></textarea>
                            <p class="description">Insira o CSS personalizado para os produtos do PDV Vendas.</p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Salvar CSS'); ?>
            </form>
            
            <h2>Exemplo de CSS</h2>
            <pre>
/* Custom CSS for PDV Vendas products */
.woocommerce ul.products li.product {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.woocommerce ul.products li.product:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.woocommerce ul.products li.product img {
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.woocommerce ul.products li.product .price {
  color: #4CAF50;
  font-weight: bold;
  font-size: 1.2em;
}

.woocommerce ul.products li.product .button {
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  margin-top: 10px;
}

.woocommerce ul.products li.product .button:hover {
  background-color: #45a049;
}
            </pre>
        </div>
        <?php
    }
}

// Iniciar o plugin
new PDV_Vendas_CSS_Injector();
