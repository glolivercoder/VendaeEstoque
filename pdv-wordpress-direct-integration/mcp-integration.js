/**
 * PDV Vendas - WordPress Direct Integration
 * Script para uso com o MCP Browser Tools
 * 
 * Para usar:
 * 1. Inicie o MCP Browser Tools: npx @agentdeskai/browser-tools-mcp@latest
 * 2. Cole este script no console do navegador
 * 3. Selecione um elemento usando o MCP Browser Tools
 * 4. Execute a função: syncSelectedElementToWordPress()
 */

// Configurações
const WORDPRESS_CONFIG = {
    apiUrl: 'https://achadinhoshopp.com.br/loja/wp-json/pdv-vendas/v1',
    credentials: {
        apiKey: 'OxCq4oUPrd5hqxPEq1zdjEd4',
        username: 'gloliverx',
        password: 'OxCq4oUPrd5hqxPEq1zdjEd4'
    }
};

// Função para obter elemento selecionado via MCP
async function getSelectedElementViaMCP() {
    if (typeof getSelectedElement_Browser_Tools_Agent !== 'function') {
        console.error('MCP Browser Tools não está disponível. Execute: npx @agentdeskai/browser-tools-mcp@latest');
        return null;
    }
    
    try {
        const result = await getSelectedElement_Browser_Tools_Agent();
        return result && result.result ? result.result : null;
    } catch (error) {
        console.error('Erro ao obter elemento via MCP:', error);
        return null;
    }
}

// Função para extrair dados do elemento
function extractDataFromElement(element) {
    if (!element) return null;
    
    console.log('Extraindo dados do elemento:', element);
    
    // Tentar obter informações do elemento
    const id = element.id || element.dataset.id || element.dataset.productId || `item-${Date.now()}`;
    
    // Tentar obter descrição
    let description = '';
    if (element.textContent) {
        description = element.textContent.trim();
        // Limitar tamanho da descrição
        if (description.length > 100) {
            description = description.substring(0, 100) + '...';
        }
    } else {
        description = 'Produto Selecionado';
    }
    
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
    
    // Tentar encontrar categoria
    let category = 'Geral';
    const categoryElements = ['category', 'categoria', 'tipo', 'group'];
    for (const catClass of categoryElements) {
        const catElement = element.querySelector(`.${catClass}`) || element.closest(`.${catClass}`);
        if (catElement && catElement.textContent) {
            category = catElement.textContent.trim();
            break;
        }
    }
    
    // Tentar encontrar imagem
    let image = '';
    const img = element.querySelector('img');
    if (img && img.src) {
        image = img.src;
    }
    
    const productData = {
        id,
        description,
        itemDescription: description,
        price,
        quantity,
        category,
        image
    };
    
    console.log('Dados extraídos:', productData);
    return productData;
}

// Função para sincronizar elemento selecionado com o WordPress
async function syncSelectedElementToWordPress() {
    try {
        console.log('Iniciando sincronização com WordPress...');
        
        // Obter elemento selecionado
        const element = await getSelectedElementViaMCP();
        
        if (!element) {
            console.error('Nenhum elemento selecionado. Use o MCP Browser Tools para selecionar um elemento.');
            alert('Nenhum elemento selecionado. Por favor, selecione um elemento usando o MCP Browser Tools.');
            return;
        }
        
        console.log('Elemento selecionado:', element);
        
        // Extrair dados do elemento
        const productData = extractDataFromElement(element);
        
        if (!productData) {
            console.error('Não foi possível extrair dados do elemento selecionado.');
            alert('Não foi possível extrair dados do elemento selecionado.');
            return;
        }
        
        // Confirmar sincronização
        if (!confirm(`Sincronizar item "${productData.description}" com preço R$ ${productData.price} para o WordPress?`)) {
            console.log('Sincronização cancelada pelo usuário.');
            return;
        }
        
        console.log('Enviando dados para o WordPress:', productData);
        
        // Mostrar status
        showStatus('Sincronizando item com WordPress...', 'info');
        
        // Enviar para o WordPress
        const response = await fetch(`${WORDPRESS_CONFIG.apiUrl}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-PDV-API-Key': WORDPRESS_CONFIG.credentials.apiKey,
                'X-PDV-Username': WORDPRESS_CONFIG.credentials.username,
                'X-PDV-Password': WORDPRESS_CONFIG.credentials.password
            },
            body: JSON.stringify({
                products: [productData]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao sincronizar: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Resultado da sincronização:', result);
        
        // Mostrar sucesso
        showStatus(`Sincronização concluída com sucesso! Item "${productData.description}" sincronizado.`, 'success');
        
        return result;
        
    } catch (error) {
        console.error('Erro durante a sincronização:', error);
        showStatus(`Erro durante a sincronização: ${error.message}`, 'error');
        throw error;
    }
}

// Função para mostrar status na interface
function showStatus(message, type = 'info') {
    // Remover status anterior se existir
    const existingStatus = document.getElementById('pdv-sync-status');
    if (existingStatus) {
        document.body.removeChild(existingStatus);
    }
    
    // Criar elemento de status
    const statusElement = document.createElement('div');
    statusElement.id = 'pdv-sync-status';
    statusElement.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 15px; border-radius: 5px; z-index: 9999; max-width: 400px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
    
    // Definir estilo com base no tipo
    switch (type) {
        case 'success':
            statusElement.style.backgroundColor = '#d4edda';
            statusElement.style.color = '#155724';
            break;
        case 'error':
            statusElement.style.backgroundColor = '#f8d7da';
            statusElement.style.color = '#721c24';
            break;
        default:
            statusElement.style.backgroundColor = '#cce5ff';
            statusElement.style.color = '#004085';
            break;
    }
    
    // Definir mensagem
    statusElement.textContent = message;
    
    // Adicionar ao corpo da página
    document.body.appendChild(statusElement);
    
    // Remover automaticamente após 5 segundos para tipos success e error
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            if (document.body.contains(statusElement)) {
                document.body.removeChild(statusElement);
            }
        }, 5000);
    }
    
    return statusElement;
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
    button.addEventListener('click', syncSelectedElementToWordPress);
    
    // Adicionar ao corpo da página
    document.body.appendChild(button);
    
    console.log('Botão de sincronização adicionado.');
}

// Adicionar botão de sincronização
addSyncButton();

// Verificar se o MCP Browser Tools está disponível
if (typeof getSelectedElement_Browser_Tools_Agent !== 'function') {
    console.warn('MCP Browser Tools não detectado. Execute: npx @agentdeskai/browser-tools-mcp@latest');
    showStatus('MCP Browser Tools não detectado. Execute: npx @agentdeskai/browser-tools-mcp@latest', 'error');
} else {
    console.log('MCP Browser Tools detectado!');
    showStatus('MCP Browser Tools detectado! Selecione um elemento e clique no botão de sincronização.', 'success');
}

console.log('Script de integração PDV Vendas → WordPress carregado com sucesso!');
console.log('Selecione um elemento usando o MCP Browser Tools e execute: syncSelectedElementToWordPress()');

// Exportar função para uso global
window.syncSelectedElementToWordPress = syncSelectedElementToWordPress;
