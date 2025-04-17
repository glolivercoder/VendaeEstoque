/**
 * Script para configurar o tema do WooCommerce
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

  console.log('Iniciando configuração do tema do WooCommerce...');

  // Função para navegar para uma página específica do painel
  function navigateTo(path) {
    window.location.href = path;
  }

  // Função para verificar se estamos na página correta
  function isOnPage(pagePath) {
    return window.location.href.includes(pagePath);
  }

  // Função para esperar um elemento aparecer na página
  function waitForElement(selector, callback, maxTries = 10, interval = 500) {
    let tries = 0;
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        callback(element);
        return;
      }
      
      tries++;
      if (tries < maxTries) {
        setTimeout(checkElement, interval);
      } else {
        console.log(`Elemento ${selector} não encontrado após ${maxTries} tentativas.`);
      }
    };
    
    checkElement();
  }

  // Configurar o tema do WooCommerce
  if (isOnPage('/wp-admin/')) {
    console.log('Navegando para o personalizador...');
    navigateTo('/wp-admin/customize.php');
    return;
  }

  // No personalizador
  if (isOnPage('/customize.php')) {
    console.log('Configurando o tema...');
    
    // Esperar o personalizador carregar
    waitForElement('#customize-theme-controls', (element) => {
      // Abrir seção de CSS adicional
      waitForElement('#accordion-section-custom_css', (cssSection) => {
        cssSection.click();
        
        // Esperar o editor de CSS carregar
        waitForElement('#customize-control-custom_css', (cssControl) => {
          const cssEditor = cssControl.querySelector('textarea');
          if (cssEditor) {
            // Verificar se já existe CSS
            const existingCSS = cssEditor.value;
            
            // Adicionar nosso CSS personalizado
            fetch('https://raw.githubusercontent.com/glolivercoder/VendaeEstoque/main/pdv-vendas-style.css')
              .then(response => response.text())
              .then(css => {
                cssEditor.value = existingCSS ? existingCSS + '\n\n' + css : css;
                
                // Simular evento de mudança
                const event = new Event('change', { bubbles: true });
                cssEditor.dispatchEvent(event);
                
                console.log('CSS personalizado adicionado. Clique em "Publicar" para salvar as alterações.');
              })
              .catch(error => {
                console.error('Erro ao carregar CSS:', error);
                alert('Não foi possível carregar o CSS personalizado. Por favor, adicione-o manualmente.');
              });
          }
        });
      });
    });
    return;
  }

  console.log('Script concluído. Verifique se as configurações foram aplicadas corretamente.');
})();
