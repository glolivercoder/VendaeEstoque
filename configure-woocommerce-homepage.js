/**
 * Script para configurar a página inicial do WooCommerce
 * 
 * Este script deve ser executado no console do navegador quando estiver logado
 * no painel administrativo do WordPress.
 */

(function() {
  // Verificar se estamos no painel do WordPress
  if (!window.location.href.includes('/wp-admin/')) {
    alert('Este script deve ser executado no painel administrativo do WordPress!');
    return;
  }

  console.log('Iniciando configuração da página inicial do WooCommerce...');

  // Função para navegar para uma página específica do painel
  function navigateTo(path) {
    window.location.href = path;
  }

  // Função para verificar se estamos na página correta
  function isOnPage(pagePath) {
    return window.location.href.includes(pagePath);
  }

  // Configurar a página inicial para exibir produtos
  if (isOnPage('/wp-admin/')) {
    console.log('Navegando para configurações de leitura...');
    navigateTo('/wp-admin/options-reading.php');
    return;
  }

  // Na página de configurações de leitura
  if (isOnPage('/options-reading.php')) {
    console.log('Configurando página inicial para exibir produtos...');
    
    // Selecionar "Uma página estática"
    const staticPageOption = document.querySelector('input[name="show_on_front"][value="page"]');
    if (staticPageOption) {
      staticPageOption.checked = true;
      
      // Verificar se já existe uma página "Loja"
      const shopPageSelect = document.querySelector('#page_on_front');
      if (shopPageSelect) {
        // Procurar opção "Loja" ou "Shop"
        let shopOption = Array.from(shopPageSelect.options).find(option => 
          option.text.toLowerCase() === 'loja' || 
          option.text.toLowerCase() === 'shop'
        );
        
        if (shopOption) {
          shopPageSelect.value = shopOption.value;
        } else {
          console.log('Página "Loja" não encontrada. Você precisa criar uma página com esse nome.');
          alert('Página "Loja" não encontrada. Por favor, crie uma página com esse nome primeiro.');
          navigateTo('/wp-admin/post-new.php?post_type=page');
          return;
        }
      }
      
      // Salvar alterações
      const saveButton = document.querySelector('#submit');
      if (saveButton) {
        console.log('Salvando configurações...');
        saveButton.click();
      }
    }
    return;
  }

  // Na página de criação de página
  if (isOnPage('/post-new.php?post_type=page')) {
    console.log('Criando página "Loja"...');
    
    // Definir título
    const titleInput = document.querySelector('#title');
    if (titleInput && titleInput.value === '') {
      titleInput.value = 'Loja';
    }
    
    // Adicionar shortcode para exibir produtos
    if (document.querySelector('.wp-editor-area')) {
      const editor = document.querySelector('.wp-editor-area');
      editor.value = '[products limit="12" columns="4" orderby="date" order="DESC"]';
    }
    
    console.log('Preencha os detalhes da página e clique em "Publicar"');
    alert('Preencha os detalhes da página e clique em "Publicar". Depois, volte para as configurações de leitura.');
    return;
  }

  console.log('Script concluído. Verifique se as configurações foram aplicadas corretamente.');
})();
