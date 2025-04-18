const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Função para criar um backup em ZIP
async function createBackupZip() {
  try {
    console.log('Iniciando criação de backup em ZIP...');
    
    // Nome do arquivo de backup
    const backupFileName = 'Backup180425.zip';
    
    // Criar uma nova instância do AdmZip
    const zip = new AdmZip();
    
    // Diretórios a serem incluídos no backup
    const dirsToBackup = [
      'src',
      'public',
      'dist'
    ];
    
    // Arquivos a serem incluídos no backup
    const filesToBackup = [
      'package.json',
      'package-lock.json',
      'vite.config.js',
      '.env',
      'README.md',
      'index.html'
    ];
    
    // Adicionar diretórios ao ZIP
    for (const dir of dirsToBackup) {
      if (fs.existsSync(dir)) {
        console.log(`Adicionando diretório: ${dir}`);
        addDirectoryToZip(zip, dir, dir);
      }
    }
    
    // Adicionar arquivos individuais ao ZIP
    for (const file of filesToBackup) {
      if (fs.existsSync(file)) {
        console.log(`Adicionando arquivo: ${file}`);
        zip.addLocalFile(file);
      }
    }
    
    // Salvar o arquivo ZIP
    zip.writeZip(backupFileName);
    
    console.log(`Backup criado com sucesso: ${backupFileName}`);
    console.log(`Caminho completo: ${path.resolve(backupFileName)}`);
    
    return path.resolve(backupFileName);
  } catch (error) {
    console.error('Erro ao criar backup ZIP:', error);
    throw error;
  }
}

// Função auxiliar para adicionar um diretório e seus subdiretórios ao ZIP
function addDirectoryToZip(zip, localPath, zipPath) {
  try {
    // Ler o conteúdo do diretório
    const items = fs.readdirSync(localPath);
    
    for (const item of items) {
      const fullPath = path.join(localPath, item);
      const zipEntryPath = path.join(zipPath, item);
      
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Se for um diretório, adicionar recursivamente
        addDirectoryToZip(zip, fullPath, zipEntryPath);
      } else {
        // Se for um arquivo, adicionar ao ZIP
        zip.addLocalFile(fullPath, path.dirname(zipEntryPath));
      }
    }
  } catch (error) {
    console.error(`Erro ao adicionar diretório ${localPath}:`, error);
  }
}

// Executar a função
createBackupZip()
  .then(backupPath => {
    console.log(`Backup concluído: ${backupPath}`);
  })
  .catch(error => {
    console.error('Falha ao criar backup:', error);
  });
