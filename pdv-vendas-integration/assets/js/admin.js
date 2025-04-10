jQuery(document).ready(function($) {
    // Copiar shortcode para a área de transferência
    $('.pdv-vendas-copy-shortcode').on('click', function(e) {
        e.preventDefault();
        
        var shortcode = $(this).data('shortcode');
        var tempInput = $('<input>');
        
        $('body').append(tempInput);
        tempInput.val(shortcode).select();
        document.execCommand('copy');
        tempInput.remove();
        
        $(this).text('Copiado!');
        
        setTimeout(function() {
            $('.pdv-vendas-copy-shortcode').text('Copiar');
        }, 2000);
    });
});
