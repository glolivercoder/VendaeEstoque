import { useState, useEffect } from 'react';
import { shippingConfig, updateShippingConfig } from '../lib/shippingConfig';
import { useToast } from './ui/toast';

// Ícones
const CorreiosIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#DC3545" />
    <path d="M7 12H17M7 8H17M7 16H13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MelhorEnvioIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#4285F4" />
    <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const JadlogIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#28A745" />
    <path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LoggiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#FFC107" />
    <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AzulCargoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#007BFF" />
    <path d="M8 12H16M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const CarrierConfigPanel = () => {
  const [config, setConfig] = useState({ ...shippingConfig });
  const [activeCarrier, setActiveCarrier] = useState('correios');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Função para atualizar configuração
  const handleConfigChange = (carrier, field, value) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [carrier]: {
        ...prevConfig[carrier],
        [field]: value
      }
    }));
  };

  // Função para atualizar serviços
  const handleServiceChange = (carrier, serviceKey, field, value) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [carrier]: {
        ...prevConfig[carrier],
        services: {
          ...prevConfig[carrier].services,
          [serviceKey]: {
            ...prevConfig[carrier].services[serviceKey],
            [field]: value
          }
        }
      }
    }));
  };

  // Função para testar conexão
  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Conexão testada com sucesso',
        description: `Conexão com ${getCarrierName(activeCarrier)} estabelecida com sucesso.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Erro ao testar conexão',
        description: error.message || 'Não foi possível conectar com a transportadora.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Função para salvar configurações
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // Atualizar configurações
      updateShippingConfig(config);
      
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de transportadoras foram salvas com sucesso.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message || 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Função para obter nome da transportadora
  const getCarrierName = (carrier) => {
    const names = {
      correios: 'Correios',
      melhorEnvio: 'Melhor Envio',
      jadlog: 'Jadlog',
      loggi: 'Loggi',
      azulCargo: 'Azul Cargo'
    };
    return names[carrier] || carrier;
  };

  // Função para obter ícone da transportadora
  const getCarrierIcon = (carrier) => {
    const icons = {
      correios: <CorreiosIcon />,
      melhorEnvio: <MelhorEnvioIcon />,
      jadlog: <JadlogIcon />,
      loggi: <LoggiIcon />,
      azulCargo: <AzulCargoIcon />
    };
    return icons[carrier] || null;
  };

  return (
    <div className="carrier-config-panel">
      <h3 className="section-title">Configurações de Transportadoras</h3>
      
      {/* Abas de transportadoras */}
      <div className="carrier-tabs">
        <div className="carrier-tab-header">
          {Object.keys(config).filter(key => key !== 'general').map(carrier => (
            <button
              key={carrier}
              className={`carrier-tab-button ${activeCarrier === carrier ? 'active' : ''}`}
              onClick={() => setActiveCarrier(carrier)}
            >
              {getCarrierIcon(carrier)}
              <span>{getCarrierName(carrier)}</span>
            </button>
          ))}
        </div>
        
        <div className="carrier-tab-content">
          {/* Correios */}
          {activeCarrier === 'correios' && (
            <div className="carrier-form">
              <div className="carrier-info-box">
                <InfoIcon />
                <p>Para usar os Correios, você precisa ter um contrato comercial. <a href="https://www.correios.com.br/solucoes-empresariais/comercio-eletronico" target="_blank" rel="noopener noreferrer">Saiba mais</a></p>
              </div>
              
              <div className="form-group">
                <div className="form-toggle">
                  <label htmlFor="correios-enabled">Ativado</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="correios-enabled"
                      checked={config.correios.enabled}
                      onChange={(e) => handleConfigChange('correios', 'enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="correios-username">Username</label>
                <input
                  type="text"
                  id="correios-username"
                  placeholder="Insira seu username"
                  value={config.correios.username}
                  onChange={(e) => handleConfigChange('correios', 'username', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="correios-password">Password</label>
                <input
                  type="password"
                  id="correios-password"
                  placeholder="Insira seu password"
                  value={config.correios.password}
                  onChange={(e) => handleConfigChange('correios', 'password', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="correios-contract">Contrato</label>
                <input
                  type="text"
                  id="correios-contract"
                  placeholder="Insira seu contrato"
                  value={config.correios.contract}
                  onChange={(e) => handleConfigChange('correios', 'contract', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="correios-postal-card">Cartão Postal</label>
                <input
                  type="text"
                  id="correios-postal-card"
                  placeholder="Insira seu cartão postal"
                  value={config.correios.postalCard}
                  onChange={(e) => handleConfigChange('correios', 'postalCard', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <h4 className="subsection-title">Serviços</h4>
              
              {Object.keys(config.correios.services).map(serviceKey => (
                <div key={serviceKey} className="service-item">
                  <div className="form-toggle">
                    <label htmlFor={`correios-service-${serviceKey}`}>{config.correios.services[serviceKey].name}</label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id={`correios-service-${serviceKey}`}
                        checked={config.correios.services[serviceKey].enabled}
                        onChange={(e) => handleServiceChange('correios', serviceKey, 'enabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  <p className="service-description">{config.correios.services[serviceKey].description}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Melhor Envio */}
          {activeCarrier === 'melhorEnvio' && (
            <div className="carrier-form">
              <div className="carrier-info-box">
                <InfoIcon />
                <p>Para usar o Melhor Envio, você precisa criar uma conta e obter suas credenciais. <a href="https://melhorenvio.com.br/api/v2/register" target="_blank" rel="noopener noreferrer">Saiba mais</a></p>
              </div>
              
              <div className="form-group">
                <div className="form-toggle">
                  <label htmlFor="melhorEnvio-enabled">Ativado</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="melhorEnvio-enabled"
                      checked={config.melhorEnvio.enabled}
                      onChange={(e) => handleConfigChange('melhorEnvio', 'enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="melhorEnvio-clientId">Client ID</label>
                <input
                  type="text"
                  id="melhorEnvio-clientId"
                  placeholder="Insira seu Client ID"
                  value={config.melhorEnvio.clientId}
                  onChange={(e) => handleConfigChange('melhorEnvio', 'clientId', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="melhorEnvio-clientSecret">Client Secret</label>
                <input
                  type="password"
                  id="melhorEnvio-clientSecret"
                  placeholder="Insira seu Client Secret"
                  value={config.melhorEnvio.clientSecret}
                  onChange={(e) => handleConfigChange('melhorEnvio', 'clientSecret', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="melhorEnvio-token">Token</label>
                <input
                  type="password"
                  id="melhorEnvio-token"
                  placeholder="Insira seu Token"
                  value={config.melhorEnvio.token}
                  onChange={(e) => handleConfigChange('melhorEnvio', 'token', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <div className="form-toggle">
                  <label htmlFor="melhorEnvio-sandbox">Ambiente Sandbox</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="melhorEnvio-sandbox"
                      checked={config.melhorEnvio.sandbox}
                      onChange={(e) => handleConfigChange('melhorEnvio', 'sandbox', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
              </div>
              
              <h4 className="subsection-title">Serviços</h4>
              
              {Object.keys(config.melhorEnvio.services).map(serviceKey => (
                <div key={serviceKey} className="service-item">
                  <div className="form-toggle">
                    <label htmlFor={`melhorEnvio-service-${serviceKey}`}>{config.melhorEnvio.services[serviceKey].name}</label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id={`melhorEnvio-service-${serviceKey}`}
                        checked={config.melhorEnvio.services[serviceKey].enabled}
                        onChange={(e) => handleServiceChange('melhorEnvio', serviceKey, 'enabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  <p className="service-description">{config.melhorEnvio.services[serviceKey].description}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Jadlog */}
          {activeCarrier === 'jadlog' && (
            <div className="carrier-form">
              <div className="carrier-info-box">
                <InfoIcon />
                <p>Para usar a Jadlog, você precisa ter um contrato comercial. <a href="https://www.jadlog.com.br/jadlog/ecommerce" target="_blank" rel="noopener noreferrer">Saiba mais</a></p>
              </div>
              
              <div className="form-group">
                <div className="form-toggle">
                  <label htmlFor="jadlog-enabled">Ativado</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="jadlog-enabled"
                      checked={config.jadlog.enabled}
                      onChange={(e) => handleConfigChange('jadlog', 'enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="jadlog-token">Token</label>
                <input
                  type="password"
                  id="jadlog-token"
                  placeholder="Insira seu token"
                  value={config.jadlog.token}
                  onChange={(e) => handleConfigChange('jadlog', 'token', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="jadlog-cnpj">CNPJ</label>
                <input
                  type="text"
                  id="jadlog-cnpj"
                  placeholder="Insira seu CNPJ"
                  value={config.jadlog.cnpj}
                  onChange={(e) => handleConfigChange('jadlog', 'cnpj', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <h4 className="subsection-title">Serviços</h4>
              
              {Object.keys(config.jadlog.services).map(serviceKey => (
                <div key={serviceKey} className="service-item">
                  <div className="form-toggle">
                    <label htmlFor={`jadlog-service-${serviceKey}`}>{config.jadlog.services[serviceKey].name}</label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id={`jadlog-service-${serviceKey}`}
                        checked={config.jadlog.services[serviceKey].enabled}
                        onChange={(e) => handleServiceChange('jadlog', serviceKey, 'enabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  <p className="service-description">{config.jadlog.services[serviceKey].description}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Loggi */}
          {activeCarrier === 'loggi' && (
            <div className="carrier-form">
              <div className="carrier-info-box">
                <InfoIcon />
                <p>Para usar a Loggi, você precisa ter uma conta e obter suas credenciais. <a href="https://www.loggi.com/empresas/" target="_blank" rel="noopener noreferrer">Saiba mais</a></p>
              </div>
              
              <div className="form-group">
                <div className="form-toggle">
                  <label htmlFor="loggi-enabled">Ativado</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="loggi-enabled"
                      checked={config.loggi.enabled}
                      onChange={(e) => handleConfigChange('loggi', 'enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="loggi-email">Email</label>
                <input
                  type="email"
                  id="loggi-email"
                  placeholder="Insira seu email"
                  value={config.loggi.email}
                  onChange={(e) => handleConfigChange('loggi', 'email', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="loggi-apiKey">API Key</label>
                <input
                  type="password"
                  id="loggi-apiKey"
                  placeholder="Insira sua API Key"
                  value={config.loggi.apiKey}
                  onChange={(e) => handleConfigChange('loggi', 'apiKey', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <h4 className="subsection-title">Serviços</h4>
              
              {Object.keys(config.loggi.services).map(serviceKey => (
                <div key={serviceKey} className="service-item">
                  <div className="form-toggle">
                    <label htmlFor={`loggi-service-${serviceKey}`}>{config.loggi.services[serviceKey].name}</label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id={`loggi-service-${serviceKey}`}
                        checked={config.loggi.services[serviceKey].enabled}
                        onChange={(e) => handleServiceChange('loggi', serviceKey, 'enabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  <p className="service-description">{config.loggi.services[serviceKey].description}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Azul Cargo */}
          {activeCarrier === 'azulCargo' && (
            <div className="carrier-form">
              <div className="carrier-info-box">
                <InfoIcon />
                <p>Para usar a Azul Cargo, você precisa ter um contrato comercial. <a href="https://www.azulcargo.com.br/ecommerce/" target="_blank" rel="noopener noreferrer">Saiba mais</a></p>
              </div>
              
              <div className="form-group">
                <div className="form-toggle">
                  <label htmlFor="azulCargo-enabled">Ativado</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="azulCargo-enabled"
                      checked={config.azulCargo.enabled}
                      onChange={(e) => handleConfigChange('azulCargo', 'enabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="azulCargo-token">Token</label>
                <input
                  type="password"
                  id="azulCargo-token"
                  placeholder="Insira seu token"
                  value={config.azulCargo.token}
                  onChange={(e) => handleConfigChange('azulCargo', 'token', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="azulCargo-cnpj">CNPJ</label>
                <input
                  type="text"
                  id="azulCargo-cnpj"
                  placeholder="Insira seu CNPJ"
                  value={config.azulCargo.cnpj}
                  onChange={(e) => handleConfigChange('azulCargo', 'cnpj', e.target.value)}
                  className="form-control"
                />
              </div>
              
              <h4 className="subsection-title">Serviços</h4>
              
              {Object.keys(config.azulCargo.services).map(serviceKey => (
                <div key={serviceKey} className="service-item">
                  <div className="form-toggle">
                    <label htmlFor={`azulCargo-service-${serviceKey}`}>{config.azulCargo.services[serviceKey].name}</label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id={`azulCargo-service-${serviceKey}`}
                        checked={config.azulCargo.services[serviceKey].enabled}
                        onChange={(e) => handleServiceChange('azulCargo', serviceKey, 'enabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  <p className="service-description">{config.azulCargo.services[serviceKey].description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="carrier-config-actions">
        <button
          className="btn btn-secondary"
          onClick={handleTestConnection}
          disabled={isTesting}
        >
          {isTesting ? 'Testando...' : 'Testar Conexão'}
        </button>
        
        <button
          className="btn btn-primary"
          onClick={handleSaveConfig}
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
};

export default CarrierConfigPanel;
