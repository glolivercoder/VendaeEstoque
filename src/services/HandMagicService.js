// src/services/HandMagicService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import Tesseract from 'tesseract.js';
import axios from 'axios';

class HandMagicService {
  constructor() {
    if (HandMagicService.instance) {
      return HandMagicService.instance;
    }
    
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
      
    HandMagicService.instance = this;
  }

  // Processar imagem com reconhecimento de texto manuscrito
  async processHandwrittenText(imageFile) {
    try {
      console.log("Processando imagem com OCR para texto manuscrito...");
      
      // Extrair texto com Tesseract para melhorar a precisão
      const tesseractResult = await Tesseract.recognize(
        imageFile,
        'por', // Português
        { logger: m => console.log(m) }
      );
      
      console.log("Texto extraído com Tesseract:", tesseractResult.data.text);
      
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
      
      console.log("Enviando imagem para o Gemini...");
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      console.log("Resposta do Gemini recebida");
      
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
      console.log(`Processando texto com OpenRouter (modelo: ${model})...`);
      
      const response = await this.openRouterClient.post('/chat/completions', {
        model: model,
        messages: [
          { role: 'system', content: 'Você é um assistente especializado em análise de texto.' },
          { role: 'user', content: text }
        ]
      });
      
      console.log("Resposta do OpenRouter recebida");
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
