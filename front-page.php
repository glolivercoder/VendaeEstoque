<?php
/**
 * The front page template file
 *
 * This is the template that displays the front page.
 *
 * @package VendaEstoque
 */

get_header();
?>

<div id="primary" class="content-area">
    <main id="main" class="site-main">
        <?php
        /**
         * Hook: vendaestoque_before_content.
         *
         * @hooked vendaestoque_homepage_products - 10
         */
        do_action( 'vendaestoque_before_content' );

        // If we have a static front page, display its content
        if ( have_posts() ) :
            while ( have_posts() ) :
                the_post();
                ?>
                <div class="container">
                    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                        <div class="entry-content">
                            <?php the_content(); ?>
                        </div><!-- .entry-content -->
                    </article><!-- #post-<?php the_ID(); ?> -->
                </div>
                <?php
            endwhile;
        endif;

        // Display featured products
        if ( class_exists( 'WooCommerce' ) ) :
            ?>
            <section class="home-featured-products">
                <div class="container">
                    <h2><?php echo esc_html__( 'Produtos em Destaque', 'vendaestoque' ); ?></h2>
                    <?php
                    echo do_shortcode( '[products limit="8" columns="4" orderby="date" order="DESC"]' );
                    ?>
                    <div class="view-all-products">
                        <a href="<?php echo esc_url( get_permalink( wc_get_page_id( 'shop' ) ) ); ?>" class="button">
                            <?php echo esc_html__( 'Ver Todos os Produtos', 'vendaestoque' ); ?>
                        </a>
                    </div>
                </div>
            </section>

            <section class="home-new-products">
                <div class="container">
                    <h2><?php echo esc_html__( 'Novos Produtos', 'vendaestoque' ); ?></h2>
                    <?php
                    echo do_shortcode( '[products limit="4" columns="4" orderby="date" order="DESC"]' );
                    ?>
                </div>
            </section>

            <section class="home-sale-products">
                <div class="container">
                    <h2><?php echo esc_html__( 'Produtos em Promoção', 'vendaestoque' ); ?></h2>
                    <?php
                    echo do_shortcode( '[products limit="4" columns="4" on_sale="true"]' );
                    ?>
                </div>
            </section>
        <?php endif; ?>
    </main><!-- #main -->
</div><!-- #primary -->

<?php
get_footer();
