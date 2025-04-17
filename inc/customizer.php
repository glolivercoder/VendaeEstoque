<?php
/**
 * VendaEstoque Theme Customizer
 *
 * @package VendaEstoque
 */

/**
 * Add postMessage support for site title and description for the Theme Customizer.
 *
 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
 */
function vendaestoque_customize_register( $wp_customize ) {
    $wp_customize->get_setting( 'blogname' )->transport         = 'postMessage';
    $wp_customize->get_setting( 'blogdescription' )->transport  = 'postMessage';
    $wp_customize->get_setting( 'header_textcolor' )->transport = 'postMessage';

    if ( isset( $wp_customize->selective_refresh ) ) {
        $wp_customize->selective_refresh->add_partial(
            'blogname',
            array(
                'selector'        => '.site-title a',
                'render_callback' => 'vendaestoque_customize_partial_blogname',
            )
        );
        $wp_customize->selective_refresh->add_partial(
            'blogdescription',
            array(
                'selector'        => '.site-description',
                'render_callback' => 'vendaestoque_customize_partial_blogdescription',
            )
        );
    }

    // Add Theme Options Panel
    $wp_customize->add_panel( 'vendaestoque_theme_options', array(
        'title'    => esc_html__( 'Theme Options', 'vendaestoque' ),
        'priority' => 130,
    ) );

    // Add WooCommerce Section
    $wp_customize->add_section( 'vendaestoque_woocommerce_options', array(
        'title'    => esc_html__( 'WooCommerce Options', 'vendaestoque' ),
        'priority' => 10,
        'panel'    => 'vendaestoque_theme_options',
    ) );

    // Products per row
    $wp_customize->add_setting( 'vendaestoque_products_per_row', array(
        'default'           => 4,
        'sanitize_callback' => 'absint',
    ) );

    $wp_customize->add_control( 'vendaestoque_products_per_row', array(
        'label'       => esc_html__( 'Products per row', 'vendaestoque' ),
        'description' => esc_html__( 'How many products to display per row on shop pages', 'vendaestoque' ),
        'section'     => 'vendaestoque_woocommerce_options',
        'type'        => 'number',
        'input_attrs' => array(
            'min'  => 2,
            'max'  => 6,
            'step' => 1,
        ),
    ) );

    // Products per page
    $wp_customize->add_setting( 'vendaestoque_products_per_page', array(
        'default'           => 12,
        'sanitize_callback' => 'absint',
    ) );

    $wp_customize->add_control( 'vendaestoque_products_per_page', array(
        'label'       => esc_html__( 'Products per page', 'vendaestoque' ),
        'description' => esc_html__( 'How many products to display per page on shop pages', 'vendaestoque' ),
        'section'     => 'vendaestoque_woocommerce_options',
        'type'        => 'number',
        'input_attrs' => array(
            'min'  => 4,
            'max'  => 48,
            'step' => 4,
        ),
    ) );

    // Show products on homepage
    $wp_customize->add_setting( 'vendaestoque_show_products_on_homepage', array(
        'default'           => true,
        'sanitize_callback' => 'vendaestoque_sanitize_checkbox',
    ) );

    $wp_customize->add_control( 'vendaestoque_show_products_on_homepage', array(
        'label'       => esc_html__( 'Show products on homepage', 'vendaestoque' ),
        'description' => esc_html__( 'Display products on the front page', 'vendaestoque' ),
        'section'     => 'vendaestoque_woocommerce_options',
        'type'        => 'checkbox',
    ) );

    // Number of featured products
    $wp_customize->add_setting( 'vendaestoque_featured_products_count', array(
        'default'           => 8,
        'sanitize_callback' => 'absint',
    ) );

    $wp_customize->add_control( 'vendaestoque_featured_products_count', array(
        'label'       => esc_html__( 'Featured products count', 'vendaestoque' ),
        'description' => esc_html__( 'Number of featured products to display on homepage', 'vendaestoque' ),
        'section'     => 'vendaestoque_woocommerce_options',
        'type'        => 'number',
        'input_attrs' => array(
            'min'  => 4,
            'max'  => 20,
            'step' => 4,
        ),
    ) );

    // Add Colors Section
    $wp_customize->add_section( 'vendaestoque_colors', array(
        'title'    => esc_html__( 'Theme Colors', 'vendaestoque' ),
        'priority' => 20,
        'panel'    => 'vendaestoque_theme_options',
    ) );

    // Primary Color
    $wp_customize->add_setting( 'vendaestoque_primary_color', array(
        'default'           => '#6a90e2',
        'sanitize_callback' => 'sanitize_hex_color',
    ) );

    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'vendaestoque_primary_color', array(
        'label'    => esc_html__( 'Primary Color', 'vendaestoque' ),
        'section'  => 'vendaestoque_colors',
        'settings' => 'vendaestoque_primary_color',
    ) ) );

    // Secondary Color
    $wp_customize->add_setting( 'vendaestoque_secondary_color', array(
        'default'           => '#7e5ce3',
        'sanitize_callback' => 'sanitize_hex_color',
    ) );

    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'vendaestoque_secondary_color', array(
        'label'    => esc_html__( 'Secondary Color', 'vendaestoque' ),
        'section'  => 'vendaestoque_colors',
        'settings' => 'vendaestoque_secondary_color',
    ) ) );

    // Text Color
    $wp_customize->add_setting( 'vendaestoque_text_color', array(
        'default'           => '#333333',
        'sanitize_callback' => 'sanitize_hex_color',
    ) );

    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'vendaestoque_text_color', array(
        'label'    => esc_html__( 'Text Color', 'vendaestoque' ),
        'section'  => 'vendaestoque_colors',
        'settings' => 'vendaestoque_text_color',
    ) ) );
}
add_action( 'customize_register', 'vendaestoque_customize_register' );

/**
 * Render the site title for the selective refresh partial.
 *
 * @return void
 */
function vendaestoque_customize_partial_blogname() {
    bloginfo( 'name' );
}

/**
 * Render the site tagline for the selective refresh partial.
 *
 * @return void
 */
function vendaestoque_customize_partial_blogdescription() {
    bloginfo( 'description' );
}

/**
 * Sanitize checkbox values.
 *
 * @param bool $checked Whether the checkbox is checked.
 * @return bool
 */
function vendaestoque_sanitize_checkbox( $checked ) {
    return ( ( isset( $checked ) && true == $checked ) ? true : false );
}

/**
 * Binds JS handlers to make Theme Customizer preview reload changes asynchronously.
 */
function vendaestoque_customize_preview_js() {
    wp_enqueue_script( 'vendaestoque-customizer', get_template_directory_uri() . '/js/customizer.js', array( 'customize-preview' ), VENDAESTOQUE_VERSION, true );
}
add_action( 'customize_preview_init', 'vendaestoque_customize_preview_js' );

/**
 * Generate CSS from customizer settings
 */
function vendaestoque_customizer_css() {
    $primary_color = get_theme_mod( 'vendaestoque_primary_color', '#6a90e2' );
    $secondary_color = get_theme_mod( 'vendaestoque_secondary_color', '#7e5ce3' );
    $text_color = get_theme_mod( 'vendaestoque_text_color', '#333333' );
    
    $css = '
        :root {
            --pdv-primary: ' . esc_attr( $primary_color ) . ';
            --pdv-secondary: ' . esc_attr( $secondary_color ) . ';
            --pdv-text: ' . esc_attr( $text_color ) . ';
        }
    ';
    
    wp_add_inline_style( 'vendaestoque-style', $css );
}
add_action( 'wp_enqueue_scripts', 'vendaestoque_customizer_css' );
