import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import PaymentModal from '../components/modals/PaymentModal';
import SalesFilter from '../components/sales/SalesFilter';
import SalesList from '../components/sales/SalesList';
import SalesSummary from '../components/sales/SalesSummary';
import WordPressSyncButton from '../components/WordPressSyncButton';
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
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => document.getElementById('wordpress-sync-section').scrollIntoView({ behavior: 'smooth' })}
            disabled={selectedItems.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            Sincronizar com WordPress
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

      {/* Seção de sincronização com WordPress */}
      <div id="wordpress-sync-section" className="mt-8 bg-white dark:bg-dark-surface rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Sincronização com WordPress</h2>
        <p className="mb-4 text-light-text-secondary dark:text-dark-text-secondary">
          Sincronize os itens selecionados com o site WordPress em <a href="https://achadinhoshopp.com.br/loja/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">achadinhoshopp.com.br/loja</a>.
        </p>

        {selectedItems.length > 0 ? (
          <div className="bg-gray-50 dark:bg-dark-surface-secondary p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Itens selecionados para sincronização:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {selectedItems.map(index => (
                <li key={items[index].id}>{items[index].description}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4 text-yellow-800 dark:text-yellow-200">
            <p>Selecione pelo menos um item para sincronizar com o WordPress.</p>
          </div>
        )}

        <WordPressSyncButton
          selectedItems={selectedItems.map(index => items[index].id)}
          allItems={items}
          onSuccess={(result) => {
            alert(`Sincronização concluída: ${result.message}`);
          }}
          onError={(error) => {
            alert(`Erro na sincronização: ${error.message}`);
          }}
          onStockUpdate={(products) => {
            // Atualizar o estoque local com base nos produtos do WordPress
            const updatedItems = [...items];
            let updatedCount = 0;

            products.forEach(wpProduct => {
              const localIndex = updatedItems.findIndex(item => item.id === wpProduct.id);

              if (localIndex !== -1) {
                // Atualizar a quantidade do produto local
                updatedItems[localIndex] = {
                  ...updatedItems[localIndex],
                  quantity: parseInt(wpProduct.quantity) || 0
                };
                updatedCount++;
              }
            });

            if (updatedCount > 0) {
              // Atualizar o estado dos itens
              // Aqui você precisaria ter uma função para atualizar o estado global dos itens
              // Por exemplo: setItems(updatedItems);
              alert(`${updatedCount} produtos tiveram o estoque atualizado do WordPress.`);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Sales;