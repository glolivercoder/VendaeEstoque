/**
 * Script para diagnosticar problemas com o IndexedDB
 * Este script verifica como o IndexedDB está armazenando dados e como diferentes portas podem afetar o armazenamento
 */

// Função para verificar o banco de dados IndexedDB
async function diagnoseIndexedDB() {
  console.log('=== DIAGNÓSTICO DO INDEXEDDB ===');
  
  try {
    // Verificar se o IndexedDB está disponível
    if (!window.indexedDB) {
      console.error('IndexedDB não está disponível neste navegador');
      return;
    }
    
    console.log('IndexedDB está disponível');
    
    // Tentar abrir o banco de dados
    const dbName = 'estoqueDB';
    const dbVersion = 4;
    
    console.log(`Tentando abrir banco de dados: ${dbName} (versão ${dbVersion})`);
    
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onerror = (event) => {
      console.error('Erro ao abrir o banco de dados:', event.target.error);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log('Banco de dados aberto com sucesso');
      console.log('Versão atual:', db.version);
      
      // Listar object stores
      const objectStoreNames = Array.from(db.objectStoreNames);
      console.log('Object stores disponíveis:', objectStoreNames);
      
      // Verificar dados em cada object store
      const transaction = db.transaction(objectStoreNames, 'readonly');
      
      objectStoreNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          console.log(`${storeName}: ${countRequest.result} registros`);
          
          // Se for a store de produtos, mostrar mais detalhes
          if (storeName === 'products') {
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
              const products = getAllRequest.result;
              console.log(`Detalhes dos produtos (${products.length} encontrados):`);
              
              if (products.length > 0) {
                // Mostrar apenas alguns produtos para não sobrecarregar o console
                const sampleSize = Math.min(3, products.length);
                for (let i = 0; i < sampleSize; i++) {
                  console.log(`- Produto ${i+1}:`, {
                    id: products[i].id,
                    description: products[i].description,
                    price: products[i].price,
                    quantity: products[i].quantity
                  });
                }
                
                if (products.length > sampleSize) {
                  console.log(`... e mais ${products.length - sampleSize} produtos`);
                }
              } else {
                console.log('Nenhum produto encontrado');
              }
            };
          }
        };
      });
      
      // Verificar origem do banco de dados
      console.log('Origem do banco de dados:');
      console.log('- URL:', window.location.href);
      console.log('- Hostname:', window.location.hostname);
      console.log('- Porta:', window.location.port);
      console.log('- Protocolo:', window.location.protocol);
      console.log('- Origin:', window.location.origin);
      
      // Verificar se há outros bancos de dados
      if ('databases' in indexedDB) {
        indexedDB.databases().then(databases => {
          console.log('Outros bancos de dados IndexedDB nesta origem:');
          databases.forEach(database => {
            console.log(`- ${database.name} (versão ${database.version})`);
          });
        });
      } else {
        console.log('API indexedDB.databases() não disponível neste navegador');
      }
    };
    
    request.onupgradeneeded = (event) => {
      console.log('Upgrade do banco de dados necessário');
      console.log('Versão antiga:', event.oldVersion);
      console.log('Nova versão:', event.newVersion);
    };
    
  } catch (error) {
    console.error('Erro durante o diagnóstico:', error);
  }
}

// Executar o diagnóstico quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
  console.log('Página carregada, iniciando diagnóstico...');
  diagnoseIndexedDB();
});

// Adicionar botão para executar o diagnóstico manualmente
const button = document.createElement('button');
button.textContent = 'Diagnosticar IndexedDB';
button.style.position = 'fixed';
button.style.bottom = '10px';
button.style.right = '10px';
button.style.zIndex = '9999';
button.style.padding = '10px';
button.style.backgroundColor = '#4CAF50';
button.style.color = 'white';
button.style.border = 'none';
button.style.borderRadius = '5px';
button.style.cursor = 'pointer';

button.addEventListener('click', diagnoseIndexedDB);

document.body.appendChild(button);

// Exibir informações sobre a origem
console.log('=== INFORMAÇÕES DE ORIGEM ===');
console.log('URL:', window.location.href);
console.log('Hostname:', window.location.hostname);
console.log('Porta:', window.location.port);
console.log('Protocolo:', window.location.protocol);
console.log('Origin:', window.location.origin);
