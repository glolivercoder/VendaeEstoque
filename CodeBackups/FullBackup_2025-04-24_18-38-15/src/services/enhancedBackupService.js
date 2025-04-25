/**
 * Serviço de backup aprimorado para o PDV Vendas
 *
 * Este serviço implementa um sistema de backup que:
 * 1. Divide os dados em arquivos separados por setor
 * 2. Usa formatos mais acessíveis (.js, .md, .jsx) em vez de JSON
 * 3. Inclui comentários explicativos em cada arquivo
 * 4. Compacta os arquivos em um único arquivo ZIP para facilitar o armazenamento
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  getProducts,
  getClients,
  getVendors,
  ensureDB
} from './database';

/**
 * Obtém o caminho para a pasta de backup padrão
 * @returns {string} Caminho para a pasta de backup
 */
const getDefaultBackupPath = () => {
  // Tentar obter o caminho salvo nas configurações
  const savedPath = localStorage.getItem('backupLocation');
  if (savedPath) {
    return savedPath;
  }

  // Caminho padrão para a pasta Backup na raiz do aplicativo
  return './Backup';
};

/**
 * Obtém todos os dados do sistema para backup
 * @returns {Promise<Object>} Objeto contendo todos os dados do sistema
 */
const getAllData = async () => {
  try {
    // Obter produtos
    const products = await getProducts();

    // Obter clientes
    const clients = await getClients();

    // Obter fornecedores
    const vendors = await getVendors();

    // Obter vendas do localStorage
    const salesData = localStorage.getItem('salesData');
    const sales = salesData ? JSON.parse(salesData) : [];

    // Obter configurações do sistema
    const config = {
      backupLocation: localStorage.getItem('backupLocation') || '',
      autoBackup: localStorage.getItem('autoBackup') === 'true',
      minStockAlert: JSON.parse(localStorage.getItem('minStockAlert') || '{}'),
      ignoreStock: JSON.parse(localStorage.getItem('ignoreStock') || '{}'),
      hostingerConfig: JSON.parse(localStorage.getItem('hostingerConfig') || '{}')
    };

    // Obter usuários e permissões
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];

    // Obter dados de rastreamento
    const trackingData = localStorage.getItem('trackingData');
    const tracking = trackingData ? JSON.parse(trackingData) : [];

    // Obter configurações de logística
    const logisticsConfig = localStorage.getItem('logisticsConfig');
    const logistics = logisticsConfig ? JSON.parse(logisticsConfig) : {};

    return {
      products,
      clients,
      vendors,
      sales,
      config,
      users,
      tracking,
      logistics
    };
  } catch (error) {
    console.error('Erro ao obter dados para backup:', error);
    throw error;
  }
};

/**
 * Converte dados para formato JavaScript
 * @param {string} name Nome da seção
 * @param {Array|Object} data Dados a serem convertidos
 * @param {string} description Descrição da seção
 * @returns {string} Código JavaScript formatado
 */
const convertToJS = (name, data, description) => {
  const timestamp = new Date().toISOString();

  return `/**
 * ${name}
 * ${description}
 *
 * Backup gerado em: ${timestamp}
 */

const ${name.toLowerCase().replace(/\s+/g, '_')} = ${JSON.stringify(data, null, 2)};

// Exportar dados para uso em outros módulos
export default ${name.toLowerCase().replace(/\s+/g, '_')};

/**
 * Informações adicionais:
 * - Total de registros: ${Array.isArray(data) ? data.length : '1'}
 * - Tipo de dados: ${Array.isArray(data) ? 'Array' : 'Object'}
 */
`;
};

/**
 * Converte dados para formato Markdown
 * @param {string} name Nome da seção
 * @param {Array|Object} data Dados a serem convertidos
 * @param {string} description Descrição da seção
 * @returns {string} Markdown formatado
 */
