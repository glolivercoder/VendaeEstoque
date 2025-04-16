/**
 * Script para instalar a extensão Browser-Use Helper no Chrome
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função principal
async function installExtension() {
  console.log('Iniciando instalação da extensão Browser-Use Helper...');
  
  try {
    // Caminho para o Chrome
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    
    // Verificar se o Chrome existe
    if (!fs.existsSync(chromePath)) {
      console.error(`Chrome não encontrado em ${chromePath}`);
      console.log('Por favor, verifique o caminho do Chrome e tente novamente.');
      return;
    }
    
    // URL da extensão Browser-Use Helper na Chrome Web Store
    const extensionUrl = 'https://chrome.google.com/webstore/detail/browser-use-helper/pdkhjfcbdbgngfpnlkdimjlimmcmpmcd';
    
    // Abrir o Chrome com a URL da extensão
    console.log('Abrindo o Chrome para instalar a extensão...');
    execSync(`"${chromePath}" ${extensionUrl}`, { stdio: 'inherit' });
    
    console.log('\nPor favor, siga estas instruções:');
    console.log('1. No Chrome que acabou de abrir, clique em "Adicionar ao Chrome"');
    console.log('2. Confirme a instalação clicando em "Adicionar extensão"');
    console.log('3. Após a instalação, reinicie o Chrome');
    console.log('\nDepois de instalar a extensão, reinicie o UI Agent para usar o navegador padrão.');
    
  } catch (error) {
    console.error('Erro durante a instalação da extensão:', error);
  }
}

// Executar a função principal
installExtension().catch(console.error);
