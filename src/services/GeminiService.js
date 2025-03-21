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

  async processImage(imageFile) {
    try {
      console.log("Processando imagem com OCR...");
      
      // Primeiro, extrair texto com Tesseract para melhorar a precisão
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
      
      // Prompt para o Gemini
      const prompt = `Analise esta imagem de um documento e me retorne um JSON com os campos encontrados.
      Identifique os seguintes campos específicos:
      - Nome Completo
      - CPF
      - RG
      - Data de Expedição
      - Data de Nascimento
      - Naturalidade
      - Filiação (Nome do Pai e Nome da Mãe)
      
      Considere também o texto extraído por OCR: ${tesseractResult.data.text}
      
      IMPORTANTE: Para os campos de data, use sempre o formato DD/MM/YYYY (exemplo: 15/01/2020).
      
      O JSON deve seguir este formato:
      {
        "documentType": "Documento de Identificação",
        "confidence": 0.95,
        "fields": [
          {
            "name": "nomeCompleto",
            "type": "texto",
            "label": "Nome Completo",
            "value": "",
            "confidence": 0.9
          },
          {
            "name": "cpf",
            "type": "texto",
            "label": "CPF",
            "value": "",
            "confidence": 0.9
          },
          {
            "name": "rg",
            "type": "texto",
            "label": "RG",
            "value": "",
            "confidence": 0.9
          },
          {
            "name": "dataExpedicao",
            "type": "data",
            "label": "Data de Expedição",
            "value": "",
            "confidence": 0.9
          },
          {
            "name": "dataNascimento",
            "type": "data",
            "label": "Data de Nascimento",
            "value": "",
            "confidence": 0.9
          },
          {
            "name": "naturalidade",
            "type": "texto",
            "label": "Naturalidade",
            "value": "",
            "confidence": 0.9
          },
          {
            "name": "nomePai",
            "type": "texto",
            "label": "Nome do Pai",
            "value": "",
            "confidence": 0.9
          },
          {
            "name": "nomeMae",
            "type": "texto",
            "label": "Nome da Mãe",
            "value": "",
            "confidence": 0.9
          }
        ]
      }`;
      
      console.log("Enviando imagem para o Gemini...");
      const result = await this.model.generateContent([prompt, imagePart]);
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
        throw new Error("Não foi possível extrair informações do documento");
      }
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      throw error;
    }
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
  
  mapFieldsToClientForm(data) {
    const mappedData = {};
    
    if (!data || !data.fields) {
      return mappedData;
    }
    
    const fieldMap = {
      nomeCompleto: 'name',
      cpf: 'cpf',
      rg: 'rg',
      dataExpedicao: 'issueDate',
      dataNascimento: 'birthDate',
      naturalidade: 'birthPlace',
      nomePai: 'fatherName',
      nomeMae: 'motherName'
    };
    
    data.fields.forEach(field => {
      const formField = fieldMap[field.name];
      if (formField && field.value) {
        // Converter formatos de data se necessário
        if (field.name === 'dataNascimento' || field.name === 'dataExpedicao') {
          mappedData[formField] = this.convertDateFormat(field.value);
        } 
        // Formatar CPF
        else if (field.name === 'cpf') {
          mappedData[formField] = this.formatCPF(field.value);
        }
        // Formatar RG (remover pontos e traços)
        else if (field.name === 'rg') {
          mappedData[formField] = this.formatRG(field.value);
        }
        else {
          mappedData[formField] = field.value;
        }
      }
    });
    
    return mappedData;
  }
  
  // Método para converter formato de data de DD/MM/YYYY para YYYY-MM-DD
  convertDateFormat(dateString) {
    // Verificar se a string está vazia
    if (!dateString || dateString.trim() === '') {
      return '';
    }
    
    try {
      // Tentar diferentes formatos de data
      
      // Formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
      }
      
      // Formato D/M/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
        const parts = dateString.split('/');
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
      
      // Formato DD.MM.YYYY
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('.');
        return `${year}-${month}-${day}`;
      }
      
      // Formato DD-MM-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      }
      
      // Formato textual (ex: "15 de Janeiro de 2020")
      const months = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
      };
      
      const textMatch = dateString.match(/(\d{1,2})\s+de\s+([^\s]+)\s+de\s+(\d{4})/i);
      if (textMatch) {
        const day = textMatch[1].padStart(2, '0');
        const monthText = textMatch[2].toLowerCase();
        const month = months[monthText] || '01';
        const year = textMatch[3];
        return `${year}-${month}-${day}`;
      }
      
      // Se já estiver no formato YYYY-MM-DD, retornar como está
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Se não conseguir converter, retornar a string original
      console.warn('Formato de data não reconhecido:', dateString);
      return dateString;
    } catch (error) {
      console.error('Erro ao converter formato de data:', error);
      return dateString;
    }
  }
  
  // Método para formatar CPF
  formatCPF(cpf) {
    if (!cpf) return '';
    
    // Remover todos os caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    
    // Se não tiver 11 dígitos, retornar como está
    if (numbers.length !== 11) {
      return cpf;
    }
    
    // Formatar como XXX.XXX.XXX-XX
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  // Método para formatar RG
  formatRG(rg) {
    if (!rg) return '';
    
    // Remover caracteres especiais, mantendo apenas números e letras
    return rg.replace(/[^\w]/g, '');
  }
  
  // Método para salvar os dados no localStorage em vez do banco de dados
  saveAnalysisToStorage(data) {
    try {
      // Obter análises existentes ou iniciar um array vazio
      const existingAnalyses = JSON.parse(localStorage.getItem('documentAnalyses') || '[]');
      
      // Adicionar timestamp
      const analysisWithTimestamp = {
        ...data,
        createdAt: new Date().toISOString()
      };
      
      // Adicionar à lista
      existingAnalyses.push(analysisWithTimestamp);
      
      // Salvar de volta no localStorage
      localStorage.setItem('documentAnalyses', JSON.stringify(existingAnalyses));
      
      return analysisWithTimestamp;
    } catch (error) {
      console.error("Erro ao salvar análise:", error);
      throw error;
    }
  }
}

export default new GeminiService(); 