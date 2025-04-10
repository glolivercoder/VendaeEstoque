/**
 * Script para sincronizar dados do PDV Vendas com o WordPress
 * 
 * Este script deve ser executado no aplicativo PDV Vendas para enviar
 * os itens selecionados para o site WordPress.
 */

// Configurações
const WORDPRESS_API_URL = 'https://achadinhoshopp.com.br/loja/wp-json/pdv-vendas/v1';
const API_KEY = 'OxCq4oUPrd5hqxPEq1zdjEd4';

/**
 * Função para sincronizar produtos selecionados com o WordPress
 * @param {Array} selectedItems - Array de IDs dos itens selecionados
 * @param {Array} allItems - Array de todos os itens disponíveis
 * @returns {Promise} - Promise com o resultado da sincronização
 */
async function syncSelectedItemsToWordPress(selectedItems, allItems) {
    try {
        // Filtrar apenas os itens selecionados
        const itemsToSync = allItems.filter(item => selectedItems.includes(item.id));
        
        console.log(`Sincronizando ${itemsToSync.length} itens com o WordPress...`);
        
        // Primeiro, limpar os produtos existentes
        await clearWordPressProducts();
        
        // Depois, enviar os novos produtos
        const result = await sendProductsToWordPress(itemsToSync);
        
        console.log('Sincronização concluída com sucesso!', result);
        
        return {
            success: true,
            message: `${result.count} produtos sincronizados com sucesso!`,
            details: result
        };
    } catch (error) {
        console.error('Erro ao sincronizar com o WordPress:', error);
        
        return {
            success: false,
            message: `Erro ao sincronizar: ${error.message}`,
            error
        };
    }
}

/**
 * Função para limpar os produtos existentes no WordPress
 * @returns {Promise} - Promise com o resultado da limpeza
 */
async function clearWordPressProducts() {
    try {
        const response = await fetch(`${WORDPRESS_API_URL}/clear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-PDV-API-Key': API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao limpar produtos: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Produtos limpos com sucesso:', result);
        
        return result;
    } catch (error) {
        console.error('Erro ao limpar produtos:', error);
        throw error;
    }
}

/**
 * Função para enviar produtos para o WordPress
 * @param {Array} products - Array de produtos a serem enviados
 * @returns {Promise} - Promise com o resultado do envio
 */
async function sendProductsToWordPress(products) {
    try {
        // Formatar os produtos para o formato esperado pela API
        const formattedProducts = products.map(product => ({
            id: product.id,
            description: product.description,
            itemDescription: product.itemDescription || '',
            price: product.price,
            quantity: product.quantity || 0,
            category: product.category || 'Geral',
            image: product.image || '',
            additionalImages: product.additionalImages || []
        }));
        
        const response = await fetch(`${WORDPRESS_API_URL}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-PDV-API-Key': API_KEY
            },
            body: JSON.stringify({
                products: formattedProducts
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao enviar produtos: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Produtos enviados com sucesso:', result);
        
        return result;
    } catch (error) {
        console.error('Erro ao enviar produtos:', error);
        throw error;
    }
}

// Exportar funções para uso no aplicativo
export {
    syncSelectedItemsToWordPress,
    clearWordPressProducts,
    sendProductsToWordPress
};
