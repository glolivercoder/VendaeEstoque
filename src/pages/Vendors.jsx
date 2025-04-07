import React, { useState, useEffect } from 'react';
import { formatPhoneNumber, formatCNPJ } from '../utils/format';
import VendorProductModal from '../components/modals/VendorProductModal';

const Vendors = ({
  vendors,
  handleAddVendor,
  handleUpdateVendor,
  handleDeleteVendor
}) => {
  // Definir função handleAddItem localmente
  const handleAddItem = (product) => {
    console.log('Adicionando produto:', product);

    // Aqui você pode implementar a lógica para adicionar o produto ao estoque
    // Por exemplo, você pode usar localStorage para armazenar temporariamente o produto
    try {
      // Obter produtos existentes do localStorage
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');

      // Gerar um ID único para o produto
      const newProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      // Adicionar o novo produto à lista
      existingProducts.push(newProduct);

      // Salvar a lista atualizada no localStorage
      localStorage.setItem('products', JSON.stringify(existingProducts));

      return newProduct;
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      throw error;
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  // Estado para controlar o modal de produtos do fornecedor
  const [showVendorProducts, setShowVendorProducts] = useState(false);
  const [selectedVendorForProducts, setSelectedVendorForProducts] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cnpj: '',
    url: '',
    email: '',
    whatsapp: '',
    telegram: '',
    instagram: ''
  });

  // Filter vendors when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVendors(vendors || []);
    } else {
      const filtered = (vendors || []).filter(vendor =>
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.cnpj?.includes(searchTerm) ||
        vendor.whatsapp?.includes(searchTerm) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendors(filtered);
    }
  }, [searchTerm, vendors]);

  // Initialize filtered vendors
  useEffect(() => {
    setFilteredVendors(vendors || []);
  }, [vendors]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply masks for specific fields
    if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (name === 'whatsapp' || name === 'telegram') {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing && selectedVendor) {
      handleUpdateVendor({
        ...formData,
        id: selectedVendor.id
      });
    } else {
      handleAddVendor(formData);
    }

    resetForm();
  };

  // Reset form and editing state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cnpj: '',
      url: '',
      email: '',
      whatsapp: '',
      telegram: '',
      instagram: ''
    });
    setIsEditing(false);
    setSelectedVendor(null);
  };

  // Edit vendor
  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name || '',
      description: vendor.description || '',
      cnpj: vendor.cnpj || '',
      url: vendor.url || '',
      email: vendor.email || '',
      whatsapp: vendor.whatsapp || '',
      telegram: vendor.telegram || '',
      instagram: vendor.instagram || ''
    });
    setIsEditing(true);
  };

  // Delete vendor
  const handleDelete = (vendor) => {
    setVendorToDelete(vendor);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (vendorToDelete) {
      handleDeleteVendor(vendorToDelete.id);
      setShowDeleteConfirm(false);
      setVendorToDelete(null);
    }
  };

  // Abrir modal de produtos do fornecedor
  const handleOpenVendorProducts = (vendor) => {
    setSelectedVendorForProducts(vendor);
    setShowVendorProducts(true);
  };

  // Adicionar produto para o fornecedor
  const handleAddVendorProduct = (product) => {
    // Aqui você pode implementar a lógica para adicionar o produto ao fornecedor
    console.log('Adicionando produto para o fornecedor:', product);

    try {
      // Usar a função handleAddItem definida localmente
      const newProduct = handleAddItem(product);
      console.log('Produto adicionado:', newProduct);
      alert(`Produto "${product.description}" adicionado com sucesso!`);
      return newProduct;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto. Por favor, tente novamente.');
    }
  };

  // Function to render social media icons with links
  const renderSocialIcon = (type, value) => {
    if (!value) return null;

    let href = '';
    let icon = '';
    let title = '';

    switch (type) {
      case 'whatsapp':
        href = `https://wa.me/${value.replace(/\D/g, '')}`;
        icon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/767px-WhatsApp.svg.png';
        title = 'WhatsApp';
        break;
      case 'telegram':
        href = `https://t.me/${value.replace(/\D/g, '')}`;
        icon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/512px-Telegram_logo.svg.png';
        title = 'Telegram';
        break;
      case 'instagram':
        href = `https://instagram.com/${value.replace('@', '')}`;
        icon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/768px-Instagram_logo_2016.svg.png';
        title = 'Instagram';
        break;
      case 'email':
        href = `mailto:${value}`;
        icon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/512px-Gmail_icon_%282020%29.svg.png';
        title = 'Email';
        break;
      case 'url':
        href = value.startsWith('http') ? value : `https://${value}`;
        icon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Globe_icon.svg/768px-Globe_icon.svg.png';
        title = 'Website';
        break;
      default:
        return null;
    }

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mr-2"
        title={title}
      >
        <img src={icon} alt={title} className="w-6 h-6 object-contain" />
      </a>
    );
  };

  return (
    <div className="vendors-page bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-primary text-center">
          Fornecedores
        </h2>

        {/* Unified View */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-primary border-b pb-2">
            {isEditing ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              {/* CNPJ */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* URL */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-gray-700">Website</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="www.exemplo.com.br"
                    className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  />
                  {formData.url && (
                    <button
                      type="button"
                      onClick={() => window.open(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`, '_blank')}
                      className="absolute right-2 top-8 p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                      title="Abrir URL"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                <div className="flex items-center">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contato@exemplo.com.br"
                    className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  />
                  {formData.email && (
                    <button
                      type="button"
                      onClick={() => window.open(`mailto:${formData.email}`, '_blank')}
                      className="absolute right-2 top-8 p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                      title="Enviar Email"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* WhatsApp */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-gray-700">WhatsApp</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  />
                  {formData.whatsapp && (
                    <button
                      type="button"
                      onClick={() => window.open(`https://wa.me/${formData.whatsapp.replace(/\D/g, '')}`, '_blank')}
                      className="absolute right-2 top-8 p-1 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                      title="Abrir WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Telegram */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-gray-700">Telegram</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    placeholder="@usuario ou telefone"
                    className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  />
                  {formData.telegram && (
                    <button
                      type="button"
                      onClick={() => {
                        const telegramValue = formData.telegram.startsWith('@') ?
                          formData.telegram.substring(1) :
                          formData.telegram.replace(/\D/g, '');
                        window.open(`https://t.me/${telegramValue}`, '_blank');
                      }}
                      className="absolute right-2 top-8 p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                      title="Abrir Telegram"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Instagram */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-gray-700">Instagram</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder="@usuario"
                    className="w-full p-2 border rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  />
                  {formData.instagram && (
                    <button
                      type="button"
                      onClick={() => window.open(`https://instagram.com/${formData.instagram.replace('@', '')}`, '_blank')}
                      className="absolute right-2 top-8 p-1 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
                      title="Abrir Instagram"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end mt-6 space-x-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                {isEditing ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>

        {/* Vendors List */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-xl font-semibold text-primary">Lista de Fornecedores</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pl-8 border rounded bg-white text-gray-900"
              />
              <svg
                className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {filteredVendors.length === 0 ? (
            <div className="text-center py-8 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-gray-700">
                Nenhum fornecedor encontrado
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border p-3 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">{vendor.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenVendorProducts(vendor)}
                        className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                        title="Produtos do Fornecedor"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="p-1 rounded-full hover:bg-primary/10 text-primary transition-colors"
                        title="Editar fornecedor"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(vendor)}
                        className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                        title="Excluir fornecedor"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {vendor.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {vendor.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    {vendor.cnpj && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800">
                        CNPJ: {vendor.cnpj}
                      </span>
                    )}

                    <div className="flex space-x-3 mt-2">
                      {vendor.whatsapp && (
                        <button
                          onClick={() => window.open(`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`, '_blank')}
                          className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                          title="Abrir WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      )}

                      {vendor.telegram && (
                        <button
                          onClick={() => {
                            const telegramValue = vendor.telegram.startsWith('@') ?
                              vendor.telegram.substring(1) :
                              vendor.telegram.replace(/\D/g, '');
                            window.open(`https://t.me/${telegramValue}`, '_blank');
                          }}
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                          title="Abrir Telegram"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      )}

                      {vendor.instagram && (
                        <button
                          onClick={() => window.open(`https://instagram.com/${vendor.instagram.replace('@', '')}`, '_blank')}
                          className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-600 transition-colors"
                          title="Abrir Instagram"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}

                      {vendor.email && (
                        <button
                          onClick={() => window.open(`mailto:${vendor.email}`, '_blank')}
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                          title="Enviar Email"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}

                      {vendor.url && (
                        <button
                          onClick={() => window.open(vendor.url.startsWith('http') ? vendor.url : `https://${vendor.url}`, '_blank')}
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                          title="Abrir Site"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Confirmar Exclusão</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="mr-4 p-2 rounded-full bg-red-100 text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <p className="text-gray-800">
                  Tem certeza que deseja excluir o fornecedor <span className="font-semibold">"{vendorToDelete?.name}"</span>?
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Products Modal */}
      {showVendorProducts && selectedVendorForProducts && (
        <VendorProductModal
          isOpen={showVendorProducts}
          onClose={() => {
            setShowVendorProducts(false);
            setSelectedVendorForProducts(null);
          }}
          vendor={selectedVendorForProducts}
          onSave={handleAddVendorProduct}
        />
      )}
    </div>
  );
};

export default Vendors;
