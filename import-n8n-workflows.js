/**
 * Script para importar workflows no n8n
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWZhMGVkYi1iMTk5LTRmOWYtODY1My0yYWJjZTllMzQyY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ0NTAyNjMxfQ.RZB0tGBnAtQcid8R2VaKqOoqW2OsnutBEmNWmCoCAsk';
const N8N_BASE_URL = 'http://localhost:5679';

// Diretório dos workflows
const WORKFLOWS_DIR = path.join(__dirname, 'n8n-workflows');

// Criar cliente axios
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY
  }
});

// Função para importar um workflow
async function importWorkflow(filePath) {
  try {
    const fileName = path.basename(filePath);
    console.log(`Importando workflow: ${fileName}`);

    // Ler o arquivo JSON
    const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Enviar para o n8n
    const response = await n8nApi.post('/api/v1/workflows', workflowData);

    console.log(`Workflow importado com sucesso: ${response.data.name} (ID: ${response.data.id})`);

    // Ativar o workflow
    await n8nApi.post(`/api/v1/workflows/${response.data.id}/activate`);
    console.log(`Workflow ativado: ${response.data.name}`);

    return response.data;
  } catch (error) {
    console.error(`Erro ao importar workflow: ${error.message}`);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('Iniciando importação de workflows...');

    // Verificar se o diretório existe
    if (!fs.existsSync(WORKFLOWS_DIR)) {
      console.error(`Diretório não encontrado: ${WORKFLOWS_DIR}`);
      return;
    }

    // Listar arquivos JSON no diretório
    const files = fs.readdirSync(WORKFLOWS_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(WORKFLOWS_DIR, file));

    console.log(`Encontrados ${files.length} arquivos de workflow para importar.`);

    // Importar cada workflow
    for (const file of files) {
      await importWorkflow(file);
    }

    console.log('Importação de workflows concluída com sucesso!');

    // Exibir URLs dos webhooks
    console.log('\nURLs dos webhooks:');
    console.log(`Sincronização de Produtos: ${N8N_BASE_URL}/webhook/pdv-vendas/produtos`);
    console.log(`Sincronização de Estoque (WooCommerce → PDV): ${N8N_BASE_URL}/webhook/woocommerce/estoque`);
    console.log(`Sincronização de Estoque (PDV → WooCommerce): ${N8N_BASE_URL}/webhook/pdv-vendas/estoque`);
    console.log(`Gerenciamento com IA: ${N8N_BASE_URL}/webhook/pdv-vendas/ai-manager`);
    console.log(`Análise de Produtos: ${N8N_BASE_URL}/webhook/pdv-vendas/analise-produto`);
  } catch (error) {
    console.error('Erro durante a importação de workflows:', error);
  }
}

// Executar o script
main();
