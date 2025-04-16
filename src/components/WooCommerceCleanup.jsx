import { useState } from 'react';
import { cleanupTrashProducts } from '../utils/woocommerce-cleanup';

/**
 * Componente para limpar produtos na lixeira do WooCommerce
 */
const WooCommerceCleanup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Função para limpar produtos na lixeira
  const handleCleanupTrash = async () => {
    if (!confirm('Tem certeza que deseja limpar permanentemente todos os produtos na lixeira do WooCommerce?')) {
      return;
    }
    
    setIsLoading(true);
    setCleanupResult(null);
    
    try {
      const result = await cleanupTrashProducts();
      setCleanupResult(result);
    } catch (error) {
      setCleanupResult({
        success: false,
        message: `Erro ao limpar produtos na lixeira: ${error.message}`,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">Manutenção do WooCommerce</h3>
      
      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          Se você está tendo problemas para recriar produtos que foram excluídos no WooCommerce,
          use esta ferramenta para limpar permanentemente os produtos na lixeira.
        </p>
        
        <button
          onClick={handleCleanupTrash}
          disabled={isLoading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Limpando...' : 'Limpar Produtos na Lixeira'}
        </button>
      </div>
      
      {cleanupResult && (
        <div className={`mt-4 p-3 rounded-md ${cleanupResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-medium">{cleanupResult.message || `${cleanupResult.count} produtos limpos com sucesso!`}</p>
          
          {cleanupResult.count > 0 && (
            <p className="mt-1">
              {cleanupResult.count} produtos foram excluídos permanentemente.
              {cleanupResult.failed > 0 && ` ${cleanupResult.failed} produtos não puderam ser excluídos.`}
            </p>
          )}
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-sm underline"
          >
            {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
          </button>
          
          {showDetails && cleanupResult.details && (
            <div className="mt-2 p-2 bg-white rounded text-sm max-h-40 overflow-y-auto">
              <ul className="list-disc pl-5">
                {cleanupResult.details.map((detail, index) => (
                  <li key={index} className={detail.status === 'failed' ? 'text-red-600' : ''}>
                    {detail.name} (ID: {detail.id}) - {detail.status}
                    {detail.error && `: ${detail.error}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="font-semibold text-blue-800">Dicas para evitar problemas</h4>
        <ul className="mt-2 list-disc pl-5 text-blue-700">
          <li>Ao excluir produtos no WooCommerce, use a opção "Mover para a Lixeira" em vez de "Excluir Permanentemente"</li>
          <li>Use esta ferramenta de limpeza regularmente para evitar conflitos com produtos na lixeira</li>
          <li>Se ainda tiver problemas, tente limpar o cache do WordPress e do navegador</li>
        </ul>
      </div>
    </div>
  );
};

export default WooCommerceCleanup;
