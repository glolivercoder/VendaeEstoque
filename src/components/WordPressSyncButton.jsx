import React, { useState, useEffect } from 'react';
import {
  syncSelectedItemsToWordPress,
  getProductsFromWordPress,
  updateWordPressStock,
  setupSalesWebhook
} from '../services/wordpress-sync';

/**
 * Componente para sincronizar itens selecionados com o WordPress
 *
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.selectedItems - Array de IDs dos itens selecionados
 * @param {Array} props.allItems - Array de todos os itens disponíveis
 * @param {Function} props.onSuccess - Função a ser chamada em caso de sucesso
 * @param {Function} props.onError - Função a ser chamada em caso de erro
 */
const WordPressSyncButton = ({ selectedItems, allItems, onSuccess, onError, onStockUpdate }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncMode, setSyncMode] = useState('export'); // 'export' ou 'bidirectional'
  const [autoSync, setAutoSync] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [webhookStatus, setWebhookStatus] = useState('inactive');

  // Configurar webhook para sincronização bidirecional
  useEffect(() => {
    let webhook = null;

    if (autoSync && syncMode === 'bidirectional') {
      webhook = setupSalesWebhook(async (result) => {
        // Callback chamado quando há uma venda no WordPress
        if (result.success && result.products && result.products.length > 0) {
          // Atualizar o estoque local com base nas vendas do WordPress
          if (onStockUpdate) {
            onStockUpdate(result.products);
          }

          setLastSyncTime(new Date().toLocaleTimeString());
        }
      });

      // Iniciar a verificação a cada 1 minuto
      webhook.start(60000);
      setWebhookStatus('active');

      return () => {
        // Limpar o webhook quando o componente for desmontado
        if (webhook) {
          webhook.stop();
          setWebhookStatus('inactive');
        }
      };
    }
  }, [autoSync, syncMode, onStockUpdate]);

  // Função para sincronizar estoque do WordPress para o aplicativo
  const handleSyncFromWordPress = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);

      const result = await getProductsFromWordPress();

      if (result.success && result.products && result.products.length > 0) {
        // Atualizar o estoque local com base nos produtos do WordPress
        if (onStockUpdate) {
          onStockUpdate(result.products);
        }

        setSyncResult({
          success: true,
          message: `${result.count} produtos importados do WordPress com sucesso!`
        });

        setLastSyncTime(new Date().toLocaleTimeString());
      } else {
        setSyncResult({
          success: false,
          message: result.message || 'Nenhum produto encontrado no WordPress.'
        });
      }

      setIsSyncing(false);
    } catch (error) {
      console.error('Erro ao importar produtos do WordPress:', error);
      setSyncResult({
        success: false,
        message: `Erro ao importar produtos: ${error.message}`
      });
      setIsSyncing(false);

      if (onError) {
        onError(error);
      }
    }
  };

  // Função para sincronizar estoque do aplicativo para o WordPress
  const handleSyncToWordPress = async () => {
    if (selectedItems.length === 0) {
      alert('Por favor, selecione pelo menos um item para sincronizar.');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncResult(null);

      const result = await syncSelectedItemsToWordPress(selectedItems, allItems);

      setSyncResult(result);
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString());

      if (result.success) {
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        if (onError) {
          onError(result.error);
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar com o WordPress:', error);
      setSyncResult({
        success: false,
        message: `Erro ao sincronizar: ${error.message}`
      });
      setIsSyncing(false);

      if (onError) {
        onError(error);
      }
    }
  };

  // Função principal de sincronização que decide qual método usar
  const handleSync = async () => {
    if (syncMode === 'export') {
      // Sincronizar do aplicativo para o WordPress
      await handleSyncToWordPress();
    } else if (syncMode === 'bidirectional') {
      // Sincronizar em ambas as direções
      await handleSyncToWordPress();
      await handleSyncFromWordPress();
    }
  };

  return (
    <div className="wordpress-sync-container">
      <div className="sync-options">
        <div className="sync-mode-selector">
          <label className="sync-option">
            <input
              type="radio"
              name="syncMode"
              value="export"
              checked={syncMode === 'export'}
              onChange={() => setSyncMode('export')}
              disabled={isSyncing}
            />
            <span>Exportar para WordPress</span>
          </label>
          <label className="sync-option">
            <input
              type="radio"
              name="syncMode"
              value="bidirectional"
              checked={syncMode === 'bidirectional'}
              onChange={() => setSyncMode('bidirectional')}
              disabled={isSyncing}
            />
            <span>Sincronização Bidirecional</span>
          </label>
        </div>

        <label className="auto-sync-option">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={() => setAutoSync(!autoSync)}
            disabled={isSyncing || syncMode !== 'bidirectional'}
          />
          <span>Sincronização Automática</span>
        </label>
      </div>

      <div className="sync-actions">
        <button
          onClick={handleSync}
          disabled={isSyncing || (syncMode === 'export' && selectedItems.length === 0)}
          className={`wordpress-sync-button ${isSyncing ? 'syncing' : ''}`}
        >
          {isSyncing ? (
            <>
              <span className="spinner"></span>
              Sincronizando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              {syncMode === 'export' ? 'Exportar para WordPress' : 'Sincronizar Bidirecional'}
            </>
          )}
        </button>

        {syncMode === 'bidirectional' && (
          <button
            onClick={handleSyncFromWordPress}
            disabled={isSyncing}
            className="wordpress-import-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"></path>
            </svg>
            Importar do WordPress
          </button>
        )}
      </div>

      {webhookStatus === 'active' && (
        <div className="webhook-status active">
          <span className="status-indicator"></span>
          Sincronização automática ativa
          {lastSyncTime && (
            <span className="last-sync-time">
              Última verificação: {lastSyncTime}
            </span>
          )}
        </div>
      )}

      {syncResult && (
        <div className={`sync-result ${syncResult.success ? 'success' : 'error'}`}>
          <p>{syncResult.message}</p>
          {syncResult.success && (
            <div className="sync-actions">
              <a
                href="https://achadinhoshopp.com.br/loja/"
                target="_blank"
                rel="noopener noreferrer"
                className="view-site-button"
              >
                Ver no Site
              </a>
              {lastSyncTime && (
                <span className="last-sync-time">
                  Sincronizado em: {lastSyncTime}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .wordpress-sync-container {
          margin: 20px 0;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .sync-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }

        .sync-mode-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .sync-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .auto-sync-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-top: 8px;
        }

        .sync-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 16px;
        }

        .wordpress-sync-button,
        .wordpress-import-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
          flex: 1;
          min-width: 200px;
        }

        .wordpress-sync-button {
          background-color: #21759b;
        }

        .wordpress-import-button {
          background-color: #4caf50;
        }

        .wordpress-sync-button:hover {
          background-color: #135e7c;
        }

        .wordpress-import-button:hover {
          background-color: #3d8b40;
        }

        .wordpress-sync-button:disabled,
        .wordpress-import-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .wordpress-sync-button.syncing {
          background-color: #135e7c;
        }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .webhook-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .webhook-status.active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #4caf50;
          display: inline-block;
          position: relative;
        }

        .status-indicator::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 50%;
          border: 2px solid #4caf50;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .last-sync-time {
          margin-left: auto;
          font-size: 12px;
          color: #666;
        }

        .sync-result {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 4px;
          text-align: center;
          width: 100%;
        }

        .sync-result.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .sync-result.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .sync-result .sync-actions {
          margin-top: 12px;
          justify-content: center;
        }

        .view-site-button {
          display: inline-block;
          padding: 6px 12px;
          background-color: #21759b;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          transition: background-color 0.3s ease;
        }

        .view-site-button:hover {
          background-color: #135e7c;
        }
      `}</style>
    </div>
  );
};

export default WordPressSyncButton;
