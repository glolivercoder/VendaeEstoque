/**
 * Serviço para sincronizar dados do PDV Vendas com o WordPress
 */

// Configurações
const WORDPRESS_API_URL = 'https://achadinhoshopp.com.br/loja/wp-json/pdv-vendas/v1';
const API_KEY = 'OxCq4oUPrd5hqxPEq1zdjEd4';
const USERNAME = 'gloliverx';
const PASSWORD = 'OxCq4oUPrd5hqxPEq1zdjEd4';

/**
 * Função para sincronizar produtos selecionados com o WordPress
 * @param {Array} selectedItems - Array de IDs dos itens selecionados
 * @param {Array} allItems - Array de todos os itens disponíveis
 * @returns {Promise} - Promise com o resultado da sincronização
 */
export const syncSelectedItemsToWordPress = async (selectedItems, allItems) => {
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
};

/**
 * Função para atualizar o estoque no WordPress
 * @param {Array} products - Array de produtos com ID e quantidade
 * @returns {Promise} - Promise com o resultado da atualização
 */
export const updateWordPressStock = async (products) => {
    try {
        const response = await fetch(`${WORDPRESS_API_URL}/stock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-PDV-API-Key': API_KEY,
                'X-PDV-Username': USERNAME,
                'X-PDV-Password': PASSWORD
            },
            body: JSON.stringify({
                products: products
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao atualizar estoque: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Estoque atualizado com sucesso:', result);

        return {
            success: true,
            message: `${result.updated_count} produtos atualizados com sucesso!`,
            details: result
        };
    } catch (error) {
        console.error('Erro ao atualizar estoque no WordPress:', error);

        return {
            success: false,
            message: `Erro ao atualizar estoque: ${error.message}`,
            error
        };
    }
};

/**
 * Função para obter produtos do WordPress
 * @param {Object} options - Opções de filtro (categoria, limite)
 * @returns {Promise} - Promise com os produtos
 */
export const getProductsFromWordPress = async (options = {}) => {
    try {
        const { category, limit } = options;
        let url = `${WORDPRESS_API_URL}/get-products`;

        // Adicionar parâmetros de consulta
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (limit) params.append('limit', limit);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-PDV-API-Key': API_KEY,
                'X-PDV-Username': USERNAME,
                'X-PDV-Password': PASSWORD
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao obter produtos: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Produtos obtidos com sucesso:', result);

        return {
            success: true,
            count: result.count,
            products: result.products
        };
    } catch (error) {
        console.error('Erro ao obter produtos do WordPress:', error);

        return {
            success: false,
            message: `Erro ao obter produtos: ${error.message}`,
            error,
            products: []
        };
    }
};

/**
 * Função para configurar o webhook para receber notificações de vendas do WordPress
 * @param {Function} callback - Função a ser chamada quando uma venda for recebida
 * @returns {Object} - Objeto com métodos para gerenciar o webhook
 */
export const setupSalesWebhook = (callback) => {
    // URL para o endpoint que receberá as notificações de vendas
    const webhookUrl = window.location.origin + '/api/wordpress-webhook';

    // Variável para armazenar o intervalo de verificação
    let pollingInterval = null;

    // Função para verificar vendas recentes
    const checkRecentSales = async () => {
        try {
            const result = await getProductsFromWordPress();

            if (result.success && callback) {
                callback(result);
            }
        } catch (error) {
            console.error('Erro ao verificar vendas recentes:', error);
        }
    };

    return {
        // Iniciar a verificação periódica
        start: (intervalMs = 60000) => { // Padrão: verificar a cada 1 minuto
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }

            pollingInterval = setInterval(checkRecentSales, intervalMs);
            console.log(`Webhook de vendas configurado. Verificando a cada ${intervalMs / 1000} segundos.`);

            // Verificar imediatamente
            checkRecentSales();

            return webhookUrl;
        },

        // Parar a verificação
        stop: () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                console.log('Webhook de vendas parado.');
            }
        },

        // Verificar manualmente
        check: checkRecentSales
    };
};

/**
 * Função para limpar os produtos existentes no WordPress
 * @returns {Promise} - Promise com o resultado da limpeza
 */
export const clearWordPressProducts = async () => {
    try {
        const response = await fetch(`${WORDPRESS_API_URL}/clear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-PDV-API-Key': API_KEY,
                'X-PDV-Username': USERNAME,
                'X-PDV-Password': PASSWORD
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
};

/**
 * Função para enviar produtos para o WordPress
 * @param {Array} products - Array de produtos a serem enviados
 * @returns {Promise} - Promise com o resultado do envio
 */
export const sendProductsToWordPress = async (products) => {
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
                'X-PDV-API-Key': API_KEY,
                'X-PDV-Username': USERNAME,
                'X-PDV-Password': PASSWORD
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
};
