/**
 * Script de automação para deploy do Chevereto na Hostinger
 * Este script usa o Puppeteer para automatizar o processo de deploy
 */
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

/**
 * Função principal para deploy do Chevereto
 */
async function deployChevereto() {
  console.log('Iniciando deploy do Chevereto...');
  
  // Verificar variáveis de ambiente
  checkEnvVariables();
  
  const browser = await puppeteer.launch({
    headless: false, // Para visualizar o processo
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. Login no painel da Hostinger
    console.log('Fazendo login no painel da Hostinger...');
    await page.goto('https://hpanel.hostinger.com/login');
    await page.waitForSelector('#email');
    await page.type('#email', process.env.HOSTINGER_EMAIL);
    await page.type('#password', process.env.HOSTINGER_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Aguardar navegação e verificar se o login foi bem-sucedido
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    if (page.url().includes('login')) {
      throw new Error('Falha no login. Verifique suas credenciais.');
    }
    
    console.log('Login realizado com sucesso!');
    
    // 2. Navegar até o gerenciador de banco de dados
    console.log('Navegando até o gerenciador de banco de dados...');
    await page.goto(`https://hpanel.hostinger.com/hosting/${process.env.DOMAIN}/advanced/mysql`);
    await page.waitForTimeout(3000); // Aguardar carregamento da página
    
    // 3. Criar banco de dados
    console.log('Criando banco de dados para o Chevereto...');
    
    // Verificar se o botão "Create a database" está visível
    const createDbButtonSelector = 'button:has-text("Create a database"), button:has-text("Criar banco de dados")';
    await page.waitForSelector(createDbButtonSelector, { timeout: 10000 });
    await page.click(createDbButtonSelector);
    
    // Preencher formulário de criação de banco de dados
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', process.env.DB_NAME);
    
    // Clicar no botão de criar
    const createButtonSelector = 'button:has-text("Create"), button:has-text("Criar")';
    await page.click(createButtonSelector);
    
    // Aguardar notificação de sucesso
    await page.waitForSelector('.notification-success, .alert-success', { timeout: 10000 });
    
    console.log('Banco de dados criado com sucesso!');
    
    // 4. Obter credenciais do banco de dados
    const dbCredentials = await page.evaluate(() => {
      // Adapte esses seletores conforme necessário para a interface atual da Hostinger
      const dbNameElement = document.querySelector('.database-name, .db-name');
      const dbUserElement = document.querySelector('.database-user, .db-user');
      const dbPassElement = document.querySelector('.database-password, .db-password');
      
      return {
        dbName: dbNameElement ? dbNameElement.textContent.trim() : '',
        dbUser: dbUserElement ? dbUserElement.textContent.trim() : '',
        dbPass: dbPassElement ? dbPassElement.textContent.trim() : ''
      };
    });
    
    console.log('Credenciais do banco de dados obtidas:', {
      dbName: dbCredentials.dbName,
      dbUser: dbCredentials.dbUser,
      dbPass: dbCredentials.dbPass ? '********' : 'Não encontrada'
    });
    
    // Salvar as credenciais em um arquivo seguro
    const dbConfigPath = path.join(__dirname, 'configs/db-config.json');
    fs.ensureDirSync(path.dirname(dbConfigPath));
    fs.writeFileSync(dbConfigPath, JSON.stringify(dbCredentials, null, 2));
    console.log(`Credenciais salvas em ${dbConfigPath}`);
    
    // 5. Criar subdomínio
    console.log('Criando subdomínio para o Chevereto...');
    await page.goto(`https://hpanel.hostinger.com/hosting/${process.env.DOMAIN}/domains/subdomains`);
    await page.waitForTimeout(3000); // Aguardar carregamento da página
    
    // Verificar se o botão "Create" está visível
    const createSubdomainButtonSelector = 'button:has-text("Create"), button:has-text("Criar")';
    await page.waitForSelector(createSubdomainButtonSelector, { timeout: 10000 });
    await page.click(createSubdomainButtonSelector);
    
    // Preencher formulário de criação de subdomínio
    await page.waitForSelector('input[name="prefix"]');
    await page.type('input[name="prefix"]', process.env.SUBDOMAIN);
    await page.type('input[name="path"]', `public_html/${process.env.SUBDOMAIN}`);
    
    // Clicar no botão de criar
    await page.click(createSubdomainButtonSelector);
    
    // Aguardar notificação de sucesso
    await page.waitForSelector('.notification-success, .alert-success', { timeout: 10000 });
    
    console.log('Subdomínio criado com sucesso!');
    
    // 6. Fazer upload dos arquivos (usando o gerenciador de arquivos)
    console.log('Navegando para o gerenciador de arquivos...');
    await page.goto(`https://hpanel.hostinger.com/hosting/${process.env.DOMAIN}/filemanager`);
    await page.waitForTimeout(5000); // Aguardar carregamento da página
    
    // Navegar até o diretório do subdomínio
    console.log(`Navegando até o diretório public_html/${process.env.SUBDOMAIN}...`);
    await page.click('a:has-text("public_html")');
    await page.waitForTimeout(2000);
    
    // Verificar se o diretório do subdomínio existe
    const subdomainDirExists = await page.evaluate((subdomain) => {
      const elements = Array.from(document.querySelectorAll('td.name'));
      return elements.some(el => el.textContent.trim() === subdomain);
    }, process.env.SUBDOMAIN);
    
    if (!subdomainDirExists) {
      console.log(`Diretório ${process.env.SUBDOMAIN} não encontrado. Criando...`);
      await page.click('button:has-text("New Folder"), button:has-text("Nova Pasta")');
      await page.waitForSelector('input[name="name"]');
      await page.type('input[name="name"]', process.env.SUBDOMAIN);
      await page.click('button:has-text("Create"), button:has-text("Criar")');
      await page.waitForTimeout(2000);
    }
    
    // Entrar no diretório do subdomínio
    await page.click(`a:has-text("${process.env.SUBDOMAIN}")`);
    await page.waitForTimeout(2000);
    
    // Fazer upload do arquivo ZIP
    console.log('Fazendo upload do arquivo ZIP...');
    
    // Clicar no botão de upload
    await page.click('button:has-text("Upload"), button:has-text("Enviar")');
    await page.waitForTimeout(1000);
    
    // Selecionar o arquivo para upload
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('button:has-text("Select Files"), button:has-text("Selecionar Arquivos")')
    ]);
    
    await fileChooser.accept(['G:/MCP/chevereto-deploy/chevereto-upload.zip']);
    
    // Aguardar o upload concluir
    await page.waitForSelector('.upload-complete, .upload-success', { timeout: 60000 });
    console.log('Upload concluído com sucesso!');
    
    // Extrair o arquivo ZIP
    console.log('Extraindo o arquivo ZIP...');
    await page.click('tr:has-text("chevereto-upload.zip")');
    await page.click('button:has-text("Extract"), button:has-text("Extrair")');
    await page.waitForSelector('.extract-complete, .extract-success', { timeout: 60000 });
    console.log('Extração concluída com sucesso!');
    
    // Configurar permissões dos diretórios
    console.log('Configurando permissões dos diretórios...');
    const diretoriosParaPermissao = ['content', 'app/content', 'images'];
    
    for (const dir of diretoriosParaPermissao) {
      console.log(`Configurando permissões para o diretório ${dir}...`);
      await page.click(`tr:has-text("${dir}")`);
      await page.click('button:has-text("Permissions"), button:has-text("Permissões")');
      await page.waitForSelector('input[name="permissions"]');
      await page.type('input[name="permissions"]', '777');
      await page.click('button:has-text("Save"), button:has-text("Salvar")');
      await page.waitForSelector('.notification-success, .alert-success', { timeout: 10000 });
    }
    
    console.log('Permissões configuradas com sucesso!');
    
    // Atualizar o arquivo de configuração com as credenciais do banco de dados
    console.log('Atualizando arquivo de configuração...');
    await page.click('tr:has-text("app")');
    await page.waitForTimeout(1000);
    await page.click('tr:has-text("settings.php")');
    await page.click('button:has-text("Edit"), button:has-text("Editar")');
    
    // Substituir as credenciais do banco de dados
    await page.evaluate((credentials) => {
      const editor = document.querySelector('.code-editor');
      let content = editor.value;
      
      content = content.replace('${env:DB_NAME}', credentials.dbName);
      content = content.replace('${env:DB_USER}', credentials.dbUser);
      content = content.replace('${env:DB_PASSWORD}', credentials.dbPass);
      
      editor.value = content;
    }, dbCredentials);
    
    await page.click('button:has-text("Save"), button:has-text("Salvar")');
    await page.waitForSelector('.notification-success, .alert-success', { timeout: 10000 });
    
    console.log('Arquivo de configuração atualizado com sucesso!');
    
    console.log('\nDeploy do Chevereto concluído com sucesso!');
    console.log(`Acesse https://${process.env.SUBDOMAIN}.${process.env.DOMAIN}/install para concluir a instalação web.`);
    
  } catch (error) {
    console.error('Erro durante o deploy:', error);
  } finally {
    // Perguntar se deseja fechar o navegador
    console.log('\nPressione CTRL+C para encerrar o script e fechar o navegador.');
    // Manter o navegador aberto para inspeção manual
  }
}

/**
 * Verificar se todas as variáveis de ambiente necessárias estão definidas
 */
function checkEnvVariables() {
  const requiredVars = [
    'HOSTINGER_EMAIL',
    'HOSTINGER_PASSWORD',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'DOMAIN',
    'SUBDOMAIN'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Erro: As seguintes variáveis de ambiente estão faltando no arquivo .env:');
    console.error(missingVars.join(', '));
    process.exit(1);
  }
}

// Executar o script
if (require.main === module) {
  deployChevereto().catch(error => {
    console.error('Erro não tratado:', error);
    process.exit(1);
  });
}

module.exports = { deployChevereto };