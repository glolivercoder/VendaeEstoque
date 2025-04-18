// Script para criar um backup do aplicativo usando a API do navegador

// Função para criar um backup do aplicativo
async function createBackup() {
  try {
    // Obter todos os dados do IndexedDB
    const backupData = await getAllData();
    
    // Converter para JSON
    const jsonData = JSON.stringify(backupData, null, 2);
    
    // Criar um Blob com os dados
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Criar um link para download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Backup180425.json';
    document.body.appendChild(a);
    a.click();
    
    // Limpar recursos
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('Backup criado com sucesso!');
    alert('Backup criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    alert('Erro ao criar backup: ' + error.message);
  }
}

// Função para obter todos os dados do IndexedDB
async function getAllData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('estoqueDB', 4);
    
    request.onerror = (event) => {
      reject(new Error('Erro ao abrir o banco de dados: ' + event.target.error));
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const stores = ['products', 'clients', 'vendors', 'sales'];
      const data = {};
      let completedStores = 0;
      
      stores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          completedStores++;
          data[storeName] = [];
          if (completedStores === stores.length) {
            resolve(data);
          }
          return;
        }
        
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          data[storeName] = request.result;
          completedStores++;
          
          if (completedStores === stores.length) {
            resolve(data);
          }
        };
        
        request.onerror = (event) => {
          reject(new Error(`Erro ao ler dados de ${storeName}: ${event.target.error}`));
        };
      });
    };
    
    request.onupgradeneeded = (event) => {
      reject(new Error('O banco de dados precisa ser atualizado.'));
    };
  });
}

// Executar a função de backup
createBackup();
