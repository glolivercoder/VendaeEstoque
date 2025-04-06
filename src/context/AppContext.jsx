import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Criando o contexto
export const AppContext = createContext();

// Hook personalizado para usar o contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppContextProvider');
  }
  return context;
};

export const AppContextProvider = ({ children }) => {
  // Estado dos produtos
  const [products, setProducts] = useLocalStorage('products', []);
  
  // Estado das vendas
  const [sales, setSales] = useLocalStorage('sales', []);
  
  // Estado dos clientes
  const [clients, setClients] = useLocalStorage('clients', []);
  
  // Estado dos fornecedores
  const [vendors, setVendors] = useLocalStorage('vendors', []);
  
  // Configurações de alertas de estoque mínimo
  const [minStockAlert, setMinStockAlert] = useLocalStorage('min-stock-alert', {});
  
  // Estado para notificações do sistema
  const [notifications, setNotifications] = useState([]);
  
  // Estatísticas da aplicação
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    monthlySales: 0,
    totalClients: 0,
    totalVendors: 0
  });
  
  // Atualizar estatísticas quando os dados mudarem
  useEffect(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Cálculo das estatísticas
    const totalProducts = products.length;
    const lowStockProducts = products.filter(product => {
      const minStock = minStockAlert[product.id] || 5; // Padrão: 5
      return product.quantity <= minStock;
    }).length;
    const totalSales = sales.length;
    const monthlySales = sales.filter(sale => new Date(sale.date) >= startOfMonth).length;
    const totalClients = clients.length;
    const totalVendors = vendors.length;
    
    setStats({
      totalProducts,
      lowStockProducts,
      totalSales,
      monthlySales,
      totalClients,
      totalVendors
    });
  }, [products, sales, clients, vendors, minStockAlert]);

  // Função para adicionar um novo produto ao estoque
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
    return newProduct;
  };
  
  // Função para atualizar um produto existente
  const updateProduct = (id, updatedData) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === id 
          ? { ...product, ...updatedData, updatedAt: new Date().toISOString() } 
          : product
      )
    );
  };
  
  // Função para remover um produto
  const removeProduct = (id) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
  };
  
  // Função para obter um produto específico
  const getProduct = (id) => {
    return products.find(product => product.id === id);
  };
  
  // Função para registrar uma nova venda
  const addSale = (sale) => {
    const newSale = {
      ...sale,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString('pt-BR'),
    };
    
    // Atualizar o estoque
    sale.items.forEach(saleItem => {
      const product = products.find(p => p.id === saleItem.productId);
      if (product) {
        updateProduct(product.id, {
          quantity: product.quantity - saleItem.quantity,
        });
      }
    });
    
    setSales(prevSales => [newSale, ...prevSales]);
    
    return newSale;
  };
  
  // Função para remover uma venda
  const removeSale = (id) => {
    setSales(prevSales => prevSales.filter(sale => sale.id !== id));
  };
  
  // Função para adicionar um cliente
  const addClient = (client) => {
    const newClient = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setClients(prevClients => [...prevClients, newClient]);
    return newClient;
  };
  
  // Função para atualizar um cliente
  const updateClient = (id, updatedData) => {
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === id 
          ? { ...client, ...updatedData, updatedAt: new Date().toISOString() } 
          : client
      )
    );
  };
  
  // Função para remover um cliente
  const removeClient = (id) => {
    setClients(prevClients => prevClients.filter(client => client.id !== id));
  };
  
  // Função para adicionar um fornecedor
  const addVendor = (vendor) => {
    const newVendor = {
      ...vendor,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setVendors(prevVendors => [...prevVendors, newVendor]);
    return newVendor;
  };
  
  // Função para atualizar um fornecedor
  const updateVendor = (id, updatedData) => {
    setVendors(prevVendors => 
      prevVendors.map(vendor => 
        vendor.id === id 
          ? { ...vendor, ...updatedData, updatedAt: new Date().toISOString() } 
          : vendor
      )
    );
  };
  
  // Função para remover um fornecedor
  const removeVendor = (id) => {
    setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== id));
  };
  
  // Função para configurar alerta de estoque mínimo
  const setItemMinStock = (itemId, minQuantity) => {
    setMinStockAlert(prev => ({
      ...prev,
      [itemId]: minQuantity
    }));
  };
  
  // Função para adicionar notificação
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Remover notificação após 5 segundos se for do tipo toast
    if (notification.type === 'toast') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
    
    return newNotification;
  };
  
  // Função para marcar notificação como lida
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Função para remover notificação
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Verificar estoque baixo e criar notificações
  useEffect(() => {
    // Verificar cada produto
    products.forEach(product => {
      const minStock = minStockAlert[product.id] || 5; // Padrão: 5
      
      if (product.quantity <= minStock && product.quantity > 0) {
        // Verificar se já existe notificação para este produto
        const existingNotification = notifications.find(
          n => n.productId === product.id && n.type === 'low-stock' && !n.read
        );
        
        if (!existingNotification) {
          addNotification({
            title: 'Estoque Baixo',
            message: `O produto "${product.name}" está com estoque baixo (${product.quantity} unidades)`,
            type: 'low-stock',
            severity: 'warning',
            productId: product.id
          });
        }
      } else if (product.quantity === 0) {
        // Verificar se já existe notificação para este produto
        const existingNotification = notifications.find(
          n => n.productId === product.id && n.type === 'out-of-stock' && !n.read
        );
        
        if (!existingNotification) {
          addNotification({
            title: 'Sem Estoque',
            message: `O produto "${product.name}" está sem estoque!`,
            type: 'out-of-stock',
            severity: 'error',
            productId: product.id
          });
        }
      }
    });
  }, [products, notifications, minStockAlert]);

  // Exportar dados para backup
  const exportData = () => {
    return {
      products,
      sales,
      clients,
      vendors,
      minStockAlert,
      exportDate: new Date().toISOString()
    };
  };

  // Importar dados de backup
  const importData = (data) => {
    if (data.products) setProducts(data.products);
    if (data.sales) setSales(data.sales);
    if (data.clients) setClients(data.clients);
    if (data.vendors) setVendors(data.vendors);
    if (data.minStockAlert) setMinStockAlert(data.minStockAlert);
    
    return true;
  };

  // Exportar valores e funções do contexto
  const value = {
    // Dados
    products,
    sales,
    clients,
    vendors,
    minStockAlert,
    notifications,
    stats,
    
    // Funções de gerenciamento de produtos
    addProduct,
    updateProduct,
    removeProduct,
    getProduct,
    
    // Funções de gerenciamento de vendas
    addSale,
    removeSale,
    
    // Funções de gerenciamento de clientes
    addClient,
    updateClient,
    removeClient,
    
    // Funções de gerenciamento de fornecedores
    addVendor,
    updateVendor,
    removeVendor,
    
    // Configurações
    setItemMinStock,
    
    // Notificações
    addNotification,
    markNotificationAsRead,
    removeNotification,
    
    // Backup
    exportData,
    importData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

