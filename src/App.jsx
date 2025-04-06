import { useState, useEffect, useRef } from 'react';
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addVendor,
  getVendors,
  searchVendors,
  addClient,
  getClients,
  searchClients,
  deleteClient,
  updateClient,
  ensureDB,
  initializeDefaultVendor
} from './services/database';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { syncProductsToHostinger, configureHostingerApp } from './services/hostinger';
import MagicWandButton from './components/MagicWandButton';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function App() {
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
  const [hostingerConfig, setHostingerConfig] = useState({
    site_url: '',
    api_key: '',
    site_id: ''
  });
  const [showPixQRCode, setShowPixQRCode] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState('/path/to/qr-code.png');
  const [isLoading, setIsLoading] = useState(true);
  const [exportType, setExportType] = useState('');
  const [exportMethod, setExportMethod] = useState('');
  const [contactInfo, setContactInfo] = useState({ whatsapp: '', email: '' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  const [showHostingerConfig, setShowHostingerConfig] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [minStockAlert, setMinStockAlert] = useState({});
  const [ignoreStock, setIgnoreStock] = useState({});
  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const [backupLocation, setBackupLocation] = useState(localStorage.getItem('backupLocation') || '');
  const [autoBackup, setAutoBackup] = useState(localStorage.getItem('autoBackup') === 'true');
  const [showDescription, setShowDescription] = useState(null);
  const [showSimpleSalesReport, setShowSimpleSalesReport] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');

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

        // Primeiro inicializa o banco de dados
        const database = await ensureDB();
        if (!database) {
          throw new Error('Falha ao inicializar o banco de dados');
        }

        // Depois inicializa o fornecedor padrão
        await initializeDefaultVendor();

        console.log('Banco de dados inicializado com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
        setIsLoading(false);
        alert('Erro ao inicializar o banco de dados. Por favor, recarregue a página.');
      }
    };

    initializeDB();
  }, []);

  // Load data after database is initialized
  const loadData = async () => {
    try {
      console.log('Carregando dados...');
      const [vendorsList, clientsList, productsList] = await Promise.all([
        getVendors(),
        getClients(),
        getProducts()
      ]);

      setVendors(vendorsList || []);
      setFilteredClients((clientsList || []).map(client => ({ ...client, showDetails: false })));
      setClients((clientsList || []).map(client => ({ ...client, showDetails: false })));
      setItems(productsList || []);

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

      // Load Hostinger configuration from localStorage
      const savedHostingerConfig = localStorage.getItem('hostingerConfig');
      if (savedHostingerConfig) {
        setHostingerConfig(JSON.parse(savedHostingerConfig));
      }

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
          ...newClient
        };
        await updateClient(updatedClient);
        const updatedClients = clients.map(c =>
          c.id === selectedClient.id ? updatedClient : c
        );
        setClients(updatedClients);
        setFilteredClients(updatedClients);
      } else {
        // Add new client
        await addClient(newClient);
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
    if (paymentMethod === 'pix') {
      setShowPixQRCode(true);
      return;
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
      const quantity = item.soldQuantity || 1;

      if (!ignoreStock[item.id] && item.quantity < quantity) {
        alert(`Quantidade insuficiente em estoque para ${item.description}`);
        return;
      }
    }

    if (!window.confirm(`Confirmar venda de ${selectedItems.length} itens via ${paymentMethod}?`)) {
      return;
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
      setSelectedItems([]);

      // Update sales summary
      setSalesSummary(prev => ({
        totalCash: paymentMethod === 'dinheiro' ? prev.totalCash + Math.abs(totalAmount) : prev.totalCash,
        totalCard: paymentMethod === 'cartao' ? prev.totalCard + Math.abs(totalAmount) : prev.totalCard,
        totalPix: paymentMethod === 'pix' ? prev.totalPix + Math.abs(totalAmount) : prev.totalPix
      }));

      // Adicionar à lista de vendas com data local
      setSalesData(prev => [...prev, {
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
      }]);

      setShowPaymentPopup(false);

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
        expirationDate: newItem.expirationDate || null,
        links: newItem.links || [],
        itemDescription: newItem.itemDescription || '',
        category: newItem.category || 'Todos' // Adicionar categoria ao produto
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
        links: [],
        expirationDate: null,
        checked: false,
        itemDescription: '',
        category: 'Todos' // Resetar categoria para o padrão
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

    // Get total amount from current sale with null check
    const totalAmount = currentSale?.total || (item?.price * (item?.saleQuantity || 1));

    const receiptContent = `RECIBO DE VENDA

DADOS DO VENDEDOR
Nome: ${item?.vendor?.name || 'Não especificado'}
Documento: ${item?.vendor?.doc || 'Não especificado'}

DADOS DO CLIENTE
Nome: ${item?.client?.name || 'Não especificado'}
RG: ${item?.client?.rg || 'Não especificado'}
CPF: ${item?.client?.cpf || 'Não especificado'}

DETALHES DA VENDA
${currentSale?.items ?
  currentSale.items.map(saleItem =>
    `- ${saleItem?.description || 'Item'}: ${saleItem?.quantity || 1}x R$ ${(saleItem?.price || 0).toFixed(2)} = R$ ${((saleItem?.price || 0) * (saleItem?.quantity || 1)).toFixed(2)}`
  ).join('\n') :
  `- ${item?.description || 'Item'}: 1x R$ ${(item?.price || 0).toFixed(2)} = R$ ${(item?.price || 0).toFixed(2)}`
}

Valor Total: R$ ${(totalAmount || 0).toFixed(2)}
Forma de Pagamento: ${currentSale?.paymentMethod || item?.paymentMethod || 'Não especificado'}

Declaro para os devidos fins que recebi o valor acima descrito referente à venda dos itens listados.

${navigator.geolocation ? 'Cidade Local' : 'Local'}, ${formatDateInPortuguese(currentDate)}


_______________________________
${item?.vendor?.name || 'Vendedor'}
${item?.vendor?.doc || ''}


_______________________________
${item?.client?.name || 'Cliente'}
${item?.client?.rg || ''}
${item?.client?.cpf || ''}
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

  // Função para gerar dados de exemplo para os gráficos com datas variadas
  const generateSampleSalesData = () => {
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
    // Três meses atrás
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    dates.push(threeMonthsAgo);

    // Produtos variados
    const products = [
      { name: 'Smartphone XYZ', price: 1200, quantity: 2 },
      { name: 'Notebook ABC', price: 3500, quantity: 1 },
      { name: 'Fone de Ouvido', price: 150, quantity: 5 },
      { name: 'Mouse sem fio', price: 80, quantity: 8 },
      { name: 'Teclado mecânico', price: 250, quantity: 3 },
      { name: 'Monitor 24"', price: 900, quantity: 2 },
      { name: 'Cadeira gamer', price: 1500, quantity: 1 },
      { name: 'Impressora', price: 450, quantity: 2 },
      { name: 'Caixa de som', price: 120, quantity: 4 },
      { name: 'Pendrive 64GB', price: 60, quantity: 10 }
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

  // Carregar dados de vendas de exemplo ao iniciar apenas se não houver dados existentes
  useEffect(() => {
    // Verificar se já existem dados no localStorage
    const savedSalesData = localStorage.getItem('salesData');
    if (!savedSalesData || JSON.parse(savedSalesData).length === 0) {
      console.log("Nenhum dado de vendas encontrado, gerando dados de exemplo...");
      setSalesData(generateSampleSalesData());
    } else {
      console.log("Dados de vendas existentes encontrados, não gerando dados de exemplo.");
    }
  }, []);

  // Função getFilteredSalesData melhorada para trabalhar com o formato brasileiro e histórico de vendas
  const getFilteredSalesData = () => {
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
          category: item.category // Adicionar a categoria do produto
        });
      }
    });

    // Combinar com os dados existentes do localStorage/Vendas PDV
    const combinedData = [
      ...realSalesData,
      ...salesData.map(sale => ({
        ...sale,
        quantity: Math.abs(sale.quantity || 0), // Garantir que a quantidade seja positiva
        price: Math.abs(sale.price || 0), // Garantir que o preço seja positivo
        total: Math.abs(sale.total || 0), // Garantir que o total seja positivo
        source: sale.source || 'vendas_pdv' // Marcar a origem dos dados se não existir
      }))
    ];

    console.log("Total de vendas antes da filtragem:", combinedData.length);

    let filtered = [...combinedData];

    // Verificar se há dados para filtrar
    if (filtered.length === 0) {
      console.log("Nenhuma venda encontrada para filtrar");
      return [];
    }

    // Filtrar por período apenas se estiver gerando relatório
    // Se não estiver gerando relatório, retornar todos os dados
    if (!showSalesReport && !showSimpleSalesReport) {
      console.log("Exibindo todas as vendas na página principal");
      return filtered;
    }

    if (reportType === 'day') {
      console.log("Filtrando por dia:", reportStartDate);
      filtered = filtered.filter(sale => {
        // Verificar se a data é válida
        if (!sale.date) {
          console.log("Venda sem data:", sale);
          return false;
        }

        try {
          // Normalizar a data para o formato brasileiro se necessário
          let saleDate = sale.date;

          // Verificar se a data está no formato ISO (YYYY-MM-DD) e converter
          if (saleDate.includes('-') && !saleDate.includes('/')) {
            const dateParts = saleDate.split('-');
            if (dateParts.length === 3) {
              saleDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            }
          }

          // Comparar as strings de data no formato brasileiro
          const matches = saleDate === reportStartDate;
          if (matches) {
            console.log("Venda correspondente encontrada:", sale);
          }
          return matches;
        } catch (e) {
          console.error("Erro ao processar data:", sale.date, e);
          return false;
        }
      });
    } else if (reportType === 'month') {
      console.log("Filtrando por mês:", reportStartDate);
      // Extrair mês e ano do formato brasileiro
      const [_day, month, year] = (reportStartDate || '').split('/');

      if (!month || !year) {
        console.error("Data de início inválida:", reportStartDate);
        return [];
      }

      filtered = filtered.filter(sale => {
        try {
          // Verificar se a data é válida
          if (!sale.date) {
            console.log("Venda sem data:", sale);
            return false;
          }

          // Normalizar a data para o formato brasileiro se necessário
          let saleDate = sale.date;

          // Verificar se a data está no formato ISO (YYYY-MM-DD) e converter
          if (saleDate.includes('-') && !saleDate.includes('/')) {
            const dateParts = saleDate.split('-');
            if (dateParts.length === 3) {
              saleDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            }
          }

          // Converter a data de venda do formato brasileiro para comparação
          const [_saleDay, saleMonth, saleYear] = saleDate.split('/');

          if (!saleMonth || !saleYear) {
            console.log("Data de venda inválida:", saleDate);
            return false;
          }

          const matches = parseInt(saleYear) === parseInt(year) && parseInt(saleMonth) === parseInt(month);
          if (matches) {
            console.log("Venda correspondente encontrada:", sale);
          }
          return matches;
        } catch (e) {
          console.error("Erro ao processar data:", sale.date, e);
          return false;
        }
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
          try {
            // Verificar se a data é válida
            if (!sale.date) {
              console.log("Venda sem data:", sale);
              return false;
            }

            // Normalizar a data para o formato brasileiro se necessário
            let saleDate = sale.date;

            // Verificar se a data está no formato ISO (YYYY-MM-DD) e converter
            if (saleDate.includes('-') && !saleDate.includes('/')) {
              const dateParts = saleDate.split('-');
              if (dateParts.length === 3) {
                saleDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
              }
            }

            const [saleDay, saleMonth, saleYear] = saleDate.split('/');

            if (!saleDay || !saleMonth || !saleYear) {
              console.log("Data de venda inválida:", saleDate);
              return false;
            }

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
          } catch (e) {
            console.error("Erro ao processar data:", sale.date, e);
            return false;
          }
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

    // Filtrar por cliente
    if (clientSearchTerm) {
      const clientQuery = clientSearchTerm.toLowerCase();
      filtered = filtered.filter(sale =>
        (sale.client && sale.client.toLowerCase().includes(clientQuery)) ||
        (sale.clientDoc && sale.clientDoc.toLowerCase().includes(clientQuery)) ||
        (sale.clientCpf && sale.clientCpf.toLowerCase().includes(clientQuery))
      );
    }

    // Filtrar por produto
    if (productSearchTerm) {
      const productQuery = productSearchTerm.toLowerCase();
      filtered = filtered.filter(sale => sale.product && sale.product.toLowerCase().includes(productQuery));
    }

    console.log("Total de vendas após filtragem:", filtered.length);
    return filtered;
  };

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

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.setFontSize(18);
      pdf.text('Relatório de Vendas', pdfWidth / 2, 20, { align: 'center' });
      pdf.addImage(imageData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

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

  // Modificar a função getPieChartData para usar o mesmo sistema de datas do relatório
  const getPieChartData = () => {
    console.log("Gerando dados do gráfico de pizza para data:", reportStartDate);

    // Obter os dados filtrados do relatório - exatamente os mesmos dados mostrados na tabela
    const filteredSales = getFilteredSalesData();
    console.log("Vendas filtradas para o gráfico:", filteredSales.length, "registros");

    if (filteredSales.length === 0) {
      console.log("Nenhuma venda encontrada para o período selecionado");
      // Retornar dados vazios para evitar erro no gráfico
      return {
        labels: ['Nenhum dado disponível'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderWidth: 1,
          },
        ],
      };
    }

    // Agrupar por produto - usar exatamente o mesmo formato que aparece na tabela
    const productSales = {};
    filteredSales.forEach(sale => {
      // Verificar se o produto existe
      if (!sale.product) {
        console.log("Venda sem produto:", sale);
        return;
      }

      // Usar o produto como está, sem dividir por vírgulas
      const product = sale.product;

      if (!productSales[product]) {
        productSales[product] = 0;
      }

      // Adicionar a quantidade total da venda
      productSales[product] += sale.quantity;
    });

    console.log("Produtos agrupados:", productSales);

    // Converter para o formato do gráfico
    const labels = Object.keys(productSales);
    const data = Object.values(productSales);

    if (labels.length === 0) {
      console.log("Nenhum produto encontrado após agrupamento");
      return {
        labels: ['Nenhum dado disponível'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderWidth: 1,
          },
        ],
      };
    }

    // Gerar cores aleatórias para cada produto, mas usar seed fixo para manter consistência
    const backgroundColors = labels.map((label, index) => {
      // Usar o índice como seed para gerar cores consistentes
      const r = (173 + index * 50) % 255;
      const g = (100 + index * 70) % 255;
      const b = (200 + index * 30) % 255;
      return `rgba(${r}, ${g}, ${b}, 0.6)`;
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  };

  // Modificar a função getBarChartData para usar o mesmo sistema de datas do relatório
  const getBarChartData = () => {
    console.log("Gerando dados do gráfico de barras para data:", reportStartDate);

    // Obter os dados filtrados do relatório - exatamente os mesmos dados mostrados na tabela
    const filteredSales = getFilteredSalesData();
    console.log("Vendas filtradas para o gráfico de barras:", filteredSales.length, "registros");

    if (filteredSales.length === 0) {
      console.log("Nenhuma venda encontrada para o período selecionado");
      // Retornar dados vazios para evitar erro no gráfico
      return {
        labels: ['Nenhum dado disponível'],
        datasets: [
          {
            label: 'Sem dados',
            data: [0],
            backgroundColor: '#e5e7eb',
            borderWidth: 1,
          }
        ],
      };
    }

    // Agrupar por data e produto
    const salesByDateAndProduct = {};

    filteredSales.forEach(sale => {
      // Verificar se a data e o produto existem
      if (!sale.date || !sale.product) {
        console.log("Venda com data ou produto ausente:", sale);
        return;
      }

      // Usar a data da venda como chave
      const dateKey = sale.date;

      if (!salesByDateAndProduct[dateKey]) {
        salesByDateAndProduct[dateKey] = {};
      }

      // Usar o produto como está, sem dividir por vírgulas
      const product = sale.product;

      if (!salesByDateAndProduct[dateKey][product]) {
        salesByDateAndProduct[dateKey][product] = 0;
      }

      // Adicionar a quantidade total da venda
      salesByDateAndProduct[dateKey][product] += sale.quantity;
    });

    console.log("Vendas agrupadas por data e produto:", salesByDateAndProduct);

    // Obter todas as datas e produtos únicos
    const dates = Object.keys(salesByDateAndProduct).sort((a, b) => {
      // Ordenar datas no formato DD/MM/YYYY
      const [dayA, monthA, yearA] = a.split('/').map(Number);
      const [dayB, monthB, yearB] = b.split('/').map(Number);

      if (yearA !== yearB) return yearA - yearB;
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });

    const allProducts = new Set();

    Object.values(salesByDateAndProduct).forEach(productMap => {
      Object.keys(productMap).forEach(product => allProducts.add(product));
    });

    const uniqueProducts = Array.from(allProducts);

    if (dates.length === 0 || uniqueProducts.length === 0) {
      console.log("Nenhuma data ou produto encontrado após agrupamento");
      return {
        labels: ['Nenhum dado disponível'],
        datasets: [
          {
            label: 'Sem dados',
            data: [0],
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

    // Criar datasets para o gráfico
    const datasets = uniqueProducts.map(product => ({
      label: product,
      data: dates.map(date => salesByDateAndProduct[date][product] || 0),
      backgroundColor: productColors[product],
      borderWidth: 1,
    }));

    return {
      labels: dates,
      datasets,
    };
  };

  // Atualizar os gráficos quando a data do relatório mudar
  useEffect(() => {
    // Forçar atualização dos gráficos
    if (showDashboard) {
      // Temporariamente esconder e mostrar novamente para forçar a atualização
      setShowDashboard(false);
      setTimeout(() => setShowDashboard(true), 100);
    }
  }, [reportStartDate, reportEndDate, reportType]);

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
    if (showDashboard) {
      // Forçar atualização dos gráficos
      setShowDashboard(false);
      setTimeout(() => setShowDashboard(true), 100);
    }
  }, [salesData, items]);

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

  // Add new function for Hostinger sync
  const handleHostingerSync = async () => {
    try {
      const selectedProducts = items.filter((_, index) => selectedItems.includes(index));
      await syncProductsToHostinger(selectedProducts);
      alert('Products successfully synced to Hostinger site!');
    } catch (error) {
      alert('Error syncing products: ' + error.message);
    }
  };

  // Add new function for Hostinger configuration
  const handleHostingerConfig = async () => {
    try {
      await configureHostingerApp(hostingerConfig);
      localStorage.setItem('hostingerConfig', JSON.stringify(hostingerConfig));
      setShowHostingerConfig(false);
      alert('Hostinger configuration saved successfully!');
    } catch (error) {
      alert('Error saving configuration: ' + error.message);
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
        setQRCodeImage(e.target.result);
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
      const saleItems = [];

      for (const index of selectedItems) {
        const item = updatedItems[index];
        const quantity = item.soldQuantity || 1;

        // Verificar estoque
        if (!ignoreStock[item.id] && item.quantity < quantity) {
          alert(`Quantidade insuficiente em estoque para ${item.description}`);
          return;
        }

        const updatedItem = {
          ...item,
          quantity: item.quantity - quantity,
          sold: (item.sold || 0) + quantity,
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

      // Atualizar o histórico de vendas
      setCurrentSale({
        client: selectedClient || { name: 'Cliente não especificado' },
        items: saleItems,
        total: Math.abs(totalAmount),
        paymentMethod: 'pix',
        date: localDate
      });

      // Adicionar à lista de vendas
      setSalesData(prev => [...prev, {
        id: Date.now(),
        date: localDate,
        client: selectedClient?.name || 'Cliente não especificado',
        clientDoc: selectedClient?.rg || '',
        clientCpf: selectedClient?.cpf || '',
        vendor: selectedVendor?.name || 'Vendedor não especificado',
        vendorDoc: selectedVendor?.document || '',
        product: saleItems.map(item => item.description).join(', '),
        quantity: saleItems.reduce((total, item) => total + Math.abs(item.quantity), 0),
        price: Math.abs(totalAmount) / saleItems.reduce((total, item) => total + Math.abs(item.quantity), 0),
        total: Math.abs(totalAmount),
        paymentMethod: 'pix'
      }]);

      alert('Venda finalizada com sucesso!');

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
    const formattedNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  const handleWhatsAppWebClick = (number) => {
    const formattedNumber = number.replace(/\D/g, '');
    window.open(`https://web.whatsapp.com/send?phone=${formattedNumber}`, '_blank');
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
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
      console.log('Iniciando criação de backup...');

      // Verificar se há dados para backup
      if (!items || items.length === 0) {
        console.warn('Nenhum produto encontrado para backup');
      }

      const backupData = {
        products: items || [],
        clients: clients || [],
        vendors: vendors || [],
        sales: salesData || [],
        minStockAlert: minStockAlert || {},
        ignoreStock: ignoreStock || {},
        hostingerConfig: hostingerConfig || { site_url: '', api_key: '', site_id: '' },
        timestamp: new Date().toISOString()
      };

      // Salvar no localStorage como backup temporário
      try {
        localStorage.setItem('pdvBackupTemp', JSON.stringify(backupData));
        console.log('Backup salvo no localStorage');
      } catch (storageError) {
        console.error('Erro ao salvar no localStorage:', storageError);
        // Continuar mesmo com erro no localStorage
      }

      // Se o autoBackup estiver ativado e houver um local definido, salvar no arquivo
      if (autoBackup && backupLocation) {
        console.log('Exportando backup para arquivo...');
        await exportBackup();
      } else {
        // Mostrar alerta de sucesso
        console.log('Backup criado com sucesso');
        alert('Backup criado com sucesso!');
      }

      return backupData;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      alert('Erro ao criar backup dos dados: ' + (error.message || 'Erro desconhecido'));
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

            if (backupData.hostingerConfig) {
              setHostingerConfig(backupData.hostingerConfig);
              localStorage.setItem('hostingerConfig', JSON.stringify(backupData.hostingerConfig));
            }

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
                <h2 className="text-2xl font-semibold">Adicionar Novo Item</h2>
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
                      <label className="block text-sm font-medium mb-1">Imagem do Item</label>
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
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Nome do Item</label>
                      <input
                        type="text"
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        placeholder="Nome do item"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Descrição do Item</label>
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
                      <label className="block text-sm font-medium mb-1">Preço de Venda</label>
                      <input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                        placeholder="Preço"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Estoque Inicial</label>
                      <input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
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
                      <label className="block text-sm font-medium mb-1">Data de Validade</label>
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

              {/* Checkbox centralizado para mostrar descrições */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Descrição:</label>
                  <input
                    type="checkbox"
                    checked={showDescription !== null}
                    onChange={() => setShowDescription(showDescription === null ? true : null)}
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
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategory === category
                          ? 'bg-blue-500'
                          : 'bg-gray-200'
                      } text-white rounded hover:bg-gray-300`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {items.length > 0 ? (
                <div className="space-y-4">
                  {items
                    .filter(item => selectedCategory === 'Todos' || item.category === selectedCategory)
                    .map((item, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {item.image && (
                          <div>
                            <img src={item.image} alt={item.description} className="w-full h-32 object-cover rounded-md" />
                          </div>
                        )}
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
                        </div>

                        {/* Área de descrição com margem de 10px à esquerda da categoria */}
                        <div className="flex flex-col h-full" style={{ marginRight: '10px' }}>
                          <div className="text-left mb-2">
                            <span className="font-medium">Descrição</span>
                          </div>
                          {showDescription && (
                            <div className="h-[100px] flex items-center">
                              <p className="text-sm w-full">
                                {item.itemDescription || "Sem descrição"}
                              </p>
                            </div>
                          )}

                          {/* Categoria do item */}
                          <div className="mt-auto">
                            <div className="text-left mb-1">
                              <span className="font-medium">Categoria</span>
                            </div>
                            <div className="text-left">
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {item.category || "Todos"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

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
                className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                disabled={selectedItems.length === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finalizar Venda
              </button>

              {/* Ver Relatório de Vendas button */}
              <button
                onClick={() => setShowSalesReport(true)}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 00-2 2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Relatório Completo
              </button>

              {/* Relatório de Vendas button (new) */}
              <button
                onClick={() => setShowSimpleSalesReport(true)}
                className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Relatório de Vendas
              </button>

              {/* Clientes button */}
              <button
                onClick={() => setShowClients(!showClients)}
                className={`w-full ${
                  showClients ? 'bg-purple-600' : 'bg-purple-500'
                } text-white px-6 py-3 rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
                Clientes
                <svg
                  className={`w-5 h-5 transform ${showClients ? 'rotate-180' : ''} transition-transform`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Site Exporter Sync button */}
              <button
                onClick={() => setShowSiteExporter(!showSiteExporter)}
                className={`w-full ${
                  showSiteExporter ? 'bg-indigo-600' : 'bg-indigo-500'
                } text-white px-6 py-3 rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Site Exporter Sync
                <svg
                  className={`w-5 h-5 transform ${showSiteExporter ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                            href={`https://wa.me/${formatWhatsApp(client.whatsapp)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-500 hover:text-green-600"
                            onClick={(e) => e.stopPropagation()}
                            title="Enviar WhatsApp"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                            </svg>
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
                    <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded">Informações Básicas</summary>
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
                    <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded">Informações Complementares</summary>
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
                    <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded">Contato</summary>
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
                          className="p-2 text-blue-500 hover:text-blue-600"
                          title="Enviar WhatsApp"
                        >
                          <i className="fas fa-whatsapp"></i>
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
                          <i className="fas fa-envelope"></i>
                        </button>
                      </div>
                    </div>
                  </details>

                  {/* Endereço - Expansível */}
                  <details className="mb-4">
                    <summary className="font-semibold cursor-pointer p-2 bg-gray-100 rounded">Endereço</summary>
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
              <div className="bg-white rounded-lg shadow-md p-6 mt-4">
                <h3 className="text-lg font-semibold">Exportar para o Site</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={hostingerConfig.site_url}
                      onChange={(e) => setHostingerConfig({ ...hostingerConfig, site_url: e.target.value })}
                      placeholder="URL do Site"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <input
                      type="text"
                      value={hostingerConfig.api_key}
                      onChange={(e) => setHostingerConfig({ ...hostingerConfig, api_key: e.target.value })}
                      placeholder="API Key"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <input
                      type="text"
                      value={hostingerConfig.site_id}
                      onChange={(e) => setHostingerConfig({ ...hostingerConfig, site_id: e.target.value })}
                      placeholder="Site ID"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleHostingerConfig}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Salvar Configuração
                    </button>
                    <button
                      onClick={handleHostingerSync}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      disabled={selectedItems.length === 0}
                    >
                      Sincronizar Produtos Selecionados
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                <button
                  onClick={() => {
                    const { salesDataFixed, itemsFixed } = checkDataIntegrity();
                    if (salesDataFixed || itemsFixed) {
                      alert("Dados corrigidos com sucesso!");
                    } else {
                      alert("Verificação concluída. Nenhum problema encontrado nos dados.");
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                  title="Verificar Integridade dos Dados"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verificar Dados
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
              {/* Conteúdo do Relatório de Vendas */}
              <div className="space-y-6">
                  {/* Seletor de Período */}
                  <div className="flex gap-4 items-center">
                    <select
                      value={reportType}
                      onChange={(e) => {
                        setReportType(e.target.value);
                      }}
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="day">Hoje</option>
                      <option value="month">Este Mês</option>
                      <option value="custom">Período Personalizado</option>
                    </select>
                    {reportType === 'custom' && (
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <label className="text-sm text-gray-600 mb-1">De:</label>
                          <input
                            type="date"
                            value={formatDateToISO(reportStartDate)}
                            onChange={(e) => {
                              const newDate = formatDateToBrazilian(e.target.value);
                              setReportStartDate(newDate);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-sm text-gray-600 mb-1">Até:</label>
                          <input
                            type="date"
                            value={formatDateToISO(reportEndDate)}
                            onChange={(e) => {
                              const newDate = formatDateToBrazilian(e.target.value);
                              setReportEndDate(newDate);
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        // Verificar a integridade dos dados
                        const { salesDataFixed, itemsFixed } = checkDataIntegrity();

                        // Atualizar os dados filtrados
                        const filteredData = getFilteredSalesData();
                        console.log("Dados filtrados atualizados:", filteredData.length, "registros");

                        // Mostrar mensagem de sucesso
                        if (salesDataFixed || itemsFixed) {
                          alert("Dados corrigidos com sucesso!");
                        } else {
                          alert("Dados verificados com sucesso!");
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                      title="Verificar Dados"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Verificar
                    </button>
                  </div>

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
                </div>
              ) : (
                // Original Sales Report Content
                <>
                  {/* Report Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Período</label>
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
                        <label className="block text-sm font-medium mb-1">Data</label>
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
                        <label className="block text-sm font-medium mb-1">Mês</label>
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
                          <label className="block text-sm font-medium mb-1">Data Inicial</label>
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
                          <label className="block text-sm font-medium mb-1">Data Final</label>
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
                      <label className="block text-sm font-medium mb-1">Buscar</label>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-medium mb-4">Produtos Mais Vendidos</h4>
                      <div className="h-64">
                        <Pie data={getPieChartData()} options={{ maintainAspectRatio: false }} />
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h4 className="font-medium mb-4">Vendas por Mês</h4>
                      <div className="h-64">
                        <Bar data={getBarChartData()} options={{ maintainAspectRatio: false }} />
                      </div>
                    </div>
                  </div>

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
              )
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
    </div>
  );
}

export default App;
