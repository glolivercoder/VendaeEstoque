import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/format';

// Componentes do Inventory
import ProductModal from '../components/modals/ProductModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SearchInput from '../components/common/SearchInput';
import Badge from '../components/common/Badge';
import PaginationControls from '../components/common/PaginationControls';

const Inventory = () => {
  const { 
    items, 
    addItem, 
    updateItem, 
    removeItem,
    minStockAlert,
    setItemMinStock,
    addNotification
  } = useAppContext();

  // Estados para controle de interface
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortOption, setSortOption] = useState('name-asc');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedItems, setPaginatedItems] = useState([]);

  // Obter categorias únicas do estoque para o filtro
  const categories = ['all', ...new Set(items.map(item => item.category || 'sem categoria'))];

  // Efeito para filtrar itens com base na busca e filtro de categoria
  useEffect(() => {
    let result = [...items];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(search) || 
        item.code?.toLowerCase().includes(search) || 
        item.description?.toLowerCase().includes(search)
      );
    }
    
    // Aplicar filtro de categoria
    if (categoryFilter !== 'all') {
      result = result.filter(item => 
        (item.category || 'sem categoria') === categoryFilter
      );
    }
    
    // Aplicar ordenação
    switch (sortOption) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'stock-asc':
        result.sort((a, b) => a.quantity - b.quantity);
        break;
      case 'stock-desc':
        result.sort((a, b) => b.quantity - a.quantity);
        break;
      default:
        break;
    }
    
    setFilteredItems(result);
  }, [items, searchTerm, categoryFilter, sortOption]);
  
  // Efeito para paginar os itens filtrados
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedItems(filteredItems.slice(startIndex, endIndex));
  }, [filteredItems, currentPage, itemsPerPage]);

  // Quando muda o número de itens filtrados, reseta a página atual
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredItems.length]);

  // Funções para manipulação de produtos
  const handleAddItem = (newItem) => {
    const item = addItem(newItem);
    addNotification({
      title: 'Produto Adicionado',
      message: `O produto "${item.name}" foi adicionado ao estoque.`,
      type: 'success',
      severity: 'success'
    });
    setShowAddModal(false);
  };
  
  const handleUpdateItem = (updatedItem) => {
    updateItem(selectedItem.id, updatedItem);
    addNotification({
      title: 'Produto Atualizado',
      message: `As informações do produto "${updatedItem.name}" foram atualizadas.`,
      type: 'success',
      severity: 'success'
    });
    setShowEditModal(false);
    setSelectedItem(null);
  };
  
  const confirmDeleteItem = () => {
    if (selectedItem) {
      removeItem(selectedItem.id);
      addNotification({
        title: 'Produto Removido',
        message: `O produto "${selectedItem.name}" foi removido do estoque.`,
        type: 'info',
        severity: 'info'
      });
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
  };
  
  const openEditModal = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };
  
  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Função para verificar se um item está com estoque baixo
  const isLowStock = (item) => {
    const minStock = minStockAlert[item.id] || 5; // Valor padrão: 5
    return item.quantity <= minStock;
  };
  
  // Função para verificar se um item está sem estoque
  const isOutOfStock = (item) => {
    return item.quantity === 0;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Gerenciamento de Estoque
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Gerencie seus produtos, preços e estoque
          </p>
        </div>
        
        {/* Botão de adicionar produto */}
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center shadow-sm"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Produto
          </button>
        </div>
      </div>
      
      {/* Barra de filtros e pesquisa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="col-span-1 md:col-span-2">
          <SearchInput
            placeholder="Buscar produtos por nome, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>
        
        {/* Filtro de categoria */}
        <div className="col-span-1">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="all">Todas as categorias</option>
            {categories.filter(cat => cat !== 'all').map((category, index) => (
              <option key={index} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Ordenação */}
        <div className="col-span-1">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="price-asc">Preço (menor-maior)</option>
            <option value="price-desc">Preço (maior-menor)</option>
            <option value="stock-asc">Estoque (menor-maior)</option>
            <option value="stock-desc">Estoque (maior-menor)</option>
          </select>
        </div>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de produtos */}
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm dark:shadow-dark-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/10 mr-4">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total de Produtos</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{items.length}</p>
            </div>
          </div>
        </div>
        
        {/* Valor total em estoque */}
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm dark:shadow-dark-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
              <svg className="h-6 w-6 text-green-700 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Valor em Estoque</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {formatCurrency(items.reduce((total, item) => total + (item.price * item.quantity), 0))}
              </p>
            </div>
          </div>
        </div>
        
        {/* Produtos com estoque baixo */}
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm dark:shadow-dark-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-4">
              <svg className="h-6 w-6 text-yellow-700 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Estoque Baixo</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {items.filter(item => isLowStock(item) && !isOutOfStock(item)).length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Produtos sem estoque */}
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm dark:shadow-dark-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
              <svg className="h-6 w-6 text-red-700 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Sem Estoque</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {items.filter(item => isOutOfStock(item)).length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabela de produtos */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-dark-sm overflow-hidden">
        {filteredItems.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
                <thead className="bg-light-background dark:bg-dark-border">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Produto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Categoria
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Preço
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Estoque
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-light-border dark:divide-dark-border">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-light-background dark:hover:bg-dark-border transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.imageUrl ? (
                            <img className="h-10 w-10 rounded-md mr-3 object-cover" src={item.imageUrl} alt={item.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3">
                              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                              {item.name}
                            </div>
                            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                              {item.code || 'Sem código'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1">
                          {item.category || 'Sem categoria'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-light-text-primary dark:text-dark-text-primary">
                          {formatCurrency(item.price)}
                        </div>
                        {item.costPrice && (
                          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                            Custo: {formatCurrency(item.costPrice)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isOutOfStock(item) ? (
                          <Badge color="red" text="Sem estoque" />
                        ) : isLowStock(item) ? (
                          <Badge color="yellow" text={`Baixo: ${item.quantity}`} />
                        ) : (
                          <Badge color="green" text={`${item.quantity} unid.`} />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-primary hover:text-primary-dark dark:hover:text-primary-light mr-3"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="text-danger hover:text-red-800 dark:hover:text-red-400"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginação */}
            <div className="bg-white dark:bg-dark-surface px-4 py-3 flex items-center justify-between border-t border-light-border dark:border-dark-border sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-light-border dark:border-dark-border text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'text-light-text-disabled dark:text-dark-text-disabled bg-light-background dark:bg-dark-background'
                      : 'text-light-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-surface hover:bg-light-background dark:hover:bg-dark-border'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredItems.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-light-border dark:border-dark-border text-sm font-medium rounded-md ${
                    currentPage === Math.ceil(filteredItems.length / itemsPerPage)
                      ? 'text-light-text-disabled dark:text-dark-text-disabled bg-light-background dark:bg-dark-background'
                      : 'text-light-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-surface hover:bg-light-background dark:hover:bg-dark-border'
                  }`}
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Mostrando <span className="font-medium">{paginatedItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> a <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> de <span className="font-medium">{filteredItems.length}</span> resultados
                  </p>
                </div>
                <div>
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-light-text-primary dark:text-dark-text-primary">Nenhum produto encontrado</h3>
            <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {searchTerm || categoryFilter !== 'all'
                ? 'Nenhum produto corresponde aos filtros aplicados.'
                : 'Comece adicionando produtos ao seu estoque.'}
            </p>
            {(searchTerm || categoryFilter !== 'all') && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal de adicionar produto */}
      {showAddModal && (
        <ProductModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddItem}
          title="Adicionar Produto"
        />
      )}
      
      {/* Modal de editar produto */}
      {showEditModal && selectedItem && (
        <ProductModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={handleUpdateItem}
          title="Editar Produto"
          product={selectedItem}
        />
      )}
      
      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && selectedItem && (
        <ConfirmDialog
          isOpen={showDeleteModal}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o produto "${selectedItem.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={confirmDeleteItem}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          confirmButtonClass="bg-danger hover:bg-red-800"
        />
      )}
    </div>
  );
};

export default Inventory;