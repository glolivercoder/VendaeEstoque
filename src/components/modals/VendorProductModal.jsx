import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const VendorProductModal = ({
  isOpen,
  onClose,
  vendor,
  onSave
}) => {
  // Definir categorias localmente
  const [categories, setCategories] = useState(['Ferramentas', 'Instrumentos Musicais', 'Informática', 'Gadgets', 'Todos', 'Diversos']);

  // Estado do formulário
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    quantity: '',
    image: '',
    additionalImages: [],
    itemDescription: '',
    category: 'Todos',
    expirationDate: '',
    checked: false,
    links: [],
    vendorId: vendor?.id || null
  });

  // Estados auxiliares
  const [previewImage, setPreviewImage] = useState(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showLinks, setShowLinks] = useState(false);
  const [newLink, setNewLink] = useState('');

  // Inicializar o formulário com o ID do fornecedor
  useEffect(() => {
    if (vendor) {
      setFormData(prev => ({
        ...prev,
        vendorId: vendor.id || vendor.cnpj || null // Usar CNPJ como fallback se não houver ID
      }));
    }
  }, [vendor]);

  // Manipuladores de eventos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setFormData(prev => ({
        ...prev,
        category: newCategory.trim()
      }));
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleAddLink = (e) => {
    if (e.key === 'Enter' && newLink.trim()) {
      // Garantir que o link tenha o protocolo
      let fullUrl = newLink.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }

      setFormData(prev => ({
        ...prev,
        links: [...prev.links, fullUrl]
      }));
      setNewLink('');
    }
  };

  const handleRemoveLink = (index) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    // Validar campos obrigatórios
    if (!formData.description || !formData.price) {
      alert('Por favor, preencha os campos obrigatórios: Nome do Item e Preço');
      return;
    }

    // Chamar a função de salvar
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 0
    });

    // Fechar o modal
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adicionar Produto para ${vendor?.name || 'Fornecedor'}`}
      size="3xl"
    >
      <div className="space-y-6">
        {/* Informações do Fornecedor */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="text-lg font-medium mb-2">Informações do Fornecedor</h4>
          <p><span className="font-medium">Nome:</span> {vendor?.name}</p>
          {vendor?.description && (
            <p><span className="font-medium">Descrição:</span> {vendor.description}</p>
          )}
          {vendor?.cnpj && (
            <p><span className="font-medium">CNPJ:</span> {vendor.cnpj}</p>
          )}
        </div>

        {/* Formulário de Produto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Imagem Principal */}
          <div>
            <label className="block text-sm font-medium mb-1">Imagem Principal</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
              {formData.image ? (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="max-h-40 mx-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: '' }));
                      setPreviewImage(null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    title="Remover imagem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500">Clique para adicionar uma imagem</p>
                </>
              )}
              <label className="cursor-pointer absolute inset-0 w-full h-full flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {!formData.image && <span className="sr-only">Selecionar imagem</span>}
              </label>
            </div>
          </div>

          {/* Imagens Adicionais */}
          <div>
            <label className="block text-sm font-medium mb-1">Imagens Adicionais</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-2">
                {formData.additionalImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Imagem ${index + 1}`}
                      className="h-20 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      title="Remover imagem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="relative">
                  <label className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center h-20 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdditionalImageChange}
                      className="hidden"
                    />
                    <span className="sr-only">Adicionar imagem</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Nome do Item */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Nome do Item *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nome do produto"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          {/* Descrição do Item */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Descrição do Item</label>
            <textarea
              name="itemDescription"
              value={formData.itemDescription}
              onChange={handleInputChange}
              placeholder="Descrição detalhada do produto (até 300 caracteres)"
              maxLength={300}
              rows={4}
              className="w-full px-3 py-2 border rounded-md resize-none"
            />
            <span className="text-xs text-gray-500">
              {formData.itemDescription.length}/300 caracteres
            </span>
          </div>

          {/* Preço */}
          <div>
            <label className="block text-sm font-medium mb-1">Preço de Venda *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Preço"
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          {/* Estoque */}
          <div>
            <label className="block text-sm font-medium mb-1">Estoque Inicial</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="Quantidade"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <div className="flex gap-2">
              {showNewCategoryInput ? (
                <>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Nova categoria"
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory('');
                      setShowNewCategoryInput(false);
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border rounded-md"
                  >
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(true)}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="Adicionar nova categoria"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Data de Validade */}
          <div>
            <label className="block text-sm font-medium mb-1">Data de Validade</label>
            <div className="flex gap-2">
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, checked: !prev.checked }))}
                className={`px-4 py-2 rounded-md ${
                  formData.checked ? 'bg-green-500' : 'bg-gray-200'
                } text-white`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowLinks(!showLinks)}
            className="flex items-center text-blue-500 hover:text-blue-600"
          >
            <span className="mr-2">Gerenciar URLs</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform ${showLinks ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showLinks && (
            <div className="mt-2 border p-3 rounded-md">
              <h4 className="font-medium mb-2">URLs Cadastradas</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                {formData.links && formData.links.length > 0 ? (
                  formData.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex-grow text-sm truncate">
                        {link}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma URL cadastrada</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Adicionar URL</label>
                <input
                  type="url"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={handleAddLink}
                  placeholder="Digite a URL e pressione Enter"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pressione Enter para adicionar a URL
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Adicionar Produto
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VendorProductModal;
