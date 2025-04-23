/**
 * Serviço de backup aprimorado para o PDV Vendas
 * 
 * Este serviço implementa um sistema de backup que:
 * 1. Divide os dados em arquivos separados por setor
 * 2. Usa formatos mais acessíveis (.js, .md) em vez de JSON
 * 3. Inclui comentários explicativos em cada arquivo
 * 4. Compacta os arquivos em um único arquivo ZIP para facilitar o armazenamento
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ensureDB } from './database';

/**
 * Obtém todos os dados do sistema para backup
 * @returns {Promise<Object>} Objeto contendo todos os dados do sistema
 */
export const getAllData = async () => {
  try {
    // Obter dados do IndexedDB
    const db = await ensureDB();
    
    // Dados de produtos
    const products = await getStoreData(db, 'products');
    
    // Dados de clientes
    const clients = await getStoreData(db, 'clients');
    
    // Dados de fornecedores
    const vendors = await getStoreData(db, 'vendors');
    
    // Dados de vendas (do localStorage)
    const salesData = localStorage.getItem('salesData');
    const sales = salesData ? JSON.parse(salesData) : [];
    
    // Dados de configuração
    const minStockAlert = localStorage.getItem('minStockAlert');
    const ignoreStock = localStorage.getItem('ignoreStock');
    const wordpressConfig = localStorage.getItem('wordpressConfig');
    const wooCommerceConfig = localStorage.getItem('wooCommerceConfig');
    const backupLocation = localStorage.getItem('backupLocation');
    const autoBackup = localStorage.getItem('autoBackup');
    const theme = localStorage.getItem('theme');
    
    // Dados de login/usuários
    const users = localStorage.getItem('users');
    const currentUser = localStorage.getItem('currentUser');
    
    // Dados de rastreamento
    const trackingData = localStorage.getItem('trackingData');
    
    // Retornar todos os dados
    return {
      products,
      clients,
      vendors,
      sales,
      config: {
        minStockAlert: minStockAlert ? JSON.parse(minStockAlert) : {},
        ignoreStock: ignoreStock ? JSON.parse(ignoreStock) : {},
        wordpressConfig: wordpressConfig ? JSON.parse(wordpressConfig) : {},
        wooCommerceConfig: wooCommerceConfig ? JSON.parse(wooCommerceConfig) : {},
        backupLocation,
        autoBackup,
        theme
      },
      users: {
        list: users ? JSON.parse(users) : [],
        currentUser: currentUser ? JSON.parse(currentUser) : null
      },
      tracking: trackingData ? JSON.parse(trackingData) : []
    };
  } catch (error) {
    console.error('Erro ao obter dados para backup:', error);
    throw error;
  }
};

/**
 * Obtém dados de uma store específica do IndexedDB
 * @param {IDBDatabase} db Conexão com o banco de dados
 * @param {string} storeName Nome da store
 * @returns {Promise<Array>} Array com os dados da store
 */
