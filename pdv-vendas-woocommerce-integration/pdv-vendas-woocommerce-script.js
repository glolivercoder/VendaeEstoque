/**
 * PDV Vendas - Script personalizado para WooCommerce
 * 
 * Este arquivo JavaScript adiciona funcionalidades personalizadas ao tema do WooCommerce
 * para melhorar a experiência do usuário e torná-la mais parecida com o app PDV Vendas.
 * 
 * Instruções de instalação:
 * 1. Faça upload deste arquivo para o diretório do tema ativo
 * 2. Adicione o código para carregar este script no functions.php do tema
 * 3. Ou use um plugin como "Header and Footer Scripts" para adicionar este script
 */

document.addEventListener('DOMContentLoaded', function() {
    // Função para melhorar a exibição de imagens de produtos
    function enhanceProductImages() {
        // Encontrar todas as imagens de produtos
        const productImages = document.querySelectorAll('.woocommerce-product-gallery__image img, .woocommerce ul.products li.product img');
        
        // Para cada imagem
        productImages.forEach(img => {
            // Verificar se é uma imagem placeholder
            if (img.src.includes('placeholder') || img.src.includes('woocommerce-placeholder')) {
                // Adicionar classe para estilização específica
                img.classList.add('pdv-placeholder-image');
                
                // Adicionar um ícone de câmera ou texto alternativo
                const parent = img.closest('.woocommerce-product-gallery__image') || img.closest('.attachment-woocommerce_thumbnail');
                if (parent) {
                    const overlay = document.createElement('div');
                    overlay.className = 'pdv-image-placeholder-overlay';
                    overlay.innerHTML = '<span>Imagem não disponível</span>';
                    parent.appendChild(overlay);
                }
            } else {
                // Para imagens reais, garantir que elas sejam exibidas corretamente
                img.style.objectFit = 'contain';
                img.style.backgroundColor = '#f9f9f9';
            }
            
            // Adicionar tratamento de erro para imagens que falham ao carregar
            img.onerror = function() {
                this.src = 'https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png';
                this.classList.add('pdv-placeholder-image');
            };
        });
    }
    
    // Função para adicionar botão "Voltar ao topo"
    function addBackToTopButton() {
        // Criar o botão
        const backToTopButton = document.createElement('a');
        backToTopButton.href = '#';
        backToTopButton.className = 'pdv-back-to-top';
        backToTopButton.innerHTML = '↑';
        document.body.appendChild(backToTopButton);
        
        // Mostrar/ocultar o botão com base na posição de rolagem
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Adicionar funcionalidade de rolagem suave
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Função para melhorar a exibição de preços
    function enhancePriceDisplay() {
        // Encontrar todos os elementos de preço
        const priceElements = document.querySelectorAll('.price');
        
        priceElements.forEach(priceEl => {
            // Verificar se há preço promocional
            const hasDiscount = priceEl.querySelector('del') !== null;
            
            if (hasDiscount) {
                // Adicionar classe para estilização específica
                priceEl.classList.add('pdv-discount-price');
                
                // Calcular a porcentagem de desconto, se possível
                const regularPrice = priceEl.querySelector('del .amount');
                const salePrice = priceEl.querySelector('ins .amount');
                
                if (regularPrice && salePrice) {
                    // Extrair valores numéricos
                    const regularValue = parseFloat(regularPrice.textContent.replace(/[^0-9,.]/g, '').replace(',', '.'));
                    const saleValue = parseFloat(salePrice.textContent.replace(/[^0-9,.]/g, '').replace(',', '.'));
                    
                    if (!isNaN(regularValue) && !isNaN(saleValue) && regularValue > 0) {
                        // Calcular a porcentagem de desconto
                        const discountPercent = Math.round((1 - saleValue / regularValue) * 100);
                        
                        // Criar e adicionar o badge de desconto
                        if (discountPercent > 0) {
                            const discountBadge = document.createElement('span');
                            discountBadge.className = 'pdv-discount-badge';
                            discountBadge.textContent = `-${discountPercent}%`;
                            priceEl.appendChild(discountBadge);
                        }
                    }
                }
            }
        });
    }
    
    // Função para melhorar a navegação mobile
    function enhanceMobileNavigation() {
        // Verificar se é um dispositivo móvel
        if (window.innerWidth <= 768) {
            // Adicionar classe ao body para estilização específica
            document.body.classList.add('pdv-mobile-view');
            
            // Melhorar o menu mobile, se existir
            const mobileMenu = document.querySelector('.mobile-menu, .menu-toggle, .handheld-navigation');
            if (mobileMenu) {
                mobileMenu.classList.add('pdv-mobile-menu');
            }
            
            // Melhorar a barra de pesquisa mobile
            const searchForm = document.querySelector('.site-search, .search-form');
            if (searchForm) {
                searchForm.classList.add('pdv-mobile-search');
            }
        }
    }
    
    // Função para adicionar lazy loading às imagens
    function addLazyLoading() {
        // Verificar se o navegador suporta lazy loading nativo
        if ('loading' in HTMLImageElement.prototype) {
            // Adicionar atributo loading="lazy" a todas as imagens
            document.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });
        } else {
            // Para navegadores que não suportam lazy loading nativo,
            // poderíamos implementar uma solução baseada em JavaScript aqui
            // ou usar uma biblioteca como lazysizes
        }
    }
    
    // Função para melhorar a exibição de produtos em grade
    function enhanceProductGrid() {
        // Verificar se estamos na página de produtos
        const productGrid = document.querySelector('.products');
        if (productGrid) {
            // Adicionar classe para estilização específica
            productGrid.classList.add('pdv-product-grid');
            
            // Encontrar todos os produtos
            const products = productGrid.querySelectorAll('li.product');
            
            products.forEach(product => {
                // Adicionar classe para estilização específica
                product.classList.add('pdv-product-card');
                
                // Melhorar a exibição do botão "Adicionar ao carrinho"
                const addToCartButton = product.querySelector('.add_to_cart_button');
                if (addToCartButton) {
                    addToCartButton.classList.add('pdv-add-to-cart');
                    
                    // Adicionar ícone de carrinho, se ainda não tiver
                    if (!addToCartButton.querySelector('i, svg')) {
                        addToCartButton.innerHTML = '<span class="pdv-cart-icon">🛒</span> ' + addToCartButton.innerHTML;
                    }
                }
            });
        }
    }
    
    // Executar todas as funções de melhoria
    enhanceProductImages();
    addBackToTopButton();
    enhancePriceDisplay();
    enhanceMobileNavigation();
    addLazyLoading();
    enhanceProductGrid();
    
    // Adicionar listener para reexecutar as funções quando o AJAX do WooCommerce terminar
    // (útil para quando produtos são carregados dinamicamente)
    jQuery(document).on('ajaxComplete', function() {
        setTimeout(function() {
            enhanceProductImages();
            enhancePriceDisplay();
            addLazyLoading();
            enhanceProductGrid();
        }, 500);
    });
});
