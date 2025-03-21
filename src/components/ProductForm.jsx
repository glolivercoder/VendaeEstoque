import { useState } from 'react';

const ProductForm = ({ 
  newItem, 
  setNewItem, 
  categories, 
  handleAddItem, 
  setShowAddItem, 
  showNewCategoryInput, 
  setShowNewCategoryInput,
  newCategory,
  setNewCategory,
  handleAddCategory
}) => {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setNewItem({ ...newItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  return (
    <div className="add-item-popup">
      <div className="add-item-content">
        <h2>Adicionar Novo Item</h2>
        <div className="form-group">
          <label>Imagem:</label>
          <input type="file" onChange={handleImageChange} accept="image/*" />
          {(previewImage || newItem.image) && (
            <div className="image-preview">
              <img src={previewImage || newItem.image} alt="Preview" />
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Descriu00e7u00e3o:</label>
          <input
            type="text"
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            placeholder="Nome do produto"
          />
        </div>
        <div className="form-group">
          <label>Preu00e7o:</label>
          <input
            type="number"
            name="price"
            value={newItem.price}
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
            value={newItem.quantity}
            onChange={handleInputChange}
            placeholder="Quantidade em estoque"
          />
        </div>
        <div className="form-group">
          <label>Categoria:</label>
          <select
            name="category"
            value={newItem.category}
            onChange={handleInputChange}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
            <option value="nova">+ Nova Categoria</option>
          </select>
          {newItem.category === "nova" && !showNewCategoryInput && (
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
            value={newItem.itemDescription}
            onChange={handleInputChange}
            placeholder="Descriu00e7u00e3o detalhada do produto"
            rows="4"
          ></textarea>
        </div>
        <div className="form-actions">
          <button className="btn-cancel" onClick={() => setShowAddItem(false)}>
            Cancelar
          </button>
          <button className="btn-add" onClick={handleAddItem}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
