/**
 * Main JavaScript file for the VendaEstoque theme
 */
(function($) {
    'use strict';

    // Mobile menu toggle
    $('.menu-toggle').on('click', function() {
        $(this).toggleClass('active');
        $('#primary-menu').slideToggle();
    });

    // Responsive menu
    $(window).on('resize', function() {
        if ($(window).width() > 768) {
            $('#primary-menu').removeAttr('style');
            $('.menu-toggle').removeClass('active');
        }
    });

    // WooCommerce quantity buttons
    $(document).on('click', '.quantity .plus, .quantity .minus', function() {
        var $qty = $(this).closest('.quantity').find('.qty'),
            currentVal = parseFloat($qty.val()),
            max = parseFloat($qty.attr('max')),
            min = parseFloat($qty.attr('min')),
            step = $qty.attr('step');

        if (!currentVal || currentVal === '' || currentVal === 'NaN') currentVal = 0;
        if (max === '' || max === 'NaN') max = '';
        if (min === '' || min === 'NaN') min = 0;
        if (step === 'any' || step === '' || step === undefined || parseFloat(step) === 'NaN') step = 1;

        if ($(this).is('.plus')) {
            if (max && (max == currentVal || currentVal > max)) {
                $qty.val(max);
            } else {
                $qty.val(currentVal + parseFloat(step));
            }
        } else {
            if (min && (min == currentVal || currentVal < min)) {
                $qty.val(min);
            } else if (currentVal > 0) {
                $qty.val(currentVal - parseFloat(step));
            }
        }

        $qty.trigger('change');
    });

    // Product gallery video support
    $('.woocommerce-product-gallery').on('click', '.video-thumbnail', function(e) {
        e.preventDefault();
        var $videoContainer = $(this).siblings('.product-video-container');
        
        if ($videoContainer.length) {
            $videoContainer.show();
            $(this).hide();
            
            // If it's a video element, play it
            var $video = $videoContainer.find('video');
            if ($video.length) {
                $video[0].play();
            }
        }
    });

    // Initialize product video thumbnails
    function initProductVideoThumbnails() {
        $('.video-thumbnail').each(function() {
            var $this = $(this);
            var $img = $this.find('img');
            
            if ($img.length) {
                $img.attr('data-video-thumbnail', 'true');
            }
        });
    }

    // Run on document ready
    $(document).ready(function() {
        initProductVideoThumbnails();
    });

    // Run after AJAX content is loaded (for WooCommerce)
    $(document).on('ajaxComplete', function() {
        initProductVideoThumbnails();
    });

})(jQuery);
