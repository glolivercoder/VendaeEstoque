import { useState } from 'react';
import checkWooCommerceConfig from '../utils/woocommerce-check';

/**
 * Componente para verificar a configuração do WooCommerce
 */
const WooCommerceConfigCheck = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Função para verificar a configuração
  const handleCheckConfig = async () => {
    setIsLoading(true);
    setCheckResult(null);
    
    try {
      const result = await checkWooCommerceConfig();
      setCheckResult(result);
    } catch (error) {
      setCheckResult({
        success: false,
        issues: [
          {
            type: 'check_error',
            message: 'Erro ao verificar configuração',
            details: error.message
          }
        ],
        recommendations: [
          'Verifique a conexão com a internet',
          'Verifique se o WordPress e o WooCommerce estão acessíveis'
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="woocommerce-config-check" style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '16px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>Verificação de Configuração do WooCommerce</h3>
      
      <p>
        Esta ferramenta verifica se o WooCommerce está configurado corretamente para exibir os produtos na loja.
      </p>
      
      <button 
        onClick={handleCheckConfig}
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
        {isLoading ? 'Verificando...' : 'Verificar Configuração'}
      </button>
      
      {checkResult && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          borderRadius: '4px',
          backgroundColor: checkResult.success ? '#f0f9eb' : '#fef0f0',
          color: checkResult.success ? '#67c23a' : '#f56c6c'
        }}>
          <p><strong>{checkResult.success ? 'Configuração OK!' : 'Problemas encontrados!'}</strong></p>
          
          {checkResult.issues.length > 0 && (
            <div>
              <p>Problemas encontrados:</p>
              <ul>
                {checkResult.issues.map((issue, index) => (
                  <li key={index}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}
          
          {checkResult.recommendations.length > 0 && (
            <div>
              <p>Recomendações:</p>
              <ul>
                {checkResult.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
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
            {showDetails ? 'Ocultar Detalhes Técnicos' : 'Mostrar Detalhes Técnicos'}
          </button>
          
          {showDetails && (
            <pre style={{ 
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px',
              fontSize: '12px'
            }}>
              {JSON.stringify(checkResult, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default WooCommerceConfigCheck;
