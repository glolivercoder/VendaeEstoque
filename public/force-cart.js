// Script para forçar a exibição do carrinho
(function() {
  // Função para criar o botão do carrinho
  function createCartButton() {
    // Verificar se o botão já existe
    if (document.getElementById('force-cart-button')) {
      return;
    }

    console.log('Criando botão do carrinho forçado...');

    // Criar o container do botão
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'force-cart-container';
    buttonContainer.style.cssText = `
      position: fixed !important;
      top: 70px !important;
      left: 10px !important;
      z-index: 99999999 !important;
      width: 50px !important;
      height: 50px !important;
      pointer-events: auto !important;
      display: block !important;
    `;

    // Criar o botão
    const cartButton = document.createElement('button');
    cartButton.id = 'force-cart-button';
    cartButton.style.cssText = `
      width: 50px !important;
      height: 50px !important;
      border-radius: 50% !important;
      background-color: #1976d2 !important;
      color: white !important;
      border: 3px solid white !important;
      font-size: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5) !important;
      position: relative !important;
      outline: none !important;
    `;

    // Adicionar ícone do carrinho
    cartButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 28px; height: 28px; color: white;">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    `;

    // Adicionar contador de itens
    const itemCounter = document.createElement('span');
    itemCounter.id = 'force-cart-counter';
    itemCounter.style.cssText = `
      position: absolute !important;
      top: -5px !important;
      right: -5px !important;
      background-color: #ff4081 !important;
      color: white !important;
      border-radius: 50% !important;
      width: 22px !important;
      height: 22px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 12px !important;
      font-weight: bold !important;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
      border: 1px solid white !important;
    `;
    itemCounter.textContent = '0';
    cartButton.appendChild(itemCounter);

    // Adicionar evento de clique ao botão
    cartButton.addEventListener('click', function() {
      // Tentar encontrar o botão do carrinho original e clicar nele
      const originalCartButton = document.querySelector('[data-testid="cart-button"]');
      if (originalCartButton) {
        originalCartButton.click();
      } else {
        alert('Carrinho não disponível. Por favor, recarregue a página.');
      }
    });

    // Adicionar o botão ao container
    buttonContainer.appendChild(cartButton);

    // Adicionar o container ao body
    document.body.appendChild(buttonContainer);

    console.log('Botão do carrinho forçado criado com sucesso!');
  }

  // Função para atualizar o contador de itens
  function updateCartCounter() {
    try {
      // Tentar obter o contexto do React
      const reactContext = window.__APP_CONTEXT__;
      if (reactContext && reactContext.selectedItems) {
        const counter = document.getElementById('force-cart-counter');
        if (counter) {
          const count = reactContext.selectedItems.length;
          counter.textContent = count;
          counter.style.display = count > 0 ? 'flex' : 'none';
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar contador do carrinho:', error);
    }
  }

  // Função para verificar e criar o botão periodicamente
  function checkAndCreateButton() {
    createCartButton();
    updateCartCounter();
  }

  // Verificar e criar o botão a cada segundo
  setInterval(checkAndCreateButton, 1000);

  // Criar o botão imediatamente
  createCartButton();
})();
