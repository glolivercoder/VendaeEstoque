/**
 * Script para instalar o tema WooCommerce VendaEstoque no WordPress
 * 
 * Este script utiliza a API REST do WordPress para fazer upload e ativar o tema.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configurações
const themeName = 'vendaestoque-theme';
const zipPath = path.join(__dirname, `${themeName}.zip`);
const wpUrl = 'https://achadinhoshopp.com.br/loja';

// Credenciais WordPress
const credentials = {
  username: 'gloliverx',
  applicationPassword: '0lr4 umHb 8pfx 5Cqf v7KW oq8S'
};

// Função para fazer upload do tema
async function uploadTheme() {
  console.log('Iniciando upload do tema para o WordPress...');
  
  if (!fs.existsSync(zipPath)) {
    console.error(`Arquivo ZIP não encontrado: ${zipPath}`);
    console.log('Execute primeiro o script create-theme-zip.js para criar o arquivo ZIP.');
    return;
  }
  
  try {
    // Criar FormData com o arquivo ZIP
    const formData = new FormData();
    formData.append('file', fs.createReadStream(zipPath));
    
    // Configurar autenticação
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString('base64');
    
    // Fazer upload do tema
    const response = await axios.post(
      `${wpUrl}/wp-json/wp/v2/themes`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Basic ${auth}`,
          'Content-Disposition': `attachment; filename=${path.basename(zipPath)}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log('Upload do tema concluído com sucesso!');
    console.log('Resposta:', response.data);
    
    // Ativar o tema
    if (response.data && response.data.status === 'active') {
      console.log('O tema já está ativo.');
    } else {
      await activateTheme();
    }
  } catch (error) {
    console.error('Erro ao fazer upload do tema:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Função para ativar o tema
async function activateTheme() {
  console.log('Ativando o tema...');
  
  try {
    // Configurar autenticação
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString('base64');
    
    // Ativar o tema
    const response = await axios.post(
      `${wpUrl}/wp-json/wp/v2/themes/${themeName}/active`,
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Tema ativado com sucesso!');
    console.log('Resposta:', response.data);
  } catch (error) {
    console.error('Erro ao ativar o tema:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Função para configurar o tema para exibir produtos na página inicial
async function configureTheme() {
  console.log('Configurando o tema para exibir produtos na página inicial...');
  
  try {
    // Configurar autenticação
    const auth = Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString('base64');
    
    // Configurar a página inicial para exibir a loja
    const response = await axios.post(
      `${wpUrl}/wp-json/wp/v2/settings`,
      {
        show_on_front: 'page',
        page_on_front: 'shop'
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Configuração concluída com sucesso!');
    console.log('Resposta:', response.data);
  } catch (error) {
    console.error('Erro ao configurar o tema:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Executar as funções em sequência
async function main() {
  await uploadTheme();
  await configureTheme();
  console.log('Processo concluído!');
}

main();
