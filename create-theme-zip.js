/**
 * Script para criar o arquivo ZIP do tema WooCommerce VendaEstoque
 * 
 * Este script utiliza as credenciais fornecidas para acessar as APIs necessárias
 * e cria um arquivo ZIP com os arquivos essenciais do tema.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Configurações
const themeName = 'vendaestoque-theme';
const outputPath = path.join(__dirname, `${themeName}.zip`);
const themeFiles = [
  'style.css',
  'functions.php',
  'index.php',
  'header.php',
  'footer.php',
  'front-page.php',
  'woocommerce.php',
  'sidebar.php',
  'js/main.js',
  'js/customizer.js',
  'inc/template-tags.php',
  'inc/template-functions.php',
  'inc/customizer.php',
  'template-parts/content.php',
  'template-parts/content-none.php'
];

// Credenciais (carregadas do arquivo .env em produção)
const credentials = {
  woocommerce: {
    consumerKey: 'ck_40b4a1a674084d504579a2ba2d51530c260d3645',
    consumerSecret: 'cs_8fa4b36ab57ddb02415e4fc346451791ab1782f9'
  },
  wordpress: {
    username: 'gloliverx',
    applicationPassword: '0lr4 umHb 8pfx 5Cqf v7KW oq8S'
  },
  n8n: {
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWZhMGVkYi1iMTk5LTRmOWYtODY1My0yYWJjZTllMzQyY2YiLCJpc3MiOiJuOG4iLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ0NTAyNjMxfQ.RZB0tGBnAtQcid8R2VaKqOoqW2OsnutBEmNWmCoCAsk'
  }
};

// Função para criar diretórios recursivamente
function createDirectories(dirPath) {
  const parts = dirPath.split(path.sep);
  let currentPath = '';
  
  parts.forEach(part => {
    currentPath = currentPath ? path.join(currentPath, part) : part;
    
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });
}

// Função para verificar se todos os arquivos existem
function checkFiles() {
  const missingFiles = [];
  
  themeFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  });
  
  return missingFiles;
}

// Função principal para criar o arquivo ZIP
function createThemeZip() {
  console.log(`Iniciando criação do arquivo ZIP do tema ${themeName}...`);
  
  // Verificar arquivos
  const missingFiles = checkFiles();
  if (missingFiles.length > 0) {
    console.error('Arquivos ausentes:', missingFiles);
    console.log('Criando diretórios necessários...');
    
    // Criar diretórios necessários
    missingFiles.forEach(file => {
      const dir = path.dirname(file);
      if (dir !== '.') {
        createDirectories(dir);
      }
    });
    
    console.log('Diretórios criados. Por favor, adicione os arquivos ausentes antes de continuar.');
    return;
  }
  
  // Criar arquivo ZIP
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Nível máximo de compressão
  });
  
  output.on('close', () => {
    console.log(`Arquivo ZIP criado com sucesso: ${outputPath}`);
    console.log(`Tamanho total: ${archive.pointer()} bytes`);
  });
  
  archive.on('error', (err) => {
    throw err;
  });
  
  archive.pipe(output);
  
  // Adicionar arquivos ao ZIP
  themeFiles.forEach(file => {
    archive.file(file, { name: `${themeName}/${file}` });
  });
  
  archive.finalize();
}

// Executar a função principal
createThemeZip();
