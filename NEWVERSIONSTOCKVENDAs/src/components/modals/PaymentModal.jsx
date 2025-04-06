import React, { useState } from 'react';
import { formatCurrency } from '../../utils/format';
import { useAppContext } from '../../context/AppContext';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onProcess, 
  totalAmount, 
  itemCount 
}) => {
  const { selectedClient } = useAppContext();
  const [showPixQR, setShowPixQR] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState('');
  
  const handleReceivedAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setReceivedAmount(value);
    
    const numValue = parseFloat(value) || 0;
    setChangeAmount(numValue > totalAmount ? numValue - totalAmount : 0);
  };
  
  const handlePayment = (method) => {
    if (method === 'pix') {
      setShowPixQR(true);
      return;
    }
    
    onProcess(method);
  };
  
  const handlePixConfirm = () => {
    setShowPixQR(false);
    onProcess('pix');
  };
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg">
        <div className="modal-header">
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {showPixQR ? 'Pagamento via PIX' : 'Processar Pagamento'}
          </h2>
          <button onClick={onClose} className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          {showPixQR ? (
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg mx-auto w-48 h-48 flex items-center justify-center mb-4">
                {/* Placeholder para o QR Code */}
                <div className="text-gray-500 text-5xl">QR</div>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                Escaneie o QR Code acima com o aplicativo do seu banco para pagar via PIX.
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  className="btn-outline"
                  onClick={() => setShowPixQR(false)}
                >
                  Voltar
                </button>
                <button 
                  className="btn-primary"
                  onClick={handlePixConfirm}
                >
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Resumo da Venda
                </h3>
                <div className="bg-light-background dark:bg-dark-background p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Itens:
                    </span>
                    <span className="text-light-text-primary dark:text-dark-text-primary">
                      {itemCount}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      Cliente:
                    </span>
                    <span className="text-light-text-primary dark:text-dark-text-primary">
                      {selectedClient?.name || 'Cliente não especificado'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-light-border dark:border-dark-border">
                    <span className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      Total:
                    </span>
                    <span className="font-bold text-light-text-primary dark:text-dark-text-primary">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Valor recebido e troco (para dinheiro) */}
              <div className="mb-6">
                <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Valor Recebido (opcional)
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-grow">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Valor recebido em dinheiro"
                      value={receivedAmount}
                      onChange={handleReceivedAmountChange}
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Troco:
                    </div>
                    <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                      {formatCurrency(changeAmount)}
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3">
                Selecione a forma de pagamento
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                  className="p-4 border border-light-border dark:border-dark-border rounded-lg text-center hover:bg-light-background dark:hover:bg-dark-background transition-colors flex flex-col items-center"
                  onClick={() => handlePayment('dinheiro')}
                >
                  <span className="text-2xl mb-2">💵</span>
                  <span className="font-medium text-light-text-primary dark:text-dark-text-primary">Dinheiro</span>
                </button>
                
                <button 
                  className="p-4 border border-light-border dark:border-dark-border rounded-lg text-center hover:bg-light-background dark:hover:bg-dark-background transition-colors flex flex-col items-center"
                  onClick={() => handlePayment('cartao')}
                >
                  <span className="text-2xl mb-2">💳</span>
                  <span className="font-medium text-light-text-primary dark:text-dark-text-primary">Cartão</span>
                </button>
                
                <button 
                  className="p-4 border border-light-border dark:border-dark-border rounded-lg text-center hover:bg-light-background dark:hover:bg-dark-background transition-colors flex flex-col items-center"
                  onClick={() => handlePayment('pix')}
                >
                  <span className="text-2xl mb-2">📱</span>
                  <span className="font-medium text-light-text-primary dark:text-dark-text-primary">Pix</span>
                </button>
              </div>
            </>
          )}
        </div>
        
        {!showPixQR && (
          <div className="modal-footer">
            <button 
              className="btn-outline"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;