import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import PaymentModal from '../components/modals/PaymentModal';
import SalesFilter from '../components/sales/SalesFilter';
import SalesList from '../components/sales/SalesList';
import SalesSummary from '../components/sales/SalesSummary';
import { formatCurrency } from '../utils/format';

const Sales = () => {
  const { 
    items, 
    filteredItems, 
    selectedItems, 
    setSelectedItems, 
    salesSummary,
    handleMultipleSales
  } = useAppContext();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [displayItems, setDisplayItems] = useState([]);
  const [totalSelected, setTotalSelected] = useState(0);
  
  // Atualizar itens exibidos quando filteredItems mudar
  useEffect(() => {
    applyFilters();
  }, [filteredItems, searchTerm, sortOption]);
  
  // Calcular total selecionado quando selectedItems mudar
  useEffect(() => {
    calculateTotalSelected();
  }, [selectedItems, items]);
  
  // Aplicar filtros e ordenação
  const applyFilters = () => {
    let filtered = [...filteredItems];
    
    // Aplicar pesquisa
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(search) ||
        (item.itemDescription && item.itemDescription.toLowerCase().includes(search))
      );
    }
    
    // Aplicar ordenação
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.description.localeCompare(b.description));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.description.localeCompare(a.description));
        break;
      case 'stock-asc':
        filtered.sort((a, b) => a.quantity - b.quantity);
        break;
      case 'stock-desc':
        filtered.sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        // Manter a ordem padrão
        break;
    }
    
    setDisplayItems(filtered);
  };
  
  // Calcular o total dos itens selecionados
  const calculateTotalSelected = () => {
    let total = 0;
    
    selectedItems.forEach(index => {
      const item = items[index];
      if (item) {
        total += (item.price * (item.soldQuantity || 1));
      }
    });
    
    setTotalSelected(total);
  };
  
  // Alternar seleção de item
  const toggleItemSelection = (index) => {
    if (selectedItems.includes(index)) {
      setSelectedItems(selectedItems.filter(i => i !== index));
    } else {
      setSelectedItems([...selectedItems, index]);
    }
  };
  
  // Atualizar quantidade de item
  const updateItemQuantity = (index, quantity) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      soldQuantity: parseInt(quantity) || 1
    };
    
    // Força o recálculo do total
    calculateTotalSelected();
  };
  
  // Processar venda
  const processSale = async (paymentMethod) => {
    try {
      await handleMultipleSales(paymentMethod);
      setShowPaymentModal(false);
      
      // Mostrar mensagem de sucesso
      alert(`Venda processada com sucesso via ${paymentMethod}!`);
    } catch (error) {
      alert(error.message || 'Erro ao processar venda');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Vendas
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Selecione os produtos e processe vendas
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            className="btn-primary"
            onClick={() => setShowPaymentModal(true)}
            disabled={selectedItems.length === 0}
          >
            Vender Selecionados ({selectedItems.length})
          </button>
        </div>
      </div>
      
      {/* Resumo do dia */}
      <SalesSummary salesSummary={salesSummary} />
      
      {/* Filtros e barra de pesquisa */}
      <SalesFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortOption={sortOption}
        setSortOption={setSortOption}
      />
      
      {/* Lista de produtos */}
      <SalesList 
        items={displayItems}
        selectedItems={selectedItems}
        toggleItemSelection={toggleItemSelection}
        updateItemQuantity={updateItemQuantity}
        originalItems={items}
      />
      
      {/* Barra de ações fixa na parte inferior para dispositivos móveis */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface p-4 border-t border-light-border dark:border-dark-border shadow-lg flex justify-between items-center z-10 md:hidden">
          <div>
            <p className="font-medium">Total: {formatCurrency(totalSelected)}</p>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {selectedItems.length} itens selecionados
            </p>
          </div>
          
          <button 
            className="btn-primary"
            onClick={() => setShowPaymentModal(true)}
          >
            Vender
          </button>
        </div>
      )}
      
      {/* Modal de pagamento */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProcess={processSale}
        totalAmount={totalSelected}
        itemCount={selectedItems.length}
      />
    </div>
  );
};

export default Sales;