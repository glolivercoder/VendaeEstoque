# HANDMAGIC - Reconhecimento de Texto Manuscrito

## Visão Geral

HANDMAGIC é uma ferramenta avançada para reconhecimento de texto manuscrito, mapas mentais e análise de conteúdo escrito à mão. Utilizando múltiplos modelos de IA, o sistema é capaz de:

1. Converter texto manuscrito (cursivo) em texto digitalizado
2. Reconhecer e estruturar mapas mentais
3. Analisar conteúdo para sugerir pesquisas relacionadas
4. Criar resumos e sínteses do material escrito
5. Resolver questões identificadas no texto

## Tecnologias Utilizadas

O HANDMAGIC integra-se com múltiplos provedores de IA:

- **Google Gemini** - Reconhecimento visual avançado
- **DeepSeek** - Processamento de linguagem natural
- **Grok** - Análise contextual
- **Arcee** - Processamento especializado
- **OpenAI** - Geração de conteúdo
- **OpenRouter** - Integração com múltiplos modelos

## Configuração de API

Para utilizar o HANDMAGIC, configure as seguintes variáveis no arquivo `.env`:

```
# Google Gemini API
VITE_GEMINI_API_KEY=sua-chave-api-gemini
VITE_GEMINI_MODEL=gemini-1.5-flash

# DeepSeek API
VITE_DEEPSEEK_API_KEY=sua-chave-api-deepseek

# OpenAI API
VITE_OPENAI_API_KEY=sua-chave-api-openai

# OpenRouter API
VITE_OPENROUTER_API_KEY=sua-chave-api-openrouter

# Outras APIs (opcionais)
VITE_GROK_API_KEY=sua-chave-api-grok
VITE_ARCEE_API_KEY=sua-chave-api-arcee
```

## Arquitetura do Sistema

O HANDMAGIC é composto por vários componentes principais:

1. **Módulo de Captura** - Responsável por capturar imagens de texto manuscrito
2. **Serviço de Reconhecimento** - Processa as imagens e extrai o texto
3. **Analisador de Conteúdo** - Interpreta o significado e estrutura do texto
4. **Interface de Usuário** - Apresenta os resultados e opções de interação
5. **Gerenciador de IA** - Coordena a comunicação com diferentes modelos de IA

### Fluxo de Processamento

1. O usuário captura uma imagem de texto manuscrito
2. A imagem é pré-processada para melhorar a qualidade
3. O texto é extraído usando OCR e modelos de visão computacional
4. O conteúdo é analisado para identificar estrutura e significado
5. Resultados são apresentados ao usuário com opções de ação

## Interface do Usuário

A interface do HANDMAGIC é projetada para ser intuitiva e funcional, oferecendo:

1. **Botão de Captura** - Permite capturar imagens da câmera ou selecionar do dispositivo
2. **Seletor de Modelo de IA** - Dropdown para escolher entre diferentes provedores de IA
3. **Painel de Visualização** - Exibe a imagem capturada e o texto reconhecido
4. **Barra de Ferramentas** - Oferece opções para diferentes tipos de análise:
   - Reconhecimento de Texto
   - Análise de Mapa Mental
   - Resumo de Conteúdo
   - Sugestões de Pesquisa
   - Resolução de Questões

### Layout da Interface

```
+-------------------------------------------------------+
|                     HANDMAGIC                         |
+-------------------------------------------------------+
|  [Capturar Imagem]    [Selecionar Modelo ▼]          |
+-------------------------------------------------------+
|                                                       |
|                                                       |
|              [Área de Visualização]                   |
|                                                       |
|                                                       |
+-------------------------------------------------------+
|  [Texto] [Mapa Mental] [Resumo] [Pesquisa] [Resolver] |
+-------------------------------------------------------+
|                                                       |
|              [Resultados / Saída]                     |
|                                                       |
+-------------------------------------------------------+
```

## Implementação Técnica

### Componentes Principais

#### 1. HandMagicService.js

Este serviço gerencia a comunicação com as APIs de IA e o processamento de imagens:

