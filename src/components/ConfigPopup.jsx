import { useState, useRef } from 'react';
import EnhancedBackupConfig from './EnhancedBackupConfig';
import { useToast } from './ui/toast';
import { createEnhancedBackup, saveBackupFile, restoreBackup } from '../services/enhancedBackupService';

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
  const [showEnhancedBackup, setShowEnhancedBackup] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

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

        {showEnhancedBackup ? (
          <EnhancedBackupConfig onClose={() => setShowEnhancedBackup(false)} />
        ) : (
          <>
            <div className="popup-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Configurações de Backup</h3>
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => setShowEnhancedBackup(true)}
                >
                  Sistema de Backup Avançado
                </button>
              </div>

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
                  onClick={async () => {
                    try {
                      // Criar backup usando o serviço aprimorado
                      const backupContent = await createEnhancedBackup('js');
                      // Salvar o backup
                      const fileName = saveBackupFile(backupContent, 'js');
                      toast({
                        title: "Backup Criado",
                        description: `Backup criado com sucesso e salvo como ${fileName}!`,
                        variant: "success"
                      });
                    } catch (error) {
                      console.error('Erro ao criar backup:', error);
                      toast({
                        title: "Erro",
                        description: `Erro ao criar backup: ${error.message || 'Erro desconhecido'}`,
                        variant: "destructive"
                      });
                    }
                  }}
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
                  onChange={async (e) => {
                    try {
                      const file = e.target.files[0];
                      if (!file) return;

                      // Restaurar o backup usando o serviço aprimorado
                      await restoreBackup(file);
                      toast({
                        title: "Backup Restaurado",
                        description: "Backup restaurado com sucesso!",
                        variant: "success"
                      });
                      // Recarregar a página para aplicar as alterações
                      window.location.reload();
                    } catch (error) {
                      console.error('Erro ao restaurar backup:', error);
                      toast({
                        title: "Erro",
                        description: `Erro ao restaurar backup: ${error.message || 'Erro desconhecido'}`,
                        variant: "destructive"
                      });
                    }
                  }}
                  accept=".zip"
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
          </>
        )}
      </div>
    </div>
  );
};

export default ConfigPopup;
