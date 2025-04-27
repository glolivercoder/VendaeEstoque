// Serviço de carrinho de compras
class CartService {
  constructor() {
    this.items = [];
    this.selectedItems = [];
    this.listeners = [];
    
    // Tentar carregar dados do localStorage
    this.loadFromStorage();
    
    // Configurar intervalo para salvar dados periodicamente
    setInterval(() => this.saveToStorage(), 5000);
  }
  
  // Adicionar item ao carrinho
  addItem(item) {
    // Verificar se o item já existe
    const existingIndex = this.items.findIndex(i => i.id === item.id);
    
    if (existingIndex !== -1) {
      // Atualizar quantidade
      this.items[existingIndex].quantity = (this.items[existingIndex].quantity || 1) + 1;
    } else {
      // Adicionar novo item
      this.items.push({
        ...item,
        quantity: 1
      });
    }
    
    // Adicionar à seleção
    if (!this.selectedItems.includes(item.id)) {
      this.selectedItems.push(item.id);
    }
    
    // Notificar ouvintes
    this.notifyListeners();
    
    // Salvar no storage
    this.saveToStorage();
  }
  
  // Remover item do carrinho
  removeItem(itemId) {
    // Remover da seleção
    this.selectedItems = this.selectedItems.filter(id => id !== itemId);
    
    // Notificar ouvintes
    this.notifyListeners();
    
    // Salvar no storage
    this.saveToStorage();
  }
  
  // Limpar carrinho
  clearCart() {
    this.selectedItems = [];
    
    // Notificar ouvintes
    this.notifyListeners();
    
    // Salvar no storage
    this.saveToStorage();
  }
  
  // Obter itens selecionados
  getSelectedItems() {
    return this.selectedItems.map(id => {
      const item = this.items.find(i => i.id === id);
      return item || null;
    }).filter(Boolean);
  }
  
  // Calcular total
  getTotal() {
    return this.getSelectedItems().reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  }
  
  // Adicionar ouvinte
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  // Notificar ouvintes
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({
          items: this.items,
          selectedItems: this.selectedItems,
          total: this.getTotal()
        });
      } catch (error) {
        console.error('Erro ao notificar ouvinte:', error);
      }
    });
  }
  
  // Salvar no localStorage
  saveToStorage() {
    try {
      localStorage.setItem('cart-items', JSON.stringify(this.items));
      localStorage.setItem('cart-selected-items', JSON.stringify(this.selectedItems));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }
  
  // Carregar do localStorage
  loadFromStorage() {
    try {
      const items = localStorage.getItem('cart-items');
      const selectedItems = localStorage.getItem('cart-selected-items');
      
      if (items) {
        this.items = JSON.parse(items);
      }
      
      if (selectedItems) {
        this.selectedItems = JSON.parse(selectedItems);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
    }
  }
}

// Criar instância global
window.cartService = new CartService();

// Expor para uso externo
export default window.cartService;
