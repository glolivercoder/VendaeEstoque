import React from 'react';
import { formatCurrency } from '../../utils/format';
import { useAppContext } from '../../context/AppContext';

const SalesList = ({ 
  items, 
  selectedItems, 
  toggleItemSelection, 
  updateItemQuantity,
  originalItems
}) => {
  const { ignoreStock, minStockAlert } = useAppContext();

  // Verificar se um item está em baixo estoque
  const isLowStock = (item) => {
    if (!item) return false;
    const minStock = minStockAlert[item.id] || 5; // Valor padrão: 5
    return item.quantity <= minStock;
  };

  // Verificar se um item está selecionado
  const isSelected = (itemIndex) => {
    return selectedItems.includes(itemIndex);
  };

  // Obter o índice original de um item
  const getOriginalIndex = (item) => {
    return originalItems.findIndex(originalItem => originalItem.id === item.id);
  };

  // Renderizar cada item na lista
  const renderItem = (item) => {
    const originalIndex = getOriginalIndex(item);
    const selected = isSelected(originalIndex);
    const lowStock = isLowStock(item);
    const noStock = item.quantity <= 0 && !ignoreStock[item.id];

    return (
      <div 
        key={item.id} 
        className={`border rounded-lg p-4 transition-all duration-200
                   ${selected ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-light-border dark:border-dark-border'}
                   ${noStock ? 'opacity-60' : ''}
                   hover:shadow-md dark:hover:shadow-dark-md`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Checkbox e imagem */}
          <div className="flex items-start mb-4 md:mb-0 md:mr-4">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => !noStock && toggleItemSelection(originalIndex)}
              disabled={noStock}
              className="h-5 w-5 mr-3 text-primary focus:ring-primary mt-1"
            />
            
            <div className="w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-dark-background rounded overflow-hidden">
              {item.image ? (
                <img 
                  src={item.image} 
                  alt={item.description} 
                  className="object-contain h-full w-full" 
                />
              ) : (
                <div className="text-4xl text-gray-400 dark:text-dark-text-disabled">
                  📦
                </div>
              )}
            </div>
          </div>
          
          {/* Detalhes do produto */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
                  {item.description}
                </h3>
                
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  {item.category !== 'Todos' ? item.category : 'Categoria não especificada'}
                </p>
                
                {/* Status de estoque */}
                <div className="mt-2">
                  {noStock ? (
                    <span className="badge badge-danger">Sem estoque</span>
                  ) : lowStock ? (
                    <span className="badge badge-warning">Estoque baixo: {item.quantity} unid.</span>
                  ) : (
                    <span className="badge badge-success">Em estoque: {item.quantity} unid.</span>
                  )}
                  
                  {ignoreStock[item.id] && (
                    <span className="badge badge-secondary ml-2">Ignorar estoque</span>
                  )}
                </div>
                
                {/* Descrição do item (se houver) */}
                {item.itemDescription && (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2 line-clamp-2">
                    {item.itemDescription}
                  </p>
                )}
              </div>
              
              {/* Preço e controles */}
              <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                  {formatCurrency(item.price)}
                </p>
                
                {/* Controle de quantidade (apenas se estiver selecionado) */}
                {selected && (
                  <div className="flex items-center justify-end mt-2">
                    <label className="block text-sm mr-2 text-light-text-secondary dark:text-dark-text-secondary">
                      Qtd:
                    </label>
                    <div className="flex border border-light-border dark:border-dark-border rounded">
                      <button
                        className="px-2 py-1 text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border"
                        onClick={() => {
                          const currentQty = originalItems[originalIndex]?.soldQuantity || 1;
                          if (currentQty > 1) {
                            updateItemQuantity(originalIndex, currentQty - 1);
                          }
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={ignoreStock[item.id] ? 999 : item.quantity}
                        value={originalItems[originalIndex]?.soldQuantity || 1}
                        onChange={(e) => updateItemQuantity(originalIndex, e.target.value)}
                        className="w-12 text-center border-x border-light-border dark:border-dark-border"
                      />
                      <button
                        className="px-2 py-1 text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border"
                        onClick={() => {
                          const currentQty = originalItems[originalIndex]?.soldQuantity || 1;
                          updateItemQuantity(originalIndex, currentQty + 1);
                        }}
                        disabled={!ignoreStock[item.id] && (originalItems[originalIndex]?.soldQuantity || 1) >= item.quantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        items.map(item => renderItem(item))
      ) : (
        <div className="text-center py-8 border border-dashed border-light-border dark:border-dark-border rounded-lg">
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Nenhum produto encontrado. Tente ajustar os filtros ou adicione novos produtos.
          </p>
        </div>
      )}
    </div>
  );
};

export default SalesList;