// Carrinho de compras standalone que funciona independentemente do React
(function() {
  // Armazenamento local para os itens do carrinho
  let cartItems = [];
  let isCartOpen = false;

  // Função para inicializar o carrinho
  function initCart() {
    console.log('Inicializando carrinho standalone...');

    // Criar o container do carrinho
    const cartContainer = document.createElement('div');
    cartContainer.id = 'standalone-cart-container';
    cartContainer.style.cssText = `
      position: fixed !important;
      top: 70px !important;
      right: 20px !important;
      z-index: 9999999 !important;
      font-family: Arial, sans-serif !important;
    `;

    // Criar o botão do carrinho
    const cartButton = document.createElement('button');
    cartButton.id = 'standalone-cart-button';
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
    itemCounter.id = 'standalone-cart-counter';
    itemCounter.style.cssText = `
      position: absolute !important;
      top: -5px !important;
      right: -5px !important;
      background-color: #ff4081 !important;
      color: white !important;
      border-radius: 50% !important;
      width: 22px !important;
      height: 22px !important;
      display: none !important;
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
    cartButton.addEventListener('click', toggleCart);

    // Adicionar o botão ao container
    cartContainer.appendChild(cartButton);

    // Adicionar o container ao body
    document.body.appendChild(cartContainer);

    // Iniciar o monitoramento do contexto React
    monitorReactContext();

    console.log('Carrinho standalone inicializado com sucesso!');
  }

  // Função para monitorar o contexto React e sincronizar os itens
  function monitorReactContext() {
    // Verificar periodicamente se o contexto React está disponível
    const checkInterval = setInterval(() => {
      try {
        // Tentar obter o contexto do React
        const reactContext = window.__APP_CONTEXT__;
        if (reactContext && reactContext.items && reactContext.selectedItems) {
          // Sincronizar os itens do carrinho
          syncCartItems(reactContext);

          // Atualizar o contador de itens
          updateItemCounter(reactContext.selectedItems.length);

          // Log detalhado para depuração
          console.log('Contexto React encontrado:', {
            items: reactContext.items.length,
            selectedItems: reactContext.selectedItems.length,
            cartItems: cartItems.length
          });

          // Se o carrinho estiver aberto, atualizá-lo
          if (isCartOpen) {
            openCart();
          }
        } else {
          console.warn('Contexto React incompleto ou não encontrado');
        }
      } catch (error) {
        console.error('Erro ao monitorar contexto React:', error);
      }
    }, 500); // Verificar com mais frequência

    // Limpar o intervalo quando a página for fechada
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
    });
  }

  // Função para sincronizar os itens do carrinho com o contexto React
  function syncCartItems(reactContext) {
    try {
      const { items, selectedItems } = reactContext;

      console.log('Sincronizando itens do carrinho:', {
        totalItems: items ? items.length : 0,
        selectedIndices: selectedItems || []
      });

      // Verificar se temos itens e seleções válidas
      if (!items || !items.length || !selectedItems) {
        console.warn('Dados insuficientes para sincronizar o carrinho');
        cartItems = [];
        return;
      }

      // Mapear os itens selecionados com verificações detalhadas
      cartItems = [];

      for (let i = 0; i < selectedItems.length; i++) {
        const index = selectedItems[i];
        const item = items[index];

        if (item) {
          console.log(`Item ${index} encontrado:`, {
            name: item.name || item.description,
            price: item.price,
            quantity: item.soldQuantity || 1
          });

          cartItems.push({
            ...item,
            originalIndex: index,
            quantity: item.soldQuantity || 1
          });
        } else {
          console.warn(`Item ${index} não encontrado no array de itens`);
        }
      }

      console.log(`Sincronização concluída: ${cartItems.length} itens no carrinho`);
    } catch (error) {
      console.error('Erro ao sincronizar itens do carrinho:', error);
    }
  }

  // Função para atualizar o contador de itens
  function updateItemCounter(count) {
    const counter = document.getElementById('standalone-cart-counter');
    if (!counter) return;

    if (count > 0) {
      counter.textContent = count;
      counter.style.display = 'flex';
    } else {
      counter.style.display = 'none';
    }
  }

  // Função para alternar a visibilidade do carrinho
  function toggleCart() {
    if (isCartOpen) {
      closeCart();
    } else {
      openCart();
    }
  }

  // Função para abrir o carrinho
  function openCart() {
    console.log('Abrindo carrinho com', cartItems.length, 'itens');

    // Remover carrinho existente se houver
    closeCart();

    // Criar o popup do carrinho
    const cartPopup = document.createElement('div');
    cartPopup.id = 'standalone-cart-popup';
    cartPopup.style.cssText = `
      position: fixed !important;
      top: 130px !important;
      left: 10px !important;
      width: 320px !important;
      background-color: white !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
      z-index: 99999999 !important;
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
    closeButton.addEventListener('click', closeCart);

    header.appendChild(title);
    header.appendChild(closeButton);
    cartPopup.appendChild(header);

    // Criar o conteúdo do popup
    const content = document.createElement('div');
    content.style.cssText = `
      max-height: 300px !important;
      overflow-y: auto !important;
    `;

    // Adicionar informação de depuração
    const debugInfo = document.createElement('div');
    debugInfo.style.cssText = `
      padding: 8px 16px !important;
      background-color: #f5f5f5 !important;
      border-bottom: 1px solid #e0e0e0 !important;
      font-size: 12px !important;
      color: #757575 !important;
    `;
    debugInfo.innerHTML = `Itens no carrinho: ${cartItems.length}`;
    content.appendChild(debugInfo);

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

      // Adicionar botão para forçar a atualização
      const refreshButton = document.createElement('button');
      refreshButton.textContent = 'Atualizar Carrinho';
      refreshButton.style.cssText = `
        display: block !important;
        margin: 0 auto 16px auto !important;
        padding: 8px 16px !important;
        background-color: #1976d2 !important;
        color: white !important;
        border: none !important;
        border-radius: 4px !important;
        cursor: pointer !important;
      `;
      refreshButton.addEventListener('click', () => {
        // Tentar obter o contexto novamente
        const reactContext = window.__APP_CONTEXT__;
        if (reactContext) {
          syncCartItems(reactContext);
          openCart();
        }
      });
      content.appendChild(refreshButton);
    } else {
      const itemsList = document.createElement('ul');
      itemsList.style.cssText = `
        list-style: none !important;
        margin: 0 !important;
        padding: 0 !important;
      `;

      // Adicionar cada item ao carrinho com estilo destacado
      cartItems.forEach((item, index) => {
        const itemElement = document.createElement('li');
        itemElement.style.cssText = `
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 12px 16px !important;
          border-bottom: 1px solid #e0e0e0 !important;
          background-color: ${index % 2 === 0 ? 'white' : '#f9f9f9'} !important;
        `;

        const itemInfo = document.createElement('div');
        itemInfo.style.cssText = `
          flex: 1 !important;
          min-width: 0 !important;
          margin-right: 12px !important;
        `;

        const itemName = document.createElement('span');
        itemName.textContent = item.name || item.description || `Produto #${item.originalIndex}`;
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

        // Verificar se o preço é válido
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;

        itemPrice.innerHTML = `
          R$ ${price.toFixed(2)} x ${quantity} =
          <span style="font-weight: 700 !important; color: #4caf50 !important;">
            R$ ${(price * quantity).toFixed(2)}
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
        removeButton.addEventListener('click', () => {
          removeItemFromCart(item.originalIndex);
        });

        itemElement.appendChild(itemInfo);
        itemElement.appendChild(removeButton);
        itemsList.appendChild(itemElement);
      });

      content.appendChild(itemsList);
    }

    cartPopup.appendChild(content);

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

      // Calcular o total
      const totalPrice = cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

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
      clearButton.addEventListener('click', clearCart);

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
      checkoutButton.addEventListener('click', () => {
        showPaymentOptions();
      });

      buttonsContainer.appendChild(clearButton);
      buttonsContainer.appendChild(checkoutButton);

      footer.appendChild(totalElement);
      footer.appendChild(buttonsContainer);
      cartPopup.appendChild(footer);
    }

    // Adicionar o popup ao body
    document.body.appendChild(cartPopup);

    // Marcar o carrinho como aberto
    isCartOpen = true;

    // Adicionar evento para fechar o carrinho ao clicar fora dele
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
  }

  // Função para fechar o carrinho
  function closeCart() {
    const cartPopup = document.getElementById('standalone-cart-popup');
    if (cartPopup) {
      cartPopup.remove();
    }

    const paymentPopup = document.getElementById('standalone-payment-popup');
    if (paymentPopup) {
      paymentPopup.remove();
    }

    // Marcar o carrinho como fechado
    isCartOpen = false;

    // Remover evento de clique fora
    document.removeEventListener('mousedown', handleClickOutside);
  }

  // Função para lidar com clique fora do carrinho
  function handleClickOutside(event) {
    const cartPopup = document.getElementById('standalone-cart-popup');
    const paymentPopup = document.getElementById('standalone-payment-popup');
    const cartButton = document.getElementById('standalone-cart-button');

    if (cartPopup && !cartPopup.contains(event.target) && !cartButton.contains(event.target)) {
      closeCart();
    }

    if (paymentPopup && !paymentPopup.contains(event.target) && !cartButton.contains(event.target)) {
      closeCart();
    }
  }

  // Função para remover um item do carrinho
  function removeItemFromCart(index) {
    try {
      // Obter o contexto React
      const reactContext = window.__APP_CONTEXT__;
      if (reactContext && reactContext.setSelectedItems) {
        // Remover o item da seleção
        const newSelectedItems = reactContext.selectedItems.filter(i => i !== index);
        reactContext.setSelectedItems(newSelectedItems);

        // Atualizar o carrinho
        syncCartItems(reactContext);
        updateItemCounter(newSelectedItems.length);

        // Reabrir o carrinho para mostrar as alterações
        if (isCartOpen) {
          openCart();
        }
      }
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
    }
  }

  // Função para limpar o carrinho
  function clearCart() {
    try {
      // Obter o contexto React
      const reactContext = window.__APP_CONTEXT__;
      if (reactContext && reactContext.setSelectedItems) {
        // Limpar a seleção
        reactContext.setSelectedItems([]);

        // Atualizar o carrinho
        cartItems = [];
        updateItemCounter(0);

        // Fechar o carrinho
        closeCart();
      }
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  }

  // Função para mostrar opções de pagamento
  function showPaymentOptions() {
    // Fechar o popup do carrinho
    const cartPopup = document.getElementById('standalone-cart-popup');
    if (cartPopup) {
      cartPopup.remove();
    }

    // Criar o popup de pagamento
    const paymentPopup = document.createElement('div');
    paymentPopup.id = 'standalone-payment-popup';
    paymentPopup.style.cssText = `
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
    closeButton.addEventListener('click', closeCart);

    header.appendChild(title);
    header.appendChild(closeButton);
    paymentPopup.appendChild(header);

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

    // Calcular o total
    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

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
      button.addEventListener('click', () => {
        processPayment(method.id);
      });
      paymentButtons.appendChild(button);
    });

    content.appendChild(totalInfo);
    content.appendChild(paymentTitle);
    content.appendChild(paymentButtons);
    paymentPopup.appendChild(content);

    // Adicionar o popup ao body
    document.body.appendChild(paymentPopup);
  }

  // Função para processar o pagamento
  function processPayment(paymentMethod) {
    try {
      // Obter o contexto React
      const reactContext = window.__APP_CONTEXT__;
      if (reactContext && reactContext.handleMultipleSales) {
        // Processar o pagamento
        reactContext.handleMultipleSales(paymentMethod);

        // Limpar o carrinho
        if (reactContext.setSelectedItems) {
          reactContext.setSelectedItems([]);
        }

        // Atualizar o carrinho
        cartItems = [];
        updateItemCounter(0);

        // Fechar o carrinho
        closeCart();

        // Mostrar mensagem de sucesso
        alert(`Venda processada com sucesso via ${paymentMethod}!`);
      } else {
        alert('Erro: Função de processamento de pagamento não encontrada.');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert(`Erro ao processar pagamento: ${error.message || 'Erro desconhecido'}`);
    }
  }

  // Inicializar o carrinho quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
  } else {
    initCart();
  }
})();
