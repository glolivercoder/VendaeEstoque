// Script para verificar a integridade do banco de dados
console.log('=== VERIFICAÇÃO DO BANCO DE DADOS ===');
console.log('Data e hora: ' + new Date().toLocaleString());
console.log('===================================\n');

// Como este script é executado no Node.js e não no navegador,
// não temos acesso direto ao IndexedDB. Vamos fornecer instruções
// para verificar o banco de dados no navegador.

console.log(`
Para verificar a integridade do banco de dados no navegador, execute o seguinte código no console:

// Função para verificar a integridade do banco de dados
async function checkDatabaseIntegrity() {
  console.log('Iniciando verificação de integridade do banco de dados...');
  
  try {
    // Abrir o banco de dados
    const dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('estoqueDB');
      request.onerror = event => reject(event.target.error);
      request.onsuccess = event => resolve(event.target.result);
    });
    
    const db = await dbPromise;
    console.log('Banco de dados aberto com sucesso. Versão:', db.version);
    
    // Verificar object stores
    const stores = Array.from(db.objectStoreNames);
    console.log('Object stores encontrados:', stores);
    
    if (!stores.includes('products')) {
      console.error('ERRO: Object store "products" não encontrado!');
    }
    
    if (!stores.includes('vendors')) {
      console.error('ERRO: Object store "vendors" não encontrado!');
    }
    
    if (!stores.includes('clients')) {
      console.error('ERRO: Object store "clients" não encontrado!');
    }
    
    if (!stores.includes('sales')) {
      console.error('ERRO: Object store "sales" não encontrado!');
    }
    
    // Verificar dados em cada store
    const results = {};
    
    for (const storeName of stores) {
      const storeData = await new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onerror = event => reject(event.target.error);
        request.onsuccess = event => resolve(event.target.result);
      });
      
      results[storeName] = {
        count: storeData.length,
        hasData: storeData.length > 0,
        sample: storeData.length > 0 ? storeData[0] : null
      };
      
      console.log(\`Store "\${storeName}": \${storeData.length} registros\`);
      
      // Verificações específicas para cada store
      if (storeName === 'products') {
        const invalidProducts = storeData.filter(product => 
          !product.description || 
          typeof product.price !== 'number' || 
          isNaN(product.price)
        );
        
        if (invalidProducts.length > 0) {
          console.error(\`ERRO: \${invalidProducts.length} produtos com dados inválidos!\`);
          console.log('Exemplo de produto inválido:', invalidProducts[0]);
        }
      }
      
      if (storeName === 'sales') {
        const invalidDates = storeData.filter(sale => 
          !sale.date || 
          (typeof sale.date === 'string' && !sale.date.includes('/'))
        );
        
        if (invalidDates.length > 0) {
          console.error(\`ERRO: \${invalidDates.length} vendas com datas inválidas!\`);
          console.log('Exemplo de venda com data inválida:', invalidDates[0]);
        }
      }
    }
    
    console.log('Resumo da verificação:', results);
    console.log('Verificação de integridade concluída!');
    
    return {
      success: true,
      stores: results
    };
  } catch (error) {
    console.error('Erro durante a verificação de integridade:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar a verificação
checkDatabaseIntegrity().then(result => {
  console.log('Resultado final:', result);
});
`);

console.log('\n=== FIM DA VERIFICAÇÃO ===');
