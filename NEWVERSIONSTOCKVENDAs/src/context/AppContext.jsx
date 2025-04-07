import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  getClients,
  addClient,
  updateClient,
  deleteClient,
  ensureDB,
  initializeDefaultVendor,
} from '../services/database';
import useLocalStorage from '../hooks/useLocalStorage';

// Criar o contexto
const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // Estados para produtos
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [categories, setCategories] = useState(['Ferramentas', 'Instrumentos Musicais', 'Informática', 'Gadgets', 'Todos', 'Diversos']);

  // Estados para vendas
  const [salesData, setSalesData] = useLocalStorage('salesData', []);
  const [selectedItems, setSelectedItems] = useState([]);
  const [salesSummary, setSalesSummary] = useState({
    totalCash: 0,
    totalCard: 0,
    totalPix: 0
  });

  // Estados para clientes e fornecedores
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Estados para configurações
  const [minStockAlert, setMinStockAlert] = useLocalStorage('minStockAlert', {});
  const [ignoreStock, setIgnoreStock] = useLocalStorage('ignoreStock', {});
  const [hostingerConfig, setHostingerConfig] = useLocalStorage('hostingerConfig', {
    site_url: '',
    api_key: '',
    site_id: ''
  });

  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar o banco de dados
  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsLoading(true);
        console.log('Inicializando banco de dados...');

        // Primeiro inicializa o banco de dados
        const database = await ensureDB();
        if (!database) {
          throw new Error('Falha ao inicializar o banco de dados');
        }

        // Depois inicializa o fornecedor padrão
        await initializeDefaultVendor();

        console.log('Banco de dados inicializado com sucesso!');
        await loadData();
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        setIsLoading(false);
        alert('Erro ao inicializar o banco de dados. Por favor, recarregue a página.');
      }
    };

    initializeDB();
  }, []);

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      console.log('Carregando dados...');
      const [vendorsList, clientsList, productsList] = await Promise.all([
        getVendors(),
        getClients(),
        getProducts()
      ]);

      setVendors(vendorsList || []);
      setClients((clientsList || []).map(client => ({ ...client, showDetails: false })));
      setItems(productsList || []);
      setFilteredItems(productsList || []);

      // Set default vendor with null safety
      const defaultVendor = vendorsList?.find(v => v?.document === '0727887807') || {
        name: 'Gleidison S. Oliveira',
        document: '0727887807'
      };

      if (defaultVendor) {
        setSelectedVendor(defaultVendor);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      alert('Erro ao carregar dados. Por favor, recarregue a página.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para filtrar produtos por categoria
  const filterItemsByCategory = useCallback((category) => {
    setSelectedCategory(category);
    if (category === 'Todos') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === category));
    }
  }, [items]);

  // Função para adicionar um novo produto
  const handleAddItem = async (newItem) => {
    try {
      const productData = {
        description: newItem.description,
        price: newItem.price,
        quantity: newItem.quantity || 0,
        sold: 0,
        image: newItem.image || '',
        expirationDate: newItem.expirationDate || null,
        links: newItem.links || [],
        itemDescription: newItem.itemDescription || '',
        category: newItem.category || 'Todos'
      };

      const productId = await addProduct(productData);

      const newProductWithId = {
        ...productData,
        id: productId,
        soldQuantity: 1
      };

      setItems(prevItems => [...prevItems, newProductWithId]);

      // Atualizar itens filtrados se necessário
      if (selectedCategory === 'Todos' || selectedCategory === newProductWithId.category) {
        setFilteredItems(prevItems => [...prevItems, newProductWithId]);
      }

      return newProductWithId;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  // Função para atualizar um produto
  const handleUpdateItem = async (updatedItem) => {
    try {
      await updateProduct(updatedItem);

      setItems(prevItems =>
        prevItems.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );

      setFilteredItems(prevItems =>
        prevItems.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );

      return updatedItem;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  // Função para excluir um produto
  const handleDeleteItem = async (itemId) => {
    try {
      await deleteProduct(itemId);

      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      setFilteredItems(prevItems => prevItems.filter(item => item.id !== itemId));

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Função para processar vendas multiplas
  const handleMultipleSales = async (paymentMethod) => {
    if (selectedItems.length === 0) {
      throw new Error('Selecione pelo menos um item para vender');
    }

    const updatedItems = [...items];
    let totalAmount = 0;

    // Verificar estoque para todos os itens selecionados primeiro
    for (const index of selectedItems) {
      const item = updatedItems[index];
      const quantity = item.soldQuantity || 1;

      if (!ignoreStock[item.id] && item.quantity < quantity) {
        throw new Error(`Quantidade insuficiente em estoque para ${item.description}`);
      }
    }

    try {
      // Processar vendas com data local
      const saleDate = new Date().toISOString();
      const localDate = formatDateToBrazilian(new Date().toISOString().split('T')[0]);

      for (const index of selectedItems) {
        const item = updatedItems[index];
        const quantity = Math.abs(item.soldQuantity || 1); // Garantir que a quantidade seja positiva
        const itemTotal = Math.abs(item.price * quantity); // Garantir que o total seja positivo

        const updatedItem = {
          ...item,
          quantity: item.quantity - quantity,
          sold: (item.sold || 0) + quantity,
          saleDate,
          paymentMethod
        };

        await updateProduct(updatedItem);
        updatedItems[index] = updatedItem;
        totalAmount += itemTotal;
      }

      setItems(updatedItems);
      setFilteredItems(prevItems => {
        const itemMap = new Map(updatedItems.map(item => [item.id, item]));
        return prevItems.map(item => itemMap.get(item.id) || item);
      });

      setSelectedItems([]);

      // Update sales summary
      setSalesSummary(prev => ({
        totalCash: paymentMethod === 'dinheiro' ? prev.totalCash + Math.abs(totalAmount) : prev.totalCash,
        totalCard: paymentMethod === 'cartao' ? prev.totalCard + Math.abs(totalAmount) : prev.totalCard,
        totalPix: paymentMethod === 'pix' ? prev.totalPix + Math.abs(totalAmount) : prev.totalPix
      }));

      // Adicionar à lista de vendas com data local
      const newSale = {
        id: Date.now(),
        date: localDate,
        client: selectedClient?.name || 'Cliente não especificado',
        clientDoc: selectedClient?.rg || '',
        clientCpf: selectedClient?.cpf || '',
        vendor: selectedVendor?.name || 'Vendedor não especificado',
        vendorDoc: selectedVendor?.document || '',
        product: selectedItems.map(index => updatedItems[index].description).join(', '),
        quantity: selectedItems.reduce((total, index) => total + Math.abs(updatedItems[index].soldQuantity || 1), 0),
        price: Math.abs(totalAmount) / selectedItems.reduce((total, index) => total + Math.abs(updatedItems[index].soldQuantity || 1), 0),
        total: Math.abs(totalAmount),
        paymentMethod
      };

      setSalesData(prev => [...prev, newSale]);

      return newSale;
    } catch (error) {
      console.error('Error processing sales:', error);
      throw error;
    }
  };

  // Função para formatar data no formato brasileiro
  const formatDateToBrazilian = (isoDate) => {
    if (!isoDate) return '';
    try {
      const parts = isoDate.split('-');
      if (parts.length !== 3) return '';

      const year = parts[0];
      const month = parts[1];
      const day = parts[2];

      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return '';
    }
  };

  // Função de backup
  const createBackup = async () => {
    try {
      console.log("Iniciando backup...");

      // Preparar dados para backup
      const backupData = {
        items: items,
        vendors: vendors,
        clients: clients,
        salesData: salesData,
        minStockAlert: minStockAlert,
        ignoreStock: ignoreStock,
        hostingerConfig: hostingerConfig,
        backupDate: new Date().toISOString(),
        version: '2.0'
      };

      // Serializar dados
      const backupJSON = JSON.stringify(backupData, null, 2);

      // Nome do arquivo com timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup_estoque_${timestamp}.json`;

      // No ambiente web, fazer download do arquivo
      const blob = new Blob([backupJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // Salvar no local especificado
      // Em ambiente web, isso irá baixar para o local padrão
      link.click();

      URL.revokeObjectURL(url);

      console.log("Backup concluído com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      throw error;
    }
  };

  // Função para importar backup
  const importBackup = async (backupData) => {
    try {
      // Verificar se o arquivo é válido
      if (!backupData.items || !backupData.vendors || !backupData.clients) {
        throw new Error("Arquivo de backup inválido ou corrompido");
      }

      // Restaurar dados
      setItems(backupData.items);
      setFilteredItems(backupData.items);
      setVendors(backupData.vendors);
      setClients(backupData.clients);
      setSalesData(backupData.salesData || []);
      setMinStockAlert(backupData.minStockAlert || {});
      setIgnoreStock(backupData.ignoreStock || {});
      setHostingerConfig(backupData.hostingerConfig || {});

      return true;
    } catch (error) {
      console.error("Erro ao processar arquivo de backup:", error);
      throw error;
    }
  };

  // Função para adicionar cliente
  const handleAddClient = async (newClient) => {
    try {
      await addClient(newClient);
      const updatedClients = await getClients();
      setClients(updatedClients);
      return true;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  };

  // Função para atualizar cliente
  const handleUpdateClient = async (updatedClient) => {
    try {
      await updateClient(updatedClient);
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === updatedClient.id ? updatedClient : client
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  // Função para excluir cliente
  const handleDeleteClient = async (clientId) => {
    try {
      await deleteClient(clientId);
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  // Função para adicionar fornecedor
  const handleAddVendor = async (newVendor) => {
    try {
      await addVendor(newVendor);
      const updatedVendors = await getVendors();
      setVendors(updatedVendors);
      return true;
    } catch (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }
  };

  // Função para atualizar fornecedor
  const handleUpdateVendor = async (vendorId, updatedVendor) => {
    try {
      await updateVendor(vendorId, updatedVendor);
      const updatedVendors = await getVendors();
      setVendors(updatedVendors);
      return true;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  };

  // Função para excluir fornecedor
  const handleDeleteVendor = async (vendorId) => {
    try {
      await deleteVendor(vendorId);
      setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== vendorId));
      return true;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      // Produtos
      items,
      filteredItems,
      selectedCategory,
      categories,
      setCategories,
      filterItemsByCategory,
      handleAddItem,
      handleUpdateItem,
      handleDeleteItem,

      // Vendas
      salesData,
      selectedItems,
      setSelectedItems,
      salesSummary,
      handleMultipleSales,

      // Clientes
      clients,
      selectedClient,
      setSelectedClient,
      handleAddClient,
      handleUpdateClient,
      handleDeleteClient,

      // Fornecedores
      vendors,
      selectedVendor,
      setSelectedVendor,
      handleAddVendor,
      handleUpdateVendor,
      handleDeleteVendor,

      // Configurações
      minStockAlert,
      setMinStockAlert,
      ignoreStock,
      setIgnoreStock,
      hostingerConfig,
      setHostingerConfig,

      // Backup
      createBackup,
      importBackup,

      // Estado de carregamento
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar o contexto da aplicação
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppContextProvider');
  }
  return context;
};