import { useState } from 'react';
import { configureHostingerApp } from '../services/hostinger';

const HostingerConfig = ({ 
  showHostingerConfig, 
  setShowHostingerConfig, 
  hostingerConfig, 
  setHostingerConfig 
}) => {
  const [tempConfig, setTempConfig] = useState({ ...hostingerConfig });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempConfig({ ...tempConfig, [name]: value });
  };

  const handleSaveConfig = async () => {
    try {
      await configureHostingerApp(tempConfig);
      setHostingerConfig(tempConfig);
      localStorage.setItem('hostingerConfig', JSON.stringify(tempConfig));
      setShowHostingerConfig(false);
      alert('Configurau00e7u00f5es do Hostinger salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurau00e7u00f5es do Hostinger:', error);
      alert(`Erro ao salvar configurau00e7u00f5es: ${error.message}`);
    }
  };

  if (!showHostingerConfig) return null;

  return (
    <div className="hostinger-config-popup">
      <div className="hostinger-config-content">
        <h2>Configurau00e7u00f5es do Hostinger</h2>
        <div className="form-group">
          <label>URL do Site:</label>
          <input
            type="text"
            name="site_url"
            value={tempConfig.site_url}
            onChange={handleInputChange}
            placeholder="Ex: https://meusite.com"
          />
        </div>
        <div className="form-group">
          <label>API Key:</label>
          <input
            type="text"
            name="api_key"
            value={tempConfig.api_key}
            onChange={handleInputChange}
            placeholder="Sua chave de API do Hostinger"
          />
        </div>
        <div className="form-group">
          <label>Site ID:</label>
          <input
            type="text"
            name="site_id"
            value={tempConfig.site_id}
            onChange={handleInputChange}
            placeholder="ID do seu site no Hostinger"
          />
        </div>
        <div className="form-actions">
          <button
            className="btn-cancel"
            onClick={() => setShowHostingerConfig(false)}
          >
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSaveConfig}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HostingerConfig;
