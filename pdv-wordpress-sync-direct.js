/**
 * Script de sincronização direta entre PDV Vendas e WordPress
 * Este script captura os elementos selecionados no console e os envia para o WordPress
 */

// Configurações e credenciais
const CONFIG = {
  // URL da API WordPress
  wordpressApiUrl: 'https://achadinhoshopp.com.br/loja/wp-json/pdv-vendas/v1',
  
  // Credenciais de autenticação
  credentials: {
    apiKey: 'OxCq4oUPrd5hqxPEq1zdjEd4',
    username: 'gloliverx',
    password: 'OxCq4oUPrd5hqxPEq1zdjEd4'
  },
  
  // Configuração do webhook Fiqon
  fiqon: {
    webhookUrl: 'https://webhook.fiqon.com/pdv-wordpress',
    signature: 'OxCq4oUPrd5hqxPEq1zdjEd4-signature'
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
  }
};

/**
 * Função para obter os itens selecionados no console
 */
function getSelectedItems() {
  const selectedCheckboxes = document.querySelectorAll(CONFIG.selectors.itemCheckbox);
  console.log('Checkboxes selecionados:', selectedCheckboxes.length);
  
  if (selectedCheckboxes.length === 0) {
    alert('Nenhum item selecionado. Por favor, selecione pelo menos um item.');
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
      image
    });
    
    console.log('Item selecionado:', { id, description, price, quantity, category });
  });
  
  return selectedItems;
}

/**
 * Função para sincronizar itens com o WordPress
 */
async function syncItemsWithWordPress(items) {
  if (!items || items.length === 0) {
    alert('Nenhum item para sincronizar.');
    return;
  }
  
  console.log(`Iniciando sincronização de ${items.length} itens com o WordPress...`);
  
  try {
    // Primeiro, limpar produtos existentes (opcional)
    const clearResponse = await fetch(`${CONFIG.wordpressApiUrl}/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PDV-API-Key': CONFIG.credentials.apiKey,
        'X-PDV-Username': CONFIG.credentials.username,
        'X-PDV-Password': CONFIG.credentials.password
      }
    });
    
    if (!clearResponse.ok) {
      console.warn('Aviso ao limpar produtos:', await clearResponse.text());
    } else {
      console.log('Produtos existentes limpos com sucesso.');
    }
    
    // Enviar os novos produtos
    const syncResponse = await fetch(`${CONFIG.wordpressApiUrl}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PDV-API-Key': CONFIG.credentials.apiKey,
        'X-PDV-Username': CONFIG.credentials.username,
        'X-PDV-Password': CONFIG.credentials.password
      },
      body: JSON.stringify({
        products: items
      })
    });
    
    if (!syncResponse.ok) {
      throw new Error(`Erro ao sincronizar: ${syncResponse.status} ${syncResponse.statusText}`);
    }
    
    const result = await syncResponse.json();
    console.log('Sincronização concluída com sucesso:', result);
    
    // Notificar o Fiqon (opcional)
    try {
      await fetch(CONFIG.fiqon.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fiqon-Signature': CONFIG.fiqon.signature
        },
        body: JSON.stringify({
          event: 'items_synced',
          timestamp: Date.now(),
          items_count: items.length,
          success: true
        })
      });
    } catch (webhookError) {
      console.warn('Erro ao notificar webhook (não crítico):', webhookError);
    }
    
    alert(`Sincronização concluída com sucesso! ${items.length} itens sincronizados.`);
    return result;
    
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
    alert(`Erro durante a sincronização: ${error.message}`);
    throw error;
  }
}

/**
 * Função principal para iniciar a sincronização
 */
function startSync() {
  const selectedItems = getSelectedItems();
  if (selectedItems.length > 0) {
    syncItemsWithWordPress(selectedItems)
      .then(result => {
        console.log('Resultado da sincronização:', result);
      })
      .catch(error => {
        console.error('Falha na sincronização:', error);
      });
  }
}

/**
 * Adicionar botão de sincronização à interface
 */
function addSyncButton() {
  // Verificar se o botão já existe
  if (document.getElementById('pdv-wordpress-sync-button')) {
    return;
  }
  
  // Criar o botão
  const syncButton = document.createElement('button');
  syncButton.id = 'pdv-wordpress-sync-button';
  syncButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg> Sincronizar com WordPress';
  syncButton.style.cssText = 'background-color: #21759b; color: white; border: none; border-radius: 4px; padding: 10px 16px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; margin: 10px;';
  
  // Adicionar evento de clique
  syncButton.addEventListener('click', startSync);
  
  // Encontrar um local adequado para adicionar o botão
  const possibleContainers = [
    document.querySelector('.actions-container'),
    document.querySelector('.buttons-container'),
    document.querySelector('.toolbar'),
    document.querySelector('header'),
    document.querySelector('nav'),
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

// Exportar funções para uso no console
window.PDVWordPressSync = {
  getSelectedItems,
  syncItemsWithWordPress,
  startSync,
  CONFIG
};

console.log('Script de sincronização PDV Vendas → WordPress carregado com sucesso!');
console.log('Use PDVWordPressSync.startSync() para iniciar a sincronização manualmente pelo console.');
