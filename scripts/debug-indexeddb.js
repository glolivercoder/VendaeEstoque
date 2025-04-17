// Script para depurar o IndexedDB
console.log('=== DIAGNÓSTICO DO INDEXEDDB ===');
console.log('Data e hora: ' + new Date().toLocaleString());
console.log('================================\n');

// Como este script é executado no Node.js e não no navegador,
// não temos acesso direto ao IndexedDB. Vamos fornecer instruções
// para depurar o IndexedDB no navegador.

console.log(`
Para depurar o IndexedDB no navegador, siga estas instruções:

1. Abra o aplicativo PDV Vendas no navegador
2. Abra as Ferramentas de Desenvolvedor (F12 ou Ctrl+Shift+I)
3. Vá para a aba "Application"
4. No painel esquerdo, expanda "IndexedDB"
5. Clique em "estoqueDB" para ver os stores
6. Clique em cada store para ver os dados armazenados

Você também pode executar o seguinte código no console do navegador para obter informações sobre o IndexedDB:

// Listar todos os bancos de dados IndexedDB
indexedDB.databases().then(databases => {
  console.log('Bancos de dados IndexedDB:', databases);
});

// Abrir o banco de dados estoqueDB
const request = indexedDB.open('estoqueDB');
request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('Versão do banco de dados:', db.version);
  console.log('Object stores:', Array.from(db.objectStoreNames));
  
  // Verificar dados em cada store
  const stores = Array.from(db.objectStoreNames);
  stores.forEach(storeName => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const countRequest = store.count();
    countRequest.onsuccess = () => {
      console.log(\`Store "\${storeName}" contém \${countRequest.result} registros\`);
    };
  });
};
request.onerror = (event) => {
  console.error('Erro ao abrir o banco de dados:', event.target.error);
};

// Verificar problemas comuns
console.log('Verificando problemas comuns no IndexedDB...');
if (!window.indexedDB) {
  console.error('Seu navegador não suporta IndexedDB!');
} else {
  console.log('IndexedDB é suportado pelo navegador.');
}
`);

console.log('\n=== FIM DO DIAGNÓSTICO ===');
