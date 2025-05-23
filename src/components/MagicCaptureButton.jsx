import { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import PropTypes from 'prop-types';
import GeminiService from '../services/GeminiService';
import ImageSourceSelector from './ImageSourceSelector';

const MagicCaptureButton = ({ onProductDataExtracted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // Função para processar a imagem com base na fonte selecionada
    const handleSelectSource = (sourceType) => {
      if (sourceType === 'camera') {
        // Abrir câmera
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        // Forçar o uso da câmera em dispositivos móveis
        input.setAttribute('capture', 'environment');
        // Adicionar atributos para garantir que a câmera seja aberta
        input.setAttribute('data-capture', 'camera');
        input.onchange = handleFileChange;
        input.click();
      } else {
        // Abrir seletor de arquivo
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = handleFileChange;
        input.click();
      }
    };

    // Renderizar o componente ImageSourceSelector no DOM
    const selectorRoot = document.createElement('div');
    document.body.appendChild(selectorRoot);

    // Função para fechar o seletor
    const handleClose = () => {
      document.body.removeChild(selectorRoot);
    };

    // Renderizar o componente
    const root = ReactDOM.createRoot(selectorRoot);
    root.render(
      <ImageSourceSelector
        onSelect={sourceType => {
          handleClose();
          handleSelectSource(sourceType);
        }}
        onClose={handleClose}
      />
    );
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

      // Processar a imagem com o GeminiService
      const analysisResult = await processProductImage(file);

      console.log("Dados extraídos do produto:", analysisResult);

      // Mapear os campos para o formato do formulário de produto
      const productData = mapFieldsToProductForm(analysisResult);

      console.log("Dados mapeados para o formulário de produto:", productData);

      // Chamar o callback com os dados extraídos
      if (onProductDataExtracted) {
        onProductDataExtracted(productData);
      }

      // Mostrar feedback visual mais detalhado
      const preenchidos = Object.keys(productData).filter(key => productData[key]).length;
      const mensagem = `Dados do produto extraídos com sucesso!\n\n${preenchidos} campos foram preenchidos automaticamente.`;

      // Listar os campos preenchidos
      const camposPreenchidos = Object.entries(productData)
        .filter(([_, value]) => value)
        .map(([key, value]) => {
          const labels = {
            description: 'Nome do produto',
            itemDescription: 'Descrição detalhada',
            category: 'Categoria',
            price: 'Preço sugerido',
            barcode: 'Código de barras'
          };
          return `${labels[key] || key}: ${value}`;
        }).join('\n');

      alert(`${mensagem}\n\nCampos preenchidos:\n${camposPreenchidos}`);
    } catch (err) {
      console.error('Erro ao processar imagem do produto:', err);
      setError(err.message || 'Erro ao processar a imagem. Tente novamente.');
      alert(`Erro: ${err.message || 'Falha ao processar a imagem do produto'}`);
    } finally {
      setIsLoading(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  // Função para processar a imagem do produto usando o Gemini
  const processProductImage = async (imageFile) => {
    try {
      console.log("Processando imagem com OCR e detecção de código de barras...");

      // Tentar extrair código de barras
      let barcodeResult = null;
      try {
        const imageUrl = URL.createObjectURL(imageFile);
        const img = new Image();
        img.src = imageUrl;
        await new Promise(resolve => { img.onload = resolve; });

        if ('BarcodeDetector' in window) {
          try {
            // Usar a API BarcodeDetector nativa do navegador
            const barcodeDetector = new window.BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'code_39', 'code_128', 'qr_code', 'pdf417', 'data_matrix']
            });
            const barcodes = await barcodeDetector.detect(img);
            if (barcodes.length > 0) {
              barcodeResult = barcodes[0].rawValue;
              console.log("Código de barras detectado:", barcodeResult);
            }
          } catch (e) {
            console.log("Erro ao usar BarcodeDetector API:", e);
          }
        } else {
          console.log("BarcodeDetector API não disponível neste navegador");
        }
      } catch (barcodeError) {
        console.warn("Erro ao detectar código de barras:", barcodeError);
      }

      // Não usamos mais o Tesseract.js para extrair texto
      let tesseractResult = "";
      // Podemos implementar outra solução de OCR no futuro se necessário

      // Converter imagem para base64
      const base64Image = await fileToBase64(imageFile);

      // Criar parte da imagem para o Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      };

      // Prompt para o Gemini
      const prompt = `Analise esta imagem de um produto e me retorne um JSON com as informações encontradas.
      Identifique os seguintes campos específicos:
      - Nome completo do produto (nome oficial e completo do produto)
      - Descrição curta do produto (resumo breve do que é o produto)
      - SKU ou código do produto (se visível)
      - GTIN/EAN (código de barras, geralmente 8, 12, 13 ou 14 dígitos)
      - NCM (Nomenclatura Comum do Mercosul, formato XX.XX.XX.XX)
      - Especificações técnicas (liste as características técnicas do produto em formato objetivo, incluindo dimensões, peso, material, etc.)
      - Copy de vendas (crie uma descrição persuasiva destacando os benefícios e qualidades do produto)
      - Categoria do produto
      - Preço sugerido (se visível)

      Considere também o texto extraído por OCR: ${tesseractResult}
      ${barcodeResult ? `Foi detectado um código de barras: ${barcodeResult}` : ''}

      Formato de resposta:
      {
        "fields": [
          {"name": "productName", "value": "Nome completo do produto"},
          {"name": "description", "value": "Descrição curta do produto"},
          {"name": "sku", "value": "SKU ou código do produto"},
          {"name": "gtin", "value": "Código de barras GTIN/EAN"},
          {"name": "ncm", "value": "Código NCM"},
          {"name": "technicalSpecs", "value": "Especificações técnicas do produto em formato objetivo, incluindo dimensões, peso, etc."},
          {"name": "salesCopy", "value": "Copy de vendas persuasiva destacando benefícios"},
          {"name": "category", "value": "Categoria do produto"},
          {"name": "price", "value": "Preço sugerido"}
        ]
      }

      Se não conseguir identificar algum campo, deixe o valor como string vazia.
      Divida claramente as especificações técnicas (formato objetivo) da copy de vendas (formato persuasivo).
      Na copy de vendas, seja criativo e persuasivo, destacando os benefícios e qualidades do produto.
      Para as dimensões e peso, extraia valores numéricos precisos quando possível.`;

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
        return data;
      } catch (e) {
        console.error("Erro ao fazer parse do JSON:", e);
        throw new Error("Não foi possível extrair informações do produto");
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      throw error;
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

  // Função para mapear os campos para o formato do formulário de produto
  const mapFieldsToProductForm = (data) => {
    const mappedData = {
      productName: '',
      description: '',
      sku: '',
      gtin: '',
      ncm: '',
      technicalSpecs: '',
      itemDescription: '',
      category: '',
      price: ''
    };

    if (!data || !data.fields) {
      return mappedData;
    }

    data.fields.forEach(field => {
      if (field.name && field.value) {
        // Mapear campos especiais
        if (field.name === 'salesCopy') {
          // Guardar copy de vendas para combinar depois
          mappedData['salesCopy'] = field.value;
        } else {
          // Outros campos mapeados diretamente
          mappedData[field.name] = field.value;
        }
      }
    });

    // Combinar copy de vendas com itemDescription se não estiver vazio
    if (mappedData['salesCopy']) {
      if (mappedData['itemDescription']) {
        mappedData['itemDescription'] += `\n\n**Descrição:**\n${mappedData['salesCopy']}`;
      } else {
        mappedData['itemDescription'] = `**Descrição:**\n${mappedData['salesCopy']}`;
      }
    }

    // Remover campos temporários
    delete mappedData['salesCopy'];

    // Obter o CEP do cliente selecionado se houver um cliente selecionado
    try {
      const selectedClientData = localStorage.getItem('selectedClient');
      if (selectedClientData) {
        const selectedClient = JSON.parse(selectedClientData);
        if (selectedClient && selectedClient.address && selectedClient.address.cep) {
          console.log(`CEP do cliente selecionado: ${selectedClient.address.cep}`);
          // Aqui você pode usar o CEP para cálculos de frete ou outras finalidades
        }
      }
    } catch (error) {
      console.error('Erro ao obter CEP do cliente:', error);
    }

    return mappedData;
  };

  return (
    <div className="magic-capture-container">
      <button
        className="magic-capture-button"
        onClick={handleButtonClick}
        disabled={isLoading}
        title="Capturar informações do produto com IA"
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {/* Ícone de câmera */}
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
          style={{ marginRight: '5px' }}
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        {isLoading ? 'Processando...' : 'Magic Capture'}
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

MagicCaptureButton.propTypes = {
  onProductDataExtracted: PropTypes.func
};

export default MagicCaptureButton;
