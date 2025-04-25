import { useState } from 'react';
import { addClient, deleteClient, updateClient } from '../services/database';

const ClientManagement = ({ 
  clients, 
  setClients, 
  filteredClients, 
  setFilteredClients,
  showAddClient,
  setShowAddClient,
  newClient,
  setNewClient,
  showClients
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClientId, setEditingClientId] = useState(null);
  const [editClient, setEditClient] = useState(null);

  const handleClientInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const handleEditClientInputChange = (e) => {
    const { name, value } = e.target;
    setEditClient({ ...editClient, [name]: value });
  };

  const handleAddClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const clientId = await addClient(newClient);
      const clientWithId = { ...newClient, id: clientId, showDetails: false };
      setClients([...clients, clientWithId]);
      setFilteredClients([...filteredClients, clientWithId]);
      setNewClient({
        name: '',
        rg: '',
        cpf: '',
        fatherName: '',
        motherName: '',
        birthDate: '',
        issueDate: '',
        birthPlace: '',
        whatsapp: '',
        email: '',
        cep: '',
        address: '',
        neighborhood: '',
        city: '',
        state: ''
      });
      setShowAddClient(false);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      alert(`Erro ao adicionar cliente: ${error.message}`);
    }
  };

  const handleClientSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!query) {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        client =>
          client.name.toLowerCase().includes(query) ||
          (client.cpf && client.cpf.includes(query)) ||
          (client.rg && client.rg.includes(query))
      );
      setFilteredClients(filtered);
    }
  };

  const toggleClientDetails = (clientId) => {
    setFilteredClients(
      filteredClients.map(client => {
        if (client.id === clientId) {
          return { ...client, showDetails: !client.showDetails };
        }
        return client;
      })
    );
  };

  const startEditClient = (client) => {
    setEditingClientId(client.id);
    setEditClient({ ...client });
  };

  const cancelEditClient = () => {
    setEditingClientId(null);
    setEditClient(null);
  };

  const saveEditClient = async () => {
    try {
      await updateClient(editClient);
      
      // Update both clients and filteredClients arrays
      const updatedClients = clients.map(client => 
        client.id === editClient.id ? { ...editClient, showDetails: client.showDetails } : client
      );
      
      setClients(updatedClients);
      setFilteredClients(updatedClients.filter(client => 
        client.name.toLowerCase().includes(searchQuery) ||
        (client.cpf && client.cpf.includes(searchQuery)) ||
        (client.rg && client.rg.includes(searchQuery))
      ));
      
      setEditingClientId(null);
      setEditClient(null);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert(`Erro ao atualizar cliente: ${error.message}`);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await deleteClient(clientId);
        const updatedClients = clients.filter(client => client.id !== clientId);
        setClients(updatedClients);
        setFilteredClients(updatedClients.filter(client => 
          client.name.toLowerCase().includes(searchQuery) ||
          (client.cpf && client.cpf.includes(searchQuery)) ||
          (client.rg && client.rg.includes(searchQuery))
        ));
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert(`Erro ao excluir cliente: ${error.message}`);
      }
    }
  };

  if (!showClients) return null;

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h2>Gerenciar Clientes</h2>
        <div className="clients-actions">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchQuery}
            onChange={handleClientSearch}
            className="client-search"
          />
          <button
            className="btn-add-client"
            onClick={() => setShowAddClient(true)}
          >
            Adicionar Cliente
          </button>
        </div>
      </div>

      {showAddClient && (
        <div className="add-client-form">
          <h3>Novo Cliente</h3>
          <form onSubmit={handleAddClientSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  name="name"
                  value={newClient.name}
                  onChange={handleClientInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>CPF:</label>
                <input
                  type="text"
                  name="cpf"
                  value={newClient.cpf}
                  onChange={handleClientInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>RG:</label>
                <input
                  type="text"
                  name="rg"
                  value={newClient.rg}
                  onChange={handleClientInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nome do Pai:</label>
                <input
                  type="text"
                  name="fatherName"
                  value={newClient.fatherName}
                  onChange={handleClientInputChange}
                />
              </div>
              <div className="form-group">
                <label>Nome da Mãe:</label>
                <input
                  type="text"
                  name="motherName"
                  value={newClient.motherName}
                  onChange={handleClientInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Data de Nascimento:</label>
                <input
                  type="date"
                  name="birthDate"
                  value={newClient.birthDate}
                  onChange={handleClientInputChange}
                />
              </div>
              <div className="form-group">
                <label>Data de Emissão:</label>
                <input
                  type="date"
                  name="issueDate"
                  value={newClient.issueDate}
                  onChange={handleClientInputChange}
                />
              </div>
              <div className="form-group">
                <label>Local de Nascimento:</label>
                <input
                  type="text"
                  name="birthPlace"
                  value={newClient.birthPlace}
                  onChange={handleClientInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>WhatsApp:</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={newClient.whatsapp}
                  onChange={handleClientInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={newClient.email}
                  onChange={handleClientInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CEP:</label>
                <input
                  type="text"
                  name="cep"
                  value={newClient.cep}
                  onChange={handleClientInputChange}
                />
              </div>
              <div className="form-group">
                <label>Endereço:</label>
                <input
                  type="text"
                  name="address"
                  value={newClient.address}
                  onChange={handleClientInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bairro:</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={newClient.neighborhood}
                  onChange={handleClientInputChange}
                />
              </div>
              <div className="form-group">
                <label>Cidade:</label>
                <input
                  type="text"
                  name="city"
                  value={newClient.city}
                  onChange={handleClientInputChange}
                />
              </div>
              <div className="form-group">
                <label>Estado:</label>
                <input
                  type="text"
                  name="state"
                  value={newClient.state}
                  onChange={handleClientInputChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowAddClient(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="clients-list">
        {filteredClients.length === 0 ? (
          <p className="no-clients">Nenhum cliente encontrado.</p>
        ) : (
          filteredClients.map((client) => (
            <div key={client.id} className="client-card">
              {editingClientId === client.id ? (
                <div className="edit-client-form">
                  <h3>Editar Cliente</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nome:</label>
                      <input
                        type="text"
                        name="name"
                        value={editClient.name}
                        onChange={handleEditClientInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CPF:</label>
                      <input
                        type="text"
                        name="cpf"
                        value={editClient.cpf}
                        onChange={handleEditClientInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>RG:</label>
                      <input
                        type="text"
                        name="rg"
                        value={editClient.rg}
                        onChange={handleEditClientInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>WhatsApp:</label>
                      <input
                        type="text"
                        name="whatsapp"
                        value={editClient.whatsapp}
                        onChange={handleEditClientInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={editClient.email}
                        onChange={handleEditClientInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Endereço:</label>
                      <input
                        type="text"
                        name="address"
                        value={editClient.address}
                        onChange={handleEditClientInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={cancelEditClient}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn-save"
                      onClick={saveEditClient}
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="client-header">
                    <h3>{client.name}</h3>
                    <div className="client-actions">
                      <button
                        className="btn-edit"
                        onClick={() => startEditClient(client)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        Excluir
                      </button>
                      <button
                        className="btn-details"
                        onClick={() => toggleClientDetails(client.id)}
                      >
                        {client.showDetails ? "Ocultar" : "Detalhes"}
                      </button>
                    </div>
                  </div>
                  <div className="client-info">
                    <p><strong>CPF:</strong> {client.cpf}</p>
                    <p><strong>RG:</strong> {client.rg}</p>
                    {client.whatsapp && <p><strong>WhatsApp:</strong> {client.whatsapp}</p>}
                  </div>
                  {client.showDetails && (
                    <div className="client-details">
                      {client.fatherName && <p><strong>Nome do Pai:</strong> {client.fatherName}</p>}
                      {client.motherName && <p><strong>Nome da Mãe:</strong> {client.motherName}</p>}
                      {client.birthDate && <p><strong>Data de Nascimento:</strong> {client.birthDate}</p>}
                      {client.issueDate && <p><strong>Data de Emissão:</strong> {client.issueDate}</p>}
                      {client.birthPlace && <p><strong>Local de Nascimento:</strong> {client.birthPlace}</p>}
                      {client.email && <p><strong>Email:</strong> {client.email}</p>}
                      {client.address && <p><strong>Endereço:</strong> {client.address}</p>}
                      {client.neighborhood && <p><strong>Bairro:</strong> {client.neighborhood}</p>}
                      {client.city && <p><strong>Cidade:</strong> {client.city}</p>}
                      {client.state && <p><strong>Estado:</strong> {client.state}</p>}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientManagement;
