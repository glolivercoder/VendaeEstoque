import React from 'react';

const ConfigPopup = ({ 
  showConfigPopup, 
  setShowConfigPopup, 
  backupLocation, 
  setBackupLocation, 
  autoBackup, 
  setAutoBackup 
}) => {
  if (!showConfigPopup) return null;
  
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
          
          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowConfigPopup(false)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPopup;