```javascript
// src/services/HandMagicService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import Tesseract from 'tesseract.js';
import axios from 'axios';

class HandMagicService {
  constructor() {
    // Inicializar APIs
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.geminiModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.geminiModel,
      generationConfig: {
        temperature: 0.2,
        topK: 1,
        topP: 1,
        maxOutputTokens: 4096,
      }
    });

    // Inicializar OpenRouter (se disponível)
    this.openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    this.openRouterClient = this.openRouterApiKey ?
      axios.create({
        baseURL: 'https://openrouter.ai/api/v1',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json'
        }
      }) : null;
  }

  // Processar imagem com reconhecimento de texto manuscrito
  async processHandwrittenText(imageFile) {
    try {
      // Extrair texto com Tesseract para melhorar a precisão
      const tesseractResult = await Tesseract.recognize(
        imageFile,
        'por', // Português
        { logger: m => console.log(m) }
      );

      // Converter imagem para base64
      const base64Image = await this.fileToBase64(imageFile);

      // Criar parte da imagem para o Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      };

      // Prompt especializado para reconhecimento de texto manuscrito
      const prompt = `Analise esta imagem que contém texto manuscrito (escrito à mão) e me retorne o texto digitalizado.

      IMPORTANTE:
      - Foque especialmente em reconhecer letras cursivas e caligrafia manual
      - Mantenha a estrutura do texto (parágrafos, listas, etc.)
      - Preserve a formatação original quando possível
      - Se houver diagramas ou mapas mentais, descreva sua estrutura
      - Considere também o texto extraído por OCR: ${tesseractResult.data.text}

      Retorne o resultado em formato Markdown, preservando a estrutura do documento original.
      Se identificar um mapa mental ou diagrama, tente representá-lo em formato de lista hierárquica.`;

      // Enviar para o Gemini
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return {
        extractedText: text,
        ocrText: tesseractResult.data.text,
        confidence: tesseractResult.data.confidence
      };
    } catch (error) {
      console.error("Erro ao processar texto manuscrito:", error);
      throw error;
    }
  }

  // Converter arquivo para base64
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

  // Usar OpenRouter para acessar diferentes modelos de IA
  async processWithOpenRouter(text, model = 'anthropic/claude-3-opus-20240229') {
    if (!this.openRouterClient) {
      throw new Error('OpenRouter API não configurada');
    }

    try {
      const response = await this.openRouterClient.post('/chat/completions', {
        model: model,
        messages: [
          { role: 'system', content: 'Você é um assistente especializado em análise de texto.' },
          { role: 'user', content: text }
        ]
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Erro ao processar com OpenRouter:', error);
      throw error;
    }
  }

  // Salvar análise no localStorage
  saveAnalysisToStorage(data) {
    try {
      const existingAnalyses = JSON.parse(localStorage.getItem('handwrittenAnalyses') || '[]');
      const analysisWithTimestamp = {
        ...data,
        createdAt: new Date().toISOString()
      };
      existingAnalyses.push(analysisWithTimestamp);
      localStorage.setItem('handwrittenAnalyses', JSON.stringify(existingAnalyses));
      return analysisWithTimestamp;
    } catch (error) {
      console.error("Erro ao salvar análise:", error);
      throw error;
    }
  }
}

export default new HandMagicService();
```

#### 2. HandMagicButton.jsx

Componente de botão para captura de imagens e processamento:

```javascript
// src/components/HandMagicButton.jsx
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import HandMagicService from '../services/HandMagicService';
import ImageSourceSelector from './ImageSourceSelector';

const HandMagicButton = ({ onTextExtracted }) => {
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

    // Mostrar seletor de fonte de imagem
    const modalRoot = document.createElement('div');
    modalRoot.id = 'image-source-modal';
    document.body.appendChild(modalRoot);

    const modalContainer = ReactDOM.createRoot(modalRoot);
    modalContainer.render(
      <ImageSourceSelector
        onSelect={handleSelectSource}
        onCancel={() => {
          modalContainer.unmount();
          document.body.removeChild(modalRoot);
        }}
      />
    );
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // Processar a imagem com o HandMagicService
      const analysisResult = await HandMagicService.processHandwrittenText(file);

      console.log("Texto extraído:", analysisResult);

      // Salvar a análise no localStorage
      HandMagicService.saveAnalysisToStorage(analysisResult);

      // Chamar o callback com o texto extraído
      if (onTextExtracted) {
        onTextExtracted(analysisResult);
      }

      // Mostrar mensagem de sucesso
      const confianca = analysisResult.confidence ?
        `Confiança OCR: ${Math.round(analysisResult.confidence)}%` : '';

      alert(`Texto extraído com sucesso!\n${confianca}`);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      setError(err.message || 'Erro ao processar a imagem. Tente novamente.');
      alert(`Erro: ${err.message || 'Falha ao processar a imagem'}`);
    } finally {
      setIsLoading(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleButtonClick}
        disabled={isLoading}
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        aria-label="Capturar texto manuscrito"
      >
        {/* Ícone de varinha mágica */}
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
          <path d="M15 4V2"></path>
          <path d="M15 16v-2"></path>
          <path d="M8 9h2"></path>
          <path d="M20 9h2"></path>
          <path d="M17.8 11.8L19 13"></path>
          <path d="M15 9h0"></path>
          <path d="M17.8 6.2L19 5"></path>
          <path d="M3 21l9-9"></path>
          <path d="M12.2 6.2L11 5"></path>
        </svg>
        {isLoading ? 'Processando...' : 'Hand Magic'}
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

HandMagicButton.propTypes = {
  onTextExtracted: PropTypes.func
};

export default HandMagicButton;
```

