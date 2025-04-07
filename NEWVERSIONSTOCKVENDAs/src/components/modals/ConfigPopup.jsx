import React, { useRef, useState } from 'react';
import { performBackup, performRestore } from '../../services/backup';

const ConfigPopup = ({
  showConfigPopup,
  setShowConfigPopup,
  backupLocation,
  setBackupLocation,
  autoBackup,
  setAutoBackup,
  reloadData
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  if (!showConfigPopup) return null;

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      setMessage({ text: 'Realizando backup...', type: 'info' });

      await performBackup(backupLocation);

      setMessage({ text: 'Backup realizado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao realizar backup:', error);
      setMessage({ text: `Erro ao realizar backup: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      if (!fileInputRef.current.files || fileInputRef.current.files.length === 0) {
        setMessage({ text: 'Selecione um arquivo de backup para restaurar', type: 'error' });
        return;
      }

      setIsLoading(true);
      setMessage({ text: 'Restaurando backup...', type: 'info' });

      const file = fileInputRef.current.files[0];
      await performRestore(file);

      setMessage({ text: 'Backup restaurado com sucesso! Recarregando dados...', type: 'success' });

      // Recarregar dados após restauração
      if (reloadData) {
        setTimeout(() => {
          reloadData();
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      setMessage({ text: `Erro ao restaurar backup: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
            Configurações
          </h2>
          <button
            onClick={() => setShowConfigPopup(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {/* Configuração de backup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Local de Backup
            </label>
            <input
              type="text"
              value={backupLocation}
              onChange={(e) => setBackupLocation(e.target.value)}
              placeholder="C:\Caminho\Para\Backup"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Configuração de backup automático */}
          <div className="flex items-center">
            <input
              id="autoBackup"
              type="checkbox"
              checked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Realizar backup automático ao sair
            </label>
          </div>

          {/* Botões de backup e restauração */}
          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-3">
              <button
                onClick={handleBackup}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processando...' : 'Realizar Backup'}
              </button>

              <button
                onClick={() => fileInputRef.current.click()}
                disabled={isLoading}
                className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selecionar Arquivo
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={() => {
                  if (fileInputRef.current.files.length > 0) {
                    setMessage({ text: `Arquivo selecionado: ${fileInputRef.current.files[0].name}`, type: 'info' });
                  }
                }}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRestore}
                disabled={isLoading || !fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0}
                className="px-4 py-2 bg-warning text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processando...' : 'Restaurar Backup'}
              </button>

              <button
                onClick={() => setShowConfigPopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPopup;
