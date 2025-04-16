/**
 * Script otimizado para exportar produtos do estoqueDB do PDV Vendas
 * Execute este script no console do navegador com o PDV Vendas aberto
 */

// Função para exportar produtos do estoqueDB
async function exportarProdutos() {
    console.log('Iniciando exportação de produtos do estoqueDB...');

    try {
        // Verificar se a API IndexedDB está disponível
        if (!window.indexedDB) {
            console.error('Seu navegador não suporta IndexedDB!');
            alert('Seu navegador não suporta IndexedDB!');
            return;
        }

        // Nome do banco de dados e object store identificados pelo diagnóstico
        const dbName = 'estoqueDB';
        const storeName = 'products';

        console.log(`Tentando abrir o banco de dados: ${dbName}`);

        // Abrir o banco de dados
        const db = await abrirBancoDados(dbName);
        if (!db) {
            console.error(`Não foi possível abrir o banco de dados ${dbName}!`);
            alert(`Não foi possível abrir o banco de dados ${dbName}!`);
            return;
        }

        console.log(`Banco de dados aberto: ${dbName}`);
        console.log(`Object stores disponíveis: ${Array.from(db.objectStoreNames).join(', ')}`);

        // Verificar se o object store 'products' existe
        if (!db.objectStoreNames.contains(storeName)) {
            console.error(`Object store "${storeName}" não encontrado!`);
            alert(`Object store "${storeName}" não encontrado!`);
            db.close();
            return;
        }

        console.log(`Exportando produtos do object store: ${storeName}`);

        try {
            // Obter todos os produtos
            const produtos = await obterTodosRegistros(db, storeName);

            if (produtos && produtos.length > 0) {
                console.log(`Encontrados ${produtos.length} produtos.`);
                console.log('Exemplo de produto:', produtos[0]);

                // Exportar produtos para arquivo
                await exportarParaArquivo(produtos, `${dbName}-${storeName}.json`);
                console.log('Exportação concluída com sucesso!');
            } else {
                console.warn(`Nenhum produto encontrado em ${storeName}.`);
                alert(`Nenhum produto encontrado em ${storeName}.`);
            }
        } catch (error) {
            console.error(`Erro ao acessar ${storeName}:`, error);
            alert(`Erro ao acessar ${storeName}: ${error.message}`);
        }

        db.close();
    } catch (error) {
        console.error('Erro durante a exportação:', error);
        alert(`Erro durante a exportação: ${error.message}`);
    }
}

// Função para abrir um banco de dados
function abrirBancoDados(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);

        request.onerror = (event) => {
            console.log(`Não foi possível abrir o banco ${dbName}.`);
            resolve(null);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            // Isso só acontecerá se o banco não existir ou a versão for maior
            event.target.transaction.abort(); // Abortar para não criar/modificar o banco
            resolve(null);
        };
    });
}

// Função para obter todos os registros de um object store
function obterTodosRegistros(db, storeName) {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        } catch (error) {
            reject(error);
        }
    });
}

// Função para verificar se os registros parecem ser produtos
function verificarSeProdutos(registros) {
    if (!registros || registros.length === 0) return false;

    // Verificar o primeiro registro
    const amostra = registros[0];

    // Campos comuns em produtos
    const camposProduto = [
        'description', 'nome', 'name', 'descricao', 'titulo', 'title',  // Nome/descrição
        'price', 'preco', 'valor', 'value',                             // Preço
        'quantity', 'quantidade', 'estoque', 'stock',                   // Quantidade
        'category', 'categoria',                                        // Categoria
        'image', 'imagem', 'foto', 'picture'                            // Imagem
    ];

    // Verificar se pelo menos alguns campos comuns estão presentes
    const camposEncontrados = camposProduto.filter(campo =>
        amostra.hasOwnProperty(campo) ||
        Object.keys(amostra).some(key => key.toLowerCase().includes(campo.toLowerCase()))
    );

    // Se encontrou pelo menos 2 campos comuns, provavelmente são produtos
    return camposEncontrados.length >= 2;
}

// Função para exportar os dados para um arquivo
async function exportarParaArquivo(dados, nomeArquivo) {
    // Criar um objeto Blob com os dados
    const dadosJson = JSON.stringify(dados, null, 2);
    const blob = new Blob([dadosJson], { type: 'application/json' });

    // Criar um link para download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);

    // Iniciar o download
    a.click();

    // Limpar
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);

    console.log(`Exportados ${dados.length} registros com sucesso para ${nomeArquivo}!`);
    alert(`Exportados ${dados.length} registros com sucesso!\n\nSalve o arquivo na pasta 'data' do script de sincronização.`);

    return true;
}

// Executar a exportação
exportarProdutos().catch(error => {
    console.error('Erro não tratado:', error);
    alert(`Erro não tratado: ${error.message}`);
});
