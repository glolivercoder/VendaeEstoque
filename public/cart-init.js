// Script de inicialização do carrinho
(function() {
  console.log('Inicializando script de injeção do carrinho...');
  
  // Função para injetar o carrinho assim que possível
  function injectCart() {
    // Criar o container do carrinho
    const cartContainer = document.createElement('div');
    cartContainer.id = 'direct-cart-container';
    
    // Criar o botão do carrinho
    const cartButton = document.createElement('button');
    cartButton.id = 'direct-cart-button';
    cartButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px; color: white;">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    `;
    
    // Adicionar o botão ao container
    cartContainer.appendChild(cartButton);
    
    // Adicionar o container ao body
    document.body.appendChild(cartContainer);
    
    console.log('Carrinho injetado com sucesso pelo script de inicialização!');
  }
  
  // Injetar o carrinho quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCart);
  } else {
    injectCart();
  }
})();
