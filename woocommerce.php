<?php
/**
 * The template for displaying WooCommerce content
 *
 * @package VendaEstoque
 */

get_header();
?>

<div id="primary" class="content-area">
    <main id="main" class="site-main">
        <div class="container">
            <?php woocommerce_content(); ?>
        </div>
    </main><!-- #main -->
</div><!-- #primary -->

<?php
get_footer();
