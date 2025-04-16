/**
 * Script para iniciar o Browser-Use Web UI
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função principal
async function startWebUI() {
  console.log('Iniciando Browser-Use Web UI...');
  
  try {
    // Verificar se o diretório web-ui existe
    const webUIPath = path.join(__dirname, 'web-ui');
    if (!fs.existsSync(webUIPath)) {
      console.error('Diretório web-ui não encontrado. Execute primeiro npm run setup-webui.');
      return;
    }
    
    // Entrar no diretório web-ui
    process.chdir(webUIPath);
    
    // Verificar se o ambiente virtual existe
    const venvPath = path.join(webUIPath, '.venv');
    if (!fs.existsSync(venvPath)) {
      console.error('Ambiente virtual não encontrado. Execute primeiro npm run setup-webui.');
      return;
    }
    
    // Iniciar o Web UI
    console.log('Iniciando o servidor Web UI...');
    if (process.platform === 'win32') {
      execSync('.venv\\Scripts\\activate && python webui.py', { stdio: 'inherit', shell: true });
    } else {
      execSync('source .venv/bin/activate && python webui.py', { stdio: 'inherit', shell: true });
    }
    
  } catch (error) {
    console.error('Erro ao iniciar o Web UI:', error);
  }
}

// Executar a função principal
startWebUI().catch(console.error);
