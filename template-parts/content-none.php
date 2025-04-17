<?php
/**
 * Template part for displaying a message that posts cannot be found
 *
 * @package VendaEstoque
 */

?>

<section class="no-results not-found">
    <header class="page-header">
        <h1 class="page-title"><?php esc_html_e( 'Nothing Found', 'vendaestoque' ); ?></h1>
    </header><!-- .page-header -->

    <div class="page-content">
        <?php
        if ( is_home() && current_user_can( 'publish_posts' ) ) :

            printf(
                '<p>' . wp_kses(
                    /* translators: 1: link to WP admin new post page. */
                    __( 'Ready to publish your first post? <a href="%1$s">Get started here</a>.', 'vendaestoque' ),
                    array(
                        'a' => array(
                            'href' => array(),
                        ),
                    )
                ) . '</p>',
                esc_url( admin_url( 'post-new.php' ) )
            );

        elseif ( is_search() ) :
            ?>

            <p><?php esc_html_e( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'vendaestoque' ); ?></p>
            <?php
            get_search_form();

        elseif ( is_woocommerce() ) :
            ?>

            <p><?php esc_html_e( 'No products were found matching your selection.', 'vendaestoque' ); ?></p>
            <?php
            if ( function_exists( 'wc_get_page_id' ) ) :
                ?>
                <p><a class="button" href="<?php echo esc_url( get_permalink( wc_get_page_id( 'shop' ) ) ); ?>"><?php esc_html_e( 'Return to shop', 'vendaestoque' ); ?></a></p>
                <?php
            endif;

        else :
            ?>

            <p><?php esc_html_e( 'It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.', 'vendaestoque' ); ?></p>
            <?php
            get_search_form();

        endif;
        ?>
    </div><!-- .page-content -->
</section><!-- .no-results -->
