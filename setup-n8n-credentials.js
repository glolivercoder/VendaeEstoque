/**
 * Script para configurar credenciais no n8n
 */
import axios from 'axios';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWZhMGVkYi1iMTk5LTRmOWYtODY1My0yYWJjZTllMzQyY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ0NTAyNjMxfQ.RZB0tGBnAtQcid8R2VaKqOoqW2OsnutBEmNWmCoCAsk';
const N8N_BASE_URL = 'http://localhost:5679';

// Chaves de API
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY;

// Criar cliente axios
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY
  }
});

// Função para criar uma credencial
async function createCredential(data) {
  try {
    console.log(`Criando credencial: ${data.name}`);
    const response = await n8nApi.post('/api/v1/credentials', data);
    console.log(`Credencial criada com sucesso: ${response.data.name} (ID: ${response.data.id})`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao criar credencial: ${error.message}`);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('Iniciando configuração de credenciais...');

    // Verificar se as chaves de API estão definidas
    if (!GEMINI_API_KEY) {
      console.error('Chave de API do Gemini não encontrada no arquivo .env');
      return;
    }

    if (!DEEPSEEK_API_KEY) {
      console.error('Chave de API do Deepseek não encontrada no arquivo .env');
      return;
    }

    // Criar credencial do Gemini
    const geminiCredential = await createCredential({
      name: 'Google AI account',
      type: 'googleAiApi',
      data: {
        apiKey: GEMINI_API_KEY
      }
    });

    // Criar credencial do Deepseek
    const deepseekCredential = await createCredential({
      name: 'Deepseek API',
      type: 'httpHeaderAuth',
      data: {
        name: 'Authorization',
        value: `Bearer ${DEEPSEEK_API_KEY}`
      }
    });

    console.log('Configuração de credenciais concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a configuração de credenciais:', error);
  }
}

// Executar o script
main();
