import { useState } from 'react';
import { deleteProduct } from '../services/database';

const ProductList = ({ 
  items, 
  setItems, 
  selectedCategory,
  setEditingItem,
  setShowEditPopup,
  showDescription,
  setShowDescription
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteItem = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteProduct(id);
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error('Erro ao excluir item:', error);
        alert(`Erro ao excluir item: ${error.message}`);
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditPopup(true);
  };

  const toggleDescription = (id) => {
    if (showDescription === id) {
      setShowDescription(null);
    } else {
      setShowDescription(id);
    }
  };

  // Filtrar itens por categoria e pesquisa
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemDescription && item.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventário de Produtos</h2>
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredItems.length === 0 ? (
        <p className="no-items">Nenhum item encontrado.</p>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              {item.image && (
                <div className="item-image">
                  <img src={item.image} alt={item.description} />
                </div>
              )}
              <div className="item-info">
                <h3>{item.description}</h3>
                <p className="item-price">R$ {parseFloat(item.price).toFixed(2)}</p>
                <p className="item-quantity">
                  Estoque: <span className={item.quantity <= 0 ? 'out-of-stock' : ''}>
                    {item.quantity}
                  </span>
                </p>
                {item.category && item.category !== 'Todos' && (
                  <p className="item-category">Categoria: {item.category}</p>
                )}
                {item.itemDescription && (
                  <div className="item-description-container">
                    <button 
                      className="btn-toggle-description"
                      onClick={() => toggleDescription(item.id)}
                    >
                      {showDescription === item.id ? 'Ocultar Descrição' : 'Ver Descrição'}
                    </button>
                    {showDescription === item.id && (
                      <div className="item-description">
                        <p>{item.itemDescription}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="item-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => handleEditItem(item)}
                >
                  Editar
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
