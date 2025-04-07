// Função para adicionar o botão 'Produtos do Fornecedor'
function addVendorProductsButton() {
  // Encontrar todos os elementos com a classe 'vendor-item' ou similar
  const vendorItems = document.querySelectorAll('.border.p-3.rounded');
  
  vendorItems.forEach(item => {
    // Verificar se o botão já existe
    const existingButton = item.querySelector('[title="Produtos do Fornecedor"]');
    if (existingButton) return;
    
    // Encontrar o container dos botões
    const buttonContainer = item.querySelector('.flex.space-x-2');
    if (!buttonContainer) return;
    
    // Criar o botão
    const button = document.createElement('button');
    button.className = 'p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors';
    button.title = 'Produtos do Fornecedor';
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>';
    
    // Adicionar evento de clique
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      alert('Abrir modal de produtos do fornecedor');
    });
    
    // Inserir o botão como primeiro filho do container
    buttonContainer.insertBefore(button, buttonContainer.firstChild);
  });
}

// Executar a função imediatamente
addVendorProductsButton();

// Adicionar um observador para detectar mudanças no DOM
const observer = new MutationObserver(mutations => {
  addVendorProductsButton();
});

// Iniciar observação
observer.observe(document.body, { childList: true, subtree: true });
