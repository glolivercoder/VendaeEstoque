# Roadmap: Busca por SKU/NCM/GTIN

## Visão Geral

O componente de busca por SKU/NCM/GTIN permite aos usuários pesquisar produtos utilizando diferentes tipos de códigos (SKU, NCM ou GTIN/código de barras). O componente está integrado à calculadora de frete e utiliza o Google Gemini para reconhecimento de imagens de produtos.

## Localização na Árvore do Projeto

```
estoque-app/
├── src/
│   ├── components/
│   │   ├── ShippingCalculator.jsx       # Componente principal que contém o campo de busca
│   │   ├── ProductScanner.jsx           # Scanner de código de barras via câmera
│   │   └── MagicWandScanButton.jsx      # Botão para reconhecimento de imagem via Gemini
│   ├── lib/
│   │   └── productApi.js                # API para busca de produtos por código
│   └── services/
│       └── GeminiService.js             # Serviço de integração com Google Gemini
```

## Componentes Principais

### 1. Campo de Busca SKU/NCM/GTIN

O campo de busca está localizado no componente `ShippingCalculator.jsx`:

```jsx
<div className="form-section">
  <h3 className="section-title">Produto</h3>
  <div className="form-row">
    <div className="form-group flex-grow">
      <label htmlFor="sku">Código SKU / NCM / GTIN</label>
      <div className="input-group">
        <input
          type="text"
          id="sku"
          placeholder="Digite o código SKU, NCM ou escaneie o código de barras"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          className="form-control"
        />
        <button
          className="btn btn-outline"
          onClick={() => setIsScanning(true)}
          title="Escanear código"
        >
          <Camera />
        </button>
        <MagicWandScanButton
          onProductDataDetected={(productData) => {
            setSku(productData.code);
            // Outros preenchimentos de dados...
          }}
        />
      </div>
    </div>
    <div className="form-group">
      <label>&nbsp;</label>
      <button
        className="btn btn-secondary"
        onClick={() => lookupProduct(sku)}
        disabled={!sku || isFetchingProduct}
      >
        {isFetchingProduct ? "Buscando..." : "Buscar"}
      </button>
    </div>
  </div>
</div>
```

### 2. Função de Busca de Produto

A função `lookupProduct` no `ShippingCalculator.jsx` é responsável por buscar informações do produto com base no código fornecido:

```jsx
const lookupProduct = async (code) => {
  try {
    setIsFetchingProduct(true);

    // Primeiro, tentar buscar o produto pelo SKU
    const product = await fetchProductBySku(code);

    // Se não encontrar pelo SKU, buscar nos produtos disponíveis
    if (!product) {
      const products = await getProducts();
      const matchingProduct = products.find(p =>
        p.sku === code ||
        p.gtin === code ||
        p.ncm === code ||
        (p.description && p.description.includes(code))
      );

      if (matchingProduct) {
        fillProductData(matchingProduct);
        return;
      }
    } else {
      fillProductData(product);
      return;
    }

    toast({
      title: "Produto não encontrado",
      description: "Não foi possível encontrar informações para este código.",
      variant: "destructive",
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao buscar o produto.",
      variant: "destructive",
    });
  } finally {
    setIsFetchingProduct(false);
  }
};
```

### 3. API de Produtos

O arquivo `productApi.js` contém a lógica para buscar produtos por diferentes tipos de códigos:

```javascript
export const fetchProductDetails = async (code) => {
  try {
    // Simular uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Buscar o produto no banco de dados simulado por GTIN, NCM ou SKU
    let product = productDatabase.find(p =>
      p.gtin === code || p.ncm === code || p.sku === code
    );

    if (!product) {
      // Simular uma busca em API externa (Google Merchant, etc)
      console.log(`Buscando informações do produto com código ${code} em APIs externas...`);

      // Verificar se parece com um GTIN (código de barras)
      if (/^\d{8,14}$/.test(code)) {
        // Simular resposta de API externa para GTIN
        product = {
          name: `Produto GTIN ${code.substring(0, 4)}...`,
          weight: Math.random() * 2 + 0.1,
          dimensions: {
            length: Math.floor(Math.random() * 30) + 5,
            width: Math.floor(Math.random() * 20) + 5,
            height: Math.floor(Math.random() * 10) + 1
          }
        };
      }
      // Verificar se parece com um NCM (8 dígitos, pode ter pontos)
      else if (/^\d{2}(\.\d{2}){3}$/.test(code) || /^\d{8}$/.test(code)) {
        // Simular resposta de API externa para NCM
        product = {
          name: `Produto NCM ${code.replace(/\./g, '')}`,
          weight: Math.random() * 3 + 0.5,
          dimensions: {
            length: Math.floor(Math.random() * 40) + 10,
            width: Math.floor(Math.random() * 30) + 5,
            height: Math.floor(Math.random() * 15) + 2
          }
        };
      }
    }

    return product || null;
  } catch (error) {
    console.error('Erro ao buscar detalhes do produto:', error);
    return null;
  }
};
```

### 4. Reconhecimento de Imagem com Gemini

