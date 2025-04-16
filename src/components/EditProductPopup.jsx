import { useState, useEffect } from 'react';
import { updateProduct } from '../services/database';
import '../styles/ImageStyles.css';

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
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (editingItem) {
      setEditedItem({ ...editingItem });
      setPreviewImage(editingItem.image);

      // Inicializar o array de imagens
      const initialImages = [];
      if (editingItem.image) {
        initialImages.push(editingItem.image);
      }
      if (editingItem.additionalImages && Array.isArray(editingItem.additionalImages)) {
        initialImages.push(...editingItem.additionalImages);
      }
      setImages(initialImages);
      setCurrentImageIndex(0);
    }
  }, [editingItem]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;
        setPreviewImage(newImage);

        // Atualizar o array de imagens
        const updatedImages = [...images];
        if (currentImageIndex === 0) {
          // Se for a imagem principal, atualiza também o campo image do item
          setEditedItem({
            ...editedItem,
            image: newImage,
            additionalImages: updatedImages.slice(1) // Mantém as imagens adicionais
          });
          updatedImages[0] = newImage;
        } else {
          // Se for uma imagem adicional
          updatedImages[currentImageIndex] = newImage;

          // Atualiza o campo additionalImages do item
          const additionalImages = updatedImages.slice(1);
          setEditedItem({
            ...editedItem,
            additionalImages: additionalImages
          });
        }

        setImages(updatedImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;

        // Adicionar a nova imagem ao array
        const updatedImages = [...images, newImage];
        setImages(updatedImages);

        // Atualizar o item com as novas imagens adicionais
        const additionalImages = updatedImages.slice(1);
        setEditedItem({
          ...editedItem,
          additionalImages: additionalImages
        });

        // Selecionar a nova imagem
        setCurrentImageIndex(updatedImages.length - 1);
        setPreviewImage(newImage);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index) => {
    if (images.length <= 1) return; // Manter pelo menos uma imagem

    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);

    // Atualizar o item
    if (index === 0) {
      // Se removeu a imagem principal, a primeira imagem adicional se torna a principal
      setEditedItem({
        ...editedItem,
        image: updatedImages[0],
        additionalImages: updatedImages.slice(1)
      });
    } else {
      // Se removeu uma imagem adicional
      setEditedItem({
        ...editedItem,
        additionalImages: updatedImages.slice(1)
      });
    }

    // Ajustar o índice atual
    if (currentImageIndex >= updatedImages.length) {
      setCurrentImageIndex(updatedImages.length - 1);
    }

    // Atualizar a imagem de preview
    if (updatedImages.length > 0) {
      const newIndex = Math.min(currentImageIndex, updatedImages.length - 1);
      setPreviewImage(updatedImages[newIndex]);
      setCurrentImageIndex(newIndex);
    } else {
      setPreviewImage(null);
      setCurrentImageIndex(0);
    }
  };

  const handleSelectImage = (index) => {
    setCurrentImageIndex(index);
    setPreviewImage(images[index]);
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
          <label>Imagens do Produto:</label>
          <div className="image-upload-section">
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}

            <div className="image-actions">
              <label className="image-upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                  <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                </svg>
                Substituir Imagem
                <input type="file" onChange={handleImageChange} accept="image/*" className="hidden-file-input" />
              </label>

              <label className="image-upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                </svg>
                Adicionar Imagem
                <input type="file" onChange={handleAddImage} accept="image/*" className="hidden-file-input" />
              </label>

              {images.length > 1 && (
                <button
                  type="button"
                  className="image-upload-button"
                  onClick={() => handleRemoveImage(currentImageIndex)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  Remover Imagem
                </button>
              )}
            </div>

            {/* Miniaturas das imagens */}
            {images.length > 1 && (
              <div className="product-images-grid">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Imagem ${index + 1}`}
                    className={`product-image-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => handleSelectImage(index)}
                  />
                ))}
              </div>
            )}
          </div>
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
          <label>SKU:</label>
          <input
            type="text"
            name="sku"
            value={editedItem.sku || ''}
            onChange={handleInputChange}
            placeholder="Código do produto (opcional)"
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
