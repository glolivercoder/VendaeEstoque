/**
 * Script para registrar logs da integração entre n8n e o aplicativo
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
dotenv.config();

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração
const N8N_API_KEY = process.env.VITE_N8N_API_KEY;
const N8N_BASE_URL = 'http://localhost:5679';
const LOG_DIR = path.join(__dirname, 'logs');
const SYSTEM_LOG_DIR = path.join(__dirname, 'system-logs');

// Criar diretórios de logs se não existirem
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

if (!fs.existsSync(SYSTEM_LOG_DIR)) {
  fs.mkdirSync(SYSTEM_LOG_DIR, { recursive: true });
}

// Função para registrar logs
function logMessage(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
  
  // Registrar no console
  console.log(logEntry);
  
  // Registrar no arquivo de log
  const logFile = path.join(LOG_DIR, `${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logEntry);
  
  // Registrar no arquivo de log do sistema
  const systemLogFile = path.join(SYSTEM_LOG_DIR, `${new Date().toISOString().split('T')[0]}-system.log`);
  fs.appendFileSync(systemLogFile, logEntry);
}

// Função para verificar o status do n8n
async function checkN8nStatus() {
  try {
    logMessage('Verificando status do n8n...');
    
    const response = await axios.get(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      }
    });
    
    logMessage(`n8n está online. ${response.data.length} workflows encontrados.`);
    return true;
  } catch (error) {
    logMessage(`Erro ao verificar status do n8n: ${error.message}`, 'error');
    return false;
  }
}

// Função para verificar o status dos webhooks
async function checkWebhooks() {
  const webhooks = [
    { name: 'Sincronização de Produtos', path: 'pdv-vendas/produtos' },
    { name: 'Sincronização de Estoque (WooCommerce → PDV)', path: 'woocommerce/estoque' },
    { name: 'Sincronização de Estoque (PDV → WooCommerce)', path: 'pdv-vendas/estoque' },
    { name: 'Gerenciamento com IA', path: 'pdv-vendas/ai-manager' },
    { name: 'Análise de Produtos', path: 'pdv-vendas/analise-produto' }
  ];
  
  logMessage('Verificando status dos webhooks...');
  
  for (const webhook of webhooks) {
    try {
      const response = await axios.get(`${N8N_BASE_URL}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY
        },
        params: {
          filter: webhook.name
        }
      });
      
      if (response.data.length > 0) {
        const workflow = response.data[0];
        logMessage(`Webhook ${webhook.name} encontrado (ID: ${workflow.id}, Ativo: ${workflow.active})`);
      } else {
        logMessage(`Webhook ${webhook.name} não encontrado`, 'warning');
      }
    } catch (error) {
      logMessage(`Erro ao verificar webhook ${webhook.name}: ${error.message}`, 'error');
    }
  }
}

// Função para registrar informações do sistema
function logSystemInfo() {
  logMessage('Registrando informações do sistema...');
  
  // Informações do Node.js
  logMessage(`Node.js: ${process.version}`);
  logMessage(`Plataforma: ${process.platform}`);
  logMessage(`Arquitetura: ${process.arch}`);
  
  // Informações do ambiente
  logMessage(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logMessage(`n8n URL: ${N8N_BASE_URL}`);
  
  // Informações das APIs
  logMessage(`Gemini API configurada: ${process.env.VITE_GEMINI_API_KEY ? 'Sim' : 'Não'}`);
  logMessage(`Deepseek API configurada: ${process.env.VITE_DEEPSEEK_API_KEY ? 'Sim' : 'Não'}`);
}

// Função para testar a conexão com as APIs
async function testApiConnections() {
  logMessage('Testando conexão com as APIs...');
  
  // Testar Gemini API
  if (process.env.VITE_GEMINI_API_KEY) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.VITE_GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Olá, teste de conexão.' }]
            }
          ]
        }
      );
      
      logMessage('Conexão com Gemini API bem-sucedida');
    } catch (error) {
      logMessage(`Erro ao conectar com Gemini API: ${error.message}`, 'error');
    }
  }
  
  // Testar Deepseek API
  if (process.env.VITE_DEEPSEEK_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: 'Olá, teste de conexão.'
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.VITE_DEEPSEEK_API_KEY}`
          }
        }
      );
      
      logMessage('Conexão com Deepseek API bem-sucedida');
    } catch (error) {
      logMessage(`Erro ao conectar com Deepseek API: ${error.message}`, 'error');
    }
  }
}

// Função principal
async function main() {
  logMessage('Iniciando verificação da integração n8n...');
  
  // Registrar informações do sistema
  logSystemInfo();
  
  // Verificar status do n8n
  const n8nOnline = await checkN8nStatus();
  
  if (n8nOnline) {
    // Verificar status dos webhooks
    await checkWebhooks();
    
    // Testar conexão com as APIs
    await testApiConnections();
  }
  
  logMessage('Verificação da integração n8n concluída');
}

// Executar o script
main().catch(error => {
  logMessage(`Erro durante a execução: ${error.message}`, 'error');
});
