import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatPhoneNumber, formatCNPJ } from '../utils/format';

const Vendors = () => {
  const { 
    vendors, 
    handleAddVendor,
    handleUpdateVendor,
    handleDeleteVendor
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cnpj: '',
    url: '',
    email: '',
    whatsapp: '',
    telegram: '',
    instagram: '',
    products: []
  });

  // Filter vendors when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter(vendor => 
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.cnpj?.includes(searchTerm)
      );
      setFilteredVendors(filtered);
    }
  }, [searchTerm, vendors]);

  // Initialize filtered vendors
  useEffect(() => {
    setFilteredVendors(vendors);
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
      handleUpdateVendor(selectedVendor.id, formData);
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
      instagram: '',
      products: []
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
      instagram: vendor.instagram || '',
      products: vendor.products || []
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

  // Open external links
  const openExternalLink = (type, value) => {
    if (!value) return;
    
    let url;
    switch (type) {
      case 'whatsapp':
        url = `whatsapp://send?phone=${value.replace(/\D/g, '')}`;
        break;
      case 'telegram':
        url = `tg://resolve?domain=${value.replace(/\D/g, '')}`;
        break;
      case 'instagram':
        url = `instagram://user?username=${value}`;
        break;
      case 'email':
        url = `mailto:${value}`;
        break;
      case 'url':
        url = value.startsWith('http') ? value : `https://${value}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
  };

  return (
    <div className="vendors-page">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Vendor Form */}
        <div className="md:w-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Descrição */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                  rows="3"
                ></textarea>
              </div>
              
              {/* CNPJ */}
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* URL */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">URL</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                  />
                  {formData.url && (
                    <button 
                      type="button"
                      onClick={() => openExternalLink('url', formData.url)}
                      className="absolute right-2 top-8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Email */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="flex items-center">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                  />
                  {formData.email && (
                    <button 
                      type="button"
                      onClick={() => openExternalLink('email', formData.email)}
                      className="absolute right-2 top-8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* WhatsApp */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="(XX) XXXXX-XXXX"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                  />
                  {formData.whatsapp && (
                    <button 
                      type="button"
                      onClick={() => openExternalLink('whatsapp', formData.whatsapp)}
                      className="absolute right-2 top-8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Telegram */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Telegram</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    placeholder="(XX) XXXXX-XXXX"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                  />
                  {formData.telegram && (
                    <button 
                      type="button"
                      onClick={() => openExternalLink('telegram', formData.telegram)}
                      className="absolute right-2 top-8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Instagram */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Instagram</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                  />
                  {formData.instagram && (
                    <button 
                      type="button"
                      onClick={() => openExternalLink('instagram', formData.instagram)}
                      className="absolute right-2 top-8"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded"
              >
                {isEditing ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Vendors List */}
        <div className="md:w-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Fornecedores</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pl-8 border rounded w-full"
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
            <p className="text-center py-4 text-gray-500">
              Nenhum fornecedor encontrado
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{vendor.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(vendor)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {vendor.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {vendor.description}
                    </p>
                  )}
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {vendor.cnpj && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        CNPJ: {vendor.cnpj}
                      </span>
                    )}
                    
                    <div className="flex space-x-2 mt-2">
                      {vendor.whatsapp && (
                        <button
                          onClick={() => openExternalLink('whatsapp', vendor.whatsapp)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      )}
                      
                      {vendor.telegram && (
                        <button
                          onClick={() => openExternalLink('telegram', vendor.telegram)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      )}
                      
                      {vendor.instagram && (
                        <button
                          onClick={() => openExternalLink('instagram', vendor.instagram)}
                          className="text-pink-500 hover:text-pink-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      
                      {vendor.email && (
                        <button
                          onClick={() => openExternalLink('email', vendor.email)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                      
                      {vendor.url && (
                        <button
                          onClick={() => openExternalLink('url', vendor.url)}
                          className="text-blue-500 hover:text-blue-700"
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir o fornecedor "{vendorToDelete?.name}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
