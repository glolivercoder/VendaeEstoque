/**
 * PDV Vendas - WordPress Direct Integration
 * Script para injeção direta no console do navegador
 */

(function() {
    // Configurações
    const CONFIG = {
        // URL da API WordPress
        wordpressApiUrl: 'https://achadinhoshopp.com.br/loja/wp-json/pdv-vendas/v1',
        
        // Credenciais de autenticação
        credentials: {
            apiKey: 'OxCq4oUPrd5hqxPEq1zdjEd4',
            username: 'gloliverx',
            password: 'OxCq4oUPrd5hqxPEq1zdjEd4'
        }
    };
    
    // Verificar se o MCP Browser Tools está disponível
    const hasMCP = typeof window.getSelectedElement_Browser_Tools_Agent === 'function';
    
    // Função para obter elemento selecionado via MCP
    async function getSelectedElementViaMCP() {
        if (!hasMCP) return null;
        
        try {
            const result = await window.getSelectedElement_Browser_Tools_Agent();
            return result && result.result ? result.result : null;
        } catch (error) {
            console.error('Erro ao obter elemento via MCP:', error);
            return null;
        }
    }
    
    // Função para extrair dados do elemento
    function extractData(element) {
        if (!element) return null;
        
        // Tentar obter informações do elemento
        const id = element.id || element.dataset.id || element.dataset.productId || `item-${Date.now()}`;
        const description = element.textContent ? element.textContent.trim() : 'Produto Selecionado';
        
        // Tentar encontrar preço
        let price = 0;
        const priceRegex = /R?\$?\s*(\d+[.,]?\d*)/;
        const priceMatch = element.textContent ? element.textContent.match(priceRegex) : null;
        if (priceMatch) {
            price = parseFloat(priceMatch[1].replace(',', '.'));
        }
        
        // Tentar encontrar quantidade
        let quantity = 1;
        const quantityRegex = /(\d+)\s*(un|pcs|qtd|quantidade)/i;
        const quantityMatch = element.textContent ? element.textContent.match(quantityRegex) : null;
        if (quantityMatch) {
            quantity = parseInt(quantityMatch[1]);
        }
        
        // Tentar encontrar imagem
        let image = '';
        const img = element.querySelector('img');
        if (img && img.src) {
            image = img.src;
        }
        
        return {
            id,
            description,
            itemDescription: description,
            price,
            quantity,
            category: 'Geral',
            image
        };
    }
    
    // Função para sincronizar elemento selecionado
    async function syncSelectedElement() {
        try {
            // Obter elemento selecionado
            const element = await getSelectedElementViaMCP();
            
            if (!element) {
                alert('Nenhum elemento selecionado. Por favor, selecione um elemento usando o MCP Browser Tools.');
                return;
            }
            
            // Extrair dados do elemento
            const item = extractData(element);
            
            // Mostrar dados extraídos
            console.log('Dados extraídos do elemento selecionado:', item);
            
            // Confirmar sincronização
            if (!confirm(`Sincronizar item "${item.description}" com preço R$ ${item.price} para o WordPress?`)) {
                return;
            }
            
            // Mostrar status
            const statusElement = document.createElement('div');
            statusElement.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 15px; background-color: #cce5ff; color: #004085; border-radius: 5px; z-index: 9999; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
            statusElement.textContent = 'Sincronizando item com WordPress...';
            document.body.appendChild(statusElement);
            
            // Enviar para o WordPress
            const response = await fetch(`${CONFIG.wordpressApiUrl}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-PDV-API-Key': CONFIG.credentials.apiKey,
                    'X-PDV-Username': CONFIG.credentials.username,
                    'X-PDV-Password': CONFIG.credentials.password
                },
                body: JSON.stringify({
                    products: [item]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erro ao sincronizar: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Atualizar status
            statusElement.style.backgroundColor = '#d4edda';
            statusElement.style.color = '#155724';
            statusElement.textContent = `Sincronização concluída com sucesso! Item "${item.description}" sincronizado.`;
            
            // Remover status após 5 segundos
            setTimeout(() => {
                if (document.body.contains(statusElement)) {
                    document.body.removeChild(statusElement);
                }
            }, 5000);
            
            console.log('Resultado da sincronização:', result);
            return result;
            
        } catch (error) {
            console.error('Erro durante a sincronização:', error);
            
            // Mostrar erro
            const errorElement = document.createElement('div');
            errorElement.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 15px; background-color: #f8d7da; color: #721c24; border-radius: 5px; z-index: 9999; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
            errorElement.textContent = `Erro durante a sincronização: ${error.message}`;
            document.body.appendChild(errorElement);
            
            // Remover erro após 5 segundos
            setTimeout(() => {
                if (document.body.contains(errorElement)) {
                    document.body.removeChild(errorElement);
                }
            }, 5000);
            
            throw error;
        }
    }
    
    // Adicionar botão de sincronização
    function addSyncButton() {
        // Verificar se o botão já existe
        if (document.getElementById('pdv-wp-sync-button')) {
            return;
        }
        
        // Criar botão
        const button = document.createElement('button');
        button.id = 'pdv-wp-sync-button';
        button.textContent = 'Sincronizar com WordPress';
        button.style.cssText = 'position: fixed; bottom: 20px; left: 20px; padding: 10px 15px; background-color: #21759b; color: white; border: none; border-radius: 5px; z-index: 9999; cursor: pointer; font-weight: bold;';
        
        // Adicionar evento de clique
        button.addEventListener('click', syncSelectedElement);
        
        // Adicionar ao corpo da página
        document.body.appendChild(button);
    }
    
    // Inicializar
    addSyncButton();
    
    // Exportar função para uso no console
    window.syncSelectedElementToWordPress = syncSelectedElement;
    
    console.log('Script de sincronização PDV Vendas → WordPress carregado!');
    console.log('Selecione um elemento usando o MCP Browser Tools e clique no botão "Sincronizar com WordPress"');
    console.log('Ou execute manualmente: syncSelectedElementToWordPress()');
})();
