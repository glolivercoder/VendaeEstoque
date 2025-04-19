import { useState, useEffect } from 'react';
import { trackPackage, saveTrackingHistory, loadTrackingHistory, removeTrackingHistoryItem } from '../lib/trackingApi';
import { useToast } from '../components/ui/toast';
import { searchClients, getClients, getClientById } from '../services/database';

// Ícones
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.29 7 12 12 20.71 7"></polyline>
    <line x1="12" y1="22" x2="12" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6"></path>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
    <path d="M3 22v-6h6"></path>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrackingPanel = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' ou 'tracking'
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [clientDetailsLoading, setClientDetailsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar histórico de rastreamento e clientes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carregar histórico de rastreamento
        const history = loadTrackingHistory();
        setTrackingHistory(history);

        // Carregar clientes
        const clientsData = await getClients();
        setClients(clientsData);
        setFilteredClients(clientsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados. Tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Função para buscar clientes e códigos de rastreamento
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredClients(clients);
      return;
    }

    try {
      // Buscar clientes pelo nome ou documento
      const searchResults = await searchClients(query);

      // Filtrar histórico de rastreamento pelo código
      const filteredHistory = trackingHistory.filter(item =>
        item.code.toLowerCase().includes(query.toLowerCase())
      );

      // Se estiver na aba de clientes, mostrar resultados de clientes
      if (activeTab === 'clients') {
        setFilteredClients(searchResults);
      }
      // Se estiver na aba de rastreamento e encontrou códigos, mostrar resultados
      else if (filteredHistory.length > 0) {
        setTrackingHistory(filteredHistory);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: 'Erro na busca',
        description: 'Não foi possível realizar a busca. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Função para rastrear encomenda
  const handleTrackPackage = async () => {
    if (!trackingCode) {
      toast({
        title: 'Código de rastreamento não informado',
        description: 'Por favor, informe o código de rastreamento.',
        variant: 'destructive',
      });
      return;
    }

    setIsTracking(true);
    setTrackingResult(null);

    try {
      const result = await trackPackage(trackingCode);
      setTrackingResult(result);

      // Salvar no histórico
      saveTrackingHistory(result);

      // Atualizar histórico local
      setTrackingHistory(loadTrackingHistory());

      toast({
        title: 'Rastreamento realizado com sucesso',
        description: `Encomenda ${result.code} rastreada com sucesso.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Erro ao rastrear encomenda',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsTracking(false);
    }
  };

  // Função para carregar rastreamento do histórico
  const handleLoadTracking = async (code) => {
    setTrackingCode(code);
    await handleTrackPackage();
  };

  // Função para remover item do histórico
  const handleRemoveFromHistory = (code) => {
    removeTrackingHistoryItem(code);
    setTrackingHistory(loadTrackingHistory());

    toast({
      title: 'Item removido',
      description: `Código ${code} removido do histórico.`,
      variant: 'success',
    });
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para abrir WhatsApp
  const openWhatsApp = (phone) => {
    if (!phone) return;
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  // Função para enviar email
  const sendEmail = (email) => {
    if (!email) return;
    window.open(`mailto:${email}`, '_blank');
  };

  // Função para abrir link
  const openLink = (url) => {
    if (!url) return;
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(formattedUrl, '_blank');
  };

  // Função para ver detalhes do cliente
  const viewClientDetails = async (clientId) => {
    try {
      setClientDetailsLoading(true);
      const client = await getClientById(clientId);
      setSelectedClient(client);
      setShowClientDetails(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      toast({
        title: 'Erro ao buscar detalhes',
        description: 'Não foi possível carregar os detalhes do cliente.',
        variant: 'destructive',
      });
    } finally {
      setClientDetailsLoading(false);
    }
  };

  // Função para fechar o pop-up de detalhes
  const closeClientDetails = () => {
    setShowClientDetails(false);
    setSelectedClient(null);
  };

  // Função para adicionar novo cliente
  const handleAddNewClient = () => {
    // Implementar adição de novo cliente
    toast({
      title: 'Novo cliente',
      description: 'Funcionalidade de adicionar novo cliente será implementada.',
    });
  };

  return (
    <div className="tracking-panel">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">Monitoramento de Clientes e Encomendas</h2>
          <p className="text-sm">Acompanhe seus clientes e rastreie encomendas em tempo real</p>
        </div>

        <div className="card-body">
          {/* Barra de busca */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">
                <SearchIcon />
              </div>
            </div>
            <button
              className="btn btn-primary add-client-btn"
              onClick={handleAddNewClient}
            >
              <PlusIcon />
              <span>Novo Cliente</span>
            </button>
          </div>

          {/* Tabela de clientes */}
          <div className="clients-table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Documento</th>
                  <th>Cidade/UF</th>
                  <th>Contato</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="loading-cell">
                      <div className="loading-indicator">Carregando...</div>
                    </td>
                  </tr>
                ) : filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td className="client-name-cell">{client.name}</td>
                      <td>{client.document || client.cpf}</td>
                      <td>
                        {client.cidade && client.estado ? (
                          <div className="location-info">
                            <LocationIcon className="location-icon" />
                            <span>{client.cidade}/{client.estado}</span>
                          </div>
                        ) : (
                          <span className="no-data">Não informado</span>
                        )}
                      </td>
                      <td>
                        <div className="contact-actions">
                          {client.whatsapp && (
                            <button
                              className="contact-btn whatsapp-btn"
                              onClick={() => openWhatsApp(client.whatsapp)}
                              title="Enviar WhatsApp"
                            >
                              <MessageIcon />
                            </button>
                          )}
                          {client.email && (
                            <button
                              className="contact-btn email-btn"
                              onClick={() => sendEmail(client.email)}
                              title="Enviar Email"
                            >
                              <EmailIcon />
                            </button>
                          )}
                          {client.website && (
                            <button
                              className="contact-btn link-btn"
                              onClick={() => openLink(client.website)}
                              title="Abrir Website"
                            >
                              <LinkIcon />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm view-details-btn"
                          onClick={() => viewClientDetails(client.id)}
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      <div className="empty-state">
                        <h3>Nenhum cliente encontrado</h3>
                        <p>Tente uma nova busca ou adicione um novo cliente.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Rastreamento de Encomendas (oculto por padrão) */}
          {activeTab === 'tracking' && (
            <div className="tracking-container">
              <div className="tracking-form">
                <div className="form-group">
                  <label htmlFor="trackingCode">Código de Rastreamento</label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="trackingCode"
                      placeholder="Digite o código de rastreamento"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      className="form-control"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleTrackPackage}
                      disabled={isTracking || !trackingCode}
                    >
                      {isTracking ? 'Rastreando...' : 'Rastrear'}
                      <SearchIcon />
                    </button>
                  </div>
                </div>
              </div>

              {trackingResult && (
                <div className="tracking-result">
                  <div className="tracking-header">
                    <div className="tracking-info">
                      <h3 className="tracking-code">{trackingResult.code}</h3>
                      <p className="tracking-carrier">{trackingResult.carrier} - {trackingResult.service}</p>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleTrackPackage()}
                      title="Atualizar rastreamento"
                    >
                      <RefreshIcon />
                    </button>
                  </div>

                  <div className="tracking-timeline">
                    {trackingResult.events.map((event, index) => (
                      <div key={index} className={`timeline-item ${index === 0 ? 'current' : ''}`}>
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="event-header">
                            <h4 className="event-status">{event.status}</h4>
                            <span className="event-date">{formatDate(event.date)}</span>
                          </div>
                          <p className="event-location">{event.location}</p>
                          <p className="event-description">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="tracking-history">
                <h3 className="section-title">Histórico de Rastreamento</h3>

                {trackingHistory.length > 0 ? (
                  <div className="history-list">
                    {trackingHistory.map((item, index) => (
                      <div key={index} className="history-item">
                        <div className="history-info">
                          <PackageIcon className="history-icon" />
                          <div className="history-details">
                            <h4 className="history-code">{item.code}</h4>
                            <p className="history-carrier">{item.carrier} - {item.service}</p>
                            <p className="history-date">Última atualização: {formatDate(item.lastUpdated)}</p>
                          </div>
                        </div>
                        <div className="history-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleLoadTracking(item.code)}
                          >
                            Rastrear
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleRemoveFromHistory(item.code)}
                            title="Remover do histórico"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <PackageIcon className="empty-icon" />
                    <h3>Nenhum rastreamento realizado</h3>
                    <p>
                      Digite um código de rastreamento para acompanhar sua encomenda.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up de Detalhes do Cliente */}
      {showClientDetails && selectedClient && (
        <div className="client-details-overlay">
          <div className="client-details-popup">
            <div className="client-details-header">
              <h3>Detalhes do Cliente</h3>
              <button
                className="close-button"
                onClick={closeClientDetails}
              >
                &times;
              </button>
            </div>

            {clientDetailsLoading ? (
              <div className="client-details-loading">
                <p>Carregando detalhes do cliente...</p>
              </div>
            ) : (
              <div className="client-details-content">
                <div className="client-details-section">
                  <h4 className="section-title">Informações Pessoais</h4>
                  <div className="client-info-grid">
                    <div className="info-item">
                      <span className="info-label">Nome:</span>
                      <span className="info-value">{selectedClient.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Documento:</span>
                      <span className="info-value">{selectedClient.document || selectedClient.cpf || 'Não informado'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">E-mail:</span>
                      <span className="info-value">
                        {selectedClient.email ? (
                          <a href={`mailto:${selectedClient.email}`} className="client-link">
                            {selectedClient.email}
                          </a>
                        ) : (
                          'Não informado'
                        )}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">WhatsApp:</span>
                      <span className="info-value">
                        {selectedClient.whatsapp ? (
                          <a href={`https://wa.me/${selectedClient.whatsapp.replace(/\D/g, '')}`} className="client-link">
                            {selectedClient.whatsapp}
                          </a>
                        ) : (
                          'Não informado'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="client-details-section">
                  <h4 className="section-title">Endereço</h4>
                  <div className="client-info-grid">
                    <div className="info-item">
                      <span className="info-label">CEP:</span>
                      <span className="info-value">{selectedClient.cep || 'Não informado'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Endereço:</span>
                      <span className="info-value">{selectedClient.endereco || 'Não informado'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Número:</span>
                      <span className="info-value">{selectedClient.numero || 'Não informado'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Bairro:</span>
                      <span className="info-value">{selectedClient.bairro || 'Não informado'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Cidade:</span>
                      <span className="info-value">{selectedClient.cidade || 'Não informado'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Estado:</span>
                      <span className="info-value">{selectedClient.estado || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                <div className="client-details-section">
                  <h4 className="section-title">Histórico de Pedidos</h4>
                  <div className="orders-list">
                    {/* Aqui seria exibido o histórico de pedidos do cliente */}
                    <p className="no-orders">Nenhum pedido encontrado para este cliente.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="client-details-footer">
              <div className="client-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    closeClientDetails();
                    // Implementar edição de cliente
                    toast({
                      title: "Editar Cliente",
                      description: "Função de edição de cliente será implementada.",
                    });
                  }}
                >
                  Editar Cliente
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    closeClientDetails();
                    // Implementar novo pedido
                    toast({
                      title: "Novo Pedido",
                      description: "Função de novo pedido será implementada.",
                    });
                  }}
                >
                  Novo Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPanel;
