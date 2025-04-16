/**
 * Script para instalar e configurar o Browser-Use Web UI
 * Este script automatiza o processo de instalação e configuração
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Obter o diretório atual (equivalente a __dirname no CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar interface para interação com o usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função principal
async function setupWebUI() {
  console.log('Iniciando instalação e configuração do Browser-Use Web UI...');

  try {
    // Verificar se o diretório web-ui já existe
    if (fs.existsSync(path.join(process.cwd(), 'web-ui'))) {
      console.log('Diretório web-ui já existe. Deseja removê-lo e reinstalar? (s/n)');
      const answer = await new Promise(resolve => rl.question('', resolve));

      if (answer.toLowerCase() === 's') {
        console.log('Removendo diretório web-ui existente...');
        execSync('rmdir /s /q web-ui', { stdio: 'inherit' });
      } else {
        console.log('Usando diretório web-ui existente.');
        process.chdir('web-ui');
        await configureWebUI();
        return;
      }
    }

    // Clonar o repositório
    console.log('Clonando o repositório Browser-Use Web UI...');
    execSync('git clone https://github.com/browser-use/web-ui.git', { stdio: 'inherit' });

    // Entrar no diretório
    console.log('Entrando no diretório web-ui...');
    process.chdir('web-ui');

    // Configurar o ambiente
    await configureWebUI();

  } catch (error) {
    console.error('Erro durante a instalação:', error);
  } finally {
    rl.close();
  }
}

// Função para configurar o Web UI
async function configureWebUI() {
  try {
    // Verificar se o Python está instalado
    console.log('Verificando instalação do Python...');
    try {
      execSync('python --version', { stdio: 'inherit' });
    } catch (error) {
      console.error('Python não encontrado. Por favor, instale o Python 3.11 ou superior.');
      return;
    }

    // Criar ambiente virtual
    console.log('Criando ambiente virtual Python...');
    try {
      execSync('python -m venv .venv', { stdio: 'inherit' });
    } catch (error) {
      console.error('Erro ao criar ambiente virtual:', error);
      return;
    }

    // Ativar ambiente virtual e instalar dependências
    console.log('Instalando dependências...');
    if (process.platform === 'win32') {
      execSync('.venv\\Scripts\\activate && pip install -r requirements.txt', { stdio: 'inherit', shell: true });
    } else {
      execSync('source .venv/bin/activate && pip install -r requirements.txt', { stdio: 'inherit', shell: true });
    }

    // Configurar arquivo .env
    console.log('Configurando arquivo .env...');
    if (fs.existsSync('.env.example') && !fs.existsSync('.env')) {
      fs.copyFileSync('.env.example', '.env');
      console.log('Arquivo .env criado a partir do exemplo.');
    }

    // Adicionar configurações específicas ao .env
    const envContent = fs.readFileSync('.env', 'utf8');
    let updatedEnvContent = envContent;

    // Adicionar configuração para usar o navegador Chrome instalado
    if (!envContent.includes('CHROME_PATH=')) {
      updatedEnvContent += '\n# Caminho para o Chrome instalado\n';
      updatedEnvContent += 'CHROME_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe\n';
    }

    // Adicionar configuração para manter o navegador aberto
    if (!envContent.includes('CHROME_PERSISTENT_SESSION=')) {
      updatedEnvContent += '\n# Manter o navegador aberto entre sessões\n';
      updatedEnvContent += 'CHROME_PERSISTENT_SESSION=true\n';
    }

    // Salvar as alterações
    fs.writeFileSync('.env', updatedEnvContent);

    // Instalar navegadores no Playwright
    console.log('Instalando navegadores no Playwright...');
    execSync('npx playwright install --with-deps chromium', { stdio: 'inherit' });

    console.log('\nInstalação e configuração concluídas com sucesso!');
    console.log('\nPara iniciar o Browser-Use Web UI, execute:');
    if (process.platform === 'win32') {
      console.log('.venv\\Scripts\\activate && python webui.py');
    } else {
      console.log('source .venv/bin/activate && python webui.py');
    }

    // Perguntar se deseja iniciar o Web UI agora
    console.log('\nDeseja iniciar o Browser-Use Web UI agora? (s/n)');
    const answer = await new Promise(resolve => rl.question('', resolve));

    if (answer.toLowerCase() === 's') {
      console.log('Iniciando Browser-Use Web UI...');
      if (process.platform === 'win32') {
        execSync('.venv\\Scripts\\activate && python webui.py', { stdio: 'inherit', shell: true });
      } else {
        execSync('source .venv/bin/activate && python webui.py', { stdio: 'inherit', shell: true });
      }
    }

  } catch (error) {
    console.error('Erro durante a configuração:', error);
  }
}

// Executar a função principal
setupWebUI().catch(console.error);
