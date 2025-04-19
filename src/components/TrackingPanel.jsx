import { useState, useEffect } from 'react';
import { trackPackage, saveTrackingHistory, loadTrackingHistory, removeTrackingHistoryItem } from '../lib/trackingApi';
import { useToast } from '../components/ui/toast';

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

const TrackingPanel = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const { toast } = useToast();

  // Carregar histórico de rastreamento
  useEffect(() => {
    const history = loadTrackingHistory();
    setTrackingHistory(history);
  }, []);

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

  return (
    <div className="tracking-panel">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">Rastreamento de Encomendas</h2>
          <p className="text-sm">Acompanhe suas encomendas em tempo real</p>
        </div>

        <div className="card-body">
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
      </div>
    </div>
  );
};

export default TrackingPanel;
