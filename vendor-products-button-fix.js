// Função para adicionar o botão 'Produtos do Fornecedor' e abrir o modal
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
      
      // Obter informações do fornecedor
      const vendorName = item.querySelector('h3')?.textContent || 'Fornecedor';
      const vendorDescription = item.querySelector('p:nth-child(2)')?.textContent.replace('Descrição: ', '') || '';
      const vendorCNPJ = item.querySelector('p:nth-child(3)')?.textContent.replace('CNPJ: ', '') || '';
      
      // Criar o modal
      createVendorProductModal({
        name: vendorName,
        description: vendorDescription,
        cnpj: vendorCNPJ
      });
    });
    
    // Inserir o botão como primeiro filho do container
    buttonContainer.insertBefore(button, buttonContainer.firstChild);
    
    console.log('Botão "Produtos do Fornecedor" adicionado com sucesso!');
  });
}

// Função para criar o modal de produtos do fornecedor
function createVendorProductModal(vendor) {
  // Remover modal existente, se houver
  const existingModal = document.getElementById('vendor-product-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Criar o modal
  const modal = document.createElement('div');
  modal.id = 'vendor-product-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  
  // Conteúdo do modal
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold">Adicionar Produto para ${vendor.name}</h3>
        <button id="close-modal-button" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 class="text-lg font-medium mb-2">Informações do Fornecedor</h4>
        <p><span class="font-medium">Nome:</span> ${vendor.name}</p>
        ${vendor.description ? `<p><span class="font-medium">Descrição:</span> ${vendor.description}</p>` : ''}
        ${vendor.cnpj ? `<p><span class="font-medium">CNPJ:</span> ${vendor.cnpj}</p>` : ''}
      </div>
      
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Imagem Principal -->
          <div>
            <label class="block text-sm font-medium mb-1">Imagem Principal</label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div id="preview-container" class="hidden relative">
                <img id="preview-image" class="max-h-40 mx-auto object-contain" />
                <button
                  type="button"
                  id="remove-image-button"
                  class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  title="Remover imagem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div id="upload-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="mt-1 text-sm text-gray-500">Clique para adicionar uma imagem</p>
              </div>
              <input
                type="file"
                id="image-input"
                accept="image/*"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          
          <!-- Nome do Item -->
          <div>
            <label class="block text-sm font-medium mb-1">Nome do Item *</label>
            <input
              type="text"
              id="description-input"
              placeholder="Nome do produto"
              class="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <!-- Descrição do Item -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">Descrição do Item</label>
            <textarea
              id="item-description-input"
              placeholder="Descrição detalhada do produto (até 300 caracteres)"
              maxlength="300"
              rows="4"
              class="w-full px-3 py-2 border rounded-md resize-none"
            ></textarea>
            <span class="text-xs text-gray-500">
              <span id="char-count">0</span>/300 caracteres
            </span>
          </div>
          
          <!-- Preço -->
          <div>
            <label class="block text-sm font-medium mb-1">Preço de Venda *</label>
            <input
              type="number"
              id="price-input"
              placeholder="Preço"
              class="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <!-- Estoque -->
          <div>
            <label class="block text-sm font-medium mb-1">Estoque Inicial</label>
            <input
              type="number"
              id="quantity-input"
              placeholder="Quantidade"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <!-- Categoria -->
          <div>
            <label class="block text-sm font-medium mb-1">Categoria</label>
            <select
              id="category-input"
              class="w-full px-3 py-2 border rounded-md"
            >
              <option value="Todos">Todos</option>
              <option value="Ferramentas">Ferramentas</option>
              <option value="Instrumentos Musicais">Instrumentos Musicais</option>
              <option value="Informática">Informática</option>
              <option value="Gadgets">Gadgets</option>
              <option value="Diversos">Diversos</option>
            </select>
          </div>
          
          <!-- Data de Validade -->
          <div>
            <label class="block text-sm font-medium mb-1">Data de Validade</label>
            <input
              type="date"
              id="expiration-date-input"
              class="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        
        <!-- Botões de Ação -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            id="cancel-button"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="add-product-button"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Adicionar Produto
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Adicionar o modal ao body
  document.body.appendChild(modal);
  
  // Adicionar eventos
  document.getElementById('close-modal-button').addEventListener('click', () => {
    modal.remove();
  });
  
  document.getElementById('cancel-button').addEventListener('click', () => {
    modal.remove();
  });
  
  // Evento para o botão de adicionar produto
  document.getElementById('add-product-button').addEventListener('click', () => {
    const description = document.getElementById('description-input').value;
    const price = document.getElementById('price-input').value;
    
    if (!description || !price) {
      alert('Por favor, preencha os campos obrigatórios: Nome do Item e Preço');
      return;
    }
    
    // Criar o produto
    const product = {
      description,
      price: parseFloat(price),
      quantity: parseInt(document.getElementById('quantity-input').value) || 0,
      itemDescription: document.getElementById('item-description-input').value,
      category: document.getElementById('category-input').value,
      expirationDate: document.getElementById('expiration-date-input').value,
      vendorId: vendor.cnpj || null
    };
    
    // Adicionar o produto (aqui você pode implementar a lógica para salvar o produto)
    console.log('Produto a ser adicionado:', product);
    alert(`Produto "${product.description}" adicionado com sucesso!`);
    
    // Fechar o modal
    modal.remove();
  });
  
  // Evento para o input de imagem
  const imageInput = document.getElementById('image-input');
  const previewContainer = document.getElementById('preview-container');
  const previewImage = document.getElementById('preview-image');
  const uploadPlaceholder = document.getElementById('upload-placeholder');
  
  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewImage.src = reader.result;
        previewContainer.classList.remove('hidden');
        uploadPlaceholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Evento para remover a imagem
  document.getElementById('remove-image-button').addEventListener('click', () => {
    previewImage.src = '';
    previewContainer.classList.add('hidden');
    uploadPlaceholder.classList.remove('hidden');
    imageInput.value = '';
  });
  
  // Evento para contar caracteres na descrição
  const itemDescriptionInput = document.getElementById('item-description-input');
  const charCount = document.getElementById('char-count');
  
  itemDescriptionInput.addEventListener('input', () => {
    charCount.textContent = itemDescriptionInput.value.length;
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
