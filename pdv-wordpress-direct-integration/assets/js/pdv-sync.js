/**
 * PDV Vendas - WordPress Direct Integration
 * Script para sincronizar itens selecionados no console do navegador via MCP
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
        },

        // Configurações do MCP Browser Tools
        mcp: {
            enabled: true,
            selector: '.selected, .selected-item, .active, .checked, input[type="checkbox"]:checked'
        },

        // Seletores de elementos no DOM
        selectors: {
            itemCheckbox: 'input[type="checkbox"]:checked',
            itemRow: 'tr',
            itemId: 'data-id',
            itemDescription: '.item-description, .description, td:nth-child(2)',
            itemPrice: '.item-price, .price, td:nth-child(3)',
            itemQuantity: '.item-quantity, .quantity, td:nth-child(4)',
            itemCategory: '.item-category, .category, td:nth-child(5)',
            itemImage: '.item-image, img'
        },

        // Textos
        text: {
            buttonLabel: 'Sincronizar com WordPress',
            noItemsSelected: 'Nenhum item selecionado. Por favor, selecione pelo menos um item.',
            syncStarted: 'Iniciando sincronização...',
            syncSuccess: 'Sincronização concluída com sucesso! {count} itens sincronizados.',
            syncError: 'Erro durante a sincronização: {message}',
            clearingProducts: 'Limpando produtos existentes...',
            sendingProducts: 'Enviando produtos...'
        }
    };

    /**
     * Função para obter os itens selecionados no console via MCP Browser Tools
     */
    function getSelectedItems() {
        // Verificar se estamos usando o MCP Browser Tools
        if (CONFIG.mcp.enabled && typeof window.getSelectedElement_Browser_Tools_Agent === 'function') {
            return getMCPSelectedItems();
        } else {
            return getStandardSelectedItems();
        }
    }

    /**
     * Obter itens selecionados via MCP Browser Tools
     */
    function getMCPSelectedItems() {
        try {
            // Tentar obter elementos selecionados via MCP
            const selectedElements = [];

            // Usar o método do MCP para obter elementos selecionados
            const mcpElement = window.getSelectedElement_Browser_Tools_Agent();

            if (mcpElement && mcpElement.result) {
                // Se temos um elemento selecionado via MCP
                console.log('Elemento selecionado via MCP:', mcpElement.result);

                // Extrair informações do elemento
                const element = mcpElement.result;

                // Tentar obter o elemento pai (linha da tabela ou card)
                const row = element.closest ? element.closest(CONFIG.selectors.itemRow) : null;
                const container = row || element;

                // Extrair dados do elemento
                const id = extractElementData(container, 'id', 'data-id', 'data-product-id') ||
                           `mcp-item-${Date.now()}`;

                const description = extractElementData(container, 'text', CONFIG.selectors.itemDescription) ||
                                   'Produto via MCP';

                const priceText = extractElementData(container, 'text', CONFIG.selectors.itemPrice) || '0';
                const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

                const quantityText = extractElementData(container, 'text', CONFIG.selectors.itemQuantity) || '1';
                const quantity = parseInt(quantityText) || 1;

                const category = extractElementData(container, 'text', CONFIG.selectors.itemCategory) || 'Geral';

                const image = extractElementData(container, 'src', CONFIG.selectors.itemImage) || '';

                // Criar objeto do item
                const item = {
                    id,
                    description,
                    itemDescription: description,
                    price,
                    quantity,
                    category,
                    image,
                    source: 'mcp'
                };

                selectedElements.push(item);
                console.log('Item selecionado via MCP:', item);

                return selectedElements;
            } else {
                console.log('Nenhum elemento selecionado via MCP, tentando método padrão');
                return getStandardSelectedItems();
            }
        } catch (error) {
            console.error('Erro ao obter elementos via MCP:', error);
            return getStandardSelectedItems();
        }
    }

    /**
     * Extrair dados de um elemento
     */
    function extractElementData(element, type, ...selectors) {
        if (!element) return null;

        // Se o tipo for 'id', tentar obter o ID diretamente
        if (type === 'id') {
            for (const selector of selectors) {
                if (element.getAttribute && element.getAttribute(selector)) {
                    return element.getAttribute(selector);
                } else if (element.dataset && element.dataset[selector.replace('data-', '')]) {
                    return element.dataset[selector.replace('data-', '')];
                }
            }
            return element.id || null;
        }

        // Se o tipo for 'text', tentar obter o texto
        if (type === 'text') {
            for (const selector of selectors) {
                const child = element.querySelector ? element.querySelector(selector) : null;
                if (child && child.textContent) {
                    return child.textContent.trim();
                }
            }
            return element.textContent ? element.textContent.trim() : null;
        }

        // Se o tipo for 'src', tentar obter a URL da imagem
        if (type === 'src') {
            for (const selector of selectors) {
                const img = element.querySelector ? element.querySelector(selector) : null;
                if (img && img.src) {
                    return img.src;
                }
            }
            return null;
        }

        return null;
    }

    /**
     * Obter itens selecionados pelo método padrão
     */
    function getStandardSelectedItems() {
        const selectedCheckboxes = document.querySelectorAll(CONFIG.selectors.itemCheckbox);
        console.log('Checkboxes selecionados:', selectedCheckboxes.length);

        if (selectedCheckboxes.length === 0) {
            alert(CONFIG.text.noItemsSelected);
            return [];
        }

        const selectedItems = [];

        selectedCheckboxes.forEach(checkbox => {
            const row = checkbox.closest(CONFIG.selectors.itemRow);
            if (!row) return;

            // Tentar obter o ID do item de várias maneiras
            const id = row.getAttribute(CONFIG.selectors.itemId) ||
                       row.dataset.id ||
                       row.id ||
                       checkbox.value ||
                       `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // Tentar obter a descrição
            const descriptionEl = row.querySelector(CONFIG.selectors.itemDescription);
            const description = descriptionEl ? descriptionEl.textContent.trim() : 'Produto';

            // Tentar obter o preço
            const priceEl = row.querySelector(CONFIG.selectors.itemPrice);
            const priceText = priceEl ? priceEl.textContent.trim() : '0';
            const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

            // Tentar obter a quantidade
            const quantityEl = row.querySelector(CONFIG.selectors.itemQuantity);
            const quantity = quantityEl ? parseInt(quantityEl.textContent.trim()) || 1 : 1;

            // Tentar obter a categoria
            const categoryEl = row.querySelector(CONFIG.selectors.itemCategory);
            const category = categoryEl ? categoryEl.textContent.trim() : 'Geral';

            // Tentar obter a imagem
            const imageEl = row.querySelector(CONFIG.selectors.itemImage);
            const image = imageEl ? imageEl.src : '';

            selectedItems.push({
                id,
                description,
                itemDescription: description,
                price,
                quantity,
                category,
                image,
                source: 'standard'
            });

            console.log('Item selecionado:', { id, description, price, quantity, category });
        });

        return selectedItems;
    }

    /**
     * Função para limpar produtos existentes no WordPress
     */
    async function clearExistingProducts() {
        console.log(CONFIG.text.clearingProducts);

        try {
            const response = await fetch(`${CONFIG.wordpressApiUrl}/clear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-PDV-API-Key': CONFIG.credentials.apiKey,
                    'X-PDV-Username': CONFIG.credentials.username,
                    'X-PDV-Password': CONFIG.credentials.password
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao limpar produtos: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Produtos existentes limpos:', result);
            return result;
        } catch (error) {
            console.warn('Aviso ao limpar produtos:', error);
            // Continuar mesmo se houver erro ao limpar
            return { success: false, message: error.message };
        }
    }

    /**
     * Função para enviar produtos para o WordPress
     */
    async function sendProductsToWordPress(products) {
        console.log(CONFIG.text.sendingProducts, products);

        const response = await fetch(`${CONFIG.wordpressApiUrl}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-PDV-API-Key': CONFIG.credentials.apiKey,
                'X-PDV-Username': CONFIG.credentials.username,
                'X-PDV-Password': CONFIG.credentials.password
            },
            body: JSON.stringify({
                products: products
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao sincronizar produtos: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Produtos sincronizados:', result);
        return result;
    }

    /**
     * Função principal para sincronizar itens selecionados
     */
    async function syncSelectedItems() {
        const selectedItems = getSelectedItems();

        if (selectedItems.length === 0) {
            return;
        }

        try {
            // Mostrar mensagem de início
            const statusElement = showStatus(CONFIG.text.syncStarted, 'info');

            // Limpar produtos existentes
            await clearExistingProducts();

            // Enviar produtos selecionados
            const result = await sendProductsToWordPress(selectedItems);

            // Mostrar mensagem de sucesso
            const successMessage = CONFIG.text.syncSuccess.replace('{count}', result.count);
            updateStatus(statusElement, successMessage, 'success');

            // Também mostrar alerta
            alert(successMessage);

            return result;
        } catch (error) {
            console.error('Erro durante a sincronização:', error);

            // Mostrar mensagem de erro
            const errorMessage = CONFIG.text.syncError.replace('{message}', error.message);
            showStatus(errorMessage, 'error');

            // Também mostrar alerta
            alert(errorMessage);

            throw error;
        }
    }

    /**
     * Função para mostrar status na interface
     */
    function showStatus(message, type = 'info') {
        // Verificar se já existe um elemento de status
        let statusElement = document.getElementById('pdv-sync-status');

        if (!statusElement) {
            // Criar elemento de status
            statusElement = document.createElement('div');
            statusElement.id = 'pdv-sync-status';
            statusElement.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 15px; border-radius: 5px; z-index: 9999; max-width: 400px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);';
            document.body.appendChild(statusElement);
        }

        // Definir estilo com base no tipo
        switch (type) {
            case 'success':
                statusElement.style.backgroundColor = '#d4edda';
                statusElement.style.color = '#155724';
                statusElement.style.borderColor = '#c3e6cb';
                break;
            case 'error':
                statusElement.style.backgroundColor = '#f8d7da';
                statusElement.style.color = '#721c24';
                statusElement.style.borderColor = '#f5c6cb';
                break;
            default:
                statusElement.style.backgroundColor = '#cce5ff';
                statusElement.style.color = '#004085';
                statusElement.style.borderColor = '#b8daff';
                break;
        }

        // Definir mensagem
        statusElement.innerHTML = message;

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

    /**
     * Função para atualizar status existente
     */
    function updateStatus(statusElement, message, type = 'info') {
        if (statusElement && document.body.contains(statusElement)) {
            // Atualizar estilo
            switch (type) {
                case 'success':
                    statusElement.style.backgroundColor = '#d4edda';
                    statusElement.style.color = '#155724';
                    statusElement.style.borderColor = '#c3e6cb';
                    break;
                case 'error':
                    statusElement.style.backgroundColor = '#f8d7da';
                    statusElement.style.color = '#721c24';
                    statusElement.style.borderColor = '#f5c6cb';
                    break;
                default:
                    statusElement.style.backgroundColor = '#cce5ff';
                    statusElement.style.color = '#004085';
                    statusElement.style.borderColor = '#b8daff';
                    break;
            }

            // Atualizar mensagem
            statusElement.innerHTML = message;

            // Remover automaticamente após 5 segundos para tipos success e error
            if (type === 'success' || type === 'error') {
                setTimeout(() => {
                    if (document.body.contains(statusElement)) {
                        document.body.removeChild(statusElement);
                    }
                }, 5000);
            }
        } else {
            // Se o elemento não existir mais, criar um novo
            showStatus(message, type);
        }
    }

    /**
     * Função para adicionar botão de sincronização à interface
     */
    function addSyncButton() {
        // Verificar se o botão já existe
        if (document.getElementById('pdv-wordpress-sync-button')) {
            return;
        }

        // Criar o botão
        const syncButton = document.createElement('button');
        syncButton.id = 'pdv-wordpress-sync-button';
        syncButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            ${CONFIG.text.buttonLabel}
        `;
        syncButton.style.cssText = 'background-color: #21759b; color: white; border: none; border-radius: 4px; padding: 10px 16px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; margin: 10px;';

        // Adicionar evento de clique
        syncButton.addEventListener('click', syncSelectedItems);

        // Encontrar um local adequado para adicionar o botão
        const possibleContainers = [
            document.querySelector('.actions-container'),
            document.querySelector('.buttons-container'),
            document.querySelector('.toolbar'),
            document.querySelector('header'),
            document.querySelector('nav'),
            document.querySelector('.table-actions'),
            document.querySelector('.table-header'),
            document.body
        ];

        const container = possibleContainers.find(el => el !== null);
        if (container) {
            container.appendChild(syncButton);
            console.log('Botão de sincronização adicionado com sucesso.');
        } else {
            console.warn('Não foi possível encontrar um container para o botão de sincronização.');
            document.body.appendChild(syncButton);
        }
    }

    // Inicializar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addSyncButton);
    } else {
        addSyncButton();
    }

    // Também tentar adicionar o botão após um curto atraso (para aplicações SPA)
    setTimeout(addSyncButton, 1000);

    /**
     * Função para integração direta com o MCP Browser Tools
     */
    function setupMCPIntegration() {
        // Verificar se o MCP Browser Tools está disponível
        if (typeof window.getSelectedElement_Browser_Tools_Agent === 'function') {
            console.log('MCP Browser Tools detectado! Configurando integração...');

            // Adicionar botão de sincronização ao MCP
            const mcpButton = document.createElement('button');
            mcpButton.id = 'pdv-mcp-sync-button';
            mcpButton.innerHTML = 'Sincronizar Selecionado com WordPress';
            mcpButton.style.cssText = 'background-color: #21759b; color: white; border: none; border-radius: 4px; padding: 8px 12px; font-size: 14px; font-weight: 600; cursor: pointer; margin: 5px; display: block;';

            // Adicionar evento de clique
            mcpButton.addEventListener('click', () => {
                console.log('Botão MCP clicado, iniciando sincronização...');
                syncSelectedItems();
            });

            // Tentar adicionar o botão ao painel do MCP
            setTimeout(() => {
                const mcpPanel = document.querySelector('.mcp-panel, .browser-tools-panel');
                if (mcpPanel) {
                    mcpPanel.appendChild(mcpButton);
                    console.log('Botão de sincronização adicionado ao painel MCP');
                } else {
                    // Se não encontrar o painel, adicionar ao corpo da página
                    document.body.appendChild(mcpButton);
                    console.log('Botão de sincronização adicionado ao corpo da página');
                }
            }, 2000);

            // Adicionar evento para capturar elementos selecionados via MCP
            document.addEventListener('mcp:element-selected', (event) => {
                console.log('Elemento selecionado via MCP:', event.detail);
                // Aqui podemos fazer algo quando um elemento é selecionado via MCP
            });
        }
    }

    // Inicializar integração com MCP
    if (CONFIG.mcp.enabled) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupMCPIntegration);
        } else {
            setupMCPIntegration();
        }
    }

    // Exportar funções para uso no console
    window.PDVWordPressSync = {
        getSelectedItems,
        getMCPSelectedItems,
        getStandardSelectedItems,
        clearExistingProducts,
        sendProductsToWordPress,
        syncSelectedItems,
        CONFIG
    };

    console.log('Script de sincronização PDV Vendas → WordPress carregado com sucesso!');
    console.log('Use PDVWordPressSync.syncSelectedItems() para iniciar a sincronização manualmente pelo console.');
})();
