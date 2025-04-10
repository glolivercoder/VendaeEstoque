import { useState } from 'react';
import { checkWooCommerceConnection } from '../services/wordpress';

/**
 * Componente para testar a conexão com o WooCommerce
 */
const WooCommerceConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Função para testar a conexão
  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await checkWooCommerceConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao testar conexão',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="woocommerce-test-container" style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '16px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>Teste de Conexão WooCommerce</h3>
      
      <button 
        onClick={handleTestConnection}
        disabled={isLoading}
        style={{
          backgroundColor: '#2271b1',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: isLoading ? 'wait' : 'pointer'
        }}
      >
        {isLoading ? 'Testando...' : 'Testar Conexão'}
      </button>
      
      {testResult && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          borderRadius: '4px',
          backgroundColor: testResult.success ? '#f0f9eb' : '#fef0f0',
          color: testResult.success ? '#67c23a' : '#f56c6c'
        }}>
          <p><strong>{testResult.message}</strong></p>
          
          {!testResult.success && (
            <div>
              <p>Verifique as seguintes configurações:</p>
              <ul>
                <li>URL do WordPress no arquivo .env</li>
                <li>Chave do consumidor e segredo do consumidor no arquivo .env</li>
                <li>Permissões da API REST no painel do WooCommerce</li>
                <li>Conexão com a internet</li>
              </ul>
            </div>
          )}
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
          </button>
          
          {showDetails && (
            <pre style={{ 
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '12px'
            }}>
              {JSON.stringify(testResult, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default WooCommerceConnectionTest;
