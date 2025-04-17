<?php
/**
 * Functions which enhance the theme by hooking into WordPress
 *
 * @package VendaEstoque
 */

/**
 * Adds custom classes to the array of body classes.
 *
 * @param array $classes Classes for the body element.
 * @return array
 */
function vendaestoque_body_classes( $classes ) {
    // Adds a class of hfeed to non-singular pages.
    if ( ! is_singular() ) {
        $classes[] = 'hfeed';
    }

    // Adds a class of no-sidebar when there is no sidebar present.
    if ( ! is_active_sidebar( 'sidebar-1' ) ) {
        $classes[] = 'no-sidebar';
    }

    // Add a class if WooCommerce is active
    if ( class_exists( 'WooCommerce' ) ) {
        $classes[] = 'woocommerce-active';
    }

    return $classes;
}
add_filter( 'body_class', 'vendaestoque_body_classes' );

/**
 * Add a pingback url auto-discovery header for single posts, pages, or attachments.
 */
function vendaestoque_pingback_header() {
    if ( is_singular() && pings_open() ) {
        printf( '<link rel="pingback" href="%s">', esc_url( get_bloginfo( 'pingback_url' ) ) );
    }
}
add_action( 'wp_head', 'vendaestoque_pingback_header' );

/**
 * Modify the "Read More" link text
 */
function vendaestoque_modify_read_more_link() {
    return '<a class="more-link" href="' . get_permalink() . '">' . esc_html__( 'Continue reading', 'vendaestoque' ) . '</a>';
}
add_filter( 'the_content_more_link', 'vendaestoque_modify_read_more_link' );

/**
 * Customize the excerpt length
 */
function vendaestoque_custom_excerpt_length( $length ) {
    return 20;
}
add_filter( 'excerpt_length', 'vendaestoque_custom_excerpt_length', 999 );

/**
 * Customize the excerpt "read more" string
 */
function vendaestoque_excerpt_more( $more ) {
    return '&hellip; <a class="read-more" href="' . esc_url( get_permalink() ) . '">' . esc_html__( 'Read More', 'vendaestoque' ) . '</a>';
}
add_filter( 'excerpt_more', 'vendaestoque_excerpt_more' );

/**
 * Add custom image sizes
 */
function vendaestoque_add_image_sizes() {
    add_image_size( 'vendaestoque-featured', 1200, 600, true );
    add_image_size( 'vendaestoque-thumbnail', 300, 300, true );
}
add_action( 'after_setup_theme', 'vendaestoque_add_image_sizes' );

/**
 * Add custom image sizes to media library dropdown
 */
function vendaestoque_custom_image_sizes( $sizes ) {
    return array_merge( $sizes, array(
        'vendaestoque-featured' => esc_html__( 'Featured Image', 'vendaestoque' ),
        'vendaestoque-thumbnail' => esc_html__( 'Custom Thumbnail', 'vendaestoque' ),
    ) );
}
add_filter( 'image_size_names_choose', 'vendaestoque_custom_image_sizes' );

/**
 * Modify WooCommerce related products output
 */
function vendaestoque_related_products_args( $args ) {
    $args['posts_per_page'] = 4; // 4 related products
    $args['columns'] = 4; // arranged in 4 columns
    return $args;
}
add_filter( 'woocommerce_output_related_products_args', 'vendaestoque_related_products_args' );

/**
 * Modify WooCommerce breadcrumb arguments
 */
function vendaestoque_woocommerce_breadcrumbs() {
    return array(
        'delimiter'   => ' &rsaquo; ',
        'wrap_before' => '<nav class="woocommerce-breadcrumb">',
        'wrap_after'  => '</nav>',
        'before'      => '',
        'after'       => '',
        'home'        => _x( 'Home', 'breadcrumb', 'vendaestoque' ),
    );
}
add_filter( 'woocommerce_breadcrumb_defaults', 'vendaestoque_woocommerce_breadcrumbs' );

/**
 * Add support for video in product gallery
 */
function vendaestoque_product_gallery_video_support() {
    if ( class_exists( 'WooCommerce' ) ) {
        // Add support for video in product gallery
        add_theme_support( 'wc-product-gallery-lightbox' );
        add_theme_support( 'wc-product-gallery-slider' );
    }
}
add_action( 'after_setup_theme', 'vendaestoque_product_gallery_video_support' );
