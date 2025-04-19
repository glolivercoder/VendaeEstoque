import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import GeminiService from '../services/GeminiService';
import { fetchProductDetails } from '../lib/productApi';

const MagicWandScanButton = ({ onProductDataDetected }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Converter imagem para base64
      const base64Image = await fileToBase64(file);

      // Criar parte da imagem para o Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      };

      // Prompt para o Gemini específico para identificação de GTIN/NCM e informações do produto
      const prompt = `Analise esta imagem de um produto e identifique o código GTIN (código de barras), NCM (Nomenclatura Comum do Mercosul) ou SKU, além de outras informações visíveis sobre o produto.

      Foque especificamente em encontrar:
      1. Código GTIN/EAN (geralmente 8, 12, 13 ou 14 dígitos)
      2. Código NCM (8 dígitos, formato XX.XX.XX.XX)
      3. Código SKU (código de identificação do produto)
      4. Nome/Descrição do produto
      5. Dimensões (comprimento, largura, altura em cm)
      6. Peso (em kg ou g)
      7. Volume (em litros ou ml, se aplicável)

      Retorne as informações encontradas no formato JSON:

      {
        "productCode": {
          "type": "GTIN", "NCM" ou "SKU",
          "value": "código encontrado",
          "confidence": valor entre 0 e 1
        },
        "productInfo": {
          "name": "nome ou descrição do produto",
          "dimensions": {
            "length": valor numérico ou null,
            "width": valor numérico ou null,
            "height": valor numérico ou null,
            "unit": "cm"
          },
          "weight": {
            "value": valor numérico ou null,
            "unit": "kg" ou "g"
          },
          "volume": {
            "value": valor numérico ou null,
            "unit": "l" ou "ml"
          }
        }
      }

      Para os códigos, se encontrar mais de um tipo, priorize na ordem: GTIN, NCM, SKU.
      Para as dimensões, peso e volume, extraia apenas se estiverem claramente visíveis na imagem.
      Se alguma informação não estiver disponível, use null para valores numéricos ou string vazia para textos.`;

      console.log("Enviando imagem para o Gemini...");
      const result = await GeminiService.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      console.log("Resposta do Gemini:", text);

      // Extrair o JSON da resposta
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

      try {
        const data = JSON.parse(jsonString);
        console.log("Dados extraídos:", data);

        if (data && data.productCode && data.productCode.value) {
          // Tentar buscar informações adicionais do produto usando o código
          try {
            // Buscar informações adicionais do produto em APIs externas
            const additionalInfo = await fetchProductDetails(data.productCode.value);

            if (additionalInfo) {
              console.log("Informações adicionais do produto:", additionalInfo);

              // Mesclar as informações da API com as informações da imagem
              const mergedProductInfo = {
                ...data.productInfo || {},
                ...additionalInfo,
                // Priorizar informações da API, mas manter informações da imagem se não existirem na API
                name: additionalInfo.name || data.productInfo?.name || '',
                dimensions: {
                  ...data.productInfo?.dimensions || {},
                  ...additionalInfo.dimensions || {}
                },
                weight: {
                  ...data.productInfo?.weight || {},
                  ...additionalInfo.weight || {}
                }
              };

              // Chamar o callback com o código e informações completas do produto
              onProductDataDetected({
                code: data.productCode.value,
                type: data.productCode.type,
                ...mergedProductInfo
              });
            } else {
              // Se não encontrou informações adicionais, usar apenas as informações da imagem
              onProductDataDetected({
                code: data.productCode.value,
                type: data.productCode.type,
                ...data.productInfo || {}
              });
            }
          } catch (apiError) {
            console.warn("Erro ao buscar informações adicionais do produto:", apiError);
            // Em caso de erro na API, usar apenas as informações da imagem
            onProductDataDetected({
              code: data.productCode.value,
              type: data.productCode.type,
              ...data.productInfo || {}
            });
          }
        } else {
          throw new Error("Nenhum código de produto encontrado na imagem");
        }
      } catch (e) {
        console.error("Erro ao processar resposta:", e);
        throw new Error("Não foi possível identificar o código do produto");
      }
    } catch (err) {
      console.error('Erro ao processar imagem do produto:', err);
      setError(err.message || 'Erro ao processar a imagem. Tente novamente.');
      alert(`Erro: ${err.message || 'Falha ao identificar o código do produto'}`);
    } finally {
      setIsLoading(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  // Função para converter arquivo para base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="magic-wand-scan-container">
      <button
        className="btn btn-outline magic-wand-button"
        onClick={handleButtonClick}
        disabled={isLoading}
        title="Identificar GTIN/NCM com IA"
      >
        {/* Ícone de varinha mágica com câmera */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 4V2" />
          <path d="M8 9h2" />
          <path d="M20 9h2" />
          <path d="M17.8 11.8L19 13" />
          <path d="M15 9h0" />
          <path d="M17.8 6.2L19 5" />
          <path d="M3 21l9-9" />
          <path d="M12.2 6.2L11 5" />
          {/* Adicionar elemento de câmera */}
          <circle cx="12" cy="13" r="3" />
        </svg>
      </button>

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        capture="environment"
      />

      {/* Mensagem de erro */}
      {error && (
        <div style={{ color: 'red', marginTop: '5px', fontSize: '12px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

MagicWandScanButton.propTypes = {
  onProductDataDetected: PropTypes.func.isRequired
};

export default MagicWandScanButton;
