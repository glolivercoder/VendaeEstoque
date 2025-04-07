/**
 * Serviço para gerenciar backup e restauração de dados
 */

import { ensureDB } from './database';

/**
 * Exporta todos os dados do IndexedDB para um arquivo JSON
 * @param {string} backupLocation - Caminho onde o backup será salvo
 * @returns {Promise<Object>} - Objeto com os dados exportados
 */
export const exportData = async () => {
  try {
    const db = await ensureDB();
    const data = {};
    
    // Lista de todas as object stores que queremos incluir no backup
    const stores = ['products', 'clients', 'vendors'];
    
    // Função para ler todos os dados de uma object store
    const getAllFromStore = (storeName) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    };
    
    // Obter dados de todas as stores
    for (const storeName of stores) {
      data[storeName] = await getAllFromStore(storeName);
    }
    
    // Adicionar dados do localStorage
    data.localStorage = {};
    for (const key of ['salesData', 'minStockAlert', 'ignoreStock', 'hostingerConfig']) {
      const value = localStorage.getItem(key);
      if (value) {
        data.localStorage[key] = JSON.parse(value);
      }
    }
    
    // Retornar os dados para serem salvos
    return data;
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    throw error;
  }
};

/**
 * Importa dados de um arquivo JSON para o IndexedDB
 * @param {Object} data - Dados a serem importados
 * @returns {Promise<void>}
 */
export const importData = async (data) => {
  try {
    const db = await ensureDB();
    
    // Função para limpar uma object store
    const clearStore = (storeName) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    };
    
    // Função para adicionar itens a uma object store
    const addItemsToStore = (storeName, items) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        let completed = 0;
        let errors = 0;
        
        transaction.oncomplete = () => {
          resolve();
        };
        
        transaction.onerror = (event) => {
          reject(event.target.error);
        };
        
        // Adicionar cada item
        for (const item of items) {
          const request = store.add(item);
          
          request.onsuccess = () => {
            completed++;
          };
          
          request.onerror = () => {
            errors++;
            console.error(`Erro ao adicionar item em ${storeName}:`, request.error);
          };
        }
      });
    };
    
    // Restaurar dados para cada object store
    for (const storeName of Object.keys(data)) {
      if (storeName !== 'localStorage' && Array.isArray(data[storeName])) {
        await clearStore(storeName);
        await addItemsToStore(storeName, data[storeName]);
      }
    }
    
    // Restaurar dados do localStorage
    if (data.localStorage) {
      for (const key of Object.keys(data.localStorage)) {
        localStorage.setItem(key, JSON.stringify(data.localStorage[key]));
      }
    }
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    throw error;
  }
};

/**
 * Salva os dados em um arquivo no sistema de arquivos
 * @param {Object} data - Dados a serem salvos
 * @param {string} backupLocation - Caminho onde o backup será salvo
 * @returns {Promise<string>} - Caminho do arquivo salvo
 */
export const saveBackupToFile = async (data, backupLocation) => {
  try {
    // Criar nome de arquivo com data atual
    const date = new Date();
    const fileName = `backup_${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}.json`;
    
    // Caminho completo do arquivo
    const filePath = backupLocation ? `${backupLocation}/${fileName}` : fileName;
    
    // Converter dados para JSON
    const jsonData = JSON.stringify(data, null, 2);
    
    // Criar um Blob com os dados
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Criar URL para o Blob
    const url = URL.createObjectURL(blob);
    
    // Criar um link para download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Adicionar o link ao documento
    document.body.appendChild(link);
    
    // Clicar no link para iniciar o download
    link.click();
    
    // Remover o link do documento
    document.body.removeChild(link);
    
    // Liberar a URL
    URL.revokeObjectURL(url);
    
    return filePath;
  } catch (error) {
    console.error('Erro ao salvar backup em arquivo:', error);
    throw error;
  }
};

/**
 * Carrega dados de um arquivo JSON
 * @param {File} file - Arquivo a ser carregado
 * @returns {Promise<Object>} - Dados carregados
 */
export const loadBackupFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Arquivo de backup inválido'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo de backup'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Realiza o backup completo dos dados
 * @param {string} backupLocation - Caminho onde o backup será salvo
 * @returns {Promise<string>} - Caminho do arquivo de backup
 */
export const performBackup = async (backupLocation) => {
  try {
    const data = await exportData();
    return await saveBackupToFile(data, backupLocation);
  } catch (error) {
    console.error('Erro ao realizar backup:', error);
    throw error;
  }
};

/**
 * Restaura dados de um arquivo de backup
 * @param {File} file - Arquivo de backup
 * @returns {Promise<void>}
 */
export const performRestore = async (file) => {
  try {
    const data = await loadBackupFromFile(file);
    await importData(data);
    return true;
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    throw error;
  }
};
