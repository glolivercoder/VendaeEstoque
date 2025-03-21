import { useState } from 'react';
import { formatDateToBrazilian, formatDateToISO } from '../utils/dateUtils';

const SalesManagement = ({ 
  currentSale, 
  setCurrentSale, 
  selectedItems, 
  setSelectedItems,
  showPaymentPopup,
  setShowPaymentPopup,
  salesData,
  setSalesData,
  selectedClient,
  selectedVendor,
  items,
  setItems
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + parseFloat(item.price) * item.saleQuantity;
    }, 0);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCompleteSale = () => {
    if (!paymentMethod) {
      alert('Por favor, selecione um mu00e9todo de pagamento.');
      return;
    }

    // Create sale record
    const saleDate = new Date();
    const saleRecord = {
      id: Date.now(),
      date: saleDate.toISOString(),
      formattedDate: formatDateToBrazilian(saleDate.toISOString().split('T')[0]),
      client: selectedClient ? {
        id: selectedClient.id,
        name: selectedClient.name,
        document: selectedClient.cpf
      } : null,
      vendor: selectedVendor ? {
        id: selectedVendor.id,
        name: selectedVendor.name,
        document: selectedVendor.document
      } : null,
      items: selectedItems.map(item => ({
        id: item.id,
        description: item.description,
        price: parseFloat(item.price),
        quantity: item.saleQuantity,
        total: parseFloat(item.price) * item.saleQuantity
      })),
      total: calculateTotal(),
      paymentMethod: paymentMethod
    };

    // Update sales data
    const updatedSalesData = [...salesData, saleRecord];
    setSalesData(updatedSalesData);
    localStorage.setItem('salesData', JSON.stringify(updatedSalesData));

    // Update inventory
    const updatedItems = items.map(item => {
      const soldItem = selectedItems.find(selected => selected.id === item.id);
      if (soldItem) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity - soldItem.saleQuantity),
          sold: (item.sold || 0) + soldItem.saleQuantity
        };
      }
      return item;
    });
    setItems(updatedItems);

    // Reset sale state
    setSelectedItems([]);
    setCurrentSale({
      client: { name: '', rg: '', cpf: '', fatherName: '', motherName: '', birthDate: '', issueDate: '', birthPlace: '', whatsapp: '', email: '', address: '' },
      items: [],
      total: 0,
      paymentMethod: ''
    });
    setShowPaymentPopup(false);
    setPaymentMethod('');

    alert('Venda concluu00edda com sucesso!');
  };

  const handleCancelSale = () => {
    setShowPaymentPopup(false);
    setPaymentMethod('');
  };

  const handleQuantityChange = (id, quantity) => {
    const updatedItems = selectedItems.map(item => {
      if (item.id === id) {
        return { ...item, saleQuantity: parseInt(quantity) || 1 };
      }
      return item;
    });
    setSelectedItems(updatedItems);
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  if (!showPaymentPopup) return null;

  return (
    <div className="payment-popup">
      <div className="payment-content">
        <h2>Finalizar Venda</h2>
        
        {selectedClient && (
          <div className="sale-client-info">
            <h3>Cliente</h3>
            <p><strong>Nome:</strong> {selectedClient.name}</p>
            <p><strong>CPF:</strong> {selectedClient.cpf}</p>
          </div>
        )}
        
        <div className="sale-items">
          <h3>Itens da Venda</h3>
          <table className="sale-items-table">
            <thead>
              <tr>
                <th>Descriu00e7u00e3o</th>
                <th>Preu00e7o</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Au00e7u00f5es</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.description}</td>
                  <td>R$ {parseFloat(item.price).toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={item.saleQuantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </td>
                  <td>R$ {(parseFloat(item.price) * item.saleQuantity).toFixed(2)}</td>
                  <td>
                    <button 
                      className="btn-remove-item"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3"><strong>Total:</strong></td>
                <td colSpan="2"><strong>R$ {calculateTotal().toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="payment-method">
          <h3>Mu00e9todo de Pagamento</h3>
          <div className="payment-options">
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="dinheiro"
                checked={paymentMethod === 'dinheiro'}
                onChange={handlePaymentMethodChange}
              />
              Dinheiro
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cartu00e3o"
                checked={paymentMethod === 'cartu00e3o'}
                onChange={handlePaymentMethodChange}
              />
              Cartu00e3o
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="pix"
                checked={paymentMethod === 'pix'}
                onChange={handlePaymentMethodChange}
              />
              PIX
            </label>
          </div>
        </div>
        
        <div className="payment-actions">
          <button 
            className="btn-cancel"
            onClick={handleCancelSale}
          >
            Cancelar
          </button>
          <button 
            className="btn-complete"
            onClick={handleCompleteSale}
            disabled={selectedItems.length === 0 || !paymentMethod}
          >
            Concluir Venda
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesManagement;
