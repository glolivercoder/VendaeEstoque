import { useState, useEffect } from 'react';
import { syncProductsToWooCommerce, getProductsFromWooCommerce, checkWooCommerceConnection } from '../services/woocommerce-basic';

/**
 * Componente para integração com o WooCommerce MCP
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.selectedItems - Índices dos itens selecionados
 * @param {Array} props.items - Lista completa de itens
 */
const WooCommerceMCP = ({ selectedItems, items }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Verificar conexão com o WooCommerce ao carregar o componente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await checkWooCommerceConnection();
        setConnectionStatus(result);
      } catch (error) {
        console.error('Erro ao verificar conexão com WooCommerce:', error);
        setConnectionStatus({
          success: false,
          message: `Erro ao verificar conexão: ${error.message}`
        });
      }
    };

    checkConnection();
  }, []);

  // Função para sincronizar produtos selecionados com o WooCommerce
  const handleSyncToWooCommerce = async () => {
    console.log('Itens selecionados:', selectedItems);
    console.log('Todos os itens:', items.map(item => ({ id: item.id, name: item.description || item.name })));

    if (selectedItems.length === 0) {
      alert('Por favor, selecione pelo menos um produto para sincronizar.');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncResult(null);

      // Filtrar apenas os itens selecionados
      const selectedProducts = items.filter(item => selectedItems.includes(item.id));
      console.log('Produtos filtrados para sincronização:', selectedProducts.map(p => ({ id: p.id, name: p.description || p.name })));

      console.log(`Sincronizando ${selectedProducts.length} produtos com o WooCommerce...`);

      // Sincronizar com WooCommerce
      const result = await syncProductsToWooCommerce(selectedProducts);

      setSyncResult({
        success: true,
        message: `${result.created + result.updated} produtos sincronizados com sucesso! (${result.created} criados, ${result.updated} atualizados)`,
        details: result
      });

      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Erro ao sincronizar com WooCommerce:', error);

      // Mensagem de erro mais detalhada
      let errorMessage = `Erro ao sincronizar: ${error.message}`;

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`;
        }

        if (error.response.data.code) {
          errorMessage += ` (Código: ${error.response.data.code})`;
        }
      }

      setSyncResult({
        success: false,
        message: errorMessage,
        error: error
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Função para importar produtos do WooCommerce
  const handleImportFromWooCommerce = async () => {
    try {
      setIsSyncing(true);
      setSyncResult(null);

      const result = await getProductsFromWooCommerce();

      if (result.success && result.products && result.products.length > 0) {
        setSyncResult({
          success: true,
          message: `${result.products.length} produtos importados do WooCommerce com sucesso!`,
          details: result
        });

        setLastSyncTime(new Date().toLocaleTimeString());
      } else {
        setSyncResult({
          success: false,
          message: result.message || 'Nenhum produto encontrado no WooCommerce.',
          details: result
        });
      }
    } catch (error) {
      console.error('Erro ao importar produtos do WooCommerce:', error);

      setSyncResult({
        success: false,
        message: `Erro ao importar produtos: ${error.message}`,
        error: error
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">Integração com WooCommerce (MCP)</h3>

      {/* Status da conexão */}
      {connectionStatus && (
        <div className={`mb-4 p-3 rounded-md ${connectionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-medium">{connectionStatus.success ? '✅ Conectado ao WooCommerce' : '❌ Não conectado ao WooCommerce'}</p>
          <p className="text-sm">{connectionStatus.message}</p>
        </div>
      )}

      {/* Última sincronização */}
      {lastSyncTime && (
        <div className="mb-4 text-sm text-gray-600">
          <p>Última sincronização: {lastSyncTime}</p>
        </div>
      )}

      {/* Informação sobre produtos selecionados */}
      <div className="mb-4 p-3 rounded-md bg-blue-50 text-blue-800">
        <p className="font-medium">Produtos selecionados: {selectedItems.length}</p>
        <p className="text-sm">Selecione os produtos que deseja sincronizar com o WooCommerce.</p>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleSyncToWooCommerce}
          disabled={isSyncing || selectedItems.length === 0}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Produtos Selecionados'}
        </button>

        <button
          onClick={handleImportFromWooCommerce}
          disabled={isSyncing}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isSyncing ? 'Importando...' : 'Importar Produtos do WooCommerce'}
        </button>
      </div>

      {/* Resultado da sincronização */}
      {syncResult && (
        <div className={`p-3 rounded-md ${syncResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-medium">{syncResult.message}</p>

          {syncResult.details && syncResult.details.failed > 0 && (
            <p className="text-sm mt-2">
              Falhas: {syncResult.details.failed} produtos não puderam ser sincronizados.
            </p>
          )}

          {/* Botão para mostrar detalhes */}
          <button
            onClick={() => console.log('Detalhes da sincronização:', syncResult.details)}
            className="text-xs underline mt-2"
          >
            Ver detalhes no console
          </button>
        </div>
      )}
    </div>
  );
};

export default WooCommerceMCP;
