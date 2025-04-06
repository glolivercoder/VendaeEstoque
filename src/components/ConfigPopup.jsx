import { useState, useRef } from 'react';

const ConfigPopup = ({ 
  showConfigPopup, 
  setShowConfigPopup, 
  backupLocation, 
  setBackupLocation,
  autoBackup,
  setAutoBackup,
  createBackup,
  importBackup
}) => {
  const [tempBackupLocation, setTempBackupLocation] = useState(backupLocation);
  const [tempAutoBackup, setTempAutoBackup] = useState(autoBackup);
  const fileInputRef = useRef(null);

  const handleSaveConfig = () => {
    setBackupLocation(tempBackupLocation);
    setAutoBackup(tempAutoBackup);
    localStorage.setItem('backupLocation', tempBackupLocation);
    localStorage.setItem('autoBackup', tempAutoBackup);
    setShowConfigPopup(false);
  };

  if (!showConfigPopup) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>Configurações</h2>
          <button onClick={() => setShowConfigPopup(false)} className="close-button">×</button>
        </div>
        
        <div className="popup-body">
          <h3>Configurações de Backup</h3>
          
          <div className="form-group">
            <label>Local de Backup:</label>
            <input
              type="text"
              value={tempBackupLocation}
              onChange={(e) => setTempBackupLocation(e.target.value)}
              placeholder="Caminho para salvar backups"
              className="form-control"
            />
            <p className="form-helper">
              <small>Este será o local onde os backups serão salvos por padrão.</small>
            </p>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={tempAutoBackup}
                onChange={(e) => setTempAutoBackup(e.target.checked)}
              />
              Criar backup automático após cada venda
            </label>
          </div>
          
          <div className="backup-actions">
            <button 
              className="btn-backup"
              onClick={createBackup}
            >
              Fazer Backup Agora
            </button>
            
            <button 
              className="btn-restore"
              onClick={() => fileInputRef.current?.click()}
            >
              Restaurar Backup
            </button>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={importBackup}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
          
          <hr />
          
          <h3>Outras Configurações</h3>
          {/* Espaço para futuras configurações */}
        </div>
        
        <div className="form-actions">
          <button
            className="btn-cancel"
            onClick={() => setShowConfigPopup(false)}
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

export default ConfigPopup;
