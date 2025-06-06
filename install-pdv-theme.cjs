/**
 * Script para instalar o tema PDV Vendas no WordPress
 * Este script envia o arquivo CSS para o WordPress e o configura como um tema personalizado
 */
const fs = require('fs');
const axios = require('axios');

// Configuração do WooCommerce
const config = {
  url: 'https://achadinhoshopp.com.br/loja',
  consumer_key: 'ck_d106765e36b9a6af0d22bd22571388ec3ad67378',
  consumer_secret: 'cs_0d5d0255c002e137d48be4da75d5d87363278bd6'
};

// Função para criar o arquivo CSS
async function createThemeCSS() {
  try {
    console.log('Criando arquivo CSS do tema PDV Vendas...');
    
    // Conteúdo do CSS
    const cssContent = `/**
 * PDV Vendas - Tema personalizado para WooCommerce
 * Este arquivo CSS personaliza o tema do WooCommerce para manter o mesmo layout do app PDV Vendas
 */

/* Cores principais */
:root {
  --pdv-primary: #3b82f6;
  --pdv-primary-hover: #2563eb;
  --pdv-secondary: #10b981;
  --pdv-secondary-hover: #059669;
  --pdv-danger: #ef4444;
  --pdv-danger-hover: #dc2626;
  --pdv-warning: #f59e0b;
  --pdv-warning-hover: #d97706;
  --pdv-info: #3b82f6;
  --pdv-info-hover: #2563eb;
  --pdv-light: #f3f4f6;
  --pdv-dark: #1f2937;
  --pdv-gray: #6b7280;
  --pdv-white: #ffffff;
}

/* Estilos gerais */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--pdv-dark);
  background-color: var(--pdv-light);
  line-height: 1.5;
}

/* Cabeçalho */
.site-header {
  background-color: var(--pdv-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.site-title {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--pdv-primary);
}

/* Botões */
.button,
.woocommerce a.button,
.woocommerce button.button,
.woocommerce input.button,
.woocommerce #respond input#submit {
  background-color: var(--pdv-primary);
  color: var(--pdv-white);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
  border: none;
  cursor: pointer;
}

.button:hover,
.woocommerce a.button:hover,
.woocommerce button.button:hover,
.woocommerce input.button:hover,
.woocommerce #respond input#submit:hover {
  background-color: var(--pdv-primary-hover);
  color: var(--pdv-white);
}

/* Botão de adicionar ao carrinho */
.woocommerce a.button.add_to_cart_button,
.woocommerce button.button.alt {
  background-color: var(--pdv-secondary);
}

.woocommerce a.button.add_to_cart_button:hover,
.woocommerce button.button.alt:hover {
  background-color: var(--pdv-secondary-hover);
}

/* Produtos */
.woocommerce ul.products li.product,
.woocommerce-page ul.products li.product {
  background-color: var(--pdv-white);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.woocommerce ul.products li.product:hover,
.woocommerce-page ul.products li.product:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.woocommerce ul.products li.product .woocommerce-loop-product__title,
.woocommerce-page ul.products li.product .woocommerce-loop-product__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--pdv-dark);
  padding-top: 0.5rem;
}

.woocommerce ul.products li.product .price,
.woocommerce-page ul.products li.product .price {
  color: var(--pdv-secondary);
  font-weight: 700;
  font-size: 1.125rem;
}

/* Imagens de produto */
.woocommerce ul.products li.product a img,
.woocommerce-page ul.products li.product a img {
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;
}

/* Página de produto único */
.woocommerce div.product div.images img {
  border-radius: 0.5rem;
}

.woocommerce div.product .product_title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--pdv-dark);
}

.woocommerce div.product p.price,
.woocommerce div.product span.price {
  color: var(--pdv-secondary);
  font-weight: 700;
  font-size: 1.5rem;
}

.woocommerce div.product .woocommerce-tabs ul.tabs li {
  background-color: var(--pdv-light);
  border-radius: 0.375rem 0.375rem 0 0;
}

.woocommerce div.product .woocommerce-tabs ul.tabs li.active {
  background-color: var(--pdv-white);
  border-bottom-color: var(--pdv-white);
}

.woocommerce div.product .woocommerce-tabs ul.tabs li a {
  color: var(--pdv-gray);
  font-weight: 500;
}

.woocommerce div.product .woocommerce-tabs ul.tabs li.active a {
  color: var(--pdv-primary);
}

/* Carrinho */
.woocommerce-cart table.cart td.actions .coupon .input-text {
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--pdv-gray);
}

.woocommerce-cart table.cart img {
  width: 80px;
  border-radius: 0.375rem;
}

.woocommerce-cart table.cart th {
  font-weight: 600;
  color: var(--pdv-dark);
}

/* Checkout */
.woocommerce-checkout #payment {
  background-color: var(--pdv-white);
  border-radius: 0.5rem;
}

.woocommerce form .form-row input.input-text,
.woocommerce form .form-row textarea {
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--pdv-gray);
}

/* Mensagens */
.woocommerce-message,
.woocommerce-info {
  border-top-color: var(--pdv-primary);
}

.woocommerce-message::before,
.woocommerce-info::before {
  color: var(--pdv-primary);
}

.woocommerce-error {
  border-top-color: var(--pdv-danger);
}

.woocommerce-error::before {
  color: var(--pdv-danger);
}

/* Paginação */
.woocommerce nav.woocommerce-pagination ul {
  border: none;
}

.woocommerce nav.woocommerce-pagination ul li {
  border-right: none;
}

.woocommerce nav.woocommerce-pagination ul li a,
.woocommerce nav.woocommerce-pagination ul li span {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  margin: 0 0.25rem;
}

.woocommerce nav.woocommerce-pagination ul li a:focus,
.woocommerce nav.woocommerce-pagination ul li a:hover,
.woocommerce nav.woocommerce-pagination ul li span.current {
  background-color: var(--pdv-primary);
  color: var(--pdv-white);
}

/* Responsividade */
@media (max-width: 768px) {
  .woocommerce ul.products[class*="columns-"] li.product,
  .woocommerce-page ul.products[class*="columns-"] li.product {
    width: 48%;
    margin-right: 4%;
  }
  
  .woocommerce ul.products[class*="columns-"] li.product:nth-child(2n),
  .woocommerce-page ul.products[class*="columns-"] li.product:nth-child(2n) {
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .woocommerce ul.products[class*="columns-"] li.product,
  .woocommerce-page ul.products[class*="columns-"] li.product {
    width: 100%;
    margin-right: 0;
  }
}

/* Categorias */
.woocommerce .widget_product_categories ul.product-categories {
  list-style: none;
  padding: 0;
}

.woocommerce .widget_product_categories ul.product-categories li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--pdv-light);
}

.woocommerce .widget_product_categories ul.product-categories li a {
  color: var(--pdv-dark);
  text-decoration: none;
  transition: color 0.2s;
}

.woocommerce .widget_product_categories ul.product-categories li a:hover {
  color: var(--pdv-primary);
}

/* Barra lateral */
.widget-area .widget {
  background-color: var(--pdv-white);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.widget-area .widget h2,
.widget-area .widget .widget-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--pdv-dark);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--pdv-light);
}

/* Rodapé */
.site-footer {
  background-color: var(--pdv-dark);
  color: var(--pdv-white);
  padding: 2rem 0;
  margin-top: 2rem;
}

.site-footer a {
  color: var(--pdv-light);
  text-decoration: none;
}

.site-footer a:hover {
  color: var(--pdv-white);
  text-decoration: underline;
}

/* Ícones */
.woocommerce a.remove {
  color: var(--pdv-danger) !important;
}

.woocommerce a.remove:hover {
  background-color: var(--pdv-danger);
  color: var(--pdv-white) !important;
}

/* Estrelas de avaliação */
.woocommerce .star-rating span::before {
  color: var(--pdv-warning);
}

.woocommerce p.stars a {
  color: var(--pdv-warning);
}

/* Formulários */
.woocommerce form .form-row label {
  font-weight: 500;
  color: var(--pdv-dark);
}

/* Alertas */
.woocommerce-store-notice {
  background-color: var(--pdv-primary);
  color: var(--pdv-white);
}

/* Breadcrumbs */
.woocommerce .woocommerce-breadcrumb {
  color: var(--pdv-gray);
  margin-bottom: 1.5rem;
}

.woocommerce .woocommerce-breadcrumb a {
  color: var(--pdv-primary);
}

/* Estoque */
.woocommerce div.product .stock {
  color: var(--pdv-secondary);
}

.woocommerce div.product .out-of-stock {
  color: var(--pdv-danger);
}

/* Badges */
.woocommerce span.onsale {
  background-color: var(--pdv-warning);
  color: var(--pdv-white);
  border-radius: 2rem;
  min-height: auto;
  min-width: auto;
  padding: 0.25rem 0.75rem;
  line-height: 1.5;
  font-weight: 500;
}`;
    
    // Salvar o arquivo CSS
    fs.writeFileSync('pdv-vendas-theme.css', cssContent);
    
    console.log('Arquivo CSS criado com sucesso!');
    
    // Criar o arquivo PHP
    const phpContent = `<?php
/**
 * Plugin Name: PDV Vendas Theme
 * Plugin URI: https://achadinhoshopp.com.br/loja
 * Description: Tema personalizado para o PDV Vendas que mantém o mesmo layout do app
 * Version: 1.0.0
 * Author: PDV Vendas
 * Author URI: https://achadinhoshopp.com.br/loja
 */

// Adicionar o CSS personalizado
function pdv_vendas_enqueue_styles() {
    wp_enqueue_style('pdv-vendas-theme', plugin_dir_url(__FILE__) . 'pdv-vendas-theme.css', array(), '1.0.0');
}
add_action('wp_enqueue_scripts', 'pdv_vendas_enqueue_styles');

// Adicionar suporte para produtos do PDV Vendas
function pdv_vendas_product_meta() {
    add_meta_box(
        'pdv_vendas_product_meta',
        'PDV Vendas',
        'pdv_vendas_product_meta_callback',
        'product',
        'side',
        'default'
    );
}
add_action('add_meta_boxes', 'pdv_vendas_product_meta');

// Callback para exibir o meta box
function pdv_vendas_product_meta_callback($post) {
    // Obter o ID do PDV Vendas
    $pdv_id = get_post_meta($post->ID, '_pdv_vendas_id', true);
    
    echo '<p><strong>ID do PDV Vendas:</strong> ' . ($pdv_id ? $pdv_id : 'Não definido') . '</p>';
}

// Salvar o ID do PDV Vendas
function pdv_vendas_save_product_meta($post_id) {
    if (isset($_POST['_pdv_vendas_id'])) {
        update_post_meta($post_id, '_pdv_vendas_id', sanitize_text_field($_POST['_pdv_vendas_id']));
    }
}
add_action('save_post_product', 'pdv_vendas_save_product_meta');
`;
    
    // Salvar o arquivo PHP
    fs.writeFileSync('pdv-vendas-theme.php', phpContent);
    
    console.log('Arquivo PHP criado com sucesso!');
    
    console.log('\nPara instalar o tema, siga estas etapas:');
    console.log('1. Faça login no painel de administração do WordPress');
    console.log('2. Vá para Aparência > Personalizar > CSS Adicional');
    console.log('3. Cole o conteúdo do arquivo pdv-vendas-theme.css');
    console.log('4. Clique em Publicar');
    
    return true;
  } catch (error) {
    console.error('Erro ao criar o tema:', error);
    return false;
  }
}

// Executar o script
createThemeCSS();
