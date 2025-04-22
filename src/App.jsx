import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './styles/ImageStyles.css';
import './styles/global.css';
import './styles/shipping.css';
import ThemeSelector from './components/ThemeSelector';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppContextProvider } from './context/AppContext';
import EmployeeManager from './components/settings/EmployeeManager';
import LoginModal from './components/modals/LoginModal';
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addVendor,
  getVendors,
  searchVendors,
  updateVendor,
  deleteVendor,
  addClient,
  getClients,
  searchClients,
  deleteClient,
  updateClient,
  ensureDB,
  initializeDefaultVendor,
  fixStockIssues,
  fixGFireFanCooler
} from './services/database';
import Vendors from './pages/Vendors';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { syncProductsToWordPress, clearWordPressProducts, setupWordPressWebhook } from './services/wordpress';
import MagicWandButton from './components/MagicWandButton';
import MagicCaptureButton from './components/MagicCaptureButton';
import WordPressSync from './components/WordPressSync';
import SearchBar from './components/SearchBar';
import BankQRCodeSelector from './components/QRCode_Bancos/BankQRCodeSelector';
import ShippingCalculator from './components/ShippingCalculator.jsx';
import SaleConfirmationPopup from './components/SaleConfirmationPopup';
import SalesHistory from './components/SalesHistory';
import { ToastProvider } from './components/ui/toast';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function AppContent() {
  const [activePage, setActivePage] = useState('dashboard');
  // Função para obter a data atual no formato ISO (YYYY-MM-DD)
  const getCurrentDateISO = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para converter data do formato ISO para o formato brasileiro (DD/MM/YYYY)
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

  // Função para converter data do formato brasileiro (DD/MM/YYYY) para ISO (YYYY-MM-DD)
  const formatDateToISO = (brDate) => {
    if (!brDate || !brDate.includes('/')) return getCurrentDateISO();
    try {
      const parts = brDate.split('/');
      if (parts.length !== 3) return getCurrentDateISO();

      const day = parts[0];
      const month = parts[1];
      const year = parts[2];

      // Verificar se os valores são números válidos
      if (isNaN(parseInt(day)) || isNaN(parseInt(month)) || isNaN(parseInt(year))) {
        return getCurrentDateISO();
      }

      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (e) {
      console.error("Erro ao converter data:", e);
      return getCurrentDateISO();
    }
  };

  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLinks, setShowLinks] = useState(false);
  const [newItem, setNewItem] = useState({
    image: null,
    description: '',
    price: '',
    quantity: 1,
    sold: 0,
    saleQuantity: 1,
    links: [],
    saleDate: null,
    paymentMethod: '',
    vendor: { name: '', doc: '' },
    client: { name: '', rg: '', cpf: '', fatherName: '', motherName: '', birthDate: '', issueDate: '', birthPlace: '', whatsapp: '', email: '', address: '' },
    expirationDate: null,
    checked: false,
    itemDescription: '',
    category: 'Todos' // Adicionar categoria padrão
  });
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [salesSummary, setSalesSummary] = useState({
    totalCash: 0,
    totalCard: 0,
    totalPix: 0
  });
  const [currentSale, setCurrentSale] = useState({
    client: { name: '', rg: '', cpf: '', fatherName: '', motherName: '', birthDate: '', issueDate: '', birthPlace: '', whatsapp: '', email: '', address: '' },
    items: [],
    total: 0,
    paymentMethod: ''
  });
  const [vendors, setVendors] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', document: '' });
  const [newClient, setNewClient] = useState({
    name: '',
    rg: '',
    cpf: '',
    fatherName: '',
    motherName: '',
    birthDate: '',
    issueDate: '',
    birthPlace: '',
    whatsapp: '',
    email: '',
    cep: '',
    address: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [showClients, setShowClients] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [reportType, setReportType] = useState('day');
  const [reportStartDate, setReportStartDate] = useState(formatDateToBrazilian(new Date().toISOString().split('T')[0]));
  const [reportEndDate, setReportEndDate] = useState(formatDateToBrazilian(new Date().toISOString().split('T')[0]));
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [salesData, setSalesData] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showSiteExporter, setShowSiteExporter] = useState(false);
  const [showVendorsTab, setShowVendorsTab] = useState(false);
  const [showShippingCalculator, setShowShippingCalculator] = useState(false);
  // Estado para configurações do WordPress
  const [wordpressConfig] = useState({
    apiUrl: import.meta.env.VITE_WORDPRESS_API_URL || 'https://achadinhoshopp.com.br/loja/wp-json/pdv-vendas/v1',
    apiKey: import.meta.env.VITE_WORDPRESS_API_KEY || 'OxCq4oUPrd5hqxPEq1zdjEd4',
    username: import.meta.env.VITE_WORDPRESS_USERNAME || 'gloliverx',
    password: import.meta.env.VITE_WORDPRESS_PASSWORD || 'OxCq4oUPrd5hqxPEq1zdjEd4'
  });
  const [showPixQRCode, setShowPixQRCode] = useState(false);
  // Carregar o QR code salvo no localStorage ou usar um valor padrão
  const [qrCodeImage, setQRCodeImage] = useState(() => {
    const savedQRCode = localStorage.getItem('selectedQRCode');
    console.log('QR Code carregado do localStorage:', savedQRCode ? 'Encontrado' : 'Não encontrado');
    return savedQRCode || '/QRCode_Bancos/default_pix.png';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [exportType, setExportType] = useState('');
  const [exportMethod, setExportMethod] = useState('');
  const [contactInfo, setContactInfo] = useState({ whatsapp: '', email: '' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [showHostingerConfig, setShowHostingerConfig] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false); // Dashboard inicia fechado por padrão
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [minStockAlert, setMinStockAlert] = useState({});
  const [ignoreStock, setIgnoreStock] = useState({});
  const [showConfigPopup, setShowConfigPopup] = useState(false);

  // Usar o contexto de autenticação
  const { currentUser, hasPermission, showLoginModal, setShowLoginModal } = useAuth();
  const [backupLocation, setBackupLocation] = useState(localStorage.getItem('backupLocation') || '');
  const [autoBackup, setAutoBackup] = useState(localStorage.getItem('autoBackup') === 'true');
  const [showDescription, setShowDescription] = useState(true);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  const [showSaleConfirmation, setShowSaleConfirmation] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState(null);
  const [showSalesHistory, setShowSalesHistory] = useState(false);

  // Adicionar estado para categorias e nova categoria
  const [categories, setCategories] = useState(['Ferramentas', 'Instrumentos Musicais', 'Informática', 'Gadgets', 'Todos', 'Diversos']);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Refs para capturar elementos para exportação
  const reportRef = useRef(null);

  // Initialize database before loading data
  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsLoading(true);
        console.log('Inicializando banco de dados...');

        // Verificar se o usuário está logado
        if (!currentUser) {
          setShowLoginModal(true);
          setIsLoading(false);
          return;
        }

        // Primeiro inicializa o banco de dados
        const database = await ensureDB();
        if (!database) {
          throw new Error('Falha ao inicializar o banco de dados');
        }

        // Depois inicializa o fornecedor padrão
        await initializeDefaultVendor();

        console.log('Banco de dados inicializado com sucesso!');

        // Load data after database is initialized
        const loadData = async () => {
          try {
            console.log('Carregando dados...');

            // Corrigir problemas de estoque antes de carregar os produtos
            try {
              console.log('Verificando e corrigindo problemas de estoque...');
              const fixedCount = await fixStockIssues();
              if (fixedCount > 0) {
                console.log(`${fixedCount} produtos tiveram seus dados de estoque corrigidos.`);

                // Verificar especificamente o produto G-Fire Fan Cooler
                const products = await getProducts();
                const gFireProduct = products.find(p => p.description && p.description.includes('G-Fire Fan Cooler'));
                if (gFireProduct) {
                  console.log(`Produto G-Fire Fan Cooler encontrado: ID=${gFireProduct.id}, Estoque atual=${gFireProduct.quantity}, Tipo=${typeof gFireProduct.quantity}`);
                }
              } else {
                console.log('Nenhum problema de estoque encontrado.');

                // Verificar especificamente o produto G-Fire Fan Cooler mesmo sem problemas
                const products = await getProducts();
                const gFireProduct = products.find(p => p.description && p.description.includes('G-Fire Fan Cooler'));
                if (gFireProduct) {
                  console.log(`Produto G-Fire Fan Cooler encontrado: ID=${gFireProduct.id}, Estoque atual=${gFireProduct.quantity}, Tipo=${typeof gFireProduct.quantity}`);
                }
              }
            } catch (error) {
              console.error('Erro ao corrigir problemas de estoque:', error);
              // Continuar mesmo com erro
            }
            const [vendorsList, clientsList, productsList] = await Promise.all([
              getVendors(),
              getClients(),
              getProducts()
            ]);

            setVendors(vendorsList || []);
            setFilteredClients((clientsList || []).map(client => ({ ...client, showDetails: false })));
            setClients((clientsList || []).map(client => ({ ...client, showDetails: false })));
            setItems(productsList || []);

            // Verificar se o usuário tem permissão para a página atual
            if (activePage && !hasPermission(activePage)) {
              // Redirecionar para uma página que o usuário tem permissão
              if (hasPermission('dashboard')) {
                setActivePage('dashboard');
              } else if (hasPermission('inventory')) {
                setActivePage('inventory');
              } else if (hasPermission('sales')) {
                setActivePage('sales');
              } else if (hasPermission('clients')) {
                setActivePage('clients');
              }
            }

            // Carregar dados de vendas do localStorage
            const savedSalesData = localStorage.getItem('salesData');
            if (savedSalesData) {
              try {
                const parsedSalesData = JSON.parse(savedSalesData);
                console.log("Dados de vendas carregados do localStorage:", parsedSalesData.length, "registros");
                setSalesData(parsedSalesData);
              } catch (error) {
                console.error("Erro ao carregar dados de vendas do localStorage:", error);
              }
            }

            // Carregar configurações de alerta de estoque mínimo
            const savedMinStockAlert = localStorage.getItem('minStockAlert');
            if (savedMinStockAlert) {
              try {
                setMinStockAlert(JSON.parse(savedMinStockAlert));
              } catch (error) {
                console.error("Erro ao carregar configurações de alerta de estoque mínimo:", error);
              }
            }

            // Carregar configurações de ignorar estoque
            const savedIgnoreStock = localStorage.getItem('ignoreStock');
            if (savedIgnoreStock) {
              try {
                setIgnoreStock(JSON.parse(savedIgnoreStock));
              } catch (error) {
                console.error("Erro ao carregar configurações de ignorar estoque:", error);
              }
            }

            // Configurações do WordPress já carregadas do .env

            // Set default vendor with null safety
            const defaultVendor = vendorsList?.find(v => v?.document === '0727887807') || {
              name: 'Gleidison S. Oliveira',
              document: '0727887807'
            };

            if (defaultVendor) {
              setSelectedVendor(defaultVendor);
              setNewItem(prev => ({
                ...prev,
                vendor: {
                  name: defaultVendor.name || '',
                  doc: defaultVendor.document || ''
                }
              }));
            }
          } catch (error) {
            console.error('Error loading initial data:', error);
            alert('Erro ao carregar dados. Por favor, recarregue a página.');
          } finally {
            setIsLoading(false);
          }
        };

        loadData();
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        setIsLoading(false);
        alert('Erro ao inicializar o banco de dados. Por favor, recarregue a página.');
      }
    };

    initializeDB();
  }, [currentUser, setShowLoginModal, activePage, hasPermission, setActivePage]);

  // Salvar dados de vendas no localStorage quando houver alterações
  useEffect(() => {
    if (salesData.length > 0) {
      console.log("Salvando dados de vendas no localStorage:", salesData.length, "registros");
      localStorage.setItem('salesData', JSON.stringify(salesData));
    }
  }, [salesData]);

  // Salvar configurações de alerta de estoque mínimo
  useEffect(() => {
    if (Object.keys(minStockAlert).length > 0) {
      localStorage.setItem('minStockAlert', JSON.stringify(minStockAlert));
    }
  }, [minStockAlert]);

  // Salvar configurações de ignorar estoque
  useEffect(() => {
    if (Object.keys(ignoreStock).length > 0) {
      localStorage.setItem('ignoreStock', JSON.stringify(ignoreStock));
    }
  }, [ignoreStock]);

  // Inicializar as datas com o formato correto
  useEffect(() => {
    // Definir a data atual no formato brasileiro
    const currentDateISO = getCurrentDateISO();
    const currentDateBR = formatDateToBrazilian(currentDateISO);

    // Atualizar os estados com a data atual
    setReportStartDate(currentDateBR);
    setReportEndDate(currentDateBR);

    console.log("Data atual ISO:", currentDateISO);
    console.log("Data atual BR:", currentDateBR);
  }, []);

  const handleClientSearch = async (query) => {
    if (query.trim() === '') {
      const allClients = await getClients();
      setFilteredClients(allClients);
      return;
    }

    const searchResults = await searchClients(query);
    setFilteredClients(searchResults);
  };

  const handleAddNewVendor = async () => {
    if (!newVendor.name || !newVendor.document) {
      alert('Por favor, preencha todos os campos do vendedor');
      return;
    }

    try {
      await addVendor(newVendor);
      const updatedVendors = await getVendors();
      setVendors(updatedVendors);
      setShowAddVendor(false);
      setNewVendor({ name: '', document: '' });
    } catch {
      alert('Erro ao adicionar vendedor. Verifique se o documento já existe.');
    }
  };

  // Funções para manipular fornecedores na aba de Fornecedores
  const handleAddVendor = async (vendorData) => {
    try {
      const newVendorId = await addVendor(vendorData);
      const updatedVendors = await getVendors();
      setVendors(updatedVendors);
      alert('Fornecedor adicionado com sucesso!');
      return newVendorId;
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      alert('Erro ao adicionar fornecedor. Por favor, tente novamente.');
    }
  };

  const handleUpdateVendor = async (vendorData) => {
    try {
      await updateVendor(vendorData);
      const updatedVendors = await getVendors();
      setVendors(updatedVendors);
      alert('Fornecedor atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      alert('Erro ao atualizar fornecedor. Por favor, tente novamente.');
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
      await deleteVendor(vendorId);
      const updatedVendors = await getVendors();
      setVendors(updatedVendors);
      alert('Fornecedor excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      alert('Erro ao excluir fornecedor. Por favor, tente novamente.');
    }
  };

  const handleAddNewClient = async () => {
    if (!newClient.name || !newClient.rg || !newClient.cpf) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, RG e CPF)');
      return;
    }

    try {
      if (selectedClient) {
        // Update existing client
        const updatedClient = {
          ...selectedClient,
          ...newClient,
          document: newClient.cpf // Usar CPF como documento principal
        };
        await updateClient(updatedClient);
        const updatedClients = clients.map(c =>
          c.id === selectedClient.id ? updatedClient : c
        );
        setClients(updatedClients);
        setFilteredClients(updatedClients);
      } else {
        // Add new client
        const clientData = {
          ...newClient,
          document: newClient.cpf // Usar CPF como documento principal
        };
        await addClient(clientData);
        const updatedClients = await getClients();
        setClients(updatedClients);
        setFilteredClients(updatedClients);
      }

      setShowAddClient(false);
      setSelectedClient(null);
      setNewClient({
        name: '',
        rg: '',
        cpf: '',
        fatherName: '',
        motherName: '',
        birthDate: '',
        issueDate: '',
        birthPlace: '',
        whatsapp: '',
        email: '',
        cep: '',
        address: '',
        neighborhood: '',
        city: '',
        state: ''
      });
    } catch (error) {
      alert('Erro ao salvar cliente. Verifique se o RG ou CPF já existe.');
    }
  };

  const handleMultipleSales = async (paymentMethod) => {
    // Para pagamentos PIX, mostrar o QR code e depois processar a venda
    if (paymentMethod === 'pix') {
      setShowPixQRCode(true);
      // Continuar com o processamento da venda para PIX
    }

    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item para vender');
      return;
    }

    const updatedItems = [...items];
    let totalAmount = 0;

    // Verificar estoque para todos os itens selecionados primeiro
    for (const index of selectedItems) {
      const item = updatedItems[index];
      const quantity = parseInt(item.soldQuantity || 1, 10);
      const stockQuantity = parseInt(item.quantity || 0, 10);

      console.log(`Verificando estoque para ${item.description}: Estoque=${stockQuantity}, Solicitado=${quantity}`);

      if (!ignoreStock[item.id] && stockQuantity < quantity) {
        alert(`Quantidade insuficiente em estoque para ${item.description}. Disponível: ${stockQuantity}, Solicitado: ${quantity}`);
        return;
      }
    }

    if (!window.confirm(`Confirmar venda de ${selectedItems.length} itens via ${paymentMethod}?`)) {
      return;
    }

    try {
      // Processar vendas com data local e horário
      const now = new Date();
      const saleDate = now.toISOString();
      const localDate = formatDateToBrazilian(now.toISOString().split('T')[0]);
      const localTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.log("Registrando venda com data e hora:", localDate, localTime);

      for (const index of selectedItems) {
        const item = updatedItems[index];
        const quantity = Math.abs(parseInt(item.soldQuantity || 1, 10)); // Garantir que a quantidade seja um número positivo
        const stockQuantity = parseInt(item.quantity || 0, 10); // Garantir que o estoque seja um número
        const itemTotal = Math.abs(item.price * quantity); // Garantir que o total seja positivo

        const updatedItem = {
          ...item,
          quantity: stockQuantity - quantity, // Usar o valor convertido para garantir que seja um número
          sold: (parseInt(item.sold || 0, 10)) + quantity,
          saleDate,
          paymentMethod
        };

        await updateProduct(updatedItem);
        updatedItems[index] = updatedItem;
        totalAmount += itemTotal;
      }

      setItems(updatedItems);
      setSelectedItems([]);

      // Update sales summary
      setSalesSummary(prev => ({
        totalCash: paymentMethod === 'dinheiro' ? prev.totalCash + Math.abs(totalAmount) : prev.totalCash,
        totalCard: paymentMethod === 'cartao' ? prev.totalCard + Math.abs(totalAmount) : prev.totalCard,
        totalPix: paymentMethod === 'pix' ? prev.totalPix + Math.abs(totalAmount) : prev.totalPix
      }));

      // Criar objeto de venda para adicionar à lista e mostrar no pop-up
      const newSale = {
        id: Date.now(),
        date: localDate,
        time: localTime,
        client: selectedClient?.name || 'Cliente não especificado',
        clientDoc: selectedClient?.rg || '',
        clientCpf: selectedClient?.cpf || '',
        // Usar dados do vendedor logado se disponível, caso contrário usar o vendedor selecionado
        vendor: currentUser?.name || selectedVendor?.name || 'Vendedor não especificado',
        vendorDoc: currentUser?.rg || selectedVendor?.document || '',
        product: selectedItems.map(index => updatedItems[index].description).join(', '),
        quantity: selectedItems.reduce((total, index) => total + Math.abs(updatedItems[index].soldQuantity || 1), 0),
        price: Math.abs(totalAmount) / selectedItems.reduce((total, index) => total + Math.abs(updatedItems[index].soldQuantity || 1), 0),
        total: Math.abs(totalAmount),
        paymentMethod,
        // Adicionar timestamp completo para facilitar ordenação
        timestamp: now.getTime()
      };

      setSalesData(prev => [...prev, newSale]);

      // Salvar a venda atual para mostrar no pop-up de confirmação
      console.log('Salvando venda para pop-up de confirmação:', newSale);
      setLastCompletedSale(newSale);

      // Fechar o pop-up de pagamento e mostrar o pop-up de confirmação
      setShowPaymentPopup(false);
      console.log('Exibindo pop-up de confirmação, setShowSaleConfirmation(true)');
      setShowSaleConfirmation(true);
      console.log('Estado após atualização:', { showSaleConfirmation: true, lastCompletedSale: newSale });

      // Criar backup automático após a venda
      if (autoBackup) {
        try {
          await createBackup();
        } catch (backupError) {
          console.error('Erro ao criar backup automático:', backupError);
        }
      }
    } catch (error) {
      console.error('Error processing sales:', error);
      alert('Erro ao processar vendas. Por favor, tente novamente.');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.description || !newItem.price) {
      alert('Por favor, preencha o nome do item e o preço do item');
      return;
    }

    try {
      const productData = {
        description: newItem.description,
        price: newItem.price,
        quantity: newItem.quantity || 0,
        sold: 0,
        image: newItem.image || '',
        additionalImages: newItem.additionalImages || [],
        expirationDate: newItem.expirationDate || null,
        links: newItem.links || [],
        itemDescription: newItem.itemDescription || '',
        category: newItem.category || 'Todos', // Adicionar categoria ao produto
        sku: newItem.sku || ''
      };

      const productId = await addProduct(productData);

      // Atualizar a lista de itens
      setItems(prevItems => [
        ...prevItems,
        {
          ...productData,
          id: productId,
          soldQuantity: 1
        }
      ]);

      // Limpar o formulário
      setNewItem({
        description: '',
        price: '',
        quantity: '',
        image: '',
        additionalImages: [],
        links: [],
        expirationDate: null,
        checked: false,
        itemDescription: '',
        category: 'Todos', // Resetar categoria para o padrão
        sku: ''
      });

      setShowAddItem(false);
      alert('Item adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Erro ao adicionar item. Verifique se já existe um item com a mesma descrição.');
    }
  };

  const generateReceipt = (item) => {
    const currentDate = new Date();

    // Format date in Portuguese
    const formatDateInPortuguese = (date) => {
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const days = [
        'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
        'quinta-feira', 'sexta-feira', 'sábado'
      ];

      return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    // Função para converter valor numérico em texto por extenso
    const valorPorExtenso = (valor) => {
      if (valor === 0) return 'zero reais';

      const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
      const dezADezenove = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
      const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
      const centenas = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

      // Arredondar para duas casas decimais e separar parte inteira e decimal
      const valorArredondado = Math.round(valor * 100) / 100;
      const parteInteira = Math.floor(valorArredondado);
      const parteDecimal = Math.round((valorArredondado - parteInteira) * 100);

      let resultado = '';

      // Processar parte inteira
      if (parteInteira > 0) {
        if (parteInteira < 10) {
          resultado = unidades[parteInteira];
        } else if (parteInteira < 20) {
          resultado = dezADezenove[parteInteira - 10];
        } else if (parteInteira < 100) {
          const dezena = Math.floor(parteInteira / 10);
          const unidade = parteInteira % 10;
          resultado = dezenas[dezena] + (unidade > 0 ? ' e ' + unidades[unidade] : '');
        } else if (parteInteira < 1000) {
          const centena = Math.floor(parteInteira / 100);
          const resto = parteInteira % 100;

          if (centena === 1 && resto > 0) {
            resultado = 'cento';
          } else {
            resultado = centenas[centena];
          }

          if (resto > 0) {
            if (resto < 10) {
              resultado += ' e ' + unidades[resto];
            } else if (resto < 20) {
              resultado += ' e ' + dezADezenove[resto - 10];
            } else {
              const dezena = Math.floor(resto / 10);
              const unidade = resto % 10;
              resultado += ' e ' + dezenas[dezena] + (unidade > 0 ? ' e ' + unidades[unidade] : '');
            }
          }
        } else if (parteInteira === 1000) {
          resultado = 'mil';
        } else {
          resultado = 'valor muito alto';
        }

        resultado += parteInteira === 1 ? ' real' : ' reais';
      }

      // Processar parte decimal (centavos)
      if (parteDecimal > 0) {
        if (parteInteira > 0) {
          resultado += ' e ';
        }

        if (parteDecimal < 10) {
          resultado += unidades[parteDecimal] + (parteDecimal === 1 ? ' centavo' : ' centavos');
        } else if (parteDecimal < 20) {
          resultado += dezADezenove[parteDecimal - 10] + ' centavos';
        } else {
          const dezena = Math.floor(parteDecimal / 10);
          const unidade = parteDecimal % 10;
          resultado += dezenas[dezena] + (unidade > 0 ? ' e ' + unidades[unidade] : '') + ' centavos';
        }
      } else if (parteInteira === 0) {
        resultado = 'zero reais';
      }

      return resultado;
    };

    // Get total amount from current sale with null check
    const totalAmount = currentSale?.total || (item?.price * (item?.saleQuantity || 1));

    // Obter os dados do cliente selecionado ou do objeto de venda
    const clientName = selectedClient?.name || item?.client?.name || lastCompletedSale?.client || 'Não especificado';
    const clientRG = selectedClient?.rg || item?.client?.rg || lastCompletedSale?.clientDoc || '';
    const clientCPF = selectedClient?.cpf || item?.client?.cpf || lastCompletedSale?.clientCpf || '';

    // Obter os produtos e quantidades
    let productsText = '';
    if (lastCompletedSale?.product) {
      // Se temos uma venda completa, usar os dados dela
      productsText = `- ${lastCompletedSale.product}: ${lastCompletedSale.quantity}x R$ ${(lastCompletedSale.price || 0).toFixed(2)} = R$ ${(lastCompletedSale.total || 0).toFixed(2)}`;
    } else if (currentSale?.items) {
      // Se temos itens no carrinho atual
      productsText = currentSale.items.map(saleItem =>
        `- ${saleItem?.description || 'Item'}: ${saleItem?.quantity || 1}x R$ ${(saleItem?.price || 0).toFixed(2)} = R$ ${((saleItem?.price || 0) * (saleItem?.quantity || 1)).toFixed(2)}`
      ).join('\n');
    } else {
      // Caso contrário, usar o item individual
      productsText = `- ${item?.description || 'Item'}: ${item?.soldQuantity || 1}x R$ ${(item?.price || 0).toFixed(2)} = R$ ${((item?.price || 0) * (item?.soldQuantity || 1)).toFixed(2)}`;
    }

    // Valor por extenso
    const valorExtenso = valorPorExtenso(totalAmount);

    const receiptContent = `RECIBO DE VENDA

DADOS DO VENDEDOR
Nome: ${currentUser?.name || item?.vendor?.name || 'Não especificado'}
Documento: ${currentUser?.rg || item?.vendor?.doc || 'Não especificado'}

DADOS DO CLIENTE
Nome: ${clientName}
RG: ${clientRG}
CPF: ${clientCPF}

DETALHES DA VENDA
${productsText}

Valor Total: R$ ${(totalAmount || 0).toFixed(2)} (${valorExtenso})
Forma de Pagamento: ${currentSale?.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                  currentSale?.paymentMethod === 'cartao' ? 'Cartão' :
                  currentSale?.paymentMethod === 'pix' ? 'PIX' :
                  item?.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                  item?.paymentMethod === 'cartao' ? 'Cartão' :
                  item?.paymentMethod === 'pix' ? 'PIX' :
                  lastCompletedSale?.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                  lastCompletedSale?.paymentMethod === 'cartao' ? 'Cartão' :
                  lastCompletedSale?.paymentMethod === 'pix' ? 'PIX' :
                  'Não especificado'}

Declaro para os devidos fins que recebi o valor acima descrito referente à venda dos itens listados.

Salvador-BA, ${formatDateInPortuguese(currentDate)}


_______________________________
${currentUser?.name || item?.vendor?.name || lastCompletedSale?.vendor || 'Vendedor'}
${currentUser?.rg || item?.vendor?.doc || lastCompletedSale?.vendorDoc || ''}


_______________________________
${clientName}
${clientRG}
${clientCPF}
`;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo_venda_${currentDate.toISOString().slice(0,10)}.txt`;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
  };



  // Carregar dados de vendas de exemplo ao iniciar apenas se não houver dados existentes
  useEffect(() => {
    // Função para gerar dados de exemplo dentro do useEffect
    const generateSampleData = () => {
      const today = new Date();

      // Criar datas variadas para o histórico
      const dates = [];
      // Data atual
      dates.push(new Date(today));
      // Ontem
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      dates.push(yesterday);
      // Semana passada
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      dates.push(lastWeek);
      // Mês passado
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dates.push(lastMonth);

      // Produtos variados
      const products = [
        { name: 'Ventilador G-Fire Cooler', price: 250, quantity: 5 },
        { name: 'Notebook ABC', price: 3500, quantity: 1 },
        { name: 'Fone de Ouvido', price: 150, quantity: 5 },
        { name: 'Mouse sem fio', price: 80, quantity: 8 },
        { name: 'Teclado mecânico', price: 250, quantity: 3 }
      ];

      // Métodos de pagamento
      const paymentMethods = ['dinheiro', 'cartao', 'pix'];

      // Gerar vendas com datas variadas
      const sampleSales = [];
      let id = 1;

      dates.forEach(date => {
        // Formatar data no padrão brasileiro
        const formattedDate = formatDateToBrazilian(date.toISOString().split('T')[0]);

        // Gerar 2-3 vendas para cada data
        const numSales = 2 + Math.floor(Math.random() * 2); // 2 ou 3 vendas

        for (let i = 0; i < numSales; i++) {
          // Selecionar produto aleatório
          const productIndex = Math.floor(Math.random() * products.length);
          const product = products[productIndex];

          // Selecionar método de pagamento aleatório
          const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

          // Quantidade aleatória (entre 1 e a quantidade máxima do produto)
          const quantity = 1 + Math.floor(Math.random() * product.quantity);

          // Calcular total
          const total = product.price * quantity;

          sampleSales.push({
            id: id++,
            date: formattedDate,
            client: 'Cliente não especificado',
            clientDoc: '',
            clientCpf: '',
            vendor: 'Vendedor não especificado',
            vendorDoc: '',
            product: product.name,
            quantity: quantity,
            price: product.price,
            total: total,
            paymentMethod: paymentMethod
          });
        }
      });

      return sampleSales;
    };

    // Verificar se já existem dados no localStorage
    const savedSalesData = localStorage.getItem('salesData');
    if (!savedSalesData || JSON.parse(savedSalesData).length === 0) {
      console.log("Nenhum dado de vendas encontrado, gerando dados de exemplo...");
      const sampleData = generateSampleData();
      console.log("Dados de exemplo gerados:", sampleData);
      setSalesData(sampleData);
    } else {
      console.log("Dados de vendas existentes encontrados, não gerando dados de exemplo.");
      console.log("Dados carregados do localStorage:", JSON.parse(savedSalesData));
    }
  }, []);

  // Função getFilteredSalesData melhorada para trabalhar com o formato brasileiro e histórico de vendas
  const getFilteredSalesData = useCallback(() => {
    console.log("Filtrando vendas para:", reportType, reportStartDate, reportEndDate);

    const realSalesData = [];

    // Adicionar vendas dos itens do estoque
    items.forEach(item => {
      // Verificar se o item tem uma categoria válida, se não tiver, definir como 'Diversos'
      if (!item.category || !categories.includes(item.category)) {
        item.category = 'Diversos';
      }

      if (item.sold > 0) { // Removida a verificação de item.saleDate para incluir todas as vendas
        const clientInfo = item.client || currentSale?.client || { name: 'Cliente não especificado' };
        const vendorInfo = item.vendor || selectedVendor || { name: 'Vendedor não especificado' };

        // Converter a data para o formato brasileiro
        // Se não houver data de venda, usar a data atual
        const localDate = item.saleDate ? new Date(item.saleDate) : new Date();
        const formattedDate = formatDateToBrazilian(localDate.toISOString().split('T')[0]);

        // Extrair o horário da venda ou usar horário atual
        const hours = localDate.getHours().toString().padStart(2, '0');
        const minutes = localDate.getMinutes().toString().padStart(2, '0');
        const seconds = localDate.getSeconds().toString().padStart(2, '0');
        const localTime = `${hours}:${minutes}:${seconds}`;

        realSalesData.push({
          id: item.id,
          date: formattedDate,
          client: clientInfo.name,
          clientDoc: clientInfo.rg || '',
          clientCpf: clientInfo.cpf || '',
          vendor: vendorInfo.name,
          vendorDoc: vendorInfo.document || '',
          product: item.description,
          quantity: Math.abs(item.sold), // Garantir que a quantidade seja positiva
          price: Math.abs(item.price), // Garantir que o preço seja positivo
          total: Math.abs(item.price * item.sold), // Garantir que o total seja positivo
          paymentMethod: item.paymentMethod || 'Não especificado',
          source: 'estoque', // Marcar a origem dos dados
          category: item.category, // Adicionar a categoria do produto
          time: localTime, // Adicionar o horário da venda
          timestamp: localDate.getTime() // Adicionar timestamp para ordenação
        });
      }
    });

    // Abordagem simplificada: apenas combinar os dados sem agrupamento complexo
    // Normalizar os dados para garantir valores positivos
    const normalizedSalesData = salesData.map(sale => ({
      ...sale,
      quantity: Math.abs(sale.quantity || 0),
      price: Math.abs(sale.price || 0),
      total: Math.abs(sale.total || 0),
      // Normalizar o método de pagamento para facilitar a comparação
      paymentMethod: sale.paymentMethod === 'fotos' ? 'pix' : sale.paymentMethod
    }));

    // Verificar se estamos duplicando vendas
    // Vamos usar apenas os dados de salesData (normalizedSalesData) e não combinar com realSalesData
    // Isso evita a duplicação de vendas que estão sendo contadas duas vezes
    const combinedData = [...normalizedSalesData];

    // Adicionar apenas as vendas de realSalesData que não estão em normalizedSalesData
    // Isso é feito verificando o ID da venda
    const existingIds = new Set(normalizedSalesData.map(sale => sale.id));

    realSalesData.forEach(sale => {
      if (!existingIds.has(sale.id)) {
        combinedData.push(sale);
      }
    });

    // Log para depuração
    console.log("Dados de vendas combinados:", combinedData.length);

    console.log("Total de vendas antes da filtragem:", combinedData.length);

    let filtered = [...combinedData];

    // Verificar se há dados para filtrar
    if (filtered.length === 0) {
      console.log("Nenhuma venda encontrada para filtrar");
      return [];
    }

    // Filtrar por período apenas se estiver gerando relatório
    // Se não estiver gerando relatório, retornar todos os dados
    if (!showSalesReport) {
      console.log("Exibindo todas as vendas na página principal");
      return filtered;
    }

    // Normalizar todas as datas para o formato brasileiro DD/MM/YYYY
    filtered = filtered.map(sale => {
      if (!sale.date) return sale;

      let normalizedDate = sale.date;

      // Converter de ISO para brasileiro se necessário
      if (normalizedDate.includes('-') && !normalizedDate.includes('/')) {
        const dateParts = normalizedDate.split('-');
        if (dateParts.length === 3) {
          normalizedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        }
      }

      return { ...sale, normalizedDate };
    });

    if (reportType === 'day') {
      console.log("Filtrando por dia:", reportStartDate);
      filtered = filtered.filter(sale => {
        if (!sale.normalizedDate) return false;
        const matches = sale.normalizedDate === reportStartDate;
        if (matches) {
          console.log("Venda correspondente encontrada:", sale);
        }
        return matches;
      });
    } else if (reportType === 'month') {
      console.log("Filtrando por mês:", reportStartDate);
      // Extrair mês e ano do formato brasileiro
      const [day, month, year] = (reportStartDate || '').split('/');

      if (!month || !year) {
        console.error("Data de início inválida:", reportStartDate);
        return [];
      }

      filtered = filtered.filter(sale => {
        if (!sale.normalizedDate) return false;

        const [saleDay, saleMonth, saleYear] = sale.normalizedDate.split('/');
        if (!saleMonth || !saleYear) return false;

        const matches = parseInt(saleYear) === parseInt(year) && parseInt(saleMonth) === parseInt(month);
        if (matches) {
          console.log("Venda correspondente encontrada:", sale);
        }
        return matches;
      });
    } else if (reportType === 'period') {
      console.log("Filtrando por período:", reportStartDate, "até", reportEndDate);

      // Converter datas para comparação
      const startParts = reportStartDate.split('/');
      const endParts = reportEndDate.split('/');

      if (startParts.length === 3 && endParts.length === 3) {
        const startDay = parseInt(startParts[0]);
        const startMonth = parseInt(startParts[1]);
        const startYear = parseInt(startParts[2]);

        const endDay = parseInt(endParts[0]);
        const endMonth = parseInt(endParts[1]);
        const endYear = parseInt(endParts[2]);

        filtered = filtered.filter(sale => {
          if (!sale.normalizedDate) return false;

          const [saleDay, saleMonth, saleYear] = sale.normalizedDate.split('/');
          if (!saleDay || !saleMonth || !saleYear) return false;

          const saleDayNum = parseInt(saleDay);
          const saleMonthNum = parseInt(saleMonth);
          const saleYearNum = parseInt(saleYear);

          // Comparar datas
          const isAfterStart =
            (saleYearNum > startYear) ||
            (saleYearNum === startYear && saleMonthNum > startMonth) ||
            (saleYearNum === startYear && saleMonthNum === startMonth && saleDayNum >= startDay);

          const isBeforeEnd =
            (saleYearNum < endYear) ||
            (saleYearNum === endYear && saleMonthNum < endMonth) ||
            (saleYearNum === endYear && saleMonthNum === endMonth && saleDayNum <= endDay);

          const matches = isAfterStart && isBeforeEnd;
          if (matches) {
            console.log("Venda correspondente encontrada:", sale);
          }
          return matches;
        });
      } else {
        console.error("Formato de data inválido:", reportStartDate, reportEndDate);
      }
    }

    // Filtrar por busca
    if (reportSearchQuery) {
      const query = reportSearchQuery.toLowerCase();
      filtered = filtered.filter(sale =>
        (sale.client && sale.client.toLowerCase().includes(query)) ||
        (sale.product && sale.product.toLowerCase().includes(query)) ||
        (sale.clientDoc && sale.clientDoc.toLowerCase().includes(query)) ||
        (sale.clientCpf && sale.clientCpf.toLowerCase().includes(query)) ||
        (sale.vendor && sale.vendor.toLowerCase().includes(query)) ||
        (sale.vendorDoc && sale.vendorDoc.toLowerCase().includes(query)) ||
        (sale.paymentMethod && sale.paymentMethod.toLowerCase().includes(query))
      );
    }

    // Filtro por cliente e produto removido

    console.log("Total de vendas após filtragem:", filtered.length);
    return filtered;
  }, [reportType, reportStartDate, reportEndDate, items, categories, currentSale, selectedVendor, salesData, showSalesReport, reportSearchQuery]);

  // Função para exportar o relatório como imagem
  const exportAsImage = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current);
      const imageData = canvas.toDataURL('image/png');

      if (exportMethod === 'whatsapp') {
        // Primeiro baixar a imagem
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `relatorio-vendas-${new Date().toISOString().slice(0, 10)}.png`;
        link.click();

        // Depois abrir o WhatsApp
        if (contactInfo.whatsapp) {
          setTimeout(() => {
            const encodedMessage = encodeURIComponent('Relatório de Vendas (enviando o arquivo que acabei de baixar)');
            window.open(`https://wa.me/${contactInfo.whatsapp}?text=${encodedMessage}`, '_blank');
            alert('O arquivo foi baixado. Agora você pode enviá-lo manualmente pelo WhatsApp que acabou de abrir.');
          }, 1000);
        } else {
          setShowContactForm(true);
        }
      } else if (exportMethod === 'email') {
        // Primeiro baixar a imagem
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `relatorio-vendas-${new Date().toISOString().slice(0, 10)}.png`;
        link.click();

        // Depois abrir o cliente de email
        if (contactInfo.email) {
          setTimeout(() => {
            const subject = encodeURIComponent('Relatório de Vendas');
            const body = encodeURIComponent('Segue em anexo o relatório de vendas (enviando o arquivo que acabei de baixar).');
            window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_blank');
            alert('O arquivo foi baixado. Agora você pode enviá-lo manualmente pelo email que acabou de abrir.');
          }, 1000);
        } else {
          setShowContactForm(true);
        }
      } else {
        // Download direto
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `relatorio-vendas-${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert('Erro ao exportar como imagem. Por favor, tente novamente.');
    }
  };

  // Função para exportar o relatório como PDF
  const exportAsPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current);
      const imageData = canvas.toDataURL('image/png');

      // Usar orientação retrato para melhor formatação em A4
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calcular quantas páginas serão necessárias
      const pageHeight = pdfHeight - 40; // Altura disponível na página (margem de 20mm em cima e embaixo)
      const ratio = pdfWidth / imgWidth * 0.9; // Usar 90% da largura disponível
      const scaledImgHeight = imgHeight * ratio;
      const totalPages = Math.ceil(scaledImgHeight / pageHeight);

      // Adicionar páginas conforme necessário
      let remainingHeight = scaledImgHeight;
      let sourceY = 0;

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();

        // Adicionar cabeçalho em cada página
        pdf.setFontSize(16);
        pdf.text('Relatório de Vendas', pdfWidth / 2, 15, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text(`Página ${i+1} de ${totalPages}`, pdfWidth / 2, 22, { align: 'center' });

        // Calcular altura para esta página
        const pageContentHeight = Math.min(remainingHeight, pageHeight);

        // Adicionar parte da imagem correspondente a esta página
        const destY = 30; // Posição Y inicial na página

        // Calcular a parte da imagem original a ser usada nesta página
        const sourceHeight = pageContentHeight / ratio;

        pdf.addImage(
          imageData,
          'PNG',
          (pdfWidth - imgWidth * ratio) / 2, // centralizar horizontalmente
          destY,
          imgWidth * ratio,
          imgHeight * ratio,
          null,
          'FAST',
          0,
          sourceY / imgHeight,
          1,
          (sourceY + sourceHeight) / imgHeight
        );

        // Atualizar para a próxima página
        remainingHeight -= pageContentHeight;
        sourceY += sourceHeight;
      }

      if (exportMethod === 'whatsapp') {
        // Primeiro salvar o PDF
        pdf.save(`relatorio-vendas-${new Date().toISOString().slice(0, 10)}.pdf`);

        // Depois abrir o WhatsApp
        if (contactInfo.whatsapp) {
          setTimeout(() => {
            const encodedMessage = encodeURIComponent('Relatório de Vendas (enviando o arquivo PDF que acabei de baixar)');
            window.open(`https://wa.me/${contactInfo.whatsapp}?text=${encodedMessage}`, '_blank');
            alert('O arquivo PDF foi baixado. Agora você pode enviá-lo manualmente pelo WhatsApp que acabou de abrir.');
          }, 1000);
        } else {
          setShowContactForm(true);
        }
      } else if (exportMethod === 'email') {
        // Primeiro salvar o PDF
        pdf.save(`relatorio-vendas-${new Date().toISOString().slice(0, 10)}.pdf`);

        // Depois abrir o cliente de email
        if (contactInfo.email) {
          setTimeout(() => {
            const subject = encodeURIComponent('Relatório de Vendas');
            const body = encodeURIComponent('Segue em anexo o relatório de vendas em PDF (enviando o arquivo que acabei de baixar).');
            window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_blank');
            alert('O arquivo PDF foi baixado. Agora você pode enviá-lo manualmente pelo email que acabou de abrir.');
          }, 1000);
        } else {
          setShowContactForm(true);
        }
      } else {
        // Download direto
        pdf.save(`relatorio-vendas-${new Date().toISOString().slice(0, 10)}.pdf`);
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar como PDF. Por favor, tente novamente.');
    }
  };

  // Função para lidar com a exportação
  const handleExport = (type, method) => {
    setExportType(type);
    setExportMethod(method);

    if ((method === 'whatsapp' && !contactInfo.whatsapp) ||
        (method === 'email' && !contactInfo.email)) {
      setShowContactForm(true);
    } else {
      // Se já temos as informações de contato, mostrar opção para editar
      if (method === 'whatsapp' || method === 'email') {
        const shouldEdit = window.confirm(
          `Enviar para ${method === 'whatsapp' ?
            `WhatsApp: ${contactInfo.whatsapp}` :
            `Email: ${contactInfo.email}`}?\n\nClique em "Cancelar" para editar o contato.`
        );

        if (!shouldEdit) {
          setEditingContact(true);
          setShowContactForm(true);
          return;
        }
      }

      if (type === 'photo') {
        exportAsImage();
      } else if (type === 'pdf') {
        exportAsPDF();
      }
    }
  };

  // Função para salvar informações de contato
  const handleSaveContact = () => {
    setShowContactForm(false);
    setEditingContact(false);

    // Após salvar, continuar com a exportação
    if (exportType === 'photo') {
      exportAsImage();
    } else if (exportType === 'pdf') {
      exportAsPDF();
    }
  };

  // Função para calcular o valor total das compras para um item específico
  const getItemTotalPurchases = (itemId) => {
    if (!itemId) return 0;

    // Obter a descrição do item selecionado
    const selectedItem = items.find(item => item.id === itemId);
    if (!selectedItem) return 0;

    const itemDescription = selectedItem.description;
    console.log("Calculando total de compras para o item:", itemDescription);

    // Filtrar vendas pelo período selecionado
    const filteredSales = getFilteredSalesData();
    console.log("Vendas filtradas:", filteredSales.length);

    // Calcular o total de compras para o item específico
    const totalPurchases = filteredSales.reduce((total, sale) => {
      // Verificar se o produto da venda contém a descrição do item selecionado
      if (sale.product && sale.product.includes(itemDescription)) {
        console.log("Venda correspondente encontrada:", sale);
        return total + sale.total;
      }
      return total;
    }, 0);

    console.log("Total de compras calculado:", totalPurchases);
    return totalPurchases;
  };

  const formatWhatsApp = (value) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = `(${cleaned.slice(0, 2)}`;
      if (cleaned.length >= 7) {
        formatted += `) ${cleaned.slice(2, 7)}`;
        if (cleaned.length >= 11) {
          formatted += `-${cleaned.slice(7, 11)}`;
        } else {
          formatted += `-${cleaned.slice(7)}`;
        }
      } else {
        formatted += `) ${cleaned.slice(2)}`;
      }
    }
    return formatted;
  };

  const handleCepSearch = async (cepValue) => {
    try {
      const cep = cepValue.replace(/\D/g, '');
      if (cep.length !== 8) return;

      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        return {
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  };

  const handleCPFMask = (value) => {
    return value
      .replace(/\D/g, '') // Removes tudo que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os primeiros 3 dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os segundos 3 dígitos
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca hífen antes dos últimos 2 dígitos
      .replace(/(-\d{2})\d+?$/, '$1'); // Impede que sejam digitados mais de 11 dígitos
  };

  // Função getPieChartData otimizada para evitar erros de renderização
  const getPieChartData = () => {
    try {
      // Se o dashboard não está visível, retornar dados vazios
      if (!showDashboard) {
        return {
          labels: ['Nenhum dado disponível'],
          datasets: [
            {
              label: 'Sem dados',
              data: [1],
              backgroundColor: ['#e5e7eb'],
              borderWidth: 1,
            },
          ],
        };
      }

      console.log("Gerando dados do gráfico de pizza para data:", reportStartDate);

      // Obter os dados filtrados do relatório
      const filteredSales = getFilteredSalesData() || [];
      console.log("Vendas filtradas para o gráfico:", filteredSales.length, "registros");

      // Verificar se há dados disponíveis
      if (!filteredSales || filteredSales.length === 0) {
        console.log("Nenhuma venda encontrada para o período selecionado");
        // Retornar dados vazios em um formato válido para o gráfico
        return {
          labels: ['Nenhum dado disponível'],
          datasets: [
            {
              label: 'Sem dados',
              data: [1],
              backgroundColor: ['#e5e7eb'],
              borderWidth: 1,
            },
          ],
        };
      }

      // Agrupar por produto
      const productSales = {};

      // Processar cada venda com validação de dados
      filteredSales.forEach(sale => {
        if (!sale || !sale.product) {
          console.log("Venda sem produto ou inválida:", sale);
          return;
        }

        const product = sale.product;
        const quantity = sale.quantity || 0;

        if (!productSales[product]) {
          productSales[product] = 0;
        }

        // Adicionar a quantidade total da venda (garantindo que seja um número)
        productSales[product] += Number(quantity);
      });

      console.log("Produtos agrupados:", productSales);

      // Converter para o formato do gráfico
      const labels = Object.keys(productSales);
      const data = Object.values(productSales);

      // Verificar novamente se há dados após o processamento
      if (!labels || labels.length === 0) {
        console.log("Nenhum produto encontrado após agrupamento");
        return {
          labels: ['Nenhum dado disponível'],
          datasets: [
            {
              label: 'Sem dados',
              data: [1],
              backgroundColor: ['#e5e7eb'],
              borderWidth: 1,
            },
          ],
        };
      }

      // Gerar cores para cada produto
      const backgroundColors = labels.map((label, index) => {
        // Usar o índice como seed para gerar cores consistentes
        const r = (173 + index * 50) % 255;
        const g = (100 + index * 70) % 255;
        const b = (200 + index * 30) % 255;
        return `rgba(${r}, ${g}, ${b}, 0.6)`;
      });

      // Retornar os dados formatados para o gráfico
      return {
        labels,
        datasets: [
          {
            label: 'Quantidade vendida',
            data,
            backgroundColor: backgroundColors,
            borderWidth: 1,
          },
        ],
      };
    } catch (error) {
      console.error("Erro ao gerar dados do gráfico de pizza:", error);
      // Em caso de erro, retornar um objeto válido para evitar quebrar a renderização
      return {
        labels: ['Erro ao carregar dados'],
        datasets: [
          {
            label: 'Erro',
            data: [1],
            backgroundColor: ['#f87171'],
            borderWidth: 1,
          },
        ],
      };
    }
  };

  // Função getBarChartData otimizada para evitar erros de renderização
  const getBarChartData = () => {
    try {
      // Se o dashboard não está visível, retornar dados vazios
      if (!showDashboard) {
        return {
          labels: ['Nenhum dado disponível'],
          datasets: [
            {
              label: 'Sem dados',
              data: [1],
              backgroundColor: '#e5e7eb',
              borderWidth: 1,
            }
          ],
        };
      }

      console.log("Gerando dados do gráfico de barras para data:", reportStartDate);

      // Obter os dados filtrados do relatório
      const filteredSales = getFilteredSalesData() || [];
      console.log("Vendas filtradas para o gráfico de barras:", filteredSales.length, "registros");

      // Verificar se há dados disponíveis
      if (!filteredSales || filteredSales.length === 0) {
        console.log("Nenhuma venda encontrada para o período selecionado");
        // Retornar dados vazios em um formato válido para o gráfico
        return {
          labels: ['Nenhum dado disponível'],
          datasets: [
            {
              label: 'Sem dados',
              data: [1],
              backgroundColor: '#e5e7eb',
              borderWidth: 1,
            }
          ],
        };
      }

      // Agrupar por data e produto com validação de dados
      const salesByDateAndProduct = {};

      // Processar cada venda com validação de dados
      filteredSales.forEach(sale => {
        if (!sale || !sale.date || !sale.product) {
          console.log("Venda com data ou produto ausente:", sale);
          return;
        }

        // Usar a data da venda como chave
        const dateKey = sale.date;
        const quantity = sale.quantity || 0;

        if (!salesByDateAndProduct[dateKey]) {
          salesByDateAndProduct[dateKey] = {};
        }

        // Usar o produto como está, sem dividir por vírgulas
        const product = sale.product;

        if (!salesByDateAndProduct[dateKey][product]) {
          salesByDateAndProduct[dateKey][product] = 0;
        }

        // Adicionar a quantidade total da venda (garantindo que seja um número)
        salesByDateAndProduct[dateKey][product] += Number(quantity);
      });

      console.log("Vendas agrupadas por data e produto:", salesByDateAndProduct);

      // Obter todas as datas e produtos únicos
      const dates = Object.keys(salesByDateAndProduct).sort((a, b) => {
        try {
          // Ordenar datas no formato DD/MM/YYYY com validação
          const partsA = a.split('/');
          const partsB = b.split('/');

          if (partsA.length !== 3 || partsB.length !== 3) {
            return 0; // Manter a ordem original se o formato for inválido
          }

          const [dayA, monthA, yearA] = partsA.map(Number);
          const [dayB, monthB, yearB] = partsB.map(Number);

          if (yearA !== yearB) return yearA - yearB;
          if (monthA !== monthB) return monthA - monthB;
          return dayA - dayB;
        } catch (error) {
          console.error("Erro ao ordenar datas:", error);
          return 0; // Manter a ordem original em caso de erro
        }
      });

      // Coletar produtos únicos
      const allProducts = new Set();
      Object.values(salesByDateAndProduct).forEach(productMap => {
        Object.keys(productMap).forEach(product => allProducts.add(product));
      });
      const uniqueProducts = Array.from(allProducts);

      // Verificar novamente se há dados após o processamento
      if (!dates || dates.length === 0 || !uniqueProducts || uniqueProducts.length === 0) {
        console.log("Nenhuma data ou produto encontrado após agrupamento");
        return {
          labels: ['Nenhum dado disponível'],
          datasets: [
            {
              label: 'Sem dados',
              data: [1],
              backgroundColor: '#e5e7eb',
              borderWidth: 1,
            }
          ],
        };
      }

      // Gerar cores consistentes para cada produto
      const productColors = {};
      uniqueProducts.forEach((product, index) => {
        // Usar o índice como seed para gerar cores consistentes
        const r = (173 + index * 50) % 255;
        const g = (100 + index * 70) % 255;
        const b = (200 + index * 30) % 255;
        productColors[product] = `rgba(${r}, ${g}, ${b}, 0.6)`;
      });

      // Criar datasets para o gráfico com validação
      const datasets = uniqueProducts.map(product => ({
        label: product,
        data: dates.map(date => {
          if (salesByDateAndProduct[date] && typeof salesByDateAndProduct[date][product] === 'number') {
            return salesByDateAndProduct[date][product];
          }
          return 0;
        }),
        backgroundColor: productColors[product] || '#e5e7eb',
        borderWidth: 1,
      }));

      // Retornar os dados formatados para o gráfico
      return {
        labels: dates,
        datasets,
      };
    } catch (error) {
      console.error("Erro ao gerar dados do gráfico de barras:", error);
      // Em caso de erro, retornar um objeto válido para evitar quebrar a renderização
      return {
        labels: ['Erro ao carregar dados'],
        datasets: [
          {
            label: 'Erro',
            data: [1],
            backgroundColor: ['#f87171'],
            borderWidth: 1,
          },
        ],
      };
    }
  };

  // Atualizar os gráficos e totais quando a data do relatório mudar
  useEffect(() => {
    // Só calcular totais se o dashboard estiver visível
    if (!showDashboard) return;

    // Calcular totais por método de pagamento
    const filteredData = getFilteredSalesData();
    console.log("Dados filtrados para cálculo de totais:", filteredData);

    // Calcular totais por método de pagamento
    const totals = {
      totalCash: 0,
      totalCard: 0,
      totalPix: 0
    };

    filteredData.forEach(sale => {
      // Garantir que o total seja um número válido
      const saleTotal = typeof sale.total === 'number' ? Math.abs(sale.total) : 0;

      const paymentMethod = (sale.paymentMethod || '').toLowerCase();
      if (paymentMethod.includes('dinheiro')) {
        totals.totalCash += saleTotal;
      } else if (paymentMethod.includes('cartao') || paymentMethod.includes('cartão')) {
        totals.totalCard += saleTotal;
      } else if (paymentMethod.includes('pix')) {
        totals.totalPix += saleTotal;
      } else {
        // Se não tiver método de pagamento específico, adicionar ao dinheiro (padrão)
        totals.totalCash += saleTotal;
      }
    });

    console.log("Totais calculados:", totals);

    // Atualizar o resumo de vendas
    setSalesSummary(totals);
  }, [reportStartDate, reportEndDate, reportType, getFilteredSalesData, showDashboard]);

  // Garantir que as datas estejam no formato correto quando o tipo de relatório mudar
  useEffect(() => {
    // Obter a data atual no formato ISO
    const currentDateISO = getCurrentDateISO();
    const currentDateBR = formatDateToBrazilian(currentDateISO);

    // Ajustar as datas com base no tipo de relatório
    if (reportType === 'day') {
      // Para relatório diário, usar a data atual
      setReportStartDate(currentDateBR);
      setReportEndDate(currentDateBR);
    } else if (reportType === 'month') {
      // Para relatório mensal, usar o primeiro dia do mês atual
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayISO = firstDayOfMonth.toISOString().split('T')[0];
      setReportStartDate(formatDateToBrazilian(firstDayISO));
      setReportEndDate(currentDateBR);
    }
  }, [reportType]);

  // Atualizar os dashboards quando os dados de vendas mudarem
  useEffect(() => {
    // Só calcular totais se o dashboard estiver visível
    if (!showDashboard) return;

    // Calcular totais por método de pagamento
    const filteredData = getFilteredSalesData();
    console.log("Dados filtrados para cálculo de totais (dados mudaram):", filteredData);

    // Calcular totais por método de pagamento
    const totals = {
      totalCash: 0,
      totalCard: 0,
      totalPix: 0
    };

    filteredData.forEach(sale => {
      // Garantir que o total seja um número válido
      const saleTotal = typeof sale.total === 'number' ? Math.abs(sale.total) : 0;

      const paymentMethod = (sale.paymentMethod || '').toLowerCase();
      if (paymentMethod.includes('dinheiro')) {
        totals.totalCash += saleTotal;
      } else if (paymentMethod.includes('cartao') || paymentMethod.includes('cartão')) {
        totals.totalCard += saleTotal;
      } else if (paymentMethod.includes('pix')) {
        totals.totalPix += saleTotal;
      } else {
        // Se não tiver método de pagamento específico, adicionar ao dinheiro (padrão)
        totals.totalCash += saleTotal;
      }
    });

    console.log("Totais calculados (dados mudaram):", totals);

    // Atualizar o resumo de vendas
    setSalesSummary(totals);
  }, [salesData, items, getFilteredSalesData, showDashboard]);

  const handleEditClient = async (client) => {
    setNewClient({
      ...client,
      birthDate: client.birthDate || '',
      issueDate: client.issueDate || '',
      fatherName: client.fatherName || '',
      motherName: client.motherName || '',
      birthPlace: client.birthPlace || '',
      whatsapp: client.whatsapp || '',
      email: client.email || '',
      cep: client.cep || '',
      address: client.address || '',
      neighborhood: client.neighborhood || '',
      city: client.city || '',
      state: client.state || ''
    });
    setSelectedClient(client);
    setShowAddClient(true);
  };

  // Função para sincronizar produtos com WordPress
  const handleWordPressSync = async () => {
    try {
      const selectedProducts = items.filter((_, index) => selectedItems.includes(index));
      await syncProductsToWordPress(selectedProducts);
      alert('Produtos sincronizados com sucesso para o WordPress!');
    } catch (error) {
      alert('Erro ao sincronizar produtos: ' + error.message);
    }
  };

  // Função para configurar webhook do WordPress
  const handleSetupWebhook = async () => {
    try {
      await setupWordPressWebhook();
      alert('Webhook do WordPress configurado com sucesso!');
    } catch (error) {
      alert('Erro ao configurar webhook do WordPress: ' + error.message);
    }
  };

  // Add these handler functions with the other handlers
  const handleDeleteClient = async (clientId) => {
    try {
      await deleteClient(clientId);
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      setFilteredClients(updatedClients);
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const handleQRCodeImageChange = async (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const qrCodeUrl = e.target.result;
        setQRCodeImage(qrCodeUrl);
        // Salvar o QR code selecionado no localStorage para persistência
        localStorage.setItem('selectedQRCode', qrCodeUrl);
        console.log('QR Code salvo no localStorage');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompletePurchase = async () => {
    try {
      if (selectedItems.length === 0) {
        alert('Selecione pelo menos um item para vender');
        return;
      }

      // Calcular o total da venda
      const totalAmount = selectedItems.reduce((total, index) => {
        const item = items[index];
        return total + (item.price * (item.soldQuantity || 1));
      }, 0);

      // Atualizar os itens no estoque
      const updatedItems = [...items];
      const saleDate = new Date().toISOString();
      const localDate = formatDateToBrazilian(new Date().toISOString().split('T')[0]);
      const localTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const saleItems = [];

      for (const index of selectedItems) {
        const item = updatedItems[index];
        const quantity = parseInt(item.soldQuantity || 1, 10);
        const stockQuantity = parseInt(item.quantity || 0, 10);

        // Verificar estoque
        if (!ignoreStock[item.id] && stockQuantity < quantity) {
          alert(`Quantidade insuficiente em estoque para ${item.description}. Disponível: ${stockQuantity}, Solicitado: ${quantity}`);
          return;
        }

        const updatedItem = {
          ...item,
          quantity: stockQuantity - quantity, // Usar o valor convertido para garantir que seja um número
          sold: (parseInt(item.sold || 0, 10)) + quantity,
          saleDate,
          paymentMethod: 'pix',
          qrCodeImage: qrCodeImage
        };

        await updateProduct(updatedItem);
        updatedItems[index] = updatedItem;

        saleItems.push({
          id: item.id,
          description: item.description,
          quantity,
          price: item.price,
          total: item.price * quantity
        });
      }

      // Atualizar o estado
      setItems(updatedItems);
      setSelectedItems([]);
      setShowPixQRCode(false);
      setShowPaymentPopup(false);

      // Atualizar o resumo de vendas
      setSalesSummary(prev => ({
        ...prev,
        totalPix: prev.totalPix + Math.abs(totalAmount)
      }));

      // Criar objeto de venda para adicionar à lista e mostrar no pop-up
      const newSale = {
        id: Date.now(),
        date: localDate,
        time: localTime,
        client: selectedClient?.name || 'Cliente não especificado',
        clientDoc: selectedClient?.rg || '',
        clientCpf: selectedClient?.cpf || '',
        // Usar dados do vendedor logado se disponível, caso contrário usar o vendedor selecionado
        vendor: currentUser?.name || selectedVendor?.name || 'Vendedor não especificado',
        vendorDoc: currentUser?.rg || selectedVendor?.document || '',
        product: saleItems.map(item => item.description).join(', '),
        quantity: saleItems.reduce((total, item) => total + Math.abs(item.quantity), 0),
        price: Math.abs(totalAmount) / saleItems.reduce((total, item) => total + Math.abs(item.quantity), 0),
        total: Math.abs(totalAmount),
        paymentMethod: 'pix',
        // Adicionar timestamp completo para facilitar ordenação
        timestamp: new Date().getTime()
      };

      // Adicionar à lista de vendas
      setSalesData(prev => [...prev, newSale]);

      // Salvar a venda atual para mostrar no pop-up de confirmação
      console.log('Salvando venda para pop-up de confirmação:', newSale);
      setLastCompletedSale(newSale);

      // Mostrar o pop-up de confirmação
      console.log('Exibindo pop-up de confirmação, setShowSaleConfirmation(true)');
      setShowSaleConfirmation(true);
      console.log('Estado após atualização:', { showSaleConfirmation: true, lastCompletedSale: newSale });

      // Criar backup automático após a venda
      if (autoBackup) {
        try {
          await createBackup();
        } catch (backupError) {
          console.error('Erro ao criar backup automático:', backupError);
        }
      }
    } catch (error) {
      console.error('Erro ao processar pagamento PIX:', error);
      alert('Erro ao processar pagamento. Por favor, tente novamente.');
    }
  };

  const formatCep = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleWhatsAppClick = (number) => {
    try {
      // Formata o número para o formato internacional
      const formattedNumber = number.replace(/\D/g, '');

      // Tenta abrir o aplicativo WhatsApp no dispositivo
      window.location.href = `whatsapp://send?phone=${formattedNumber}`;

      // Fallback para o WhatsApp Web caso o app não abra
      setTimeout(() => {
        window.open(`https://wa.me/${formattedNumber}`, '_blank');
      }, 500);
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      // Fallback para o WhatsApp Web
      window.open(`https://wa.me/${number.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleWhatsAppWebClick = (number) => {
    const formattedNumber = number.replace(/\D/g, '');
    window.open(`https://web.whatsapp.com/send?phone=${formattedNumber}`, '_blank');
  };

  const handleEmailClick = (email) => {
    try {
      // Abre o cliente de email padrão do dispositivo
      window.location.href = `mailto:${email}`;
    } catch (error) {
      console.error('Erro ao abrir cliente de email:', error);
      // Fallback para abrir em nova aba
      window.open(`mailto:${email}`, '_blank');
    }
  };

  // Adicionar nova função para atualizar estoque
  const handleUpdateStock = async (itemId, newQuantity) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const updatedItem = {
        ...item,
        quantity: parseInt(newQuantity)
      };

      await updateProduct(updatedItem);
      setItems(prevItems => prevItems.map(i => i.id === itemId ? updatedItem : i));

      // Verificar estoque mínimo
      if (minStockAlert[itemId] && newQuantity <= minStockAlert[itemId]) {
        alert(`Alerta: Estoque do produto "${item.description}" está baixo (${newQuantity} unidades)`);
      }
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      alert('Erro ao atualizar estoque');
    }
  };

  // Adicionar função para deletar produto
  const handleDeleteProduct = async (itemId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await deleteProduct(itemId);
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      alert('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  // Funções para gerenciar backup
  const createBackup = async () => {
    try {
      console.log('Iniciando criação de backup completo...');

      // Verificar se há dados para backup
      if (!items || items.length === 0) {
        console.warn('Nenhum produto encontrado para backup');
      }

      // Obter configurações do WordPress/WooCommerce do arquivo .env
      const wooCommerceConfig = {
        url: import.meta.env.VITE_WORDPRESS_URL || 'https://achadinhoshopp.com.br/loja',
        consumerKey: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY || 'ck_40b4a1a674084d504579a2ba2d51530c260d3645',
        consumerSecret: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET || 'cs_8fa4b36ab57ddb02415e4fc346451791ab1782f9',
        username: import.meta.env.VITE_WORDPRESS_USERNAME || 'gloliverx',
        email: import.meta.env.VITE_WORDPRESS_EMAIL || 'gloliverx@gmail.com',
        password: import.meta.env.VITE_WORDPRESS_PASSWORD || 'gloliverx',
        appPassword: import.meta.env.VITE_WORDPRESS_APP_PASSWORD || '0lr4 umHb 8pfx 5Cqf v7KW oq8S'
      };

      // Criar objeto de backup completo
      const backupData = {
        // Dados do sistema
        products: items || [],
        clients: clients || [],
        vendors: vendors || [],
        sales: salesData || [],
        minStockAlert: minStockAlert || {},
        ignoreStock: ignoreStock || {},

        // Configurações de integração
        wordpressConfig: wordpressConfig || {
          apiUrl: import.meta.env.VITE_WORDPRESS_API_URL || 'https://achadinhoshopp.com.br/loja/wp-json/pdv-vendas/v1',
          apiKey: import.meta.env.VITE_WORDPRESS_API_KEY || 'OxCq4oUPrd5hqxPEq1zdjEd4',
          username: import.meta.env.VITE_WORDPRESS_USERNAME || 'gloliverx',
          password: import.meta.env.VITE_WORDPRESS_PASSWORD || 'OxCq4oUPrd5hqxPEq1zdjEd4'
        },

        // Configurações adicionais
        wooCommerceConfig,

        // Metadados do backup
        timestamp: new Date().toISOString(),
        version: '1.1.0',
        appName: 'PDV Vendas'
      };

      // Salvar no localStorage como backup temporário
      try {
        localStorage.setItem('pdvBackupTemp', JSON.stringify(backupData));
        console.log('Backup completo salvo no localStorage');
      } catch (storageError) {
        console.error('Erro ao salvar no localStorage:', storageError);
        // Continuar mesmo com erro no localStorage
      }

      // Se o autoBackup estiver ativado e houver um local definido, salvar no arquivo
      if (autoBackup && backupLocation) {
        console.log('Exportando backup completo para arquivo...');
        await exportBackup();
      } else {
        // Mostrar alerta de sucesso
        console.log('Backup completo criado com sucesso');
        alert('Backup completo criado com sucesso!');
      }

      return backupData;
    } catch (error) {
      console.error('Erro ao criar backup completo:', error);
      alert('Erro ao criar backup completo dos dados: ' + (error.message || 'Erro desconhecido'));
      return null;
    }
  };

  const exportBackup = async () => {
    try {
      console.log('Iniciando exportação de backup...');
      // Obter dados do backup temporário ou criar um novo
      const backupData = localStorage.getItem('pdvBackupTemp')
        ? JSON.parse(localStorage.getItem('pdvBackupTemp'))
        : await createBackup();

      if (!backupData) {
        console.error('Não foi possível obter dados para exportação');
        return;
      }

      // Criar um blob com os dados
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      console.log('Blob criado para exportação');

      // Usar o seletor de arquivos nativo para escolher onde salvar
      try {
        // Verificar se a API File System Access está disponível
        if ('showSaveFilePicker' in window) {
          console.log('Usando File System Access API para salvar o arquivo...');

          const options = {
            suggestedName: `pdv_backup_${new Date().toISOString().replace(/:/g, '-')}.json`,
            types: [{
              description: 'Arquivo JSON',
              accept: { 'application/json': ['.json'] }
            }]
          };

          try {
            const fileHandle = await window.showSaveFilePicker(options);
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();

            console.log('Arquivo salvo com sucesso usando File System Access API');
            alert('Backup exportado com sucesso!');
            return;
          } catch (fsError) {
            // Se o usuário cancelar ou ocorrer um erro, cair no método de fallback
            console.warn('Erro ou cancelamento ao usar File System Access API:', fsError);
            if (fsError.name !== 'AbortError') {
              console.log('Usando método de fallback para download...');
            } else {
              // Se foi cancelado pelo usuário, não mostrar erro
              return;
            }
          }
        } else {
          console.log('File System Access API não disponível, usando método de fallback...');
        }
      } catch (apiError) {
        console.warn('Erro ao tentar usar File System Access API:', apiError);
        console.log('Usando método de fallback para download...');
      }

      // Método de fallback: download direto
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pdv_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      console.log('Iniciando download do arquivo...');
      a.click();

      // Limpar
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Download concluído e recursos liberados');
      }, 0);

      alert('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      alert('Erro ao exportar backup: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const importBackup = async (event) => {
    try {
      console.log('Iniciando importação de backup...');

      // Verificar se o evento veio de um input de arquivo
      let file = null;
      if (event && event.target && event.target.files && event.target.files[0]) {
        file = event.target.files[0];
        console.log('Arquivo selecionado do input:', file.name);
      } else if (event instanceof File) {
        file = event;
        console.log('Arquivo fornecido diretamente:', file.name);
      } else {
        console.log('Nenhum arquivo fornecido, abrindo seletor de arquivos...');

        // Criar um input de arquivo temporário
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        // Promessa para lidar com a seleção de arquivo
        const filePromise = new Promise((resolve, reject) => {
          fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
              resolve(e.target.files[0]);
            } else {
              reject(new Error('Nenhum arquivo selecionado'));
            }
          };

          // Se o usuário fechar o diálogo sem selecionar um arquivo
          setTimeout(() => {
            if (fileInput.files.length === 0) {
              reject(new Error('Seleção de arquivo cancelada'));
            }
          }, 1000);
        });

        try {
          fileInput.click(); // Abrir o seletor de arquivos
          file = await filePromise;
          console.log('Arquivo selecionado:', file.name);
        } catch (error) {
          console.log('Seleção de arquivo cancelada ou falhou:', error);
          document.body.removeChild(fileInput);
          return false;
        }

        // Limpar o input temporário
        document.body.removeChild(fileInput);
      }

      if (!file) {
        console.error('Nenhum arquivo para importar');
        alert('Nenhum arquivo selecionado para importar.');
        return false;
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            console.log('Arquivo lido, processando conteúdo...');
            const backupData = JSON.parse(e.target.result);

            // Validar o backup - verificar se tem produtos ou vendas
            if ((!backupData.products || backupData.products.length === 0) &&
                (!backupData.sales || backupData.sales.length === 0)) {
              console.error('Arquivo de backup inválido ou vazio');
              alert('Arquivo de backup inválido ou vazio. Verifique se o arquivo contém dados de produtos ou vendas.');
              reject(new Error('Arquivo de backup inválido ou vazio'));
              return;
            }

            const timestamp = backupData.timestamp ? new Date(backupData.timestamp).toLocaleString() : 'data desconhecida';
            console.log('Backup válido, criado em:', timestamp);

            // Confirmar a importação
            if (!confirm(`Deseja importar o backup criado em ${timestamp}?\n\nDetalhes do backup:\n- Produtos: ${(backupData.products || []).length}\n- Clientes: ${(backupData.clients || []).length}\n- Vendas: ${(backupData.sales || []).length}\n\nISSO SUBSTITUIRÁ TODOS OS DADOS ATUAIS!`)) {
              console.log('Importação cancelada pelo usuário');
              reject(new Error('Importação cancelada pelo usuário'));
              return;
            }

            console.log('Importando dados do backup...');

            // Importar dados - manter dados existentes se não houver no backup
            if (backupData.products && backupData.products.length > 0) {
              setItems(backupData.products);
              console.log(`Importados ${backupData.products.length} produtos`);
            }

            if (backupData.clients && backupData.clients.length > 0) {
              setClients(backupData.clients);
              setFilteredClients(backupData.clients);
              console.log(`Importados ${backupData.clients.length} clientes`);
            }

            if (backupData.vendors && backupData.vendors.length > 0) {
              setVendors(backupData.vendors);
              console.log(`Importados ${backupData.vendors.length} fornecedores`);
            }

            if (backupData.sales && backupData.sales.length > 0) {
              // Garantir que todas as vendas tenham o formato de data correto
              const processedSales = backupData.sales.map(sale => {
                // Se a venda não tiver data, usar a data atual
                if (!sale.date) {
                  return {
                    ...sale,
                    date: formatDateToBrazilian(new Date().toISOString().split('T')[0])
                  };
                }

                // Se a data estiver no formato ISO, converter para brasileiro
                if (sale.date.includes('-') && !sale.date.includes('/')) {
                  const dateParts = sale.date.split('-');
                  if (dateParts.length === 3) {
                    return {
                      ...sale,
                      date: `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
                    };
                  }
                }

                return sale;
              });

              setSalesData(processedSales);
              console.log(`Importadas ${processedSales.length} vendas`);

              // Atualizar o localStorage com as vendas importadas
              localStorage.setItem('salesData', JSON.stringify(processedSales));
            }

            if (backupData.minStockAlert) {
              setMinStockAlert(backupData.minStockAlert);
              localStorage.setItem('minStockAlert', JSON.stringify(backupData.minStockAlert));
            }

            if (backupData.ignoreStock) {
              setIgnoreStock(backupData.ignoreStock);
              localStorage.setItem('ignoreStock', JSON.stringify(backupData.ignoreStock));
            }

            // WordPress config já está configurado via .env

            // Salvar no localStorage como backup temporário
            localStorage.setItem('pdvBackupTemp', JSON.stringify(backupData));

            console.log('Backup importado com sucesso!');
            alert('Backup importado com sucesso!');

            // Forçar a atualização da interface
            checkDataIntegrity();

            resolve(true);
          } catch (error) {
            console.error('Erro ao processar arquivo de backup:', error);
            alert('Erro ao processar arquivo de backup: ' + (error.message || 'Formato inválido'));
            reject(error);
          }
        };

        reader.onerror = () => {
          console.error('Erro ao ler o arquivo');
          alert('Erro ao ler o arquivo. Verifique se o arquivo não está corrompido.');
          reject(new Error('Erro ao ler o arquivo'));
        };

        console.log('Iniciando leitura do arquivo...');
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      alert('Erro ao importar backup: ' + (error.message || 'Erro desconhecido'));
      return false;
    }
  };

  // Função para salvar configurações de backup
  const saveBackupConfig = () => {
    try {
      console.log('Salvando configurações de backup...');
      console.log('Local de backup:', backupLocation);
      console.log('Backup automático:', autoBackup);

      localStorage.setItem('backupLocation', backupLocation);
      localStorage.setItem('autoBackup', autoBackup.toString());

      console.log('Configurações salvas no localStorage');
      alert('Configurações de backup salvas com sucesso!');
      setShowConfigPopup(false);
    } catch (error) {
      console.error('Erro ao salvar configurações de backup:', error);
      alert('Erro ao salvar configurações de backup. Por favor, tente novamente.');
    }
  };

  // Adicionar backup automático após cada venda
  useEffect(() => {
    const lastSalesCount = localStorage.getItem('lastSalesCount');
    const currentSalesCount = salesData.length;

    // Só fazer backup se o número de vendas aumentou
    if (autoBackup && currentSalesCount > 0 && (!lastSalesCount || currentSalesCount > parseInt(lastSalesCount))) {
      console.log('Realizando backup automático após venda...');
      createBackup()
        .then(() => {
          console.log('Backup automático realizado com sucesso');
          localStorage.setItem('lastSalesCount', currentSalesCount.toString());
        })
        .catch(error => {
        console.error('Erro ao criar backup automático:', error);
      });
    }
  }, [salesData, autoBackup]);

  // Função para verificar e corrigir a integridade dos dados
  const checkDataIntegrity = () => {
    console.log("Verificando integridade dos dados...");

    // Verificar dados de vendas
    let salesDataFixed = false;
    const fixedSalesData = salesData.map(sale => {
      let needsFix = false;
      const fixedSale = { ...sale };

      // Verificar se a data existe
      if (!sale.date) {
        console.log("Venda sem data:", sale);
        // Usar a data atual como fallback
        fixedSale.date = formatDateToBrazilian(new Date().toISOString().split('T')[0]);
        console.log("Data adicionada:", fixedSale.date);
        needsFix = true;
      }
      // Verificar se a data está no formato correto (DD/MM/YYYY)
      else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(sale.date)) {
        console.log("Data em formato incorreto:", sale.date);
        try {
          // Verificar se a data está no formato ISO (YYYY-MM-DD)
          if (sale.date.includes('-') && !sale.date.includes('/')) {
            const dateParts = sale.date.split('-');
            if (dateParts.length === 3) {
              fixedSale.date = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
              console.log("Data corrigida de ISO para brasileiro:", fixedSale.date);
              needsFix = true;
            }
          } else {
            // Tentar converter para o formato brasileiro
            const dateObj = new Date(sale.date);
            if (!isNaN(dateObj.getTime())) {
              fixedSale.date = formatDateToBrazilian(dateObj.toISOString().split('T')[0]);
              console.log("Data corrigida:", fixedSale.date);
              needsFix = true;
            }
          }
        } catch (e) {
          console.error("Erro ao corrigir data:", e);
        }
      }

      // Adicionar campo source se não existir
      if (!sale.source) {
        fixedSale.source = 'vendas_pdv';
        needsFix = true;
      }

      // Verificar se os valores numéricos são realmente números
      if (sale.quantity === undefined || sale.quantity === null || isNaN(sale.quantity) || sale.quantity <= 0) {
        console.log("Quantidade inválida:", sale.quantity);
        fixedSale.quantity = Math.abs(Number(sale.quantity)) || 1;
        needsFix = true;
      }

      if (sale.price === undefined || sale.price === null || isNaN(sale.price) || sale.price < 0) {
        console.log("Preço inválido:", sale.price);
        fixedSale.price = Math.abs(Number(sale.price)) || 0;
        needsFix = true;
      }

      // Verificar se o total está correto (preço * quantidade)
      const calculatedTotal = fixedSale.price * fixedSale.quantity;
      if (sale.total === undefined || sale.total === null || isNaN(sale.total) ||
          sale.total < 0 || Math.abs(sale.total - calculatedTotal) > 0.01) {
        console.log("Total inválido ou inconsistente:", sale.total, "calculado:", calculatedTotal);
        fixedSale.total = calculatedTotal;
        needsFix = true;
      }

      // Verificar se o produto existe
      if (!sale.product) {
        console.log("Venda sem produto:", sale);
        fixedSale.product = "Produto não especificado";
        needsFix = true;
      }

      // Verificar se o método de pagamento existe
      if (!sale.paymentMethod) {
        console.log("Venda sem método de pagamento:", sale);
        fixedSale.paymentMethod = "Não especificado";
        needsFix = true;
      }

      if (needsFix) {
        salesDataFixed = true;
        return fixedSale;
      }

      return sale;
    });

    // Atualizar os dados de vendas se foram corrigidos
    if (salesDataFixed) {
      console.log("Dados de vendas corrigidos:", fixedSalesData.length, "registros");
      setSalesData(fixedSalesData);
      localStorage.setItem('salesData', JSON.stringify(fixedSalesData));
    }

    // Verificar dados de produtos
    let itemsFixed = false;
    const fixedItems = items.map(item => {
      let needsFix = false;
      const fixedItem = { ...item };

      // Verificar se os valores numéricos são realmente números
      if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity)) {
        console.log("Quantidade de estoque inválida:", item.quantity);
        fixedItem.quantity = Number(item.quantity) || 0;
        needsFix = true;
      }

      if (item.price === undefined || item.price === null || isNaN(item.price) || item.price < 0) {
        console.log("Preço de produto inválido:", item.price);
        fixedItem.price = Math.abs(Number(item.price)) || 0;
        needsFix = true;
      }

      if (item.sold === undefined || item.sold === null || isNaN(item.sold)) {
        console.log("Quantidade vendida inválida:", item.sold);
        fixedItem.sold = Number(item.sold) || 0;
        needsFix = true;
      }

      // Verificar se a data de venda está no formato correto
      if (item.saleDate && !(item.saleDate instanceof Date) && isNaN(new Date(item.saleDate).getTime())) {
        console.log("Data de venda inválida:", item.saleDate);
        fixedItem.saleDate = new Date();
        needsFix = true;
      }

      // Verificar se o produto tem uma categoria válida
      if (!item.category || !categories.includes(item.category)) {
        console.log("Categoria inválida ou ausente para o produto:", item.description);
        fixedItem.category = 'Diversos'; // Definir categoria padrão como 'Diversos'
        needsFix = true;
      }

      if (needsFix) {
        itemsFixed = true;
        return fixedItem;
      }

      return item;
    });

    // Atualizar os dados de produtos se foram corrigidos
    if (itemsFixed) {
      console.log("Dados de produtos corrigidos:", fixedItems.length, "registros");
      setItems(fixedItems);
      // Salvar no banco de dados
      fixedItems.forEach(async item => {
        try {
          await updateProduct(item);
        } catch (e) {
          console.error("Erro ao atualizar produto:", e);
        }
      });
    }

    return { salesDataFixed, itemsFixed };
  };

  // Verificar integridade dos dados ao carregar a aplicação
  useEffect(() => {
    if (!isLoading) {
      const { salesDataFixed, itemsFixed } = checkDataIntegrity();
      if (salesDataFixed || itemsFixed) {
        console.log("Dados corrigidos automaticamente");
      }
    }
  }, [isLoading]);

  // Função para mostrar o relatório de vendas
  const handleShowSalesReport = () => {
    console.log("Abrindo relatório de vendas");

    // Verificar a integridade dos dados antes de mostrar o relatório
    const { salesDataFixed, itemsFixed } = checkDataIntegrity();

    // Definir a data de hoje como padrão para o relatório
    const today = new Date();
    const todayFormatted = formatDateToBrazilian(today.toISOString().split('T')[0]);

    // Definir o primeiro e último dia do mês atual
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Formatar as datas no padrão brasileiro
    const firstDayFormatted = formatDateToBrazilian(firstDayOfMonth.toISOString().split('T')[0]);
    const lastDayFormatted = formatDateToBrazilian(lastDayOfMonth.toISOString().split('T')[0]);

    // Definir as datas do relatório
    setReportType('day');
    setReportStartDate(todayFormatted);
    setReportEndDate(lastDayFormatted);

    // Limpar a busca
    setReportSearchQuery('');

    // Mostrar o relatório
    setShowSalesReport(true);
    setShowDashboard(false);

    // Notificar o usuário se os dados foram corrigidos
    if (salesDataFixed || itemsFixed) {
      setTimeout(() => {
        alert("Alguns dados foram corrigidos automaticamente para garantir a integridade do relatório.");
      }, 200);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            {/* Botão de login à esquerda */}
            <div className="flex items-center">
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-primary bg-gray-100 px-3 py-1.5 rounded-md transition-colors mr-4"
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Entrar
              </button>
            </div>

            <div className="flex-1 flex justify-center items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
            </div>
            <button
              onClick={() => setShowConfigPopup(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </button>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            {/* Add Item Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold">Adicionar Novo Item</h2>
                  {/* Magic Capture Button */}
                  {showAddItem && (
                    <MagicCaptureButton
                      onProductDataExtracted={(productData) => {
                        setNewItem(prev => ({
                          ...prev,
                          description: productData.description || prev.description,
                          itemDescription: productData.itemDescription || prev.itemDescription,
                          category: productData.category || prev.category,
                          price: productData.price || prev.price
                        }));
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={() => setShowAddItem(!showAddItem)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg
                    className={`h-6 w-6 transform ${showAddItem ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {showAddItem && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Imagens do Item</label>
                      <div className="image-upload-section">
                        {newItem.image && (
                          <div className="image-preview">
                            <img
                              src={newItem.image}
                              alt="Preview"
                              className="w-full max-h-40 object-contain rounded-md border"
                            />
                          </div>
                        )}

                        <div className="image-actions mt-2 flex space-x-2">
                          <label className="image-upload-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                            </svg>
                            Imagem Principal
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    setNewItem({...newItem, image: event.target.result});
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden-file-input"
                            />
                          </label>

                          <label className="image-upload-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                            </svg>
                            Adicionar Imagem
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const newImage = event.target.result;
                                    const additionalImages = newItem.additionalImages || [];
                                    setNewItem({
                                      ...newItem,
                                      additionalImages: [...additionalImages, newImage]
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden-file-input"
                            />
                          </label>
                        </div>

                        {/* Miniaturas das imagens adicionais */}
                        {newItem.additionalImages && newItem.additionalImages.length > 0 && (
                          <div className="product-images-grid mt-2">
                            {newItem.image && (
                              <img
                                src={newItem.image}
                                alt="Imagem Principal"
                                className="product-image-thumbnail active"
                              />
                            )}
                            {newItem.additionalImages.map((img, index) => (
                              <div key={index} className="image-preview-item">
                                <img
                                  src={img}
                                  alt={`Imagem ${index + 1}`}
                                  className="product-image-thumbnail"
                                />
                                <div
                                  className="remove-image"
                                  onClick={() => {
                                    const updatedImages = [...newItem.additionalImages];
                                    updatedImages.splice(index, 1);
                                    setNewItem({...newItem, additionalImages: updatedImages});
                                  }}
                                >
                                  ×
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Nome do Item</label>
                      <input
                        type="text"
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        placeholder="Nome do item"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Descrição do Item</label>
                      <textarea
                        value={newItem.itemDescription || ''}
                        onChange={(e) => setNewItem({...newItem, itemDescription: e.target.value})}
                        placeholder="Descrição detalhada do item (até 300 caracteres)"
                        maxLength={300}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md resize-none"
                      />
                      <span className="text-xs text-gray-500">
                        {(newItem.itemDescription?.length || 0)}/300 caracteres
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Preço de Venda</label>
                      <input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                        placeholder="Preço"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Estoque Inicial</label>
                      <input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Categoria</label>
                      <div className="flex gap-2">
                        {showNewCategoryInput ? (
                          <>
                            <input
                              type="text"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="Nova categoria"
                              className="flex-1 px-3 py-2 border rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newCategory.trim()) {
                                  setCategories(prev => [...prev, newCategory.trim()]);
                                  setNewItem({...newItem, category: newCategory.trim()});
                                  setNewCategory('');
                                  setShowNewCategoryInput(false);
                                }
                              }}
                              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setNewCategory('');
                                setShowNewCategoryInput(false);
                              }}
                              className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <select
                              value={newItem.category}
                              onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                              className="flex-1 px-3 py-2 border rounded-md"
                            >
                              {categories.map((category, index) => (
                                <option key={index} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setShowNewCategoryInput(true)}
                              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                              title="Adicionar nova categoria"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Data de Validade</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={newItem.expirationDate || ''}
                          onChange={(e) => setNewItem({...newItem, expirationDate: e.target.value})}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => setNewItem({...newItem, checked: !newItem.checked})}
                          className={`px-4 py-2 rounded-md ${
                            newItem.checked ? 'bg-green-500' : 'bg-gray-200'
                          } text-white`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => setShowLinks(!showLinks)}
                      className="flex items-center text-blue-500 hover:text-blue-600"
                    >
                      <span className="mr-2">Adicionar Links</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {showLinks && (
                      <div className="mt-2">
                        <div className="space-y-2">
                          {newItem.links && newItem.links.map((link, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex-grow">
                                {link}
                              </a>
                              <button
                                onClick={() => {
                                  const updatedLinks = [...newItem.links];
                                  updatedLinks.splice(index, 1);
                                  setNewItem({...newItem, links: updatedLinks});
                                }}
                                className="p-1 text-gray-600 hover:text-red-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Digite um link e pressione Enter"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const url = e.target.value.trim();
                              if (url) {
                                const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                                setNewItem({...newItem, links: [...(newItem.links || []), fullUrl]});
                                e.target.value = '';
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-md mt-2"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddItem}
                    className="mt-6 w-full button-primary"
                  >
                    Adicionar Item ao Estoque
                  </button>
                </>
              )}
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Vendas PDV</h2>

              {/* Barra de busca centralizada */}
              <SearchBar
                value={itemSearchQuery}
                onChange={setItemSearchQuery}
                placeholder="Buscar por nome do item..."
              />

              {/* Checkbox centralizado para mostrar descrições */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Descrição:</label>
                  <input
                    type="checkbox"
                    checked={showDescription}
                    onChange={() => setShowDescription(!showDescription)}
                    className="w-4 h-4 text-blue-600"
                  />
                </div>
              </div>

              {/* Filtro de categorias */}
              <div className="flex justify-center mb-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(category)}
                      className={`category-item px-4 py-2 text-base font-bold rounded-lg ${
                        selectedCategory === category
                          ? 'selected'
                          : ''
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {items.length > 0 ? (
                <div className="space-y-4">
                  {items
                    .filter(item => {
                      // Filtrar por categoria
                      const categoryMatch = selectedCategory === 'Todos' || item.category === selectedCategory;

                      // Filtrar por termo de busca (nome do item)
                      const searchMatch = itemSearchQuery.trim() === '' ||
                        (item.description && item.description.toLowerCase().includes(itemSearchQuery.toLowerCase()));

                      return categoryMatch && searchMatch;
                    })
                    .map((item, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      {/* Grid principal para imagem e informações */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                        <div className="product-image-container">
                          {item.image ? (
                            <img src={item.image} alt={item.description} className="product-image" />
                          ) : (
                            <div className="no-image-placeholder">Sem imagem</div>
                          )}

                          {/* Miniaturas das imagens adicionais */}
                          {item.additionalImages && item.additionalImages.length > 0 && (
                            <div className="product-images-grid mt-2">
                              {item.additionalImages.map((img, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={img}
                                  alt={`${item.description} - Imagem ${imgIndex + 1}`}
                                  className="product-image-thumbnail"
                                  onClick={() => {
                                    // Abrir popup de visualização de imagem
                                    setEditingItem(item);
                                    setShowEditPopup(true);
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={`${item.image ? 'col-span-2' : 'col-span-3'}`}>
                          <p className="font-medium text-left">{item.description}</p>
                          <p className="text-sm text-gray-600 text-left">Preço: R$ {item.price}</p>
                          <div className="flex items-center justify-start gap-4 mt-2">
                            <p className="text-sm text-gray-600">Vendidos: {item.sold}</p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max={item.quantity}
                                defaultValue="1"
                                className="w-16 px-2 py-1 border rounded-md text-sm"
                                onChange={(e) => {
                                  const updatedItems = [...items];
                                  updatedItems[index].soldQuantity = Math.min(
                                    Number(e.target.value),
                                    item.quantity
                                  );
                                  setItems(updatedItems);
                                }}
                              />
                            </div>
                          </div>
                          {item.links && item.links.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-600 text-left">Links:</p>
                              <div className="space-y-1">
                                {item.links.map((link, linkIndex) => (
                                  <a
                                    key={linkIndex}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-blue-500 hover:text-blue-600 text-left"
                                  >
                                    {link}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Categoria do item (movida para a coluna de informações) */}
                          <div className="mt-4">
                            <div className="text-left mb-1">
                              <span className="font-medium">Categoria:</span>{" "}
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {item.category || "Todos"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Área de descrição centralizada (fora do grid principal) */}
                      {showDescription && (
                        <div className="mt-4 flex justify-center items-center w-full">
                          <div className="max-w-2xl mx-auto text-center w-full">
                            <div className="text-center mb-2">
                              <span className="font-medium">Descrição</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
                              <p className="text-base font-medium text-center" style={{ overflowWrap: 'break-word', color: '#000000' }}>
                                {item.itemDescription || "Sem descrição"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4 items-center">
                        {item.expirationDate && (
                          <>
                            {(() => {
                              const expiration = new Date(item.expirationDate);
                              const today = new Date();
                              const diffTime = expiration - today;
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                              if (diffDays < 0) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                                    </svg>
                                    <button className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                                      Produto Vencido
                                    </button>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </>
                        )}
                        <button
                          onClick={() => {
                            const itemToEdit = items[index];
                            setEditingItem(itemToEdit);
                            setShowEditPopup(true);
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Tem certeza que deseja excluir este item?')) {
                              try {
                                await deleteProduct(item.id);
                                const updatedItems = items.filter((_, i) => i !== index);
                                setItems(updatedItems);
                              } catch (error) {
                                alert('Erro ao excluir o item');
                                console.error('Error deleting product:', error);
                              }
                            }
                          }}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Excluir
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const isSelected = selectedItems.includes(index);
                              if (isSelected) {
                                setSelectedItems(prev => prev.filter(i => i !== index));
                              } else {
                                // Garantir que soldQuantity seja 1 quando o item é selecionado
                                const updatedItems = [...items];
                                updatedItems[index].soldQuantity = 1;
                                setItems(updatedItems);
                                setSelectedItems(prev => [...prev, index]);
                              }
                            }}
                            className={`px-3 py-1 text-sm ${
                              selectedItems.includes(index)
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                            } text-white rounded hover:bg-opacity-90`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhum item cadastrado ainda.</p>
              )}
            </div>

            {/* Main buttons grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Finalizar Venda button */}
              <button
                onClick={() => setShowPaymentPopup(true)}
                className="btn btn-primary w-full px-6 py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2"
                disabled={selectedItems.length === 0}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finalizar Venda
              </button>

              {/* Relatório de Vendas button */}
              <button
                onClick={() => {
                  // Definir a data de hoje como padrão para o relatório
                  const today = new Date();
                  const todayFormatted = formatDateToBrazilian(today.toISOString().split('T')[0]);

                  // Definir o primeiro e último dia do mês atual
                  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                  // Formatar as datas no padrão brasileiro
                  const firstDayFormatted = formatDateToBrazilian(firstDayOfMonth.toISOString().split('T')[0]);
                  const lastDayFormatted = formatDateToBrazilian(lastDayOfMonth.toISOString().split('T')[0]);

                  // Definir as datas do relatório
                  setReportType('day');
                  setReportStartDate(todayFormatted);
                  setReportEndDate(lastDayFormatted);

                  // Limpar a busca
                  setReportSearchQuery('');

                  // Mostrar o relatório
                  setShowSalesReport(true);
                  setShowDashboard(false);
                }}
                className="btn btn-primary w-full px-6 py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Relatório de Vendas
              </button>

              {/* Histórico de Vendas button */}
              <button
                onClick={() => setShowSalesHistory(true)}
                className="btn btn-primary w-full px-6 py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico de Vendas
              </button>

              {/* Clientes button */}
              <button
                onClick={() => setShowClients(!showClients)}
                className={`btn btn-primary w-full px-6 py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 ${
                  showClients ? 'active' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
                Clientes
                <svg
                  className={`w-6 h-6 transform ${showClients ? 'rotate-180' : ''} transition-transform`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Fornecedores button */}
              <button
                onClick={() => setShowVendorsTab(true)}
                className="btn btn-primary w-full px-6 py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 mt-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Fornecedores
              </button>

              {/* WordPress Sync button */}
              <button
                onClick={() => setShowSiteExporter(!showSiteExporter)}
                className={`btn btn-primary w-full px-6 py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 ${
                  showSiteExporter ? 'active' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                WordPress Sync
                <svg
                  className={`w-6 h-6 transform ${showSiteExporter ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Cálculo de Frete button */}
              <button
                onClick={() => setShowShippingCalculator(true)}
                className="btn btn-primary w-full px-6 py-3 rounded-lg text-lg font-bold flex items-center justify-center gap-2 mt-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Cálculo de Frete
              </button>
            </div>

            {/* Clients Section */}
            {showClients && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Clientes</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      className="px-3 py-2 border rounded-lg"
                      onChange={(e) => handleClientSearch(e.target.value)}
                    />
                    <button
                      onClick={() => setShowAddClient(true)}
                      className="p-2 bg-purple-100 rounded-full hover:bg-purple-200 text-purple-600"
                      title="Adicionar Novo Cliente"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div
                        className="flex-1 cursor-pointer hover:text-purple-600"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowClients(false);
                        }}
                      >
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-600">
                          {client.document}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClient(client);
                          }}
                          className="p-2 text-blue-500 hover:text-blue-600"
                          title="Editar Cliente"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {client.whatsapp && (
                          <a
                            href={`tel:${client.whatsapp}`}
                            className="p-2 text-green-500 hover:text-green-600 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppClick(client.whatsapp);
                              return false; // Impede o comportamento padrão do link
                            }}
                            title="Abrir WhatsApp"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/767px-WhatsApp.svg.png"
                              alt="WhatsApp"
                              className="w-5 h-5"
                            />
                          </a>
                        )}

                        {client.email && (
                          <a
                            href={`mailto:${client.email}`}
                            className="p-2 text-blue-500 hover:text-blue-600 flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmailClick(client.email);
                              return false; // Impede o comportamento padrão do link
                            }}
                            title="Enviar Email"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/2560px-Gmail_icon_%282020%29.svg.png"
                              alt="Email"
                              className="w-5 h-5"
                            />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Deseja realmente excluir o cliente ${client.name}?`)) {
                              handleDeleteClient(client.id);
                            }
                          }}
                          className="p-2 text-red-500 hover:text-red-600"
                          title="Excluir Cliente"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Client Modal */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${showAddClient ? 'flex' : 'hidden'} items-center justify-center p-4`}>
              <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{selectedClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                    <MagicWandButton
                      onDataExtracted={(data) => {
                        // Garantir que as datas estejam no formato correto
                        const formattedData = { ...data };

                        // Verificar e formatar a data de nascimento
                        if (formattedData.birthDate) {
                          // Verificar se já está no formato YYYY-MM-DD
                          if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedData.birthDate)) {
                            try {
                              // Tentar converter de DD/MM/YYYY para YYYY-MM-DD
                              const parts = formattedData.birthDate.split('/');
                              if (parts.length === 3) {
                                formattedData.birthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                              }
                            } catch (e) {
                              console.error('Erro ao formatar data de nascimento:', e);
                            }
                          }
                        }

                        // Verificar e formatar a data de expedição
                        if (formattedData.issueDate) {
                          // Verificar se já está no formato YYYY-MM-DD
                          if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedData.issueDate)) {
                            try {
                              // Tentar converter de DD/MM/YYYY para YYYY-MM-DD
                              const parts = formattedData.issueDate.split('/');
                              if (parts.length === 3) {
                                formattedData.issueDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                              }
                            } catch (e) {
                              console.error('Erro ao formatar data de expedição:', e);
                            }
                          }
                        }

                        console.log('Dados formatados para o formulário:', formattedData);

                        setNewClient(prev => ({
                          ...prev,
                          ...formattedData
                        }));
                      }}
                    />
                  </div>

                  {/* Informações Básicas - Expansível */}
                  <details open className="mb-4">
                    <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded text-black">Informações Básicas</summary>
                    <div className="p-2 space-y-3">
                      <input
                        type="text"
                        placeholder="Nome Completo *"
                        value={newClient.name}
                        onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="RG *"
                        value={newClient.rg}
                        onChange={(e) => setNewClient(prev => ({ ...prev, rg: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="CPF *"
                        value={newClient.cpf}
                        onChange={(e) => setNewClient(prev => ({ ...prev, cpf: handleCPFMask(e.target.value) }))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </details>

                  {/* Informações Complementares - Expansível */}
                  <details className="mb-4">
                    <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded text-black">Informações Complementares</summary>
                    <div className="p-2 space-y-3">
                      <input
                        type="text"
                        placeholder="Nome do Pai"
                        value={newClient.fatherName}
                        onChange={(e) => setNewClient(prev => ({ ...prev, fatherName: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Nome da Mãe"
                        value={newClient.motherName}
                        onChange={(e) => setNewClient(prev => ({ ...prev, motherName: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
                        <input
                          type="date"
                          value={newClient.birthDate}
                          onChange={(e) => setNewClient(prev => ({ ...prev, birthDate: e.target.value }))}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Data de Expedição</label>
                        <input
                          type="date"
                          value={newClient.issueDate}
                          onChange={(e) => setNewClient(prev => ({ ...prev, issueDate: e.target.value }))}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Naturalidade"
                        value={newClient.birthPlace}
                        onChange={(e) => setNewClient(prev => ({ ...prev, birthPlace: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </details>

                  {/* Contato - Expansível */}
                  <details className="mb-4">
                    <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded text-black">Contato</summary>
                    <div className="p-2 space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="WhatsApp"
                          value={newClient.whatsapp}
                          onChange={(e) => setNewClient(prev => ({ ...prev, whatsapp: formatWhatsApp(e.target.value) }))}
                          className="flex-1 p-2 border rounded"
                        />
                        <button
                          onClick={() => handleWhatsAppClick(newClient.whatsapp)}
                          className="p-2 text-green-500 hover:text-green-600"
                          title="Enviar WhatsApp"
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/767px-WhatsApp.svg.png"
                            alt="WhatsApp"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="email"
                          placeholder="Email"
                          value={newClient.email}
                          onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                          className="flex-1 p-2 border rounded"
                        />
                        <button
                          onClick={() => handleEmailClick(newClient.email)}
                          className="p-2 text-blue-500 hover:text-blue-600"
                          title="Enviar Email"
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/2560px-Gmail_icon_%282020%29.svg.png"
                            alt="Email"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </div>
                  </details>

                  {/* Endereço - Expansível */}
                  <details className="mb-4">
                    <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded text-black">Endereço</summary>
                    <div className="p-2 space-y-3">
                      <input
                        type="text"
                        placeholder="CEP"
                        value={newClient.cep}
                        onChange={async (e) => {
                          const formattedCep = formatCep(e.target.value);
                          setNewClient(prev => ({ ...prev, cep: formattedCep }));

                          if (formattedCep.replace(/\D/g, '').length === 8) {
                            const addressData = await handleCepSearch(formattedCep);
                            if (addressData) {
                              setNewClient(prev => ({
                                ...prev,
                                ...addressData
                              }));
                            }
                          }
                        }}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Endereço"
                        value={newClient.address}
                        onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Bairro"
                        value={newClient.neighborhood}
                        onChange={(e) => setNewClient(prev => ({ ...prev, neighborhood: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Cidade"
                        value={newClient.city}
                        onChange={(e) => setNewClient(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Estado"
                        value={newClient.state}
                        onChange={(e) => setNewClient(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </details>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowAddClient(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddNewClient}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {selectedClient ? 'Salvar' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Site Exporter Sync button and content */}
            {showSiteExporter && (
              <WordPressSync selectedItems={selectedItems} items={items} />
            )}
          </div>
        </div>
      )}

      {/* Shipping Calculator Popup */}
      {showShippingCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Cálculo de Frete</h3>
              <button
                onClick={() => setShowShippingCalculator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ToastProvider>
              <ShippingCalculator />
            </ToastProvider>
          </div>
        </div>
      )}

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Escolha a forma de pagamento</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleMultipleSales('dinheiro')}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Dinheiro
              </button>
              <button
                onClick={() => handleMultipleSales('cartao')}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Cartão
              </button>
              <button
                onClick={() => handleMultipleSales('pix')}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                PIX
              </button>
              <button
                onClick={() => setShowPaymentPopup(false)}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Report Popup */}
      {showSalesReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-6xl w-full h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Relatório de Vendas
              </h3>
              <div className="flex items-center gap-4">
                {/* Botão de Dashboard */}
                <button
                  onClick={() => {
                    if (!showDashboard) {
                      // Primeiro mostrar o indicador de carregamento
                      setIsLoadingDashboard(true);

                      // Depois ativar o dashboard com um pequeno atraso para permitir a renderização do indicador
                      setTimeout(() => {
                        setShowDashboard(true);

                        // Dar tempo para os dados serem processados antes de esconder o indicador
                        setTimeout(() => {
                          setIsLoadingDashboard(false);
                        }, 800);
                      }, 200);
                    } else {
                      // Simplesmente esconder o dashboard
                      setShowDashboard(false);
                      // Resetar o indicador de carregamento
                      setIsLoadingDashboard(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                  </svg>
                  {showDashboard ? 'Ocultar Dashboard' : 'Mostrar Dashboard'}
                </button>
                <button
                  onClick={() => setShowSalesReport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4" ref={reportRef}>
              {/* Indicador de carregamento do dashboard */}
              {showDashboard && isLoadingDashboard && (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="ml-3 text-gray-600">Carregando dashboard...</p>
                </div>
              )}

              {!showDashboard ? (
                // Relatório de Vendas Simples (sem dashboard)
                <div className="space-y-6">
                  {/* Seletor de Período com Calendário e Campo de Busca */}
                  <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div>
                        <label className="block text-sm font-medium mb-1">Período:</label>
                        <select
                          value={reportType}
                          onChange={(e) => {
                            setReportType(e.target.value);
                          }}
                          className="px-4 py-2 border rounded-lg bg-white"
                        >
                          <option value="day">Hoje</option>
                          <option value="month">Este Mês</option>
                          <option value="custom">Período Personalizado</option>
                        </select>
                      </div>

                      {/* Calendário sempre visível ao lado do dropdown */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Data:</label>
                        <input
                          type="date"
                          value={formatDateToISO(reportStartDate)}
                          onChange={(e) => {
                            const newDate = formatDateToBrazilian(e.target.value);
                            setReportStartDate(newDate);
                            if (reportType === 'day') {
                              // Se o tipo for 'day', atualiza automaticamente para a data selecionada
                              setTimeout(() => {
                                const filteredData = getFilteredSalesData();
                                console.log("Dados filtrados atualizados após mudança de data:", filteredData.length, "registros");
                              }, 100);
                            }
                          }}
                          className="px-4 py-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    {/* Campo de busca para clientes, documentos e produtos */}
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1">Buscar:</label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={reportSearchQuery}
                            onChange={(e) => setReportSearchQuery(e.target.value)}
                            placeholder="Buscar por cliente, documento ou produto..."
                            className="w-full px-4 py-2 border rounded-lg bg-white"
                          />
                        </div>
                        <button
                          onClick={() => {
                            // Limpar a busca
                            setReportSearchQuery('');
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          title="Limpar busca"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {reportType === 'custom' && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium mb-1">Período Personalizado:</label>
                        <div className="flex flex-wrap gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">De:</label>
                            <input
                              type="date"
                              value={formatDateToISO(reportStartDate)}
                              onChange={(e) => {
                                const newDate = formatDateToBrazilian(e.target.value);
                                setReportStartDate(newDate);
                              }}
                              className="px-4 py-2 border rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Até:</label>
                            <input
                              type="date"
                              value={formatDateToISO(reportEndDate)}
                              onChange={(e) => {
                                const newDate = formatDateToBrazilian(e.target.value);
                                setReportEndDate(newDate);
                              }}
                              className="px-4 py-2 border rounded-lg bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Valor Total das Compras do Item Selecionado */}
                  {selectedItems.length === 1 && items[selectedItems[0]] && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
                      <h4 className="text-lg font-medium mb-2">Valor Total das Compras do Item Selecionado</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Item: {items[selectedItems[0]]?.description || 'Item não encontrado'}</p>
                          <p className="text-gray-600">Período: {reportType === 'day' ? reportStartDate : reportType === 'month' ? `Mês ${reportStartDate.split('/')[1]}/${reportStartDate.split('/')[2]}` : `${reportStartDate} até ${reportEndDate}`}</p>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          R$ {getItemTotalPurchases(items[selectedItems[0]]?.id).toFixed(2)}
                        </div>
                      </div>

                      {/* Campo de busca de clientes centralizado */}
                      <div className="mt-4 flex justify-center">
                        <div className="w-full max-w-md">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Buscar cliente por nome ou documento..."
                              onChange={(e) => handleClientSearch(e.target.value)}
                              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                              </svg>
                            </div>
                          </div>

                          {/* Lista de resultados da busca */}
                          {filteredClients.length > 0 && (
                            <div className="absolute z-10 w-full max-w-md mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredClients.map((client) => (
                                <div
                                  key={client.id}
                                  className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 flex justify-between items-center"
                                  onClick={() => {
                                    setSelectedClient(client);
                                    // Atualizar o item selecionado com o cliente
                                    const updatedItems = [...items];
                                    updatedItems[selectedItems[0]] = {
                                      ...updatedItems[selectedItems[0]],
                                      client: {
                                        name: client.name,
                                        rg: client.rg,
                                        cpf: client.cpf,
                                        document: client.document
                                      }
                                    };
                                    setItems(updatedItems);
                                    // Limpar a lista de resultados
                                    setFilteredClients([]);
                                  }}
                                >
                                  <div>
                                    <div className="font-medium">{client.name}</div>
                                    <div className="text-sm text-gray-600">{client.document || client.cpf}</div>
                                  </div>
                                  <button className="text-blue-500 hover:text-blue-700">
                                    Selecionar
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cliente selecionado */}
                      {selectedClient && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-800">Cliente Selecionado</h5>
                          <p className="text-blue-700">{selectedClient.name} - {selectedClient.document || selectedClient.cpf}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tabela de Vendas */}
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h4 className="text-lg font-medium mb-4">Vendas no Período</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b text-left">Data</th>
                            <th className="py-2 px-4 border-b text-left">Cliente</th>
                            <th className="py-2 px-4 border-b text-left">Produto</th>
                            <th className="py-2 px-4 border-b text-right">Qtd</th>
                            <th className="py-2 px-4 border-b text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredSalesData().map((sale, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="py-2 px-4 border-b">{sale.date}</td>
                              <td className="py-2 px-4 border-b">{sale.client || 'Cliente não informado'}</td>
                              <td className="py-2 px-4 border-b">{sale.product}</td>
                              <td className="py-2 px-4 border-b text-right">{sale.quantity}</td>
                              <td className="py-2 px-4 border-b text-right">R$ {sale.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 font-bold">
                            <td className="py-2 px-4 border-b" colSpan="3">Total</td>
                            <td className="py-2 px-4 border-b text-right">
                              {getFilteredSalesData().reduce((total, sale) => total + sale.quantity, 0)}
                            </td>
                            <td className="py-2 px-4 border-b text-right">
                              R$ {getFilteredSalesData().reduce((total, sale) => total + sale.total, 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Botões de Exportação para o Relatório Simplificado */}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => handleExport('photo', 'download')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Exportar como Imagem
                    </button>
                    <button
                      onClick={() => handleExport('pdf', 'download')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Exportar como PDF
                    </button>
                  </div>
                </div>
              ) : (
                // Original Sales Report Content
                <>
                  {/* Report Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Período</label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="day">Dia</option>
                        <option value="month">Mês</option>
                        <option value="period">Período Específico</option>
                      </select>
                    </div>

                    {reportType === 'day' && (
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">Data</label>
                        <input
                          type="date"
                          value={formatDateToISO(reportStartDate)}
                          onChange={(e) => setReportStartDate(formatDateToBrazilian(e.target.value))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    )}

                    {reportType === 'month' && (
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">Mês</label>
                        <input
                          type="month"
                          value={formatDateToISO(reportStartDate).substring(0, 7)}
                          onChange={(e) => {
                            // Converter o valor do input (YYYY-MM) para o primeiro dia do mês
                            const yearMonth = e.target.value;
                            const firstDayOfMonth = `${yearMonth}-01`;
                            setReportStartDate(formatDateToBrazilian(firstDayOfMonth));

                            // Definir o último dia do mês como data final
                            const [year, month] = yearMonth.split('-');
                            const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                            const lastDayOfMonth = `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;
                            setReportEndDate(formatDateToBrazilian(lastDayOfMonth));
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    )}

                    {reportType === 'period' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-black">Data Inicial</label>
                          <input
                            type="date"
                            value={formatDateToISO(reportStartDate)}
                            onChange={(e) => {
                              const newDate = formatDateToBrazilian(e.target.value);
                              setReportStartDate(newDate);
                              // Forçar atualização dos dados quando a data inicial muda
                              console.log("Data inicial alterada para:", newDate);
                              setTimeout(() => {
                                const filteredData = getFilteredSalesData();
                                console.log("Dados filtrados atualizados após mudança de data inicial:", filteredData.length, "registros");
                              }, 100);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-black">Data Final</label>
                          <input
                            type="date"
                            value={formatDateToISO(reportEndDate)}
                            onChange={(e) => {
                              const newDate = formatDateToBrazilian(e.target.value);
                              setReportEndDate(newDate);
                              // Forçar atualização dos dados quando a data final muda
                              console.log("Data final alterada para:", newDate);
                              setTimeout(() => {
                                const filteredData = getFilteredSalesData();
                                console.log("Dados filtrados atualizados após mudança de data final:", filteredData.length, "registros");
                              }, 100);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1 text-black">Buscar</label>
                      <input
                        type="text"
                        value={reportSearchQuery}
                        onChange={(e) => setReportSearchQuery(e.target.value)}
                        placeholder="Cliente, produto ou documento..."
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>

                  {/* Sales Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-100 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800">Total em Dinheiro</h4>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {salesSummary.totalCash.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800">Total em Cartão</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {salesSummary.totalCard.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800">Total em PIX</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        R$ {salesSummary.totalPix.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800">Total Geral</h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        R$ {(salesSummary.totalCash + salesSummary.totalCard + salesSummary.totalPix).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Charts - Renderizados apenas quando o Dashboard está visível */}
                  {showDashboard && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium mb-4">Produtos Mais Vendidos</h4>
                        <div className="h-64">
                          {isLoadingDashboard ? (
                            <div className="flex h-full items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                          ) : (
                            <Pie data={getPieChartData()} options={{ maintainAspectRatio: false }} />
                          )}
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium mb-4">Vendas por Mês</h4>
                        <div className="h-64">
                          {isLoadingDashboard ? (
                            <div className="flex h-full items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                          ) : (
                            <Bar data={getBarChartData()} options={{ maintainAspectRatio: false }} />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sales Table */}
                  <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pagamento
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredSalesData().map((sale, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sale.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{sale.client}</div>
                              {sale.clientDoc && (
                                <div className="text-sm text-gray-500">{sale.clientDoc}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sale.product}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sale.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              R$ {Math.abs(sale.total).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sale.paymentMethod}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Export Options */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleExport('photo', 'download')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Exportar como Imagem
                    </button>
                    <button
                      onClick={() => handleExport('pdf', 'download')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Exportar como PDF
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PIX QR Code Popup */}
      {showPixQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setShowPixQRCode(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center space-y-6">
              <img
                src={qrCodeImage}
                alt="QR Code PIX"
                className="max-w-full max-h-[70vh] object-contain"
              />

              {/* Seletor de QR Code de Bancos */}
              <BankQRCodeSelector onSelectQRCode={(qrCodePath) => setQRCodeImage(qrCodePath)} />

              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Alterar QR Code
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleQRCodeImageChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleCompletePurchase}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Popup */}
      {showEditPopup && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Editar Produto</h3>
              <button
                onClick={() => setShowEditPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Seção de Mídias (Imagens e Vídeos) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mídias do Produto (Imagens e Vídeos)</label>
              <div className="flex flex-col space-y-3">
                {/* Preview da mídia principal */}
                <div className="relative bg-gray-100 rounded-lg p-2 flex justify-center">
                  {editingItem.image ? (
                    editingItem.mediaType === 'video' ? (
                      <video
                        src={editingItem.image}
                        controls
                        className="max-h-48 max-w-full"
                      />
                    ) : (
                      <img
                        src={editingItem.image}
                        alt={editingItem.description}
                        className="max-h-48 object-contain"
                      />
                    )
                  ) : (
                    <div className="h-48 w-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="ml-2">Sem mídia</span>
                    </div>
                  )}
                </div>

                {/* Botões de ação para mídias */}
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Substituir Mídia Principal
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/ogg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            // Determinar se é um vídeo ou imagem
                            const isVideo = file.type.startsWith('video/');

                            setEditingItem({
                              ...editingItem,
                              image: reader.result,
                              mediaType: isVideo ? 'video' : 'image'
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <label className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adicionar Mídia
                    <input
                      type="file"
                      accept="image/*,video/mp4,video/webm,video/ogg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newMedia = reader.result;
                            const isVideo = file.type.startsWith('video/');
                            const additionalImages = editingItem.additionalImages || [];
                            const additionalMediaTypes = editingItem.additionalMediaTypes || [];

                            setEditingItem({
                              ...editingItem,
                              additionalImages: [...additionalImages, newMedia],
                              additionalMediaTypes: [...additionalMediaTypes, isVideo ? 'video' : 'image']
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Miniaturas das imagens e vídeos adicionais */}
                {editingItem.additionalImages && editingItem.additionalImages.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-2">Mídias Adicionais</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {editingItem.additionalImages.map((media, index) => {
                        const isVideo = editingItem.additionalMediaTypes &&
                                      editingItem.additionalMediaTypes[index] === 'video';

                        return (
                          <div key={index} className="relative group">
                            {isVideo ? (
                              <div className="h-20 w-full rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                                <video
                                  src={media}
                                  className="h-20 w-full object-cover rounded"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white bg-black bg-opacity-50 rounded-full p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={media}
                                alt={`Mídia ${index + 1}`}
                                className="h-20 w-full object-cover rounded border border-gray-200"
                              />
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() => {
                                  const updatedImages = [...editingItem.additionalImages];
                                  updatedImages.splice(index, 1);

                                  // Também atualizar os tipos de mídia
                                  const updatedMediaTypes = [...(editingItem.additionalMediaTypes || [])];
                                  if (updatedMediaTypes.length > 0) {
                                    updatedMediaTypes.splice(index, 1);
                                  }

                                  setEditingItem({
                                    ...editingItem,
                                    additionalImages: updatedImages,
                                    additionalMediaTypes: updatedMediaTypes
                                  });
                                }}
                                className="p-1 bg-red-500 rounded-full text-white"
                                title="Remover mídia"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  // Definir como mídia principal
                                  const newMainMedia = media;
                                  const newMainMediaType = isVideo ? 'video' : 'image';
                                  const updatedImages = [...editingItem.additionalImages];
                                  updatedImages.splice(index, 1);

                                  // Atualizar tipos de mídia
                                  const updatedMediaTypes = [...(editingItem.additionalMediaTypes || [])];
                                  if (updatedMediaTypes.length > 0) {
                                    updatedMediaTypes.splice(index, 1);
                                  }

                                  // Se já existir uma mídia principal, movê-la para as adicionais
                                  if (editingItem.image) {
                                    updatedImages.unshift(editingItem.image);
                                    if (editingItem.mediaType) {
                                      updatedMediaTypes.unshift(editingItem.mediaType);
                                    } else {
                                      updatedMediaTypes.unshift('image'); // Assume imagem por padrão
                                    }
                                  }

                                  setEditingItem({
                                    ...editingItem,
                                    image: newMainMedia,
                                    mediaType: newMainMediaType,
                                    additionalImages: updatedImages,
                                    additionalMediaTypes: updatedMediaTypes
                                  });
                                }}
                                className="p-1 bg-blue-500 rounded-full text-white ml-1"
                                title="Definir como mídia principal"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Item</label>
                <input
                  type="text"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preço</label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Descrição do Item</label>
                <textarea
                  value={editingItem.itemDescription || ''}
                  onChange={(e) => setEditingItem({...editingItem, itemDescription: e.target.value})}
                  placeholder="Descrição detalhada do item (até 300 caracteres)"
                  maxLength={300}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md resize-none"
                />
                <span className="text-xs text-gray-500">
                  {(editingItem.itemDescription?.length || 0)}/300 caracteres
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estoque Atual</label>
                <input
                  type="number"
                  value={editingItem.quantity}
                  onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alerta de Estoque Mínimo</label>
                <input
                  type="number"
                  value={minStockAlert[editingItem.id] || ''}
                  onChange={(e) => setMinStockAlert({
                    ...minStockAlert,
                    [editingItem.id]: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <div className="flex gap-2">
                  {showNewCategoryInput ? (
                    <>
                  <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nova categoria"
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategory.trim()) {
                            setCategories(prev => [...prev, newCategory.trim()]);
                            setEditingItem({...editingItem, category: newCategory.trim()});
                            setNewCategory('');
                            setShowNewCategoryInput(false);
                          }
                        }}
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCategory('');
                          setShowNewCategoryInput(false);
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <select
                        value={editingItem.category || 'Todos'}
                        onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded-md"
                      >
                        {categories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(true)}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Adicionar nova categoria"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data de Validade</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={editingItem.expirationDate || ''}
                    onChange={(e) => setEditingItem({...editingItem, expirationDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingItem({...editingItem, checked: !editingItem.checked})}
                    className={`px-4 py-2 rounded-md ${
                      editingItem.checked ? 'bg-green-500' : 'bg-gray-200'
                    } text-white`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowLinks(!showLinks)}
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  <span className="mr-2">Gerenciar URLs</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>

                {showLinks && (
                  <div className="mt-2 border p-3 rounded-md">
                    <h4 className="font-medium mb-2">URLs Cadastradas</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                      {editingItem.links && editingItem.links.length > 0 ? (
                        editingItem.links.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex-grow text-sm truncate">
                              {link}
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedLinks = [...(editingItem.links || [])];
                                updatedLinks.splice(index, 1);
                                setEditingItem({...editingItem, links: updatedLinks});
                              }}
                              className="p-1 text-gray-600 hover:text-red-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Nenhuma URL cadastrada</p>
                      )}
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium mb-1">Adicionar nova URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="newUrlInput"
                          placeholder="Digite um link (ex: https://exemplo.com)"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const urlInput = document.getElementById('newUrlInput');
                            const url = urlInput.value.trim();
                            if (url) {
                              const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                              setEditingItem({
                                ...editingItem,
                                links: [...(editingItem.links || []), fullUrl]
                              });
                              urlInput.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditPopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await handleUpdateStock(editingItem.id, editingItem.quantity);
                  const updatedItem = {
                    ...editingItem,
                    price: parseFloat(editingItem.price)
                  };
                  await updateProduct(updatedItem);
                  setItems(prevItems => prevItems.map(item =>
                    item.id === editingItem.id ? updatedItem : item
                  ));
                  setShowEditPopup(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Popup */}
      {showConfigPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Configurações</h2>
              <button
                onClick={() => setShowConfigPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium mb-1">Local de Backup:</label>
                <input
                  type="text"
                  value={backupLocation}
                  onChange={(e) => setBackupLocation(e.target.value)}
                  placeholder="Caminho para salvar backups automáticos"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este caminho é usado apenas para backups automáticos. Para backups manuais, você poderá escolher onde salvar.
                </p>
              </div>

              <div className="form-group">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="h-4 w-4 mr-2"
                  />
                  <span>Backup automático após cada venda</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <button
                  onClick={createBackup}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Criar Backup
                </button>

                <button
                  onClick={exportBackup}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Exportar
                </button>

                <button
                  onClick={() => importBackup()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center justify-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Importar
                </button>
              </div>

              {/* Gerenciamento de Funcionários */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium mb-2">Funcionários</h3>
                <EmployeeManager />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium mb-2">Personalização</h3>

                {/* Seletor de Temas */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Tema do Sistema</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['green', 'blue', 'purple'].map((themeId) => {
                      const theme = {
                        green: { name: 'Verde', color: '#2ECC71' },
                        blue: { name: 'Azul', color: '#4A7AFF' },
                        purple: { name: 'Roxo', color: '#B15CFF' }
                      }[themeId];

                      const currentTheme = localStorage.getItem('theme') || 'green';

                      return (
                        <button
                          key={themeId}
                          className={`p-3 rounded-lg border-2 ${currentTheme === themeId ? 'border-black dark:border-white' : 'border-transparent'}`}
                          style={{
                            backgroundColor: theme.color,
                            color: theme.isDark ? '#fff' : '#000'
                          }}
                          onClick={() => {
                            // Remover todas as classes de tema anteriores
                            document.body.classList.remove(
                              'theme-green',
                              'theme-blue',
                              'theme-purple'
                            );

                            // Adicionar a classe do tema atual
                            document.body.classList.add(`theme-${themeId}`);

                            // Salvar a preferência no localStorage
                            localStorage.setItem('theme', themeId);

                            // Remover a classe dark-mode se existir
                            document.body.classList.remove('dark-mode');
                          }}
                        >
                          {theme.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <h3 className="text-md font-medium mb-2 mt-4">Manutenção do Sistema</h3>
                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja limpar o cache do sistema? Isso pode resolver problemas de instabilidade, mas você precisará recarregar a página. Seus dados não serão perdidos.')) {
                      // Importar e executar a função de limpeza do localStorage
                      import('./utils/clearLocalStorage.js').then(module => {
                        module.clearLocalStorage();
                      });
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center w-full"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpar Cache do Sistema
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Use esta opção se o sistema estiver apresentando problemas de carregamento ou instabilidade.
                </p>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    saveBackupConfig();
                    setShowConfigPopup(false);
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Salvar e Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Popup */}
      {showVendorsTab && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Fornecedores</h3>
              <button
                onClick={() => setShowVendorsTab(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Vendors
              vendors={vendors}
              handleAddVendor={handleAddVendor}
              handleUpdateVendor={handleUpdateVendor}
              handleDeleteVendor={handleDeleteVendor}
            />
          </div>
        </div>
      )}

      {/* Vendors Popup */}
      {showVendorsTab && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Fornecedores</h3>
              <button
                onClick={() => setShowVendorsTab(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Vendors
              vendors={vendors}
              handleAddVendor={handleAddVendor}
              handleUpdateVendor={handleUpdateVendor}
              handleDeleteVendor={handleDeleteVendor}
            />
          </div>
        </div>
      )}


      {/* Histórico de Vendas */}
      {showSalesHistory && (
        <SalesHistory
          salesData={salesData}
          onClose={() => setShowSalesHistory(false)}
        />
      )}


      {/* Theme Selector moved to Config Popup */}

      {/* Sale Confirmation Popup */}
      {showSaleConfirmation && lastCompletedSale && (
        <SaleConfirmationPopup
          sale={lastCompletedSale}
          onClose={() => setShowSaleConfirmation(false)}
          generateReceipt={generateReceipt}
        />
      )}

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContextProvider>
          <ToastProvider>
            <AppContent />
            <LoginModal />
          </ToastProvider>
        </AppContextProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
