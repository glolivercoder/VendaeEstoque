import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para criar um backup em ZIP
async function createBackupZip() {
  try {
    console.log('Iniciando criação de backup em ZIP...');

    // Nome do arquivo de backup
    const backupFileName = 'Backup180425.zip';
    // Criar o backup na pasta atual do projeto
    const outputPath = path.resolve(backupFileName);

    console.log(`Criando backup em: ${outputPath}`);

    // Criar um stream de escrita para o arquivo ZIP
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Nível máximo de compressão
    });

    // Lidar com eventos do arquivo
    output.on('close', function() {
      console.log(`Backup criado com sucesso: ${backupFileName}`);
      console.log(`Tamanho total: ${archive.pointer()} bytes`);
    });

    archive.on('error', function(err) {
      throw err;
    });

    // Pipe do arquivo de saída para o arquivador
    archive.pipe(output);

    // Adicionar diretórios e arquivos ao ZIP
    const dirsToBackup = [
      'src',
      'public',
      'node_modules',
      'dist'
    ];

    const filesToBackup = [
      'package.json',
      'package-lock.json',
      'vite.config.js',
      '.env',
      'README.md',
      'index.html'
    ];

    // Adicionar diretórios
    for (const dir of dirsToBackup) {
      if (fs.existsSync(dir)) {
        archive.directory(dir, dir);
      }
    }

    // Adicionar arquivos individuais
    for (const file of filesToBackup) {
      if (fs.existsSync(file)) {
        archive.file(file, { name: file });
      }
    }

    // Finalizar o arquivo
    await archive.finalize();

    console.log('Processo de backup iniciado...');
  } catch (error) {
    console.error('Erro ao criar backup ZIP:', error);
  }
}

// Executar a função
createBackupZip();
