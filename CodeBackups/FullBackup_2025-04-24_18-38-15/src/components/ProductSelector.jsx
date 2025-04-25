import { useState, useEffect } from 'react';
import { getProducts } from '../services/database';
import { syncProductsToWordPress } from '../services/wordpress';

const ProductSelector = ({ onClose, onSelectForPDV }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const allProducts = await getProducts();
        setProducts(allProducts);
        
        // Extract unique categories
        const uniqueCategories = ['Todos', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleSelectAll = () => {
    const newSelectedProducts = {};
    filteredProducts.forEach(product => {
      newSelectedProducts[product.id] = true;
    });
    setSelectedProducts(newSelectedProducts);
  };

  const handleDeselectAll = () => {
    const newSelectedProducts = { ...selectedProducts };
    filteredProducts.forEach(product => {
      delete newSelectedProducts[product.id];
    });
    setSelectedProducts(newSelectedProducts);
  };

  const handleExportToPDV = () => {
    const selectedProductsList = products.filter(product => selectedProducts[product.id]);
    onSelectForPDV(selectedProductsList);
    onClose();
  };

  const handleExportToWordPress = async () => {
    try {
      const selectedProductsList = products.filter(product => selectedProducts[product.id]);
      if (selectedProductsList.length === 0) {
        alert('Selecione pelo menos um produto para exportar para o WordPress');
        return;
      }
      
      await syncProductsToWordPress(selectedProductsList);
      alert(`${selectedProductsList.length} produtos exportados para o WordPress com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar para WordPress:', error);
      alert('Erro ao exportar produtos para o WordPress. Verifique o console para mais detalhes.');
    }
  };

  // Filter products based on category and search query
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
    const searchMatch = !searchQuery || 
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.itemDescription && product.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  const selectedCount = Object.values(selectedProducts).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Selecionar Produtos</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full px-3 py-2 border rounded-md"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Selecionar Todos
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Limpar Seleção
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedProducts[product.id] ? 'border-primary bg-primary bg-opacity-5' : 'hover:border-gray-300'
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={!!selectedProducts[product.id]}
                        onChange={() => {}} // Controlled component
                        className="h-5 w-5 text-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.description}
                            className="w-12 h-12 object-contain rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 truncate">{product.description}</h3>
                          <p className="text-sm text-gray-500">
                            Preço: R$ {product.price} | Estoque: {product.quantity}
                          </p>
                          <p className="text-xs text-gray-400">
                            Categoria: {product.category || "Sem categoria"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedCount} produto(s) selecionado(s)
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleExportToPDV}
              disabled={selectedCount === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar para PDV
            </button>
            <button
              onClick={handleExportToWordPress}
              disabled={selectedCount === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar para WordPress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