const getStoreData = (db, storeName) => {
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(new Error(`Erro ao obter dados da store ${storeName}: ${event.target.error}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Converte dados para formato JavaScript com comentários
 * @param {string} sectionName Nome da seção
 * @param {Array|Object} data Dados a serem convertidos
 * @param {string} description Descrição da seção
 * @returns {string} Código JavaScript formatado
 */
const convertToJS = (sectionName, data, description) => {
  const timestamp = new Date().toISOString();
  
  return `/**
 * ${sectionName}
 * 
 * ${description}
 * 
 * Gerado em: ${timestamp}
 */

const ${sectionName.toLowerCase().replace(/[^a-z0-9]/g, '_')} = ${JSON.stringify(data, null, 2)};

export default ${sectionName.toLowerCase().replace(/[^a-z0-9]/g, '_')};
`;
};

/**
 * Converte dados para formato Markdown com explicações
 * @param {string} sectionName Nome da seção
 * @param {Array|Object} data Dados a serem convertidos
 * @param {string} description Descrição da seção
 * @returns {string} Conteúdo Markdown formatado
 */
const convertToMD = (sectionName, data, description) => {
  const timestamp = new Date().toISOString();
  
  return `# ${sectionName}

${description}

## Informações do Backup
- Data de geração: ${new Date(timestamp).toLocaleString()}
- Quantidade de registros: ${Array.isArray(data) ? data.length : Object.keys(data).length}

## Dados

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`
`;
};

/**
 * Cria um backup completo do sistema
 * @param {boolean} useMarkdown Se true, usa formato Markdown, senão usa JavaScript
 * @returns {Promise<Blob>} Arquivo ZIP contendo o backup
 */
export const createEnhancedBackup = async (useMarkdown = false) => {
  try {
    // Obter todos os dados
    const allData = await getAllData();
    
    // Criar um novo arquivo ZIP
    const zip = new JSZip();
    
    // Função para adicionar um arquivo ao ZIP
    const addFileToZip = (name, data, description) => {
      const converter = useMarkdown ? convertToMD : convertToJS;
      const extension = useMarkdown ? '.md' : '.js';
      zip.file(`${name}${extension}`, converter(name, data, description));
    };
    
    // Adicionar cada seção como um arquivo separado
    addFileToZip('Produtos', allData.products, 'Lista de produtos cadastrados no sistema');
    addFileToZip('Clientes', allData.clients, 'Lista de clientes cadastrados no sistema');
    addFileToZip('Fornecedores', allData.vendors, 'Lista de fornecedores cadastrados no sistema');
    addFileToZip('Vendas', allData.sales, 'Histórico de vendas realizadas');
    addFileToZip('Configuracoes', allData.config, 'Configurações do sistema');
    addFileToZip('Usuarios', allData.users, 'Usuários do sistema e permissões');
    addFileToZip('Rastreamento', allData.tracking, 'Dados de rastreamento de encomendas');
    
    // Adicionar um arquivo README com informações sobre o backup
    const readmeContent = `# Backup PDV Vendas

Este arquivo contém um backup completo do sistema PDV Vendas.

## Informações do Backup
- Data de geração: ${new Date().toLocaleString()}
- Formato: ${useMarkdown ? 'Markdown' : 'JavaScript'}

## Conteúdo
- Produtos.${useMarkdown ? 'md' : 'js'}: Lista de produtos cadastrados no sistema
- Clientes.${useMarkdown ? 'md' : 'js'}: Lista de clientes cadastrados no sistema
- Fornecedores.${useMarkdown ? 'md' : 'js'}: Lista de fornecedores cadastrados no sistema
- Vendas.${useMarkdown ? 'md' : 'js'}: Histórico de vendas realizadas
- Configuracoes.${useMarkdown ? 'md' : 'js'}: Configurações do sistema
- Usuarios.${useMarkdown ? 'md' : 'js'}: Usuários do sistema e permissões
- Rastreamento.${useMarkdown ? 'md' : 'js'}: Dados de rastreamento de encomendas

## Restauração
Para restaurar este backup, use a opção "Restaurar Backup" nas configurações do sistema.
`;
    
    zip.file('README.md', readmeContent);
    
    // Gerar o arquivo ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    
    return content;
  } catch (error) {
    console.error('Erro ao criar backup aprimorado:', error);
    throw error;
  }
};

/**
 * Salva o backup em um arquivo
 * @param {Blob} content Conteúdo do backup
 * @param {string} format Formato do backup ('js' ou 'md')
 */
export const saveBackupFile = (content, format = 'js') => {
  try {
    // Gerar nome do arquivo com data atual
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const timeStr = `${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
    
    const fileName = `Backup_${dateStr}_${timeStr}.zip`;
    
    // Salvar o arquivo
    saveAs(content, fileName);
    
    return fileName;
  } catch (error) {
    console.error('Erro ao salvar arquivo de backup:', error);
    throw error;
  }
};

/**
 * Restaura um backup a partir de um arquivo
 * @param {File} file Arquivo de backup
 * @returns {Promise<boolean>} True se a restauração foi bem-sucedida
 */
export const restoreBackup = async (file) => {
  try {
    // Verificar se é um arquivo ZIP
    if (!file.name.endsWith('.zip')) {
      throw new Error('O arquivo de backup deve ser um arquivo ZIP');
    }
    
    // Ler o conteúdo do arquivo
    const content = await readFileAsArrayBuffer(file);
    
    // Carregar o arquivo ZIP
    const zip = await JSZip.loadAsync(content);
    
    // Verificar se o arquivo README existe
    if (!zip.files['README.md']) {
      throw new Error('Arquivo de backup inválido: README.md não encontrado');
    }
    
    // Objeto para armazenar os dados restaurados
    const restoredData = {};
    
    // Processar cada arquivo no ZIP
    for (const fileName in zip.files) {
      // Ignorar diretórios e o README
      if (zip.files[fileName].dir || fileName === 'README.md') {
        continue;
      }
      
      // Obter o conteúdo do arquivo
      const fileContent = await zip.files[fileName].async('string');
      
      // Determinar o tipo de arquivo
      const isMarkdown = fileName.endsWith('.md');
      const isJavaScript = fileName.endsWith('.js');
      
      if (!isMarkdown && !isJavaScript) {
        console.warn(`Arquivo desconhecido no backup: ${fileName}`);
        continue;
      }
      
      // Extrair o nome da seção (sem a extensão)
      const sectionName = fileName.replace(/\.(md|js)$/, '');
      
      // Extrair os dados do arquivo
      let sectionData;
      
      if (isMarkdown) {
        // Extrair JSON do Markdown
        const jsonMatch = fileContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          sectionData = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error(`Não foi possível extrair dados JSON do arquivo ${fileName}`);
        }
      } else {
        // Extrair dados do JavaScript
        const dataMatch = fileContent.match(/const [a-z_]+ = (\[[\s\S]*?\]|\{[\s\S]*?\});/);
        if (dataMatch && dataMatch[1]) {
          sectionData = JSON.parse(dataMatch[1]);
        } else {
          throw new Error(`Não foi possível extrair dados do arquivo ${fileName}`);
        }
      }
      
      // Armazenar os dados restaurados
      restoredData[sectionName.toLowerCase()] = sectionData;
    }
    
    // Restaurar os dados no sistema
    await restoreDataToSystem(restoredData);
    
    return true;
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    throw error;
  }
};

/**
 * Lê um arquivo como ArrayBuffer
 * @param {File} file Arquivo a ser lido
 * @returns {Promise<ArrayBuffer>} Conteúdo do arquivo
 */
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (event) => {
      reject(new Error('Erro ao ler arquivo: ' + event.target.error));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Restaura os dados no sistema
 * @param {Object} data Dados a serem restaurados
 * @returns {Promise<boolean>} True se a restauração foi bem-sucedida
 */
const restoreDataToSystem = async (data) => {
  try {
    // Obter conexão com o banco de dados
    const db = await ensureDB();
    
    // Restaurar produtos
    if (data.produtos) {
      await clearAndRestoreStore(db, 'products', data.produtos);
    }
    
    // Restaurar clientes
    if (data.clientes) {
      await clearAndRestoreStore(db, 'clients', data.clientes);
    }
    
    // Restaurar fornecedores
    if (data.fornecedores) {
      await clearAndRestoreStore(db, 'vendors', data.fornecedores);
    }
    
    // Restaurar vendas
    if (data.vendas) {
      localStorage.setItem('salesData', JSON.stringify(data.vendas));
    }
    
    // Restaurar configurações
    if (data.configuracoes) {
      const config = data.configuracoes;
      
      if (config.minStockAlert) {
        localStorage.setItem('minStockAlert', JSON.stringify(config.minStockAlert));
      }
      
      if (config.ignoreStock) {
        localStorage.setItem('ignoreStock', JSON.stringify(config.ignoreStock));
      }
      
      if (config.wordpressConfig) {
        localStorage.setItem('wordpressConfig', JSON.stringify(config.wordpressConfig));
      }
      
      if (config.wooCommerceConfig) {
        localStorage.setItem('wooCommerceConfig', JSON.stringify(config.wooCommerceConfig));
      }
      
      if (config.backupLocation) {
        localStorage.setItem('backupLocation', config.backupLocation);
      }
      
      if (config.autoBackup) {
        localStorage.setItem('autoBackup', config.autoBackup);
      }
      
      if (config.theme) {
        localStorage.setItem('theme', config.theme);
      }
    }
    
    // Restaurar usuários
    if (data.usuarios && data.usuarios.list) {
      localStorage.setItem('users', JSON.stringify(data.usuarios.list));
    }
    
    // Restaurar rastreamento
    if (data.rastreamento) {
      localStorage.setItem('trackingData', JSON.stringify(data.rastreamento));
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao restaurar dados no sistema:', error);
    throw error;
  }
};

/**
 * Limpa uma store e restaura os dados
 * @param {IDBDatabase} db Conexão com o banco de dados
 * @param {string} storeName Nome da store
 * @param {Array} data Dados a serem restaurados
 * @returns {Promise<boolean>} True se a operação foi bem-sucedida
 */
const clearAndRestoreStore = async (db, storeName, data) => {
  return new Promise((resolve, reject) => {
    try {
      // Criar transação para limpar a store
      const clearTransaction = db.transaction([storeName], 'readwrite');
      const clearStore = clearTransaction.objectStore(storeName);
      
      // Limpar a store
      const clearRequest = clearStore.clear();
      
      clearRequest.onsuccess = () => {
        // Criar transação para adicionar os dados
        const addTransaction = db.transaction([storeName], 'readwrite');
        const addStore = addTransaction.objectStore(storeName);
        
        // Contador de itens adicionados
        let addedCount = 0;
        
        // Adicionar cada item
        data.forEach((item) => {
          const addRequest = addStore.add(item);
          
          addRequest.onsuccess = () => {
            addedCount++;
            
            // Se todos os itens foram adicionados, resolver a promessa
            if (addedCount === data.length) {
              resolve(true);
            }
          };
          
          addRequest.onerror = (event) => {
            reject(new Error(`Erro ao adicionar item em ${storeName}: ${event.target.error}`));
          };
        });
        
        // Se não houver itens para adicionar, resolver a promessa
        if (data.length === 0) {
          resolve(true);
        }
      };
      
      clearRequest.onerror = (event) => {
        reject(new Error(`Erro ao limpar store ${storeName}: ${event.target.error}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};
