import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './CartButton.css';

const CartButton = () => {
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const {
    items,
    setItems,
    selectedItems,
    setSelectedItems,
    handleMultipleSales,
    activePage
  } = useAppContext();

  // Verificar se estamos na página de vendas
  useEffect(() => {
    const checkIfSalesPage = () => {
      // Verificar se estamos na página de vendas
      const isSalesPage =
        activePage === 'sales' ||
        window.location.hash === '#sales' ||
        window.location.pathname.includes('/sales');

      console.log('CartButton - Verificando página:', {
        activePage,
        hash: window.location.hash,
        pathname: window.location.pathname,
        isSalesPage
      });

      // Forçar visibilidade para testes
      setIsVisible(true);
    };

    checkIfSalesPage();

    // Adicionar listener para mudanças na URL
    window.addEventListener('hashchange', checkIfSalesPage);

    // Forçar verificação periódica (a cada 2 segundos)
    const intervalId = setInterval(checkIfSalesPage, 2000);

    return () => {
      window.removeEventListener('hashchange', checkIfSalesPage);
      clearInterval(intervalId);
    };
  }, [activePage]);

  // Get the actual items from the selected indices
  const cartItems = selectedItems.map(index => {
    const item = items[index];
    if (!item) return null; // Proteção contra itens indefinidos
    return {
      ...item,
      quantity: item.soldQuantity || 1
    };
  }).filter(Boolean); // Remover itens nulos

  const toggleCartPopup = () => {
    setShowCartPopup(!showCartPopup);
    if (showPaymentPopup) setShowPaymentPopup(false);
  };

  const handleFinalize = () => {
    setShowCartPopup(false);
    setShowPaymentPopup(true);
  };

  const closePaymentPopup = () => {
    setShowPaymentPopup(false);
    // Esvaziar o carrinho após fechar o popup de pagamento
    clearCart();
  };

  const removeFromCart = (itemId) => {
    setSelectedItems(selectedItems.filter(index => items[index].id !== itemId));
  };

  const clearCart = () => {
    setSelectedItems([]);
  };

  const updateQuantity = (itemId, quantity) => {
    // Garantir que a quantidade seja pelo menos 1
    const validQuantity = Math.max(1, quantity);

    // Find the index in the items array that corresponds to the item with itemId
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
      // Find the index in selectedItems that points to this item
      const selectedIndex = selectedItems.findIndex(index => items[index].id === itemId);

      if (selectedIndex !== -1) {
        // Create a copy of the items array
        const newItems = [...items];

        // Update the soldQuantity of the item
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          soldQuantity: validQuantity
        };

        // Update the items in the context
        setItems(newItems);

        // Forçar atualização do componente
        setShowCartPopup(true);
      }
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  // Se não estiver na página de vendas, não renderizar o componente
  if (!isVisible) {
    console.log('CartButton - Não renderizando o componente (isVisible: false)');
    return null;
  }

  console.log('CartButton - Renderizando o componente (isVisible: true)', {
    cartItems: cartItems.length,
    showCartPopup,
    showPaymentPopup
  });

  return (
    <div className="cart-button-container" style={{ display: 'block !important' }}>
      <button
        className="cart-button"
        onClick={toggleCartPopup}
        aria-label="Carrinho de compras"
        style={{ display: 'flex !important' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="cart-icon"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        {cartItems.length > 0 && (
          <span className="cart-count">{cartItems.length}</span>
        )}
      </button>

      {showCartPopup && (
        <div className="cart-popup">
          <div className="cart-popup-header">
            <h3>Carrinho de Compras</h3>
            <button className="close-button" onClick={toggleCartPopup}>×</button>
          </div>

          <div className="cart-items-container">
            {cartItems.length === 0 ? (
              <p className="empty-cart-message">Seu carrinho está vazio</p>
            ) : (
              <>
                <ul className="cart-items-list">
                  {cartItems.map((item) => (
                    <li key={item.id} className="cart-item">
                      {item.imageUrl && (
                        <div className="item-image">
                          <img src={item.imageUrl} alt={item.name || item.description} />
                        </div>
                      )}
                      <div className="item-details">
                        <span className="item-name">{item.name || item.description}</span>
                        <div className="item-price">
                          <span>R$ {item.price.toFixed(2)} x {item.quantity}</span>
                          <span className="item-subtotal"> = R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="item-actions">
                        <div className="quantity-control">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="quantity-input"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="remove-item-btn"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remover item"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="cart-summary">
                  <div className="total-price">
                    <span>Total:</span>
                    <span>R$ {getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="items-count">
                    <span>Itens: {cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                  </div>
                </div>

                <div className="cart-actions">
                  <button className="clear-cart-btn" onClick={clearCart}>
                    Limpar
                  </button>
                  <button className="finalize-btn" onClick={handleFinalize}>
                    Finalizar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showPaymentPopup && (
        <div className="payment-popup">
          <div className="payment-popup-header">
            <h3>Escolha a forma de pagamento</h3>
            <button className="close-button" onClick={closePaymentPopup}>×</button>
          </div>

          <div className="payment-methods">
            <button
              className="payment-method-btn dinheiro"
              onClick={() => {
                handleMultipleSales('dinheiro');
                closePaymentPopup();
              }}
            >
              DINHEIRO
            </button>

            <button
              className="payment-method-btn cartao"
              onClick={() => {
                handleMultipleSales('cartao');
                closePaymentPopup();
              }}
            >
              CARTÃO
            </button>

            <button
              className="payment-method-btn pix"
              onClick={() => {
                handleMultipleSales('pix');
                closePaymentPopup();
              }}
            >
              PIX
            </button>

            <button
              className="payment-method-btn cancelar"
              onClick={closePaymentPopup}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartButton;
