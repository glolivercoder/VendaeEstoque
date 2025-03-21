import { useState } from 'react';

const ConfigPopup = ({ 
  showConfigPopup, 
  setShowConfigPopup, 
  backupLocation, 
  setBackupLocation,
  autoBackup,
  setAutoBackup
}) => {
  const [tempBackupLocation, setTempBackupLocation] = useState(backupLocation);
  const [tempAutoBackup, setTempAutoBackup] = useState(autoBackup);

  const handleSaveConfig = () => {
    setBackupLocation(tempBackupLocation);
    setAutoBackup(tempAutoBackup);
    localStorage.setItem('backupLocation', tempBackupLocation);
    localStorage.setItem('autoBackup', tempAutoBackup);
    setShowConfigPopup(false);
  };

  if (!showConfigPopup) return null;

  return (
    <div className="config-popup">
      <div className="config-content">
        <h2>Configurau00e7u00f5es</h2>
        <div className="form-group">
          <label>Local de Backup:</label>
          <input
            type="text"
            value={tempBackupLocation}
            onChange={(e) => setTempBackupLocation(e.target.value)}
            placeholder="Caminho para salvar backups"
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={tempAutoBackup}
              onChange={(e) => setTempAutoBackup(e.target.checked)}
            />
            Backup Automático
          </label>
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
