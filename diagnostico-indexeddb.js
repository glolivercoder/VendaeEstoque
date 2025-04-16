/**
 * Script de diagnóstico para IndexedDB
 * Execute este script no console do navegador com o PDV Vendas aberto
 */

// Função para listar todos os bancos de dados IndexedDB
async function listarBancosIndexedDB() {
    console.log('Iniciando diagnóstico do IndexedDB...');
    
    try {
        // Verificar se a API IndexedDB está disponível
        if (!window.indexedDB) {
            console.error('Seu navegador não suporta IndexedDB!');
            alert('Seu navegador não suporta IndexedDB!');
            return;
        }
        
        // Obter lista de bancos de dados (disponível apenas em navegadores modernos)
        if (window.indexedDB.databases) {
            console.log('Listando todos os bancos de dados IndexedDB:');
            const databases = await window.indexedDB.databases();
            
            if (databases.length === 0) {
                console.log('Nenhum banco de dados IndexedDB encontrado!');
            } else {
                console.table(databases);
                
                // Para cada banco de dados, tentar abrir e listar os object stores
                for (const db of databases) {
                    await examinarBancoDados(db.name, db.version);
                }
            }
        } else {
            console.log('API indexedDB.databases() não disponível neste navegador.');
            console.log('Tentando abrir bancos de dados conhecidos:');
            
            // Tentar abrir bancos de dados com nomes comuns
            const dbNames = [
                'pdv-vendas-db', 
                'pdv-db', 
                'estoque-app-db', 
                'vendas-db',
                'pdv-estoque-db',
                'localforage'
            ];
            
            for (const dbName of dbNames) {
                await examinarBancoDados(dbName);
            }
        }
    } catch (error) {
        console.error('Erro durante o diagnóstico:', error);
    }
}

// Função para examinar um banco de dados específico
async function examinarBancoDados(dbName, version) {
    return new Promise((resolve) => {
        console.log(`\nExaminando banco de dados: ${dbName}`);
        
        try {
            const request = indexedDB.open(dbName);
            
            request.onerror = (event) => {
                console.error(`Erro ao abrir banco ${dbName}:`, event.target.error);
                resolve();
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const objectStoreNames = Array.from(db.objectStoreNames);
                
                console.log(`Banco: ${dbName}, Versão: ${db.version}`);
                console.log(`Object Stores (${objectStoreNames.length}):`, objectStoreNames);
                
                // Examinar cada object store
                if (objectStoreNames.length > 0) {
                    const transaction = db.transaction(objectStoreNames, 'readonly');
                    
                    objectStoreNames.forEach(storeName => {
                        const store = transaction.objectStore(storeName);
                        const indexes = Array.from(store.indexNames);
                        
                        console.log(`\nObject Store: ${storeName}`);
                        console.log(`- Key Path: ${store.keyPath}`);
                        console.log(`- Auto Increment: ${store.autoIncrement}`);
                        console.log(`- Indexes (${indexes.length}):`, indexes);
                        
                        // Contar registros
                        const countRequest = store.count();
                        countRequest.onsuccess = () => {
                            console.log(`- Número de registros: ${countRequest.result}`);
                            
                            // Se for um store que pode conter produtos, mostrar uma amostra
                            if (storeName.includes('product') || 
                                storeName.includes('item') || 
                                storeName === 'products' || 
                                storeName === 'items') {
                                
                                const sampleRequest = store.getAll(null, 1);
                                sampleRequest.onsuccess = () => {
                                    if (sampleRequest.result.length > 0) {
                                        console.log('- Amostra de registro:');
                                        console.log(sampleRequest.result[0]);
                                    }
                                };
                            }
                        };
                    });
                    
                    transaction.oncomplete = () => {
                        db.close();
                        resolve();
                    };
                } else {
                    db.close();
                    resolve();
                }
            };
            
            request.onupgradeneeded = (event) => {
                // Isso só acontecerá se o banco não existir ou a versão for maior
                console.log(`Banco ${dbName} não existe ou versão solicitada é maior.`);
                event.target.transaction.abort(); // Abortar para não criar/modificar o banco
                resolve();
            };
        } catch (error) {
            console.error(`Erro ao examinar banco ${dbName}:`, error);
            resolve();
        }
    });
}

// Executar o diagnóstico
listarBancosIndexedDB().then(() => {
    console.log('\nDiagnóstico do IndexedDB concluído!');
    console.log('Copie estas informações para ajudar na solução do problema.');
});
