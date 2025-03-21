import { useState, useEffect } from 'react';
import { updateProduct } from '../services/database';

const EditProductPopup = ({ 
  editingItem, 
  setEditingItem, 
  setShowEditPopup, 
  items, 
  setItems,
  categories
}) => {
  const [editedItem, setEditedItem] = useState({ ...editingItem });
  const [previewImage, setPreviewImage] = useState(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (editingItem) {
      setEditedItem({ ...editingItem });
      setPreviewImage(editingItem.image);
    }
  }, [editingItem]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setEditedItem({ ...editedItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem({ ...editedItem, [name]: value });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === '') return;
    
    // Add the new category to the categories array
    const updatedCategories = [...categories, newCategory];
    
    // Update the item's category to the new one
    setEditedItem({ ...editedItem, category: newCategory });
    
    // Reset the new category input
    setNewCategory('');
    setShowNewCategoryInput(false);
  };

  const handleSaveEdit = async () => {
    try {
      await updateProduct(editedItem);
      
      // Update the items array with the edited item
      const updatedItems = items.map(item => {
        if (item.id === editedItem.id) {
          return editedItem;
        }
        return item;
      });
      
      setItems(updatedItems);
      setShowEditPopup(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      alert(`Erro ao atualizar item: ${error.message}`);
    }
  };

  if (!editingItem) return null;

  return (
    <div className="edit-popup">
      <div className="edit-content">
        <h2>Editar Item</h2>
        <div className="form-group">
          <label>Imagem:</label>
          <input type="file" onChange={handleImageChange} accept="image/*" />
          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Preview" />
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Descriu00e7u00e3o:</label>
          <input
            type="text"
            name="description"
            value={editedItem.description}
            onChange={handleInputChange}
            placeholder="Nome do produto"
          />
        </div>
        <div className="form-group">
          <label>Preu00e7o:</label>
          <input
            type="number"
            name="price"
            value={editedItem.price}
            onChange={handleInputChange}
            placeholder="Preu00e7o do produto"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Quantidade:</label>
          <input
            type="number"
            name="quantity"
            value={editedItem.quantity}
            onChange={handleInputChange}
            placeholder="Quantidade em estoque"
          />
        </div>
        <div className="form-group">
          <label>Categoria:</label>
          <select
            name="category"
            value={editedItem.category}
            onChange={handleInputChange}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
            <option value="nova">+ Nova Categoria</option>
          </select>
          {editedItem.category === "nova" && !showNewCategoryInput && (
            <button
              className="btn-add-category"
              onClick={() => setShowNewCategoryInput(true)}
            >
              Adicionar Nova Categoria
            </button>
          )}
          {showNewCategoryInput && (
            <div className="new-category-input">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nome da nova categoria"
              />
              <button onClick={handleAddCategory}>Adicionar</button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Descriu00e7u00e3o Detalhada:</label>
          <textarea
            name="itemDescription"
            value={editedItem.itemDescription || ''}
            onChange={handleInputChange}
            placeholder="Descriu00e7u00e3o detalhada do produto"
            rows="4"
          ></textarea>
        </div>
        <div className="form-actions">
          <button 
            className="btn-cancel" 
            onClick={() => {
              setShowEditPopup(false);
              setEditingItem(null);
            }}
          >
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSaveEdit}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductPopup;
