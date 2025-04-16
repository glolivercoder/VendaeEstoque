/**
 * Script para configurar o Chevereto e o subdomínio "imagens" usando o Browser-Use Web UI
 * Este script deve ser executado após a instalação do Web UI
 */
import { config } from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Inicializar dotenv
config();

// Obter o diretório atual (equivalente a __dirname no CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar interface para interação com o usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função principal
async function configureChevereto() {
  console.log('Iniciando configuração do Chevereto e subdomínio "imagens"...');

  try {
    // Verificar se o Web UI está instalado
    if (!fs.existsSync(path.join(process.cwd(), 'web-ui'))) {
      console.log('Web UI não encontrado. Execute primeiro o script setup-web-ui.js.');
      return;
    }

    // Obter credenciais do arquivo .env
    const hostingerEmail = await askQuestion('Email da Hostinger: ', process.env.HOSTINGER_EMAIL);
    const hostingerPassword = await askQuestion('Senha da Hostinger: ', process.env.HOSTINGER_PASSWORD);
    const domain = await askQuestion('Domínio principal (ex: achadinhoshopp.com.br): ', process.env.DOMAIN || 'achadinhoshopp.com.br');
    const subdomain = await askQuestion('Subdomínio para o Chevereto (ex: imagens): ', 'imagens');

    // Obter credenciais do banco de dados
    const dbName = await askQuestion('Nome do banco de dados: ', process.env.VITE_DB_NAME || 'chevereto');
    const dbUser = await askQuestion('Usuário do banco de dados: ', process.env.VITE_DB_USER || 'gloliverx');
    const dbPassword = await askQuestion('Senha do banco de dados: ', process.env.VITE_DB_PASSWORD || 'Fml/N?|ZP*r9');

    // Criar script Python para o Browser-Use Web UI
    console.log('Criando script Python para o Browser-Use Web UI...');
    const scriptPath = path.join(process.cwd(), 'web-ui', 'chevereto_setup.py');

    const pythonScript = `
import os
import time
from browser_use import BrowserUse

# Configurações
HOSTINGER_EMAIL = "${hostingerEmail}"
HOSTINGER_PASSWORD = "${hostingerPassword}"
DOMAIN = "${domain}"
SUBDOMAIN = "${subdomain}"
DB_NAME = "${dbName}"
DB_USER = "${dbUser}"
DB_PASSWORD = "${dbPassword}"

def setup_chevereto():
    print("Iniciando configuração do Chevereto com Browser-Use Web UI...")

    # Inicializar o navegador
    browser = BrowserUse(headless=False)

    try:
        # 1. Login no painel da Hostinger
        print("Fazendo login no painel da Hostinger...")
        browser.goto("https://hpanel.hostinger.com/login")
        browser.wait_for_selector("#email")
        browser.fill("#email", HOSTINGER_EMAIL)
        browser.fill("#password", HOSTINGER_PASSWORD)
        browser.click('button[type="submit"]')

        # Aguardar navegação e verificar se o login foi bem-sucedido
        browser.wait_for_navigation()

        if "login" in browser.current_url():
            raise Exception("Falha no login. Verifique suas credenciais.")

        print("Login realizado com sucesso!")

        # 2. Navegar até o gerenciador de banco de dados
        print("Navegando até o gerenciador de banco de dados...")
        browser.goto(f"https://hpanel.hostinger.com/hosting/{DOMAIN}/advanced/mysql")
        time.sleep(3)  # Aguardar carregamento da página

        # 3. Criar banco de dados
        print(f"Criando banco de dados {DB_NAME}...")

        # Verificar se o botão "Create a database" está visível
        create_db_button = browser.query_selector('button:has-text("Create a database"), button:has-text("Criar banco de dados")')
        if create_db_button:
            browser.click('button:has-text("Create a database"), button:has-text("Criar banco de dados")')

            # Preencher formulário de criação de banco de dados
            browser.wait_for_selector('input[name="name"]')
            browser.fill('input[name="name"]', DB_NAME)

            # Clicar no botão de criar
            browser.click('button:has-text("Create"), button:has-text("Criar")')

            # Aguardar notificação de sucesso
            browser.wait_for_selector('.notification-success, .alert-success', timeout=10000)

            print(f"Banco de dados {DB_NAME} criado com sucesso!")
        else:
            print("Botão de criação de banco de dados não encontrado. O banco de dados pode já existir.")

        # 4. Criar subdomínio
        print(f"Criando subdomínio {SUBDOMAIN}...")
        browser.goto(f"https://hpanel.hostinger.com/hosting/{DOMAIN}/domains/subdomains")
        time.sleep(3)  # Aguardar carregamento da página

        # Verificar se o botão "Create" está visível
        create_subdomain_button = browser.query_selector('button:has-text("Create"), button:has-text("Criar")')
        if create_subdomain_button:
            browser.click('button:has-text("Create"), button:has-text("Criar")')

            # Preencher formulário de criação de subdomínio
            browser.wait_for_selector('input[name="prefix"]')
            browser.fill('input[name="prefix"]', SUBDOMAIN)
            browser.fill('input[name="path"]', f"public_html/{SUBDOMAIN}")

            # Clicar no botão de criar
            browser.click('button:has-text("Create"), button:has-text("Criar")')

            # Aguardar notificação de sucesso
            browser.wait_for_selector('.notification-success, .alert-success', timeout=10000)

            print(f"Subdomínio {SUBDOMAIN}.{DOMAIN} criado com sucesso!")
        else:
            print("Botão de criação de subdomínio não encontrado. O subdomínio pode já existir.")

        # 5. Fazer upload dos arquivos (opcional - pode ser feito manualmente)
        print("Para completar a instalação do Chevereto:")
        print(f"1. Faça upload dos arquivos do Chevereto para public_html/{SUBDOMAIN}/")
        print(f"2. Acesse https://{SUBDOMAIN}.{DOMAIN}/install")
        print(f"3. Use as seguintes credenciais de banco de dados:")
        print(f"   - Host: localhost")
        print(f"   - Nome do banco: {DB_NAME}")
        print(f"   - Usuário: {DB_USER}")
        print(f"   - Senha: {DB_PASSWORD}")

        # Manter o navegador aberto para inspeção manual
        input("Pressione Enter para fechar o navegador...")

    except Exception as e:
        print(f"Erro durante a configuração: {e}")
    finally:
        # Fechar o navegador
        browser.close()

if __name__ == "__main__":
    setup_chevereto()
`;

    fs.writeFileSync(scriptPath, pythonScript);
    console.log(`Script Python criado em ${scriptPath}`);

    // Executar o script Python
    console.log('\nDeseja executar o script de configuração agora? (s/n)');
    const answer = await new Promise(resolve => rl.question('', resolve));

    if (answer.toLowerCase() === 's') {
      console.log('Executando script de configuração...');
      process.chdir('web-ui');
      if (process.platform === 'win32') {
        execSync('.venv\\Scripts\\activate && python chevereto_setup.py', { stdio: 'inherit', shell: true });
      } else {
        execSync('source .venv/bin/activate && python chevereto_setup.py', { stdio: 'inherit', shell: true });
      }
    }

    console.log('\nConfiguração concluída!');

  } catch (error) {
    console.error('Erro durante a configuração:', error);
  } finally {
    rl.close();
  }
}

// Função auxiliar para perguntas
function askQuestion(question, defaultValue = '') {
  return new Promise(resolve => {
    const defaultText = defaultValue ? ` (${defaultValue})` : '';
    rl.question(`${question}${defaultText}: `, answer => {
      resolve(answer || defaultValue);
    });
  });
}

// Executar a função principal
configureChevereto().catch(console.error);
