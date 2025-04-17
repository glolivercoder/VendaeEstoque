<?php
/**
 * VendaEstoque WooCommerce Theme functions and definitions
 *
 * @package VendaEstoque
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// Define theme constants
define( 'VENDAESTOQUE_VERSION', '1.0.0' );
define( 'VENDAESTOQUE_DIR', get_template_directory() );
define( 'VENDAESTOQUE_URI', get_template_directory_uri() );

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function vendaestoque_setup() {
    // Add default posts and comments RSS feed links to head.
    add_theme_support( 'automatic-feed-links' );

    // Let WordPress manage the document title.
    add_theme_support( 'title-tag' );

    // Enable support for Post Thumbnails on posts and pages.
    add_theme_support( 'post-thumbnails' );

    // Add support for responsive embeds.
    add_theme_support( 'responsive-embeds' );

    // Add support for custom logo.
    add_theme_support( 'custom-logo', array(
        'height'      => 100,
        'width'       => 300,
        'flex-width'  => true,
        'flex-height' => true,
    ) );

    // Register navigation menus
    register_nav_menus( array(
        'primary' => esc_html__( 'Primary Menu', 'vendaestoque' ),
        'footer'  => esc_html__( 'Footer Menu', 'vendaestoque' ),
    ) );

    // Switch default core markup to output valid HTML5.
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ) );

    // Add theme support for selective refresh for widgets.
    add_theme_support( 'customize-selective-refresh-widgets' );

    // Add support for editor styles.
    add_theme_support( 'editor-styles' );

    // Add support for Block Styles.
    add_theme_support( 'wp-block-styles' );

    // Add support for full and wide align images.
    add_theme_support( 'align-wide' );
}
add_action( 'after_setup_theme', 'vendaestoque_setup' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 */
function vendaestoque_content_width() {
    $GLOBALS['content_width'] = apply_filters( 'vendaestoque_content_width', 1200 );
}
add_action( 'after_setup_theme', 'vendaestoque_content_width', 0 );

/**
 * Register widget area.
 */
function vendaestoque_widgets_init() {
    register_sidebar( array(
        'name'          => esc_html__( 'Sidebar', 'vendaestoque' ),
        'id'            => 'sidebar-1',
        'description'   => esc_html__( 'Add widgets here.', 'vendaestoque' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h2 class="widget-title">',
        'after_title'   => '</h2>',
    ) );

    register_sidebar( array(
        'name'          => esc_html__( 'Footer 1', 'vendaestoque' ),
        'id'            => 'footer-1',
        'description'   => esc_html__( 'Add footer widgets here.', 'vendaestoque' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="footer-widget-title">',
        'after_title'   => '</h3>',
    ) );

    register_sidebar( array(
        'name'          => esc_html__( 'Footer 2', 'vendaestoque' ),
        'id'            => 'footer-2',
        'description'   => esc_html__( 'Add footer widgets here.', 'vendaestoque' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="footer-widget-title">',
        'after_title'   => '</h3>',
    ) );

    register_sidebar( array(
        'name'          => esc_html__( 'Footer 3', 'vendaestoque' ),
        'id'            => 'footer-3',
        'description'   => esc_html__( 'Add footer widgets here.', 'vendaestoque' ),
        'before_widget' => '<section id="%1$s" class="widget %2$s">',
        'after_widget'  => '</section>',
        'before_title'  => '<h3 class="footer-widget-title">',
        'after_title'   => '</h3>',
    ) );
}
add_action( 'widgets_init', 'vendaestoque_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function vendaestoque_scripts() {
    // Enqueue Google Fonts
    wp_enqueue_style( 'vendaestoque-fonts', 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap', array(), null );

    // Enqueue main stylesheet
    wp_enqueue_style( 'vendaestoque-style', get_stylesheet_uri(), array(), VENDAESTOQUE_VERSION );

    // Enqueue theme script
    wp_enqueue_script( 'vendaestoque-script', VENDAESTOQUE_URI . '/js/main.js', array('jquery'), VENDAESTOQUE_VERSION, true );

    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }
}
add_action( 'wp_enqueue_scripts', 'vendaestoque_scripts' );

/**
 * WooCommerce specific functions and hooks.
 */
function vendaestoque_woocommerce_setup() {
    // Declare WooCommerce support
    add_theme_support( 'woocommerce' );

    // Add support for WooCommerce product gallery features
    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );

    // Remove default WooCommerce styles
    add_filter( 'woocommerce_enqueue_styles', '__return_empty_array' );
}
add_action( 'after_setup_theme', 'vendaestoque_woocommerce_setup' );

/**
 * Display products on the front page
 */
function vendaestoque_homepage_products() {
    if ( is_front_page() && function_exists( 'woocommerce_product_loop' ) ) {
        echo '<section class="home-products-section">';
        echo '<div class="container">';
        echo '<h2>' . esc_html__( 'Produtos em Destaque', 'vendaestoque' ) . '</h2>';
        
        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => 8,
            'orderby'        => 'date',
            'order'          => 'DESC',
        );
        
        $products = new WP_Query( $args );
        
        if ( $products->have_posts() ) {
            woocommerce_product_loop_start();
            
            while ( $products->have_posts() ) {
                $products->the_post();
                wc_get_template_part( 'content', 'product' );
            }
            
            woocommerce_product_loop_end();
        } else {
            echo '<p>' . esc_html__( 'Nenhum produto encontrado', 'vendaestoque' ) . '</p>';
        }
        
        wp_reset_postdata();
        
        echo '</div>';
        echo '</section>';
    }
}
add_action( 'vendaestoque_before_content', 'vendaestoque_homepage_products' );

/**
 * Modify WooCommerce product columns
 */
function vendaestoque_woocommerce_loop_columns() {
    return 4; // 4 products per row
}
add_filter( 'loop_shop_columns', 'vendaestoque_woocommerce_loop_columns' );

/**
 * Modify number of products per page
 */
function vendaestoque_woocommerce_products_per_page() {
    return 12; // 12 products per page
}
add_filter( 'loop_shop_per_page', 'vendaestoque_woocommerce_products_per_page' );

/**
 * Add support for Product Video Gallery plugin
 */
function vendaestoque_product_video_gallery_support() {
    if ( class_exists( 'Product_Video_Gallery' ) ) {
        // Add any specific theme support for the plugin here
        add_filter( 'nickx_slider_layout', function() { return 'horizontal'; } );
    }
}
add_action( 'after_setup_theme', 'vendaestoque_product_video_gallery_support' );

/**
 * Redirect shop page to home page
 */
function vendaestoque_redirect_shop_to_home() {
    if ( is_shop() ) {
        wp_redirect( home_url() );
        exit();
    }
}
add_action( 'template_redirect', 'vendaestoque_redirect_shop_to_home' );

/**
 * Custom template tags for this theme.
 */
require VENDAESTOQUE_DIR . '/inc/template-tags.php';

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require VENDAESTOQUE_DIR . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require VENDAESTOQUE_DIR . '/inc/customizer.php';