const convertToMD = (name, data, description) => {
  const timestamp = new Date().toISOString();

  let markdown = `# ${name}\n\n`;
  markdown += `${description}\n\n`;
  markdown += `Backup gerado em: ${timestamp}\n\n`;

  if (Array.isArray(data)) {
    markdown += `Total de registros: ${data.length}\n\n`;

    if (data.length > 0) {
      // Criar tabela para os primeiros 10 itens
      const sample = data.slice(0, 10);
      const keys = Object.keys(sample[0]);

      // Cabeçalho da tabela
      markdown += '## Amostra de Dados\n\n';
      markdown += '| ' + keys.join(' | ') + ' |\n';
      markdown += '| ' + keys.map(() => '---').join(' | ') + ' |\n';

      // Linhas da tabela
      sample.forEach(item => {
        markdown += '| ' + keys.map(key => {
          const value = item[key];
          if (typeof value === 'object' && value !== null) {
            return 'objeto';
          }
          return String(value || '').replace(/\n/g, ' ').substring(0, 30);
        }).join(' | ') + ' |\n';
      });

      markdown += '\n';
    }
  } else {
    markdown += '## Dados\n\n';
    markdown += '```json\n';
    markdown += JSON.stringify(data, null, 2);
    markdown += '\n```\n\n';
  }

  markdown += '## Código para Restauração\n\n';
  markdown += '```javascript\n';
  markdown += `const ${name.toLowerCase().replace(/\s+/g, '_')} = ${JSON.stringify(data, null, 2)};\n`;
  markdown += '```\n';

  return markdown;
};

/**
 * Converte dados para formato JSX (React)
 * @param {string} name Nome da seção
 * @param {Array|Object} data Dados a serem convertidos
 * @param {string} description Descrição da seção
 * @returns {string} Código JSX formatado
 */
const convertToJSX = (name, data, description) => {
  const timestamp = new Date().toISOString();
  const componentName = name.replace(/\s+/g, '');

  return `/**
 * ${componentName} - Componente de visualização de dados de backup
 * ${description}
 *
 * Backup gerado em: ${timestamp}
 */

import React, { useState } from 'react';

// Dados de backup
const ${componentName.toLowerCase()}Data = ${JSON.stringify(data, null, 2)};

/**
 * Componente para visualizar dados de backup
 */
const ${componentName}Viewer = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="backup-viewer">
      <h2>${name}</h2>
      <p>${description}</p>
      <p>Total de registros: ${Array.isArray(data) ? data.length : '1'}</p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="toggle-button"
      >
        {expanded ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
      </button>

      {expanded && (
        <pre className="data-preview">
          {JSON.stringify(${componentName.toLowerCase()}Data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ${componentName}Viewer;
export { ${componentName.toLowerCase()}Data };
`;
};

/**
 * Cria um backup completo do sistema
 * @param {string} format Formato do backup ('js', 'md', ou 'jsx')
 * @returns {Promise<Blob>} Arquivo ZIP contendo o backup
 */
