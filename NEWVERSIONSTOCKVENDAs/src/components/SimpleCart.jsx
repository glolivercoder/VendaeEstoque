import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './SimpleCart.css';

const SimpleCart = () => {
  const [showCart, setShowCart] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const { items, selectedItems, setSelectedItems, handleMultipleSales } = useAppContext();

  // Calcular o total e obter os itens selecionados
  useEffect(() => {
    let total = 0;
    selectedItems.forEach(index => {
      const item = items[index];
      if (item) {
        total += (item.price * (item.soldQuantity || 1));
      }
    });
    setTotalPrice(total);
    
    console.log('SimpleCart - Items:', items.length);
    console.log('SimpleCart - SelectedItems:', selectedItems);
  }, [items, selectedItems]);

  // Remover item do carrinho
  const removeItem = (index) => {
    setSelectedItems(prev => prev.filter(i => i !== index));
  };

  // Limpar carrinho
  const clearCart = () => {
    setSelectedItems([]);
    setShowCart(false);
  };

  // Processar pagamento
  const processPayment = (method) => {
    try {
      handleMultipleSales(method);
      setSelectedItems([]);
      setShowCart(false);
      alert(`Venda processada com sucesso via ${method}!`);
    } catch (error) {
      alert(`Erro ao processar pagamento: ${error.message}`);
    }
  };

  // Renderizar itens do carrinho
  const renderCartItems = () => {
    return selectedItems.map(index => {
      const item = items[index];
      if (!item) return null;
      
      return (
        <div key={index} className="cart-item">
          <div className="cart-item-info">
            <div className="cart-item-name">{item.description}</div>
            <div className="cart-item-price">
              R$ {item.price.toFixed(2)} x {item.soldQuantity || 1} = 
              R$ {((item.price) * (item.soldQuantity || 1)).toFixed(2)}
            </div>
          </div>
          <button 
            className="cart-item-remove" 
            onClick={() => removeItem(index)}
          >
            ✕
          </button>
        </div>
      );
    });
  };

  return (
    <div className="simple-cart-container">
      {/* Botão do carrinho */}
      <button 
        className="cart-button" 
        onClick={() => setShowCart(!showCart)}
      >
        🛒
        {selectedItems.length > 0 && (
          <span className="cart-count">{selectedItems.length}</span>
        )}
      </button>

      {/* Conteúdo do carrinho */}
      {showCart && (
        <div className="cart-content">
          <div className="cart-header">
            <h3>Carrinho de Compras</h3>
            <button 
              className="cart-close" 
              onClick={() => setShowCart(false)}
            >
              ✕
            </button>
          </div>

          <div className="cart-items">
            {selectedItems.length === 0 ? (
              <div className="cart-empty">Seu carrinho está vazio</div>
            ) : (
              renderCartItems()
            )}
          </div>

          {selectedItems.length > 0 && (
            <>
              <div className="cart-total">
                <span>Total:</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>

              <div className="cart-actions">
                <button 
                  className="cart-clear" 
                  onClick={clearCart}
                >
                  Limpar
                </button>
                <div className="cart-payment-methods">
                  <button 
                    className="cart-payment-button" 
                    onClick={() => processPayment('dinheiro')}
                  >
                    Dinheiro
                  </button>
                  <button 
                    className="cart-payment-button" 
                    onClick={() => processPayment('cartao')}
                  >
                    Cartão
                  </button>
                  <button 
                    className="cart-payment-button" 
                    onClick={() => processPayment('pix')}
                  >
                    PIX
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleCart;
