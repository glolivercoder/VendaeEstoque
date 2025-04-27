import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './CartButtonFixed.css';

const SalesCartButton = () => {
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const {
    items,
    setItems,
    selectedItems,
    setSelectedItems,
    handleMultipleSales
  } = useAppContext();

  // Log para depuração
  useEffect(() => {
    console.log('SalesCartButton - Montado');
    console.log('SalesCartButton - Items:', items.length);
    console.log('SalesCartButton - SelectedItems:', selectedItems);
    
    return () => {
      console.log('SalesCartButton - Desmontado');
    };
  }, [items, selectedItems]);

  // Get the actual items from the selected indices
  const cartItems = selectedItems.map(index => {
    const item = items[index];
    if (!item) {
      console.log(`Item não encontrado para o índice ${index}`);
      return null; // Proteção contra itens indefinidos
    }
    return {
      ...item,
      quantity: item.soldQuantity || 1
    };
  }).filter(Boolean); // Remover itens nulos

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
      const cartPopup = document.querySelector('.sales-cart-popup');
      const paymentPopup = document.querySelector('.sales-payment-popup');
      const cartButton = document.querySelector('.sales-cart-button');

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

  return (
    <div className="sales-cart-button-container" style={{
      position: 'fixed',
      top: '70px',
      right: '10px',
      zIndex: 99999,
      pointerEvents: 'auto',
      display: 'block'
    }}>
      <button
        className="sales-cart-button"
        onClick={toggleCartPopup}
        aria-label="Carrinho de compras"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#1976d2',
          color: 'white',
          border: '2px solid white',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            width: '28px',
            height: '28px',
            color: 'white'
          }}
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>

        {cartItems.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ff4081',
            color: 'white',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            border: '1px solid white'
          }}>{cartItems.length}</span>
        )}
      </button>

      {showCartPopup && (
        <div className="sales-cart-popup" style={{
          position: 'absolute',
          top: '55px',
          right: '0',
          width: '350px',
          maxHeight: '500px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 99999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#333'
            }}>Carrinho de Compras</h3>
            <button onClick={toggleCartPopup} style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#757575',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%'
            }}>×</button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '300px'
          }}>
            {cartItems.length === 0 ? (
              <div style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: '#757575',
                fontStyle: 'italic'
              }}>
                Seu carrinho está vazio
              </div>
            ) : (
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0
              }}>
                {cartItems.map((item) => (
                  <li key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    {item.imageUrl && (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        marginRight: '10px',
                        flexShrink: 0,
                        overflow: 'hidden',
                        borderRadius: '4px'
                      }}>
                        <img src={item.imageUrl} alt={item.name || item.description} style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }} />
                      </div>
                    )}
                    <div style={{
                      flex: 1,
                      minWidth: 0,
                      marginRight: '12px'
                    }}>
                      <span style={{
                        display: 'block',
                        fontWeight: 500,
                        marginBottom: '4px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{item.name || item.description}</span>
                      <div style={{
                        color: '#1976d2',
                        fontWeight: 500,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <span>R$ {item.price.toFixed(2)} x {item.quantity}</span>
                        <span style={{
                          fontWeight: 700,
                          color: '#4caf50'
                        }}> = R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: '8px'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '1px solid #e0e0e0',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          -
                        </button>
                        <span style={{
                          margin: '0 8px',
                          fontWeight: 500
                        }}>{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '1px solid #e0e0e0',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        title="Remover item"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f44336',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%'
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            width: '16px',
                            height: '16px'
                          }}
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
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#f5f5f5'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <button onClick={clearCart} style={{
                  backgroundColor: '#f5f5f5',
                  color: '#757575',
                  border: '1px solid #e0e0e0',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}>
                  Limpar
                </button>
                <button onClick={togglePaymentPopup} style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}>
                  Finalizar
                </button>
              </div>

              <div style={{
                marginTop: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  marginBottom: '5px'
                }}>
                  <span>Total:</span>
                  <span>R$ {getTotalPrice().toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  fontSize: '14px',
                  color: '#757575'
                }}>
                  <span>Itens: {cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showPaymentPopup && (
        <div className="sales-payment-popup" style={{
          position: 'absolute',
          top: '55px',
          right: '0',
          width: '350px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 99999,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#f5f5f5',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#333'
            }}>Finalizar Compra</h3>
            <button onClick={togglePaymentPopup} style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#757575',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%'
            }}>×</button>
          </div>

          <div style={{
            padding: '16px'
          }}>
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px'
            }}>
              <p style={{
                margin: '4px 0',
                fontWeight: 500
              }}>Total: R$ {getTotalPrice().toFixed(2)}</p>
              <p style={{
                margin: '4px 0',
                fontWeight: 500
              }}>Itens: {cartItems.length}</p>
            </div>

            <div>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '14px',
                color: '#757575'
              }}>Escolha o método de pagamento:</h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <button
                  onClick={() => processPayment('dinheiro')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Dinheiro
                </button>
                <button
                  onClick={() => processPayment('cartao')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cartão
                </button>
                <button
                  onClick={() => processPayment('pix')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
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

export default SalesCartButton;
