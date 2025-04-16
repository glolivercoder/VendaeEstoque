/**
 * Script para exportar produtos do IndexedDB do PDV Vendas
 * Execute este script no console do navegador com o PDV Vendas aberto
 */

// Função para exportar produtos
async function exportPdvProducts() {
    try {
        // Abrir conexão com o banco de dados
        const dbRequest = indexedDB.open('pdv-vendas-db', 5);
        
        // Manipular erro na abertura do banco
        dbRequest.onerror = (event) => {
            console.error(`Erro ao abrir o banco de dados: ${event.target.errorCode}`);
            alert(`Erro ao abrir o banco de dados: ${event.target.errorCode}`);
        };
        
        // Quando o banco for aberto com sucesso
        dbRequest.onsuccess = (event) => {
            const db = event.target.result;
            
            // Verificar se o object store 'products' existe
            if (!db.objectStoreNames.contains('products')) {
                console.error('Object store "products" não encontrado!');
                alert('Object store "products" não encontrado! Verifique se você está no PDV Vendas.');
                return;
            }
            
            // Iniciar transação para leitura
            const transaction = db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const request = store.getAll();
            
            // Quando os produtos forem obtidos com sucesso
            request.onsuccess = () => {
                const products = request.result;
                
                if (products.length === 0) {
                    console.warn('Nenhum produto encontrado no banco de dados!');
                    alert('Nenhum produto encontrado no banco de dados!');
                    return;
                }
                
                // Criar um objeto Blob com os dados
                const productsJson = JSON.stringify(products, null, 2);
                const blob = new Blob([productsJson], { type: 'application/json' });
                
                // Criar um link para download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'pdv-vendas-products.json';
                document.body.appendChild(a);
                
                // Iniciar o download
                a.click();
                
                // Limpar
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                
                console.log(`Exportados ${products.length} produtos com sucesso!`);
                alert(`Exportados ${products.length} produtos com sucesso!\n\nSalve o arquivo na pasta 'data' do script de sincronização.`);
            };
            
            // Manipular erro na obtenção dos produtos
            request.onerror = (event) => {
                console.error(`Erro ao obter produtos: ${event.target.errorCode}`);
                alert(`Erro ao obter produtos: ${event.target.errorCode}`);
            };
        };
    } catch (error) {
        console.error('Erro ao exportar produtos:', error);
        alert(`Erro ao exportar produtos: ${error.message}`);
    }
}

// Executar a exportação
console.log('Iniciando exportação de produtos do PDV Vendas...');
exportPdvProducts();
