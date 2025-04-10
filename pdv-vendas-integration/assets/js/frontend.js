jQuery(document).ready(function($) {
    // Adicionar funcionalidade de zoom nas imagens
    $('.pdv-vendas-product-image img').on('click', function() {
        var imgSrc = $(this).attr('src');
        var imgAlt = $(this).attr('alt');
        
        // Criar modal de zoom
        var modal = $('<div class="pdv-vendas-image-modal"></div>');
        var modalContent = $('<div class="pdv-vendas-image-modal-content"></div>');
        var closeBtn = $('<span class="pdv-vendas-image-modal-close">&times;</span>');
        var img = $('<img src="' + imgSrc + '" alt="' + imgAlt + '">');
        
        modalContent.append(closeBtn);
        modalContent.append(img);
        modal.append(modalContent);
        $('body').append(modal);
        
        // Mostrar modal
        setTimeout(function() {
            modal.addClass('active');
        }, 10);
        
        // Fechar modal ao clicar no botão de fechar
        closeBtn.on('click', function() {
            modal.removeClass('active');
            setTimeout(function() {
                modal.remove();
            }, 300);
        });
        
        // Fechar modal ao clicar fora da imagem
        modal.on('click', function(e) {
            if ($(e.target).is(modal)) {
                modal.removeClass('active');
                setTimeout(function() {
                    modal.remove();
                }, 300);
            }
        });
    });
    
    // Adicionar estilos para o modal
    $('<style>')
        .text(`
            .pdv-vendas-image-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .pdv-vendas-image-modal.active {
                opacity: 1;
            }
            
            .pdv-vendas-image-modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            
            .pdv-vendas-image-modal-content img {
                max-width: 100%;
                max-height: 90vh;
                display: block;
                margin: 0 auto;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            }
            
            .pdv-vendas-image-modal-close {
                position: absolute;
                top: -30px;
                right: 0;
                color: #fff;
                font-size: 30px;
                font-weight: bold;
                cursor: pointer;
            }
        `)
        .appendTo('head');
});
