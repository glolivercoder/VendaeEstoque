import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import ProductForm from '../components/inventory/ProductForm';
import CategorySelector from '../components/inventory/CategorySelector';
import AddCategoryModal from '../components/inventory/AddCategoryModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Inventory = () => {
  const { 
    items, 
    filteredItems, 
    selectedCategory, 
    categories, 
    setCategories,
    filterItemsByCategory,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    minStockAlert,
    setMinStockAlert,
    ignoreStock,
    setIgnoreStock
  } = useAppContext();
  
  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [displayItems, setDisplayItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState({});
  
  // Filtrar e ordenar os produtos quando os dados mudarem
  useEffect(() => {
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
  }, [filteredItems, searchTerm, sortOption]);
  
  // Manipuladores de eventos
  const handleCategorySelect = (category) => {
    filterItemsByCategory(category);
  };
  
  const handleAddNewItem = async (productData) => {
    try {
      await handleAddItem(productData);
      setShowAddForm(false);
    } catch (error) {
      alert(`Erro ao adicionar produto: ${error.message}`);
    }
  };
  
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddForm(true);
  };
  
  const handleUpdateItemSubmit = async (updatedItem) => {
    try {
      await handleUpdateItem(updatedItem);
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      alert(`Erro ao atualizar produto: ${error.message}`);
    }
  };
  
  const confirmDelete = (itemId) => {
    setSelectedProductId(itemId);
    setShowDeleteConfirm(true);
  };
  
  const executeDelete = async () => {
    if (!selectedProductId) return;
    
    try {
      await handleDeleteItem(selectedProductId);
      setShowDeleteConfirm(false);
      setSelectedProductId(null);
    } catch (error) {
      alert(`Erro ao excluir produto: ${error.message}`);
    }
  };
  
  const handleAddCategory = (newCategory) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setShowAddCategory(false);
    }
  };
  
  const toggleMinStockAlert = (itemId, value) => {
    setMinStockAlert(prev => ({
      ...prev,
      [itemId]: value
    }));
  };
  
  const toggleIgnoreStock = (itemId) => {
    setIgnoreStock(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  const toggleDetails = (itemId) => {
    setExpandedDetails(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Função para verificar se um produto está com estoque baixo
  const isLowStock = (item) => {
    if (!item) return false;
    const minStock = minStockAlert[item.id] || 5; // Valor padrão: 5
    return item.quantity <= minStock;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Estoque
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Gerencie seus produtos e controle o estoque
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            className="btn-primary"
            onClick={() => {
              setEditingItem(null);
              setShowAddForm(true);
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Produto
          </button>
        </div>
      </div>
      
      {/* Filtros e barra de pesquisa */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow dark:shadow-dark-md">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          {/* Barra de pesquisa */}
          <div className="flex-grow">
            <label htmlFor="search" className="sr-only">Buscar produtos</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                >
                  <path 
                    fillRule="evenodd" 
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                type="text"
                placeholder="Buscar por nome, descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          {/* Seleção de ordenação */}
          <div className="flex-shrink-0 w-full md:w-48">
            <label htmlFor="sort" className="sr-only">Ordenar por</label>
            <select
              id="sort"
              name="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="form-input"
            >
              <option value="default">Ordenar por</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name-asc">Nome (A-Z)</option>
              <option value="name-desc">Nome (Z-A)</option>
              <option value="stock-asc">Menor estoque</option>
              <option value="stock-desc">Maior estoque</option>
            </select>
          </div>
        </div>
        
        {/* Categorias */}
        <div className="mt-4 border-t border-light-border dark:border-dark-border pt-4 overflow-x-auto pb-1">
          <div className="flex space-x-2 items-center">
            <CategorySelector 
              categories={categories} 
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
            
            <button
              onClick={() => setShowAddCategory(true)}
              className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
              title="Adicionar categoria"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de produtos */}
      <div className="space-y-4">
        {displayItems.length > 0 ? (
          displayItems.map(item => (
            <div 
              key={item.id} 
              className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md overflow-hidden"
            >
              <div className="p-4">
                <div className="flex flex-col md:flex-row">
                  {/* Imagem do produto */}
                  <div className="w-full md:w-24 h-24 flex items-center justify-center bg-gray-100 dark:bg-dark-background rounded overflow-hidden mb-4 md:mb-0 md:mr-4">
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
                  
                  {/* Detalhes do produto */}
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
                            {item.description}
                          </h3>
                          
                          {/* Badge da categoria */}
                          {item.category && item.category !== 'Todos' && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                              {item.category}
                            </span>
                          )}
                        </div>
                        
                        {/* Status de estoque */}
                        <div className="mt-2 flex items-center flex-wrap gap-2">
                          {item.quantity <= 0 ? (
                            <span className="badge badge-danger">Sem estoque</span>
                          ) : isLowStock(item) ? (
                            <span className="badge badge-warning">Estoque baixo: {item.quantity} unid.</span>
                          ) : (
                            <span className="badge badge-success">Em estoque: {item.quantity} unid.</span>
                          )}
                          
                          {ignoreStock[item.id] && (
                            <span className="badge badge-secondary">Ignorar estoque</span>
                          )}
                          
                          {item.sold > 0 && (
                            <span className="badge badge-primary">Vendidos: {item.sold} unid.</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Preço e controles */}
                      <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                        <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                          {formatCurrency(item.price)}
                        </p>
                        
                        <div className="flex justify-end mt-2 space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => toggleDetails(item.id)}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                            title="Detalhes"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => confirmDelete(item.id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Excluir"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Detalhes expandidos */}
                {expandedDetails[item.id] && (
                  <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Descrição do produto */}
                      <div>
                        <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                          Descrição
                        </h4>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                          {item.itemDescription || 'Sem descrição disponível'}
                        </p>
                      </div>
                      
                      {/* Configurações de estoque */}
                      <div>
                        <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                          Configurações de Estoque
                        </h4>
                        
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center">
                            <label htmlFor={`min-stock-${item.id}`} className="mr-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                              Alerta de estoque mínimo:
                            </label>
                            <input
                              id={`min-stock-${item.id}`}
                              type="number"
                              min="0"
                              value={minStockAlert[item.id] || 5}
                              onChange={(e) => toggleMinStockAlert(item.id, parseInt(e.target.value) || 0)}
                              className="form-input py-1 px-2 w-16 text-sm"
                            />
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              id={`ignore-stock-${item.id}`}
                              type="checkbox"
                              checked={ignoreStock[item.id] || false}
                              onChange={() => toggleIgnoreStock(item.id)}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <label htmlFor={`ignore-stock-${item.id}`} className="ml-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                              Ignorar validação de estoque ao vender
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Links relacionados */}
                    {item.links && item.links.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                          Links Relacionados
                        </h4>
                        <ul className="space-y-1">
                          {item.links.map((link, idx) => (
                            <li key={idx}>
                              <a 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-words"
                              >
                                {link}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border border-dashed border-light-border dark:border-dark-border rounded-lg">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Nenhum produto encontrado. Tente ajustar os filtros ou adicione novos produtos.
            </p>
            <button 
              className="mt-4 btn-primary"
              onClick={() => {
                setEditingItem(null);
                setShowAddForm(true);
              }}
            >
              Adicionar Produto
            </button>
          </div>
        )}
      </div>
      
      {/* Formulário de produto (modal) */}
      {showAddForm && (
        <ProductForm
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
          onSubmit={editingItem ? handleUpdateItemSubmit : handleAddNewItem}
          categories={categories}
          initialData={editingItem || {}}
          isEditing={!!editingItem}
        />
      )}
      
      {/* Modal para adicionar categoria */}
      {showAddCategory && (
        <AddCategoryModal
          isOpen={showAddCategory}
          onClose={() => setShowAddCategory(false)}
          onAddCategory={handleAddCategory}
          existingCategories={categories}
        />
      )}
      
      {/* Diálogo de confirmação para exclusão */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          onConfirm={executeDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          confirmButtonClass="btn-danger"
        />
      )}
    </div>
  );
};

export default Inventory;