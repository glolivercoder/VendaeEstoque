import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './CartButtonFixed.css';

const CartButtonFixed = () => {
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const {
    items,
    setItems,
    selectedItems,
    setSelectedItems,
    handleMultipleSales
  } = useAppContext();

  // Get the actual items from the selected indices
  const cartItems = selectedItems.map(index => {
    const item = items[index];
    if (!item) {
      console.log(`Item não encontrado para o índice ${index}`);
      return null; // Proteção contra itens indefinidos
    }
    console.log(`Item encontrado para o índice ${index}:`, item);
    return {
      ...item,
      quantity: item.soldQuantity || 1
    };
  }).filter(Boolean); // Remover itens nulos

  // Log para depuração
  console.log('CartButtonFixed - Items:', items.length);
  console.log('CartButtonFixed - SelectedItems:', selectedItems);
  console.log('CartButtonFixed - CartItems:', cartItems);

  // Toggle cart popup
  const toggleCartPopup = () => {
    setShowCartPopup(!showCartPopup);
    if (showPaymentPopup) setShowPaymentPopup(false);
  };

  // Toggle payment popup
  const togglePaymentPopup = () => {
    setShowPaymentPopup(!showPaymentPopup);
    if (showCartPopup) setShowCartPopup(false);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const newSelectedItems = selectedItems.filter(index => {
      return items[index].id !== itemId;
    });
    setSelectedItems(newSelectedItems);
  };

  // Clear cart
  const clearCart = () => {
    setSelectedItems([]);
    setShowCartPopup(false);
  };

  // Update item quantity
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

  // Process payment
  const processPayment = (paymentMethod) => {
    try {
      handleMultipleSales(paymentMethod);
      setShowPaymentPopup(false);
      setSelectedItems([]);
      alert(`Venda processada com sucesso via ${paymentMethod}!`);
    } catch (error) {
      alert(`Erro ao processar pagamento: ${error.message}`);
    }
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  // Fechar popups quando clicar fora deles
  useEffect(() => {
    const handleClickOutside = (event) => {
      const cartPopup = document.querySelector('.cart-popup');
      const paymentPopup = document.querySelector('.payment-popup');
      const cartButton = document.querySelector('.cart-button-fixed');

      if (showCartPopup && cartPopup && !cartPopup.contains(event.target) && !cartButton.contains(event.target)) {
        setShowCartPopup(false);
      }

      if (showPaymentPopup && paymentPopup && !paymentPopup.contains(event.target) && !cartButton.contains(event.target)) {
        setShowPaymentPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCartPopup, showPaymentPopup]);

  console.log('CartButtonFixed - Renderizando o componente', {
    cartItems: cartItems.length,
    showCartPopup,
    showPaymentPopup
  });

  return (
    <div className="cart-button-fixed-container">
      <button
        className="cart-button-fixed"
        onClick={toggleCartPopup}
        aria-label="Carrinho de compras"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
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
          <span className="cart-badge">{cartItems.length}</span>
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
              <div className="empty-cart-message">
                Seu carrinho está vazio
              </div>
            ) : (
              <ul className="cart-items">
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
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity || 1}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        title="Remover item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="trash-icon"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-actions">
                <button className="clear-cart-btn" onClick={clearCart}>
                  Limpar
                </button>
                <button className="checkout-btn" onClick={togglePaymentPopup}>
                  Finalizar
                </button>
              </div>

              <div className="cart-summary">
                <div className="total-price">
                  <span>Total:</span>
                  <span>R$ {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="items-count">
                  <span>Itens: {cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showPaymentPopup && (
        <div className="payment-popup">
          <div className="payment-popup-header">
            <h3>Finalizar Compra</h3>
            <button className="close-button" onClick={togglePaymentPopup}>×</button>
          </div>

          <div className="payment-content">
            <div className="payment-summary">
              <p>Total: R$ {getTotalPrice().toFixed(2)}</p>
              <p>Itens: {cartItems.length}</p>
            </div>

            <div className="payment-methods">
              <h4>Escolha o método de pagamento:</h4>
              <div className="payment-buttons">
                <button
                  className="payment-method-btn"
                  onClick={() => processPayment('dinheiro')}
                >
                  Dinheiro
                </button>
                <button
                  className="payment-method-btn"
                  onClick={() => processPayment('cartao')}
                >
                  Cartão
                </button>
                <button
                  className="payment-method-btn"
                  onClick={() => processPayment('pix')}
                >
                  PIX
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartButtonFixed;
