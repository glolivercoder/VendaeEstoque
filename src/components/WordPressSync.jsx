import { useState } from 'react';
import { syncProductsToWordPress, clearWordPressProducts, setupWordPressWebhook } from '../services/wordpress';

/**
 * Componente para sincronização com WordPress
 */
const WordPressSync = ({ selectedItems, items }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [showWebhookInfo, setShowWebhookInfo] = useState(false);

  // Função para sincronizar produtos selecionados com o WordPress
  const handleSyncToWordPress = async () => {
    if (selectedItems.length === 0) {
      alert('Por favor, selecione pelo menos um produto para sincronizar.');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncResult(null);

      // Filtrar apenas os itens selecionados
      const selectedProducts = items.filter((_, index) => selectedItems.includes(index));
      
      // Sincronizar com WordPress
      const result = await syncProductsToWordPress(selectedProducts);
      
      setSyncResult({
        success: true,
        message: `${result.count || selectedProducts.length} produtos sincronizados com sucesso!`
      });
      
    } catch (error) {
      console.error('Erro ao sincronizar com WordPress:', error);
      
      setSyncResult({
        success: false,
        message: `Erro ao sincronizar: ${error.message}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Função para limpar produtos no WordPress
  const handleClearWordPress = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os produtos no WordPress?')) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncResult(null);
      
      const result = await clearWordPressProducts();
      
      setSyncResult({
        success: true,
        message: `Produtos limpos com sucesso! ${result.count || 0} produtos removidos.`
      });
    } catch (error) {
      console.error('Erro ao limpar produtos no WordPress:', error);
      
      setSyncResult({
        success: false,
        message: `Erro ao limpar produtos: ${error.message}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Função para configurar webhook
  const handleSetupWebhook = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);
      
      const result = await setupWordPressWebhook();
      
      setSyncResult({
        success: true,
        message: `Webhook configurado com sucesso!`
      });
      
      setShowWebhookInfo(true);
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      
      setSyncResult({
        success: false,
        message: `Erro ao configurar webhook: ${error.message}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h3 className="text-lg font-semibold">Exportar para o WordPress</h3>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleSyncToWordPress}
          disabled={isSyncing}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Produtos Selecionados'}
        </button>
        
        <button
          onClick={handleClearWordPress}
          disabled={isSyncing}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Limpar Produtos
        </button>
        
        <button
          onClick={handleSetupWebhook}
          disabled={isSyncing}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Configurar Webhook
        </button>
      </div>
      
      {syncResult && (
        <div className={`mt-4 p-3 rounded-md ${syncResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {syncResult.message}
        </div>
      )}
      
      {showWebhookInfo && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-semibold text-blue-800">URL do Webhook do PDV Vendas</h4>
          <p className="mt-2">
            Preencha esta URL no seu site WordPress para receber notificações de vendas:
          </p>
          <code className="block mt-2 p-2 bg-gray-100 rounded border">
            https://api.pdvvendas.com/webhook/wordpress-sync
          </code>
          <p className="mt-2 text-sm text-gray-600">
            Esta URL permite que o WordPress notifique o PDV Vendas quando ocorrer uma venda,
            mantendo o estoque sincronizado entre as duas plataformas.
          </p>
        </div>
      )}
    </div>
  );
};

export default WordPressSync;