O componente `MagicWandScanButton.jsx` utiliza o Google Gemini para reconhecer produtos a partir de imagens:

```jsx
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

    // Prompt para o Gemini específico para identificação de GTIN/NCM
    const prompt = `Analise esta imagem de um produto e identifique o código GTIN (código de barras), NCM (Nomenclatura Comum do Mercosul) ou SKU, além de outras informações visíveis sobre o produto.

    Retorne um JSON com o seguinte formato:
    {
      "productCode": {
        "value": "código identificado",
        "type": "GTIN, NCM ou SKU"
      },
      "productName": "nome do produto",
      "description": "descrição do produto",
      "weight": número em kg,
      "dimensions": {
        "length": número em cm,
        "width": número em cm,
        "height": número em cm
      },
      "technicalSpecs": "especificações técnicas do produto"
    }`;

    console.log("Enviando imagem para o Gemini...");
    const result = await GeminiService.model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Extrair o JSON da resposta
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    const data = JSON.parse(jsonString);

    if (data && data.productCode && data.productCode.value) {
      // Buscar informações adicionais do produto usando o código
      const additionalInfo = await fetchProductDetails(data.productCode.value);

      // Mesclar informações e chamar o callback
      onProductDataDetected({
        code: data.productCode.value,
        type: data.productCode.type,
        ...mergedProductInfo
      });
    }
  } catch (err) {
    console.error('Erro ao processar imagem do produto:', err);
    setError(err.message || 'Erro ao processar a imagem. Tente novamente.');
  } finally {
    setIsLoading(false);
    e.target.value = '';
  }
};
```

## Implementação da API do Google Gemini

### Configuração do Serviço Gemini

O arquivo `GeminiService.js` implementa a integração com a API do Google Gemini:

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';
import Tesseract from 'tesseract.js';

class GeminiService {
  constructor() {
    if (GeminiService.instance) {
      return GeminiService.instance;
    }

    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: 0.1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      }
    });

    GeminiService.instance = this;
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }
}

export default new GeminiService();
```

### Prompt Completo para o Google Gemini

O prompt utilizado para o reconhecimento de produtos com o Google Gemini é o seguinte:

```
Analise esta imagem de um produto e identifique o código GTIN (código de barras), NCM (Nomenclatura Comum do Mercosul) ou SKU, além de outras informações visíveis sobre o produto.

Foque especificamente em encontrar:
1. Código GTIN/EAN (geralmente 8, 12, 13 ou 14 dígitos)
2. Código NCM (8 dígitos, formato XX.XX.XX.XX)
3. Código SKU (código de identificação do produto)
4. Nome completo do produto (nome oficial e completo do produto)
5. Descrição curta do produto (resumo breve do que é o produto)
6. Especificações técnicas detalhadas (características técnicas, materiais, funcionalidades)
7. Dimensões (comprimento, largura, altura em cm)
8. Peso (em kg ou g)
9. Volume (em litros ou ml, se aplicável)

Retorne as informações encontradas no formato JSON:
{
  "productCode": {
    "value": "código identificado",
    "type": "GTIN, NCM ou SKU"
  },
  "productInfo": {
    "productName": "nome do produto",
    "name": "nome alternativo do produto",
    "description": "descrição do produto",
    "weight": número em kg,
    "dimensions": {
      "length": número em cm,
      "width": número em cm,
      "height": número em cm
    },
    "technicalSpecs": "especificações técnicas do produto"
  }
}

Para os códigos, se encontrar mais de um tipo, priorize na ordem: GTIN, NCM, SKU.
Para as dimensões, peso e volume, extraia apenas se estiverem claramente visíveis na imagem.
Se alguma informação não estiver disponível, use null para valores numéricos ou string vazia para textos.
Seja detalhado nas especificações técnicas, incluindo todas as características relevantes do produto.
```

### Chamada da API Gemini no Componente

```javascript
// Enviar a imagem para o Gemini
console.log("Enviando imagem para o Gemini...");
const result = await GeminiService.model.generateContent([prompt, imagePart]);
const response = await result.response;
const text = response.text();

// Extrair o JSON da resposta
const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

// Processar a resposta
const data = JSON.parse(jsonString);
```

## Fluxo de Funcionamento

1. O usuário pode inserir manualmente um código SKU, NCM ou GTIN no campo de busca
2. Alternativamente, o usuário pode clicar no botão de câmera para escanear um código de barras
3. Ou o usuário pode clicar no botão de varinha mágica para fazer upload de uma imagem do produto
4. Quando uma imagem é enviada, o Google Gemini analisa a imagem e extrai informações do produto
5. O código identificado é usado para buscar informações adicionais do produto na API
6. Os dados do produto são preenchidos automaticamente nos campos da calculadora de frete

## Próximos Passos

1. Implementar integração com APIs reais de produtos (como Google Merchant, Open Food Facts)
2. Melhorar o reconhecimento de códigos de barras com bibliotecas especializadas (QuaggaJS, ZXing)
3. Adicionar suporte para histórico de produtos pesquisados
4. Implementar cache de resultados para melhorar a performance
5. Adicionar suporte para busca por voz
