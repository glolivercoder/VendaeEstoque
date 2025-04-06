import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/format';

// Componente de venda rápida para máxima praticidade
const QuickSale = ({ onComplete }) => {
  const { items, addSale, clients } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [clientName, setClientName] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductsList, setShowProductsList] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const searchInputRef = useRef(null);
  
  // Efeito para focar no campo de busca ao iniciar
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Filtrar produtos baseado na busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts([]);
      return;
    }
    
    const search = searchTerm.toLowerCase();
    const filtered = items
      .filter(item => 
        item.name.toLowerCase().includes(search) || 
        (item.code && item.code.toLowerCase().includes(search))
      )
      .filter(item => item.quantity > 0) // Mostrar apenas produtos em estoque
      .slice(0, 6); // Limitar a 6 resultados para não sobrecarregar a interface
    
    setFilteredProducts(filtered);
    setShowProductsList(filtered.length > 0);
  }, [searchTerm, items]);
  
  // Calcular o total da venda
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  
  // Calcular o troco
  const calculateChange = () => {
    if (!amountPaid) return 0;
    const paid = parseFloat(amountPaid.replace(',', '.'));
    return paid > totalAmount ? paid - totalAmount : 0;
  };
  
  // Adicionar produto à venda
  const addItemToSale = (product) => {
    const existingItem = selectedItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setSelectedItems(
        selectedItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems, 
        { ...product, quantity: 1 }
      ]);
    }
    
    setSearchTerm('');
    setFilteredProducts([]);
    setShowProductsList(false);
    
    // Focar novamente no campo de busca para adicionar mais produtos rapidamente
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Remover produto da venda
  const removeItemFromSale = (productId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== productId));
  };
  
  // Atualizar quantidade de um produto na venda
  const updateItemQuantity = (productId, newQuantity) => {
    // Não permitir quantidade menor que 1
    if (newQuantity < 1) return;
    
    // Verificar se a nova quantidade está disponível em estoque
    const product = items.find(item => item.id === productId);
    if (product && newQuantity > product.quantity) {
      alert(`Apenas ${product.quantity} unidades disponíveis em estoque!`);
      return;
    }
    
    setSelectedItems(
      selectedItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  // Finalizar a venda
  const completeSale = () => {
    if (selectedItems.length === 0) {
      alert('Adicione pelo menos um produto à venda!');
      return;
    }
    
    const sale = {
      items: selectedItems.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      })),
      total: totalAmount,
      paymentMethod,
      clientName: clientName.trim() || 'Cliente não identificado',
      amountPaid: amountPaid ? parseFloat(amountPaid.replace(',', '.')) : totalAmount,
      change: calculateChange()
    };
    
    addSale(sale);
    
    // Limpar formulário
    setSelectedItems([]);
    setPaymentMethod('dinheiro');
    setClientName('');
    setAmountPaid('');
    
    if (onComplete) {
      onComplete(sale);
    }
  };
  
  // Manipular teclas especiais para agilizar a venda
  const handleKeyDown = (e) => {
    // F2 para concluir a venda
    if (e.key === 'F2') {
      e.preventDefault();
      completeSale();
    }
    
    // Esc para limpar a venda
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedItems([]);
      setSearchTerm('');
    }
  };

  return (
    <div 
      className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-dark-sm p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Busca rápida de produtos */}
      <div className="relative mb-4">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar produto pelo nome ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        
        {/* Lista de resultados da busca */}
        {showProductsList && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="px-4 py-2 hover:bg-light-background dark:hover:bg-dark-border cursor-pointer flex justify-between items-center"
                onClick={() => addItemToSale(product)}
              >
                <div>
                  <div className="font-medium text-light-text-primary dark:text-dark-text-primary">
                    {product.name}
                  </div>
                  <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {product.code && `Cód: ${product.code}`} • Estoque: {product.quantity}
                  </div>
                </div>
                <div className="text-primary font-medium">
                  {formatCurrency(product.price)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Produtos selecionados */}
      <div className="mb-4 max-h-60 overflow-auto">
        <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
          <thead className="bg-light-background dark:bg-dark-border">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Produto
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Preço
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Qtd
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Subtotal
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {selectedItems.length > 0 ? (
              selectedItems.map(item => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary">
                    {item.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-right text-light-text-primary dark:text-dark-text-primary">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="text-light-text-secondary dark:text-dark-text-secondary hover:text-danger"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="mx-2 min-w-[30px] text-light-text-primary dark:text-dark-text-primary">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-medium text-light-text-primary dark:text-dark-text-primary">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                  <td className="px-3 py-2 text-sm text-right">
                    <button
                      onClick={() => removeItemFromSale(item.id)}
                      className="text-danger hover:text-red-800 dark:hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-3 py-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
                  Adicione produtos à venda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Informações do cliente e pagamento - simples e rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <input
            type="text"
            placeholder="Nome do cliente (opcional)"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">PIX</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>
      </div>
      
      {/* Resumo e finalização da venda */}
      <div className="border-t border-light-border dark:border-dark-border pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            Total
          </span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        
        {/* Input de valor pago, visível apenas para pagamento em dinheiro */}
        {paymentMethod === 'dinheiro' && (
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Valor pago
              </label>
              <input
                type="text"
                placeholder="0,00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Troco
              </label>
              <div className="w-full px-3 py-2 bg-light-background dark:bg-dark-border rounded-md font-medium text-light-text-primary dark:text-dark-text-primary">
                {formatCurrency(calculateChange())}
              </div>
            </div>
          </div>
        )}
        
        {/* Botões de ação */}
        <div className="flex justify-between">
          <button
            onClick={() => setSelectedItems([])}
            className="px-4 py-2 border border-light-border dark:border-dark-border rounded-md hover:bg-light-background dark:hover:bg-dark-border"
          >
            Cancelar
          </button>
          <button
            onClick={completeSale}
            disabled={selectedItems.length === 0}
            className={`px-6 py-2 rounded-md text-white ${
              selectedItems.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            Finalizar Venda (F2)
          </button>
        </div>
      </div>
      
      {/* Atalhos de teclado */}
      <div className="mt-4 text-xs text-light-text-secondary dark:text-dark-text-secondary text-center">
        Atalhos: F2 = Finalizar venda | ESC = Limpar venda
      </div>
    </div>
  );
};

export default QuickSale;