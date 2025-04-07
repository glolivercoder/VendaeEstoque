import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatDocument, formatPhone } from '../utils/format';

const Clients = () => {
  const { 
    clients, 
    handleAddClient,
    handleUpdateClient,
    handleDeleteClient
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    rg: '',
    phone: '',
    email: '',
    address: ''
  });

  // Filter clients when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => 
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cpf?.includes(searchTerm) ||
        client.phone?.includes(searchTerm)
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  // Initialize filtered clients
  useEffect(() => {
    setFilteredClients(clients);
  }, [clients]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Apply masks for specific fields
    if (name === 'cpf') {
      formattedValue = formatDocument(value);
    } else if (name === 'phone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData({
      ...formData,
      [name]: formattedValue
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing && selectedClient) {
      handleUpdateClient({
        ...formData,
        id: selectedClient.id
      });
    } else {
      handleAddClient(formData);
    }
    
    resetForm();
  };

  // Reset form and editing state
  const resetForm = () => {
    setFormData({
      name: '',
      cpf: '',
      rg: '',
      phone: '',
      email: '',
      address: ''
    });
    setIsEditing(false);
    setSelectedClient(null);
  };

  // Edit client
  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || '',
      cpf: client.cpf || '',
      rg: client.rg || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || ''
    });
    setIsEditing(true);
  };

  // Delete client
  const handleDelete = (client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (clientToDelete) {
      handleDeleteClient(clientToDelete.id);
      setShowDeleteConfirm(false);
      setClientToDelete(null);
    }
  };

  return (
    <div className="clients-page">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Client Form */}
        <div className="md:w-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? 'Editar Cliente' : 'Adicionar Cliente'}
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
                  required
                />
              </div>
              
              {/* CPF */}
              <div>
                <label className="block text-sm font-medium mb-1">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* RG */}
              <div>
                <label className="block text-sm font-medium mb-1">RG</label>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                />
              </div>
              
              {/* Endereço */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Endereço</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                  rows="3"
                ></textarea>
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
        
        {/* Clients List */}
        <div className="md:w-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Clientes</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar clientes..."
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
          
          {filteredClients.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              Nenhum cliente encontrado
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{client.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {client.cpf && (
                      <p>CPF: {client.cpf}</p>
                    )}
                    {client.phone && (
                      <p>Telefone: {client.phone}</p>
                    )}
                    {client.email && (
                      <p>Email: {client.email}</p>
                    )}
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
              Tem certeza que deseja excluir o cliente "{clientToDelete?.name}"? Esta ação não pode ser desfeita.
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

export default Clients;