export const createEnhancedBackup = async (format = 'js') => {
  try {
    // Obter todos os dados
    const allData = await getAllData();

    // Criar um novo arquivo ZIP
    const zip = new JSZip();

    // Função para adicionar um arquivo ao ZIP
    const addFileToZip = (name, data, description) => {
      let converter;
      let extension;

      switch (format) {
        case 'md':
          converter = convertToMD;
          extension = '.md';
          break;
        case 'jsx':
          converter = convertToJSX;
          extension = '.jsx';
          break;
        case 'js':
        default:
          converter = convertToJS;
          extension = '.js';
          break;
      }

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
    addFileToZip('Logistica', allData.logistics, 'Configurações de transportadoras e frete');

    // Adicionar um arquivo README com informações sobre o backup
    const readmeContent = `# Backup PDV Vendas

Este arquivo contém um backup completo do sistema PDV Vendas, gerado em ${new Date().toLocaleString()}.

## Conteúdo do Backup

Este backup contém os seguintes arquivos:

- Produtos.${format} - Lista de produtos cadastrados no sistema (${allData.products.length} registros)
- Clientes.${format} - Lista de clientes cadastrados no sistema (${allData.clients.length} registros)
- Fornecedores.${format} - Lista de fornecedores cadastrados no sistema (${allData.vendors.length} registros)
- Vendas.${format} - Histórico de vendas realizadas (${allData.sales.length} registros)
- Configuracoes.${format} - Configurações do sistema
- Usuarios.${format} - Usuários do sistema e permissões
- Rastreamento.${format} - Dados de rastreamento de encomendas
- Logistica.${format} - Configurações de transportadoras e frete

## Como Restaurar

Para restaurar este backup, utilize a função "Restaurar Backup" no sistema PDV Vendas.

## Informações Técnicas

- Formato dos arquivos: ${format.toUpperCase()}
- Data de geração: ${new Date().toISOString()}
- Versão do sistema: LinkVendas Fast 1.0
`;

    zip.file('README.md', readmeContent);

    // Gerar o arquivo ZIP
    const content = await zip.generateAsync({ type: 'blob' });

    return content;
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    throw error;
  }
};

/**
 * Salva o backup em um arquivo
 * @param {Blob} content Conteúdo do backup
 * @param {string} format Formato do backup ('js', 'md', ou 'jsx')
 * @param {boolean} useFilePicker Se true, abre o seletor de arquivos para escolher onde salvar
 * @returns {Promise<string>} Nome do arquivo salvo
 */
export const saveBackupFile = async (content, format = 'js', useFilePicker = false) => {
  try {
    // Log para depuração
    console.log('saveBackupFile chamado com useFilePicker =', useFilePicker);

    // Gerar nome do arquivo com data atual
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const timeStr = `${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;

    const fileName = `Backup_${dateStr}_${timeStr}.zip`;

    // Método alternativo para abrir o explorador de arquivos
    if (useFilePicker) {
      // Criar um elemento <a> temporário com o atributo download
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(content);
      downloadLink.download = fileName;

      // Adicionar o elemento ao DOM
      document.body.appendChild(downloadLink);

      // Simular um clique no link para abrir o diálogo de salvar
      downloadLink.click();

      // Remover o elemento do DOM após um curto período
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
      }, 100);

      return fileName;
    } else {
      // Método padrão usando FileSaver.js
      saveAs(content, fileName);
      return fileName;
    }
  } catch (error) {
    console.error('Erro ao salvar arquivo de backup:', error);
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

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Lê um arquivo como texto
 * @param {File} file Arquivo a ser lido
 * @returns {Promise<string>} Conteúdo do arquivo
 */
const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
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

    // Função para processar um arquivo de backup
    const processBackupFile = async (filename, targetKey) => {
      if (!zip.files[filename]) {
        console.warn(`Arquivo ${filename} não encontrado no backup`);
        return;
      }

      // Ler o conteúdo do arquivo
      const fileContent = await zip.files[filename].async('string');

      // Extrair os dados do arquivo
      try {
        if (filename.endsWith('.js') || filename.endsWith('.jsx')) {
          // Extrair dados de arquivos JS/JSX usando regex
          const dataMatch = fileContent.match(/const\s+[a-zA-Z_]+\s+=\s+(\[[\s\S]*?\]|\{[\s\S]*?\});/);
          if (dataMatch && dataMatch[1]) {
            restoredData[targetKey] = JSON.parse(dataMatch[1]);
          }
        } else if (filename.endsWith('.md')) {
          // Extrair dados de arquivos MD usando regex
          const codeBlockMatch = fileContent.match(/```javascript\s+const\s+[a-zA-Z_]+\s+=\s+(\[[\s\S]*?\]|\{[\s\S]*?\});/);
          if (codeBlockMatch && codeBlockMatch[1]) {
            restoredData[targetKey] = JSON.parse(codeBlockMatch[1]);
          }
        } else {
          // Tentar analisar como JSON direto
          restoredData[targetKey] = JSON.parse(fileContent);
        }
      } catch (error) {
        console.error(`Erro ao processar arquivo ${filename}:`, error);
      }
    };

    // Processar cada arquivo de backup
    await processBackupFile('Produtos.js', 'produtos');
    await processBackupFile('Produtos.md', 'produtos');
    await processBackupFile('Produtos.jsx', 'produtos');

    await processBackupFile('Clientes.js', 'clientes');
    await processBackupFile('Clientes.md', 'clientes');
    await processBackupFile('Clientes.jsx', 'clientes');

    await processBackupFile('Fornecedores.js', 'fornecedores');
    await processBackupFile('Fornecedores.md', 'fornecedores');
    await processBackupFile('Fornecedores.jsx', 'fornecedores');

    await processBackupFile('Vendas.js', 'vendas');
    await processBackupFile('Vendas.md', 'vendas');
    await processBackupFile('Vendas.jsx', 'vendas');

    await processBackupFile('Configuracoes.js', 'configuracoes');
    await processBackupFile('Configuracoes.md', 'configuracoes');
    await processBackupFile('Configuracoes.jsx', 'configuracoes');

    await processBackupFile('Usuarios.js', 'usuarios');
    await processBackupFile('Usuarios.md', 'usuarios');
    await processBackupFile('Usuarios.jsx', 'usuarios');

    await processBackupFile('Rastreamento.js', 'rastreamento');
    await processBackupFile('Rastreamento.md', 'rastreamento');
    await processBackupFile('Rastreamento.jsx', 'rastreamento');

    await processBackupFile('Logistica.js', 'logistica');
    await processBackupFile('Logistica.md', 'logistica');
    await processBackupFile('Logistica.jsx', 'logistica');

    // Verificar se há dados para restaurar
    if (Object.keys(restoredData).length === 0) {
      throw new Error('Nenhum dado válido encontrado no backup');
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
 * Limpa e restaura dados em uma object store
 * @param {IDBDatabase} db Conexão com o banco de dados
 * @param {string} storeName Nome da object store
 * @param {Array} data Dados a serem restaurados
 * @returns {Promise<void>}
 */
const clearAndRestoreStore = async (db, storeName, data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log(`Nenhum dado para restaurar em ${storeName}`);
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      // Limpar a store
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        console.log(`Object store ${storeName} limpa com sucesso`);

        // Adicionar os novos dados
        let completed = 0;
        let errors = 0;

        data.forEach(item => {
          // Remover o ID para que seja gerado um novo
          const newItem = { ...item };
          delete newItem.id;

          const addRequest = store.add(newItem);

          addRequest.onsuccess = () => {
            completed++;
            if (completed + errors === data.length) {
              console.log(`Restauração de ${storeName} concluída: ${completed} itens adicionados, ${errors} erros`);
              resolve();
            }
          };

          addRequest.onerror = (event) => {
            console.error(`Erro ao adicionar item em ${storeName}:`, event.target.error);
            errors++;
            if (completed + errors === data.length) {
              console.log(`Restauração de ${storeName} concluída: ${completed} itens adicionados, ${errors} erros`);
              resolve();
            }
          };
        });
      };

      clearRequest.onerror = (event) => {
        console.error(`Erro ao limpar object store ${storeName}:`, event.target.error);
        reject(event.target.error);
      };
    } catch (error) {
      console.error(`Erro ao restaurar dados em ${storeName}:`, error);
      reject(error);
    }
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

      if (config.backupLocation) {
        localStorage.setItem('backupLocation', config.backupLocation);
      }

      if (config.autoBackup !== undefined) {
        localStorage.setItem('autoBackup', config.autoBackup.toString());
      }

      if (config.minStockAlert) {
        localStorage.setItem('minStockAlert', JSON.stringify(config.minStockAlert));
      }

      if (config.ignoreStock) {
        localStorage.setItem('ignoreStock', JSON.stringify(config.ignoreStock));
      }

      if (config.hostingerConfig) {
        localStorage.setItem('hostingerConfig', JSON.stringify(config.hostingerConfig));
      }
    }

    // Restaurar usuários
    if (data.usuarios) {
      localStorage.setItem('users', JSON.stringify(data.usuarios));
    }

    // Restaurar rastreamento
    if (data.rastreamento) {
      localStorage.setItem('trackingData', JSON.stringify(data.rastreamento));
    }

    // Restaurar logística
    if (data.logistica) {
      localStorage.setItem('logisticsConfig', JSON.stringify(data.logistica));
    }

    return true;
  } catch (error) {
    console.error('Erro ao restaurar dados no sistema:', error);
    throw error;
  }
};
