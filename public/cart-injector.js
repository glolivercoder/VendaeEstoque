// Script para injetar o carrinho diretamente no DOM
(function() {
  // Função para criar o carrinho
  function createCart() {
    // Verificar se o carrinho já existe
    if (document.getElementById('direct-cart-container')) {
      return;
    }

    console.log('Injetando carrinho diretamente no DOM...');

    // Criar o container do carrinho
    const cartContainer = document.createElement('div');
    cartContainer.id = 'direct-cart-container';
    cartContainer.style.cssText = `
      position: fixed !important;
      top: 70px !important;
      right: 20px !important;
      z-index: 9999999 !important;
      width: 50px !important;
      height: 50px !important;
      pointer-events: auto !important;
      display: block !important;
    `;

    // Criar o botão do carrinho
    const cartButton = document.createElement('button');
    cartButton.id = 'direct-cart-button';
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

    // Adicionar o botão ao container
    cartContainer.appendChild(cartButton);

    // Adicionar o container ao body
    document.body.appendChild(cartContainer);

    // Adicionar evento de clique ao botão
    cartButton.addEventListener('click', function() {
      // Obter os itens selecionados do contexto
      const appContext = window.__APP_CONTEXT__;
      if (!appContext) {
        console.error('Contexto da aplicação não encontrado');
        alert('Erro ao acessar os itens do carrinho. Tente recarregar a página.');
        return;
      }

      const { items, selectedItems } = appContext;
      
      // Verificar se há itens selecionados
      if (!selectedItems || selectedItems.length === 0) {
        alert('Seu carrinho está vazio. Selecione alguns produtos primeiro.');
        return;
      }

      // Criar o popup do carrinho
      showCartPopup(items, selectedItems, appContext);
    });

    console.log('Carrinho injetado com sucesso!');
  }

  // Função para mostrar o popup do carrinho
  function showCartPopup(items, selectedItems, appContext) {
    // Remover popup existente se houver
    const existingPopup = document.getElementById('direct-cart-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Obter os itens selecionados
    const cartItems = selectedItems.map(index => {
      const item = items[index];
      if (!item) return null;
      return {
        ...item,
        originalIndex: index,
        quantity: item.soldQuantity || 1
      };
    }).filter(Boolean);

    // Calcular o total
    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);

    // Criar o popup
    const popup = document.createElement('div');
    popup.id = 'direct-cart-popup';
    popup.style.cssText = `
      position: fixed !important;
      top: 130px !important;
      right: 20px !important;
      width: 320px !important;
      background-color: white !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
      z-index: 9999999 !important;
      overflow: hidden !important;
      font-family: Arial, sans-serif !important;
    `;

    // Criar o cabeçalho do popup
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 12px 16px !important;
      background-color: #f5f5f5 !important;
      border-bottom: 1px solid #e0e0e0 !important;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Carrinho de Compras';
    title.style.cssText = `
      margin: 0 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #333 !important;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none !important;
      border: none !important;
      font-size: 24px !important;
      color: #757575 !important;
      cursor: pointer !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 24px !important;
      height: 24px !important;
      border-radius: 50% !important;
    `;
    closeButton.addEventListener('click', function() {
      popup.remove();
    });

    header.appendChild(title);
    header.appendChild(closeButton);
    popup.appendChild(header);

    // Criar o conteúdo do popup
    const content = document.createElement('div');
    content.style.cssText = `
      max-height: 300px !important;
      overflow-y: auto !important;
    `;

    if (cartItems.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'Seu carrinho está vazio';
      emptyMessage.style.cssText = `
        padding: 24px 16px !important;
        text-align: center !important;
        color: #757575 !important;
        font-style: italic !important;
      `;
      content.appendChild(emptyMessage);
    } else {
      const itemsList = document.createElement('ul');
      itemsList.style.cssText = `
        list-style: none !important;
        margin: 0 !important;
        padding: 0 !important;
      `;

      cartItems.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.style.cssText = `
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 12px 16px !important;
          border-bottom: 1px solid #e0e0e0 !important;
        `;

        const itemInfo = document.createElement('div');
        itemInfo.style.cssText = `
          flex: 1 !important;
          min-width: 0 !important;
          margin-right: 12px !important;
        `;

        const itemName = document.createElement('span');
        itemName.textContent = item.name || item.description;
        itemName.style.cssText = `
          display: block !important;
          font-weight: 500 !important;
          margin-bottom: 4px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          color: #333 !important;
        `;

        const itemPrice = document.createElement('div');
        itemPrice.style.cssText = `
          color: #1976d2 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
        `;
        itemPrice.innerHTML = `
          R$ ${item.price.toFixed(2)} x ${item.quantity} = 
          <span style="font-weight: 700 !important; color: #4caf50 !important;">
            R$ ${(item.price * item.quantity).toFixed(2)}
          </span>
        `;

        itemInfo.appendChild(itemName);
        itemInfo.appendChild(itemPrice);

        const removeButton = document.createElement('button');
        removeButton.innerHTML = '✕';
        removeButton.style.cssText = `
          background: none !important;
          border: none !important;
          color: #f44336 !important;
          cursor: pointer !important;
          padding: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          font-size: 14px !important;
        `;
        removeButton.addEventListener('click', function() {
          // Remover item do carrinho
          if (appContext && appContext.setSelectedItems) {
            const newSelectedItems = selectedItems.filter(index => index !== item.originalIndex);
            appContext.setSelectedItems(newSelectedItems);
            
            // Atualizar o popup
            showCartPopup(items, newSelectedItems, appContext);
          }
        });

        itemElement.appendChild(itemInfo);
        itemElement.appendChild(removeButton);
        itemsList.appendChild(itemElement);
      });

      content.appendChild(itemsList);
    }

    popup.appendChild(content);

    // Adicionar o rodapé com o total e botões
    if (cartItems.length > 0) {
      const footer = document.createElement('div');
      footer.style.cssText = `
        padding: 12px 16px !important;
        border-top: 1px solid #e0e0e0 !important;
        background-color: #f5f5f5 !important;
      `;

      const totalElement = document.createElement('div');
      totalElement.style.cssText = `
        display: flex !important;
        justify-content: space-between !important;
        font-weight: bold !important;
        font-size: 18px !important;
        margin-bottom: 12px !important;
        color: #333 !important;
      `;
      totalElement.innerHTML = `
        <span>Total:</span>
        <span>R$ ${totalPrice.toFixed(2)}</span>
      `;

      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = `
        display: flex !important;
        justify-content: space-between !important;
        gap: 8px !important;
      `;

      const clearButton = document.createElement('button');
      clearButton.textContent = 'Limpar';
      clearButton.style.cssText = `
        flex: 1 !important;
        padding: 8px 0 !important;
        border-radius: 4px !important;
        border: 1px solid #e0e0e0 !important;
        background-color: #f5f5f5 !important;
        color: #757575 !important;
        cursor: pointer !important;
        font-weight: 500 !important;
      `;
      clearButton.addEventListener('click', function() {
        // Limpar o carrinho
        if (appContext && appContext.setSelectedItems) {
          appContext.setSelectedItems([]);
          popup.remove();
        }
      });

      const checkoutButton = document.createElement('button');
      checkoutButton.textContent = 'Finalizar';
      checkoutButton.style.cssText = `
        flex: 1 !important;
        padding: 8px 0 !important;
        border-radius: 4px !important;
        border: none !important;
        background-color: #4caf50 !important;
        color: white !important;
        cursor: pointer !important;
        font-weight: 500 !important;
      `;
      checkoutButton.addEventListener('click', function() {
        // Mostrar opções de pagamento
        showPaymentOptions(items, selectedItems, appContext, popup);
      });

      buttonsContainer.appendChild(clearButton);
      buttonsContainer.appendChild(checkoutButton);

      footer.appendChild(totalElement);
      footer.appendChild(buttonsContainer);
      popup.appendChild(footer);
    }

    // Adicionar o popup ao body
    document.body.appendChild(popup);

    // Adicionar evento para fechar o popup ao clicar fora dele
    document.addEventListener('mousedown', function handleClickOutside(event) {
      const cartButton = document.getElementById('direct-cart-button');
      if (popup && !popup.contains(event.target) && cartButton && !cartButton.contains(event.target)) {
        popup.remove();
        document.removeEventListener('mousedown', handleClickOutside);
      }
    });
  }

  // Função para mostrar opções de pagamento
  function showPaymentOptions(items, selectedItems, appContext, cartPopup) {
    // Remover popup existente se houver
    const existingPopup = document.getElementById('direct-payment-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Remover o popup do carrinho
    if (cartPopup) {
      cartPopup.remove();
    }

    // Obter os itens selecionados
    const cartItems = selectedItems.map(index => {
      const item = items[index];
      if (!item) return null;
      return {
        ...item,
        quantity: item.soldQuantity || 1
      };
    }).filter(Boolean);

    // Calcular o total
    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);

    // Criar o popup
    const popup = document.createElement('div');
    popup.id = 'direct-payment-popup';
    popup.style.cssText = `
      position: fixed !important;
      top: 130px !important;
      right: 20px !important;
      width: 320px !important;
      background-color: white !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
      z-index: 9999999 !important;
      overflow: hidden !important;
      font-family: Arial, sans-serif !important;
    `;

    // Criar o cabeçalho do popup
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 12px 16px !important;
      background-color: #f5f5f5 !important;
      border-bottom: 1px solid #e0e0e0 !important;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Finalizar Compra';
    title.style.cssText = `
      margin: 0 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #333 !important;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none !important;
      border: none !important;
      font-size: 24px !important;
      color: #757575 !important;
      cursor: pointer !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 24px !important;
      height: 24px !important;
      border-radius: 50% !important;
    `;
    closeButton.addEventListener('click', function() {
      popup.remove();
    });

    header.appendChild(title);
    header.appendChild(closeButton);
    popup.appendChild(header);

    // Criar o conteúdo do popup
    const content = document.createElement('div');
    content.style.cssText = `
      padding: 16px !important;
    `;

    const totalInfo = document.createElement('div');
    totalInfo.style.cssText = `
      margin-bottom: 16px !important;
      padding: 12px !important;
      background-color: #f5f5f5 !important;
      border-radius: 4px !important;
    `;
    totalInfo.innerHTML = `
      <p style="margin: 4px 0 !important; font-weight: 500 !important;">Total: R$ ${totalPrice.toFixed(2)}</p>
      <p style="margin: 4px 0 !important; font-weight: 500 !important;">Itens: ${cartItems.length}</p>
    `;

    const paymentTitle = document.createElement('h4');
    paymentTitle.textContent = 'Escolha o método de pagamento:';
    paymentTitle.style.cssText = `
      margin: 0 0 12px 0 !important;
      font-size: 14px !important;
      color: #757575 !important;
    `;

    const paymentButtons = document.createElement('div');
    paymentButtons.style.cssText = `
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
    `;

    // Criar botões de pagamento
    const paymentMethods = [
      { id: 'dinheiro', label: 'Dinheiro' },
      { id: 'cartao', label: 'Cartão' },
      { id: 'pix', label: 'PIX' }
    ];

    paymentMethods.forEach(method => {
      const button = document.createElement('button');
      button.textContent = method.label;
      button.style.cssText = `
        padding: 10px 16px !important;
        border-radius: 4px !important;
        border: none !important;
        background-color: #1976d2 !important;
        color: white !important;
        font-weight: 500 !important;
        cursor: pointer !important;
      `;
      button.addEventListener('click', function() {
        // Processar o pagamento
        processPayment(method.id, appContext, popup);
      });
      paymentButtons.appendChild(button);
    });

    content.appendChild(totalInfo);
    content.appendChild(paymentTitle);
    content.appendChild(paymentButtons);
    popup.appendChild(content);

    // Adicionar o popup ao body
    document.body.appendChild(popup);

    // Adicionar evento para fechar o popup ao clicar fora dele
    document.addEventListener('mousedown', function handleClickOutside(event) {
      const cartButton = document.getElementById('direct-cart-button');
      if (popup && !popup.contains(event.target) && cartButton && !cartButton.contains(event.target)) {
        popup.remove();
        document.removeEventListener('mousedown', handleClickOutside);
      }
    });
  }

  // Função para processar o pagamento
  function processPayment(paymentMethod, appContext, popup) {
    try {
      if (appContext && appContext.handleMultipleSales) {
        appContext.handleMultipleSales(paymentMethod);
        appContext.setSelectedItems([]);
        popup.remove();
        alert(`Venda processada com sucesso via ${paymentMethod}!`);
      } else {
        alert('Erro: Função de processamento de pagamento não encontrada.');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert(`Erro ao processar pagamento: ${error.message || 'Erro desconhecido'}`);
    }
  }

  // Função para atualizar o contador de itens no carrinho
  function updateCartCounter() {
    const appContext = window.__APP_CONTEXT__;
    if (!appContext) return;

    const { selectedItems } = appContext;
    const cartButton = document.getElementById('direct-cart-button');
    
    if (!cartButton) return;

    // Remover contador existente
    const existingCounter = document.getElementById('direct-cart-counter');
    if (existingCounter) {
      existingCounter.remove();
    }

    // Adicionar novo contador se houver itens
    if (selectedItems && selectedItems.length > 0) {
      const counter = document.createElement('span');
      counter.id = 'direct-cart-counter';
      counter.textContent = selectedItems.length;
      counter.style.cssText = `
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
      cartButton.appendChild(counter);
    }
  }

  // Função para expor o contexto da aplicação
  function exposeAppContext() {
    // Verificar se o contexto já foi exposto
    if (window.__APP_CONTEXT__) return;

    // Encontrar o elemento que contém o contexto
    const contextElement = document.querySelector('[data-app-context]');
    if (!contextElement) {
      console.warn('Elemento de contexto não encontrado. Tentando novamente em 1 segundo...');
      setTimeout(exposeAppContext, 1000);
      return;
    }

    try {
      // Obter o contexto da aplicação
      const contextData = JSON.parse(contextElement.getAttribute('data-app-context'));
      window.__APP_CONTEXT__ = contextData;
      console.log('Contexto da aplicação exposto com sucesso:', contextData);
    } catch (error) {
      console.error('Erro ao expor contexto da aplicação:', error);
    }
  }

  // Função para observar mudanças no DOM
  function observeDOM() {
    // Criar um observador para detectar quando a página de vendas é carregada
    const observer = new MutationObserver(function(mutations) {
      // Verificar se estamos na página de vendas
      const salesPageElement = document.querySelector('h1, h2, h3, h4, h5, h6');
      if (salesPageElement && (salesPageElement.textContent.includes('Vendas') || salesPageElement.textContent.includes('PDV'))) {
        createCart();
        updateCartCounter();
      }
    });

    // Iniciar a observação
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Também verificar periodicamente o contexto e o contador
    setInterval(function() {
      exposeAppContext();
      updateCartCounter();
    }, 1000);
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      exposeAppContext();
      createCart();
      observeDOM();
    });
  } else {
    exposeAppContext();
    createCart();
    observeDOM();
  }
})();