#### 3. HandMagicPanel.jsx

Painel principal para exibição e interação com o texto reconhecido:

```javascript
// src/components/HandMagicPanel.jsx
import { useState, useEffect } from 'react';
import HandMagicButton from './HandMagicButton';
import HandMagicService from '../services/HandMagicService';
import ReactMarkdown from 'react-markdown';

const HandMagicPanel = () => {
  const [extractedText, setExtractedText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [processingMode, setProcessingMode] = useState('text');
  const [isProcessing, setIsProcessing] = useState(false);

  // Modelos disponíveis
  const availableModels = [
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'grok', name: 'Grok' },
    { id: 'arcee', name: 'Arcee' },
    { id: 'openai', name: 'OpenAI' },
    { id: 'openrouter/anthropic/claude-3-opus', name: 'Claude 3 Opus' },
    { id: 'openrouter/meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
    { id: 'openrouter/mistral/mistral-large', name: 'Mistral Large' }
  ];

  // Modos de processamento
  const processingModes = [
    { id: 'text', name: 'Texto', icon: '📝' },
    { id: 'mindmap', name: 'Mapa Mental', icon: '🧠' },
    { id: 'summary', name: 'Resumo', icon: '📋' },
    { id: 'research', name: 'Pesquisa', icon: '🔍' },
    { id: 'solve', name: 'Resolver', icon: '✅' }
  ];

  // Função para lidar com o texto extraído
  const handleTextExtracted = (result) => {
    setExtractedText(result.extractedText);
    setProcessedText(''); // Limpar processamento anterior
  };

  // Função para processar o texto com base no modo selecionado
  const processText = async () => {
    if (!extractedText) return;

    setIsProcessing(true);

    try {
      let prompt = '';

      // Definir o prompt com base no modo de processamento
      switch (processingMode) {
        case 'mindmap':
          prompt = `Analise o seguinte texto e crie um mapa mental estruturado em formato Markdown. Use listas hierárquicas para representar a estrutura do mapa mental:\n\n${extractedText}`;
          break;
        case 'summary':
          prompt = `Faça um resumo conciso e bem estruturado do seguinte texto, destacando os pontos principais:\n\n${extractedText}`;
          break;
        case 'research':
          prompt = `Com base no seguinte texto, sugira 5 tópicos de pesquisa relacionados que poderiam aprofundar o conhecimento sobre o assunto. Para cada tópico, forneça uma breve justificativa:\n\n${extractedText}`;
          break;
        case 'solve':
          prompt = `Analise o seguinte texto que pode conter questões ou problemas. Identifique qualquer questão ou problema presente e forneça soluções detalhadas:\n\n${extractedText}`;
          break;
        default: // text
          prompt = `Analise o seguinte texto e melhore sua formatação, corrigindo possíveis erros de reconhecimento. Mantenha o conteúdo original, apenas melhore a estrutura e formatação:\n\n${extractedText}`;
      }

      // Processar com o modelo selecionado
      let result = '';

      if (selectedModel.startsWith('openrouter/')) {
        // Usar OpenRouter
        const modelId = selectedModel.replace('openrouter/', '');
        result = await HandMagicService.processWithOpenRouter(prompt, modelId);
      } else {
        // Usar Gemini por padrão (implementar outros modelos conforme necessário)
        const response = await HandMagicService.model.generateContent(prompt);
        result = response.response.text();
      }

      setProcessedText(result);
    } catch (error) {
      console.error('Erro ao processar texto:', error);
      alert(`Erro ao processar texto: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para copiar texto para a área de transferência
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Texto copiado para a área de transferência!'))
      .catch(err => console.error('Erro ao copiar texto:', err));
  };

  // Função para exportar como arquivo de texto
  const exportAsTextFile = (text, filename = 'texto-extraido.txt') => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Hand Magic - Reconhecimento de Texto</h2>
        <HandMagicButton onTextExtracted={handleTextExtracted} />
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
            Modelo de IA
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isProcessing}
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Área de visualização */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Texto Extraído</h3>
          <div className="border rounded-md p-4 h-64 overflow-y-auto bg-gray-50">
            {extractedText ? (
              <ReactMarkdown>{extractedText}</ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">Capture uma imagem para extrair texto...</p>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => copyToClipboard(extractedText)}
              disabled={!extractedText}
              className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded mr-2 hover:bg-gray-300 disabled:opacity-50"
            >
              Copiar
            </button>
            <button
              onClick={() => exportAsTextFile(extractedText)}
              disabled={!extractedText}
              className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Exportar
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Resultado Processado</h3>
          <div className="border rounded-md p-4 h-64 overflow-y-auto bg-gray-50">
            {processedText ? (
              <ReactMarkdown>{processedText}</ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">Selecione um modo de processamento e clique em "Processar"...</p>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => copyToClipboard(processedText)}
              disabled={!processedText}
              className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded mr-2 hover:bg-gray-300 disabled:opacity-50"
            >
              Copiar
            </button>
            <button
              onClick={() => exportAsTextFile(processedText, `${processingMode}-processado.txt`)}
              disabled={!processedText}
              className="text-sm px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Barra de ferramentas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {processingModes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setProcessingMode(mode.id)}
            className={`flex items-center px-3 py-2 rounded-md ${
              processingMode === mode.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={isProcessing}
          >
            <span className="mr-1">{mode.icon}</span>
            {mode.name}
          </button>
        ))}
      </div>

      {/* Botão de processamento */}
      <div className="flex justify-center">
        <button
          onClick={processText}
          disabled={!extractedText || isProcessing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Processando...' : 'Processar'}
        </button>
      </div>
    </div>
  );
};

export default HandMagicPanel;
```

## Integração com o Aplicativo

Para integrar o HANDMAGIC ao aplicativo existente, adicione o componente `HandMagicPanel` a uma nova rota ou página:

```javascript
// Em App.jsx ou seu arquivo de rotas
import HandMagicPanel from './components/HandMagicPanel';

// ...

<Route path="/handmagic" element={<HandMagicPanel />} />
```

Ou adicione um botão no menu principal para acessar a funcionalidade:

```javascript
<button onClick={() => navigate('/handmagic')} className="menu-button">
  <span className="icon">✨</span>
  <span className="text">Hand Magic</span>
</button>
```

## Prompts Especializados

O HANDMAGIC utiliza prompts especializados para diferentes tipos de análise:

### 1. Reconhecimento de Texto Manuscrito

```
Analise esta imagem que contém texto manuscrito (escrito à mão) e me retorne o texto digitalizado.

IMPORTANTE:
- Foque especialmente em reconhecer letras cursivas e caligrafia manual
- Mantenha a estrutura do texto (parágrafos, listas, etc.)
- Preserve a formatação original quando possível
- Se houver diagramas ou mapas mentais, descreva sua estrutura

Retorne o resultado em formato Markdown, preservando a estrutura do documento original.
```

### 2. Análise de Mapas Mentais

```
Analise esta imagem que contém um mapa mental ou diagrama escrito à mão.

IMPORTANTE:
- Identifique o tema central e os tópicos principais
- Capture a hierarquia e relações entre os elementos
- Preserve a estrutura organizacional do mapa mental
- Converta para um formato de lista hierárquica em Markdown

Retorne o resultado como uma representação estruturada do mapa mental.
```

### 3. Resolução de Questões

```
Analise esta imagem que contém questões ou problemas escritos à mão.

IMPORTANTE:
- Identifique cada questão ou problema presente
- Forneça uma solução detalhada para cada um
- Explique o raciocínio por trás de cada solução
- Se for uma questão matemática, mostre os passos do cálculo

Retorne o resultado em formato Markdown, com cada questão e sua respectiva solução.
```

## Conclusão

O HANDMAGIC oferece uma solução completa para reconhecimento e análise de texto manuscrito, aproveitando o poder de múltiplos modelos de IA. A ferramenta é especialmente útil para:

- Digitalização de notas manuscritas
- Conversão de mapas mentais em formato digital
- Análise e resolução de questões escritas à mão
- Geração de resumos e sugestões de pesquisa

Ao integrar esta funcionalidade ao aplicativo existente, os usuários ganham uma poderosa ferramenta para trabalhar com conteúdo manuscrito de forma eficiente e produtiva.
