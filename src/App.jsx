import { useState, useEffect, useRef } from 'react';
import { getVendors, getClients, searchVendors, searchClients, addVendor, addClient, getProducts, addProduct, updateProduct, deleteProduct } from './services/database';
import SearchableDropdown from './components/SearchableDropdown';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function App() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
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
    client: { name: '', doc: '' },
    expirationDate: null,
    checked: false
  });
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [salesSummary, setSalesSummary] = useState({
    totalCash: 0,
    totalCard: 0,
    totalPix: 0
  });
  const [currentSale, setCurrentSale] = useState({
    client: { name: '', doc: '' },
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
  const [newClient, setNewClient] = useState({ name: '', document: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Novos estados para o relatório de vendas
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [reportType, setReportType] = useState('day'); // 'day', 'month', 'period'
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardPeriod, setDashboardPeriod] = useState('day'); // 'day', 'week', 'month'
  const [salesData, setSalesData] = useState([]);

  // Novos estados para contatos e exportação
  const [contactInfo, setContactInfo] = useState({ whatsapp: '', email: '' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [exportType, setExportType] = useState(''); // 'photo' ou 'pdf'
  const [exportMethod, setExportMethod] = useState(''); // 'whatsapp' ou 'email'
  const [editingContact, setEditingContact] = useState(false);
  
  // Refs para capturar elementos para exportação
  const reportRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [vendorsList, clientsList, productsList] = await Promise.all([
          getVendors(),
          getClients(),
          getProducts()
        ]);
        
        setVendors(vendorsList || []);
        setClients(clientsList || []);
        setItems(productsList || []);
        
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
  }, []);

  const handleVendorSearch = async (query) => {
    if (query.trim()) {
      const results = await searchVendors(query);
      setVendors(results);
    } else {
      const allVendors = await getVendors();
      setVendors(allVendors);
    }
  };

  const handleClientSearch = async (query) => {
    if (query.trim()) {
      const results = await searchClients(query);
      setClients(results);
    } else {
      const allClients = await getClients();
      setClients(allClients);
    }
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
    if (!newClient.name || !newClient.document) {
      alert('Por favor, preencha todos os campos do cliente');
      return;
    }

    try {
      await addClient(newClient);
      const updatedClients = await getClients();
      setClients(updatedClients);
      setShowAddClient(false);
      setNewClient({ name: '', document: '' });
    } catch {
      alert('Erro ao adicionar cliente. Verifique se o documento já existe.');
    }
  };

  const handleMultipleSales = async (paymentMethod) => {
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
      
      if (item.quantity < quantity) {
        alert(`Quantidade insuficiente em estoque para ${item.description}`);
        return;
      }
    }

    if (!window.confirm(`Confirmar venda de ${selectedItems.length} itens via ${paymentMethod}?`)) {
      return;
    }

    try {
      // Processar vendas
      for (const index of selectedItems) {
        const item = updatedItems[index];
        const quantity = item.soldQuantity || 1;
        
        const updatedItem = {
          ...item,
          quantity: item.quantity - quantity,
          sold: item.sold + quantity
        };
        
        await updateProduct(updatedItem);
        updatedItems[index] = updatedItem;
        totalAmount += item.price * quantity;
      }

      setItems(updatedItems);
      setSelectedItems([]);

      // Update sales summary
      setSalesSummary(prev => ({
        totalCash: paymentMethod === 'dinheiro' ? prev.totalCash + totalAmount : prev.totalCash,
        totalCard: paymentMethod === 'cartao' ? prev.totalCard + totalAmount : prev.totalCard,
        totalPix: paymentMethod === 'pix' ? prev.totalPix + totalAmount : prev.totalPix
      }));

      setShowPaymentPopup(false);
    } catch (error) {
      console.error('Error processing sales:', error);
      alert('Erro ao processar vendas. Por favor, tente novamente.');
    }
  };

  const handleAddItem = async () => {
    // Validate required fields
    if (!newItem.description?.trim() || !newItem.price?.trim()) {
      alert('Por favor, preencha a descrição e o preço do item');
      return;
    }

    // Validate price format
    if (isNaN(Number(newItem.price)) || Number(newItem.price) <= 0) {
      alert('Por favor, insira um preço válido maior que zero');
      return;
    }

    // Validate quantity
    if (isNaN(Number(newItem.quantity)) || Number(newItem.quantity) <= 0) {
      alert('Por favor, insira uma quantidade válida maior que zero');
      return;
    }

    try {
      const productToAdd = {
        ...newItem,
        description: newItem.description.trim(),
        price: parseFloat(Number(newItem.price).toFixed(2)),
        quantity: Math.floor(Number(newItem.quantity)),
        sold: 0
      };

      const productId = await addProduct(productToAdd);
      const updatedProduct = { ...productToAdd, id: productId };
      setItems(prevItems => [...prevItems, updatedProduct]);
      
      setNewItem({
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
        client: { name: '', doc: '' },
        expirationDate: null,
        checked: false
      });
    } catch (error) {
      if (error.message === 'Product already exists') {
        alert('Item já existe no estoque');
      } else {
        alert('Erro ao adicionar item');
        console.error('Error adding product:', error);
      }
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
Documento: ${item?.client?.doc || 'Não especificado'}

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
${item?.client?.doc || ''}`;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo_venda_${currentDate.toISOString().slice(0,10)}.txt`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  // Função para gerar dados de exemplo para os gráficos (em um app real, isso viria do banco de dados)
  const generateSampleSalesData = () => {
    // Dados de exemplo para demonstração
    return [
      { id: 1, date: '2023-06-01', client: 'João Silva', product: 'Camiseta', quantity: 2, price: 49.90, total: 99.80, paymentMethod: 'Cartão' },
      { id: 2, date: '2023-06-01', client: 'Maria Souza', product: 'Calça Jeans', quantity: 1, price: 89.90, total: 89.90, paymentMethod: 'Dinheiro' },
      { id: 3, date: '2023-06-02', client: 'Pedro Santos', product: 'Tênis', quantity: 1, price: 199.90, total: 199.90, paymentMethod: 'Pix' },
      { id: 4, date: '2023-06-03', client: 'Ana Oliveira', product: 'Camiseta', quantity: 3, price: 49.90, total: 149.70, paymentMethod: 'Cartão' },
      { id: 5, date: '2023-06-05', client: 'Carlos Ferreira', product: 'Boné', quantity: 2, price: 29.90, total: 59.80, paymentMethod: 'Dinheiro' },
      { id: 6, date: '2023-06-10', client: 'Mariana Costa', product: 'Meia', quantity: 5, price: 12.90, total: 64.50, paymentMethod: 'Pix' },
      { id: 7, date: '2023-06-15', client: 'Rafael Almeida', product: 'Bermuda', quantity: 2, price: 59.90, total: 119.80, paymentMethod: 'Cartão' },
      { id: 8, date: '2023-06-20', client: 'Juliana Lima', product: 'Blusa', quantity: 1, price: 69.90, total: 69.90, paymentMethod: 'Dinheiro' },
      { id: 9, date: '2023-06-25', client: 'Fernando Gomes', product: 'Tênis', quantity: 1, price: 199.90, total: 199.90, paymentMethod: 'Pix' },
      { id: 10, date: '2023-06-30', client: 'Camila Rodrigues', product: 'Camiseta', quantity: 2, price: 49.90, total: 99.80, paymentMethod: 'Cartão' },
    ];
  };

  // Carregar dados de vendas de exemplo ao iniciar
  useEffect(() => {
    setSalesData(generateSampleSalesData());
  }, []);

  // Modificar a função getFilteredSalesData para capturar corretamente os dados do cliente e das vendas
  const getFilteredSalesData = () => {
    // Criar dados de vendas a partir dos itens do estoque e das vendas realizadas
    const realSalesData = [];
    
    // Adicionar vendas dos itens do estoque
    items.forEach(item => {
      // Cada item vendido gera uma entrada no relatório
      if (item.sold > 0) {
        // Obter informações do cliente e do vendedor
        const clientInfo = item.client || currentSale.client || { name: 'Cliente não especificado', doc: '' };
        const vendorInfo = item.vendor || { name: 'Vendedor não especificado', doc: '' };
        
        realSalesData.push({
          id: item.id,
          date: item.saleDate || new Date().toISOString().split('T')[0],
          client: clientInfo.name,
          clientDoc: clientInfo.doc,
          vendor: vendorInfo.name,
          vendorDoc: vendorInfo.doc,
          product: item.description,
          quantity: item.sold,
          price: item.price,
          total: item.price * item.sold,
          paymentMethod: item.paymentMethod || 'Não especificado'
        });
      }
    });
    
    // Adicionar vendas do histórico de vendas (se existir)
    if (currentSale && currentSale.items && currentSale.items.length > 0) {
      currentSale.items.forEach((saleItem, index) => {
        realSalesData.push({
          id: `sale-${index}`,
          date: new Date().toISOString().split('T')[0],
          client: currentSale.client?.name || 'Cliente não especificado',
          clientDoc: currentSale.client?.doc || '',
          vendor: selectedVendor?.name || 'Vendedor não especificado',
          vendorDoc: selectedVendor?.document || '',
          product: saleItem.description,
          quantity: saleItem.quantity,
          price: saleItem.price,
          total: saleItem.total,
          paymentMethod: currentSale.paymentMethod || 'Não especificado'
        });
      });
    }
    
    // Combinar com os dados de exemplo para demonstração
    const combinedData = [...realSalesData, ...salesData];
    
    let filtered = [...combinedData];
    
    // Filtrar por período
    if (reportType === 'day') {
      filtered = filtered.filter(sale => sale.date === reportStartDate);
    } else if (reportType === 'month') {
      const [year, month] = reportStartDate.split('-');
      filtered = filtered.filter(sale => {
        const [saleYear, saleMonth] = sale.date.split('-');
        return saleYear === year && saleMonth === month;
      });
    } else if (reportType === 'period') {
      filtered = filtered.filter(sale => sale.date >= reportStartDate && sale.date <= reportEndDate);
    }
    
    // Filtrar por busca (cliente, produto ou documento)
    if (reportSearchQuery) {
      const query = reportSearchQuery.toLowerCase();
      filtered = filtered.filter(sale => 
        (sale.client && sale.client.toLowerCase().includes(query)) || 
        (sale.product && sale.product.toLowerCase().includes(query)) ||
        (sale.clientDoc && sale.clientDoc.toLowerCase().includes(query)) ||
        (sale.vendorDoc && sale.vendorDoc.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  // Função para exportar o relatório como imagem
  const exportAsImage = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current);
      const imageData = canvas.toDataURL('image/png');
      
      if (exportMethod === 'whatsapp') {
        // Enviar por WhatsApp
        if (contactInfo.whatsapp) {
          const encodedMessage = encodeURIComponent('Relatório de Vendas');
          window.open(`https://wa.me/${contactInfo.whatsapp}?text=${encodedMessage}`, '_blank');
          
          // Em um cenário real, você precisaria de um backend para enviar a imagem
          // Aqui apenas abrimos o WhatsApp Web com o número
          alert('Em um ambiente de produção, a imagem seria anexada à mensagem do WhatsApp.');
        } else {
          setShowContactForm(true);
        }
      } else if (exportMethod === 'email') {
        // Enviar por email
        if (contactInfo.email) {
          const subject = encodeURIComponent('Relatório de Vendas');
          const body = encodeURIComponent('Segue em anexo o relatório de vendas.');
          window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_blank');
          
          // Em um cenário real, você precisaria de um backend para enviar a imagem
          alert('Em um ambiente de produção, a imagem seria anexada ao email.');
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
        // Enviar por WhatsApp
        if (contactInfo.whatsapp) {
          const encodedMessage = encodeURIComponent('Relatório de Vendas');
          window.open(`https://wa.me/${contactInfo.whatsapp}?text=${encodedMessage}`, '_blank');
          
          // Em um cenário real, você precisaria de um backend para enviar o PDF
          alert('Em um ambiente de produção, o PDF seria anexado à mensagem do WhatsApp.');
        } else {
          setShowContactForm(true);
        }
      } else if (exportMethod === 'email') {
        // Enviar por email
        if (contactInfo.email) {
          const subject = encodeURIComponent('Relatório de Vendas');
          const body = encodeURIComponent('Segue em anexo o relatório de vendas.');
          window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_blank');
          
          // Em um cenário real, você precisaria de um backend para enviar o PDF
          alert('Em um ambiente de produção, o PDF seria anexado ao email.');
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
  const saveContactInfo = () => {
    setShowContactForm(false);
    setEditingContact(false);
    
    // Após salvar, continuar com a exportação
    if (exportType === 'photo') {
      exportAsImage();
    } else if (exportType === 'pdf') {
      exportAsPDF();
    }
  };

  // Preparar dados para o gráfico de pizza (itens mais vendidos)
  const getPieChartData = () => {
    // Agrupar por produto e somar quantidades
    const productSales = {};
    
    // Usar dados filtrados atualizados
    const filteredData = getFilteredSalesData();
    
    filteredData.forEach(sale => {
      if (productSales[sale.product]) {
        productSales[sale.product] += sale.quantity;
      } else {
        productSales[sale.product] = sale.quantity;
      }
    });
    
    // Converter para formato do Chart.js
    const labels = Object.keys(productSales);
    const data = Object.values(productSales);
    
    // Gerar cores aleatórias
    const backgroundColors = labels.map(() => 
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'Quantidade Vendida',
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  };

  // Preparar dados para o gráfico de barras (vendas por período)
  const getBarChartData = () => {
    // Agrupar vendas por período
    const salesByPeriod = {};
    
    // Usar dados filtrados atualizados
    const filteredData = getFilteredSalesData();
    
    filteredData.forEach(sale => {
      let period;
      
      if (dashboardPeriod === 'day') {
        period = sale.date;
      } else if (dashboardPeriod === 'week') {
        // Simplificação: usar a primeira data da semana
        const date = new Date(sale.date);
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // ajuste para começar na segunda
        const firstDayOfWeek = new Date(date.setDate(diff));
        period = firstDayOfWeek.toISOString().split('T')[0];
      } else if (dashboardPeriod === 'month') {
        period = sale.date.substring(0, 7); // YYYY-MM
      }
      
      if (salesByPeriod[period]) {
        salesByPeriod[period] += sale.quantity;
      } else {
        salesByPeriod[period] = sale.quantity;
      }
    });
    
    // Ordenar períodos
    const sortedPeriods = Object.keys(salesByPeriod).sort();
    
    return {
      labels: sortedPeriods,
      datasets: [
        {
          label: 'Quantidade Vendida',
          data: sortedPeriods.map(period => salesByPeriod[period]),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center mb-8 relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="absolute left-0 p-2 text-gray-600 hover:text-gray-800"
              style={{ marginRight: '8px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-center">Controle de Estoque</h1>
          </div>

          {showSettings && (
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Configurações</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Vendedor</label>
                  <SearchableDropdown
                    items={vendors}
                    value={selectedVendor}
                    onChange={(vendor) => {
                      setSelectedVendor(vendor);
                      setNewItem(prev => ({
                        ...prev,
                        vendor: { name: vendor.name, doc: vendor.document }
                      }));
                    }}
                    onSearch={handleVendorSearch}
                    onAdd={() => setShowAddVendor(true)}
                    placeholder="Selecione ou busque um vendedor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente</label>
                  <SearchableDropdown
                    items={clients}
                    value={selectedClient}
                    onChange={(client) => {
                      setSelectedClient(client);
                      setNewItem(prev => ({
                        ...prev,
                        client: { name: client.name, doc: client.document }
                      }));
                    }}
                    onSearch={handleClientSearch}
                    onAdd={() => setShowAddClient(true)}
                    placeholder="Selecione ou busque um cliente"
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => generateReceipt(newItem)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Gerar Recibo
                </button>
              </div>
            </div>
          )}

          {showAddVendor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Adicionar Novo Vendedor</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input
                      type="text"
                      value={newVendor.name}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Documento</label>
                    <input
                      type="text"
                      value={newVendor.document}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, document: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddVendor(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddNewVendor}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAddClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Adicionar Novo Cliente</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Documento</label>
                    <input
                      type="text"
                      value={newClient.document}
                      onChange={(e) => setNewClient(prev => ({ ...prev, document: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddClient(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddNewClient}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-lg shadow-md mb-8 w-full max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Adicionar Novo Item</h2>

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
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  placeholder="Descrição do item"
                  className="w-full px-3 py-2 border rounded-md"
                />
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
                    }`}
                  >
                    {newItem.checked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H5a1 1 0 01-1-1V4zm3 1a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    )}
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
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>

              {showLinks && (
                <div className="mt-2">
                  <div className="space-y-2">
                    {newItem.links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 flex-grow">
                          {link}
                        </a>
                        <button
                          onClick={() => {
                            const updatedLinks = [...newItem.links];
                            updatedLinks[index] = link;
                            setNewItem({...newItem, links: updatedLinks});
                          }}
                          className="p-1 text-gray-600 hover:text-blue-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            const updatedLinks = newItem.links.filter((_, i) => i !== index);
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
                          setNewItem({...newItem, links: [...newItem.links, fullUrl]});
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
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Atualizar Estoque</h2>

            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {item.image && (
                        <div>
                          <img src={item.image} alt={item.description} className="w-full h-32 object-cover rounded-md" />
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">Preço: R$ {item.price}</p>
                        <div className="flex items-center gap-4">
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
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
                        onClick={() => setEditingIndex(index)}
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
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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

            {editingIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Editar Item</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Imagem do Item</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const updatedItems = [...items];
                              updatedItems[editingIndex].image = e.target.result;
                              setItems(updatedItems);
                            }
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Descrição</label>
                        <input
                          type="text"
                          value={items[editingIndex].description}
                          onChange={(e) => {
                            const updatedItems = [...items];
                            updatedItems[editingIndex].description = e.target.value;
                            setItems(updatedItems);
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Preço de Venda</label>
                        <input
                          type="number"
                          value={items[editingIndex].price}
                          onChange={(e) => {
                            const updatedItems = [...items];
                            updatedItems[editingIndex].price = e.target.value;
                            setItems(updatedItems);
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantidade em Estoque</label>
                        <input
                          type="number"
                          value={items[editingIndex].quantity}
                          onChange={(e) => {
                            const updatedItems = [...items];
                            updatedItems[editingIndex].quantity = e.target.value;
                            setItems(updatedItems);
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const updatedItem = items[editingIndex];
                            await updateProduct(updatedItem);
                            setEditingIndex(null);
                          } catch (error) {
                            alert('Erro ao atualizar o item');
                            console.error('Error updating product:', error);
                          }
                        }}
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {items.length > 0 && (
              <div className="mt-6 space-y-4">
                <button
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      alert('Selecione pelo menos um item para finalizar a venda');
                      return;
                    }

                    const saleItems = selectedItems.map(index => {
                      const item = items[index];
                      return {
                        description: item.description,
                        price: item.price,
                        quantity: item.soldQuantity || 1,
                        total: item.price * (item.soldQuantity || 1)
                      };
                    });

                    const totalSale = saleItems.reduce((sum, item) => sum + item.total, 0);
                    
                    setCurrentSale({
                      client: { name: newItem.client.name, doc: newItem.client.doc },
                      items: saleItems,
                      total: totalSale,
                      paymentMethod: ''
                    });

                    setShowPaymentPopup(true);
                  }}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mb-2"
                >
                  Finalizar Venda
                </button>

                <button
                  onClick={() => setShowSalesReport(true)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Ver Relatório de Vendas
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      // Criar objeto com todos os dados
                      const backupData = {
                        items,
                        salesSummary,
                        timestamp: new Date().toISOString()
                      };
                      
                      // Converter para JSON
                      const jsonData = JSON.stringify(backupData, null, 2);
                      
                      // Criar blob
                      const blob = new Blob([jsonData], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      
                      // Criar link de download
                      const link = document.createElement('a');
                      link.href = url;
                      
                      // Perguntar ao usuário onde salvar
                      const fileName = prompt('Digite o nome do arquivo de backup (sem extensão):', `backup_${new Date().toISOString().slice(0,10)}`);
                      if (!fileName) return;
                      
                      link.download = `${fileName}.json`;
                      link.click();
                      
                      // Limpar URL
                      URL.revokeObjectURL(url);
                    }}
                    className="w-1/2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Backup
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const backupData = JSON.parse(event.target.result);
                            setItems(backupData.items || []);
                            setSalesSummary(backupData.salesSummary || {
                              totalCash: 0,
                              totalCard: 0,
                              totalPix: 0
                            });
                            alert('Backup restaurado com sucesso!');
                          } catch {
                            alert('Erro ao restaurar backup: arquivo inválido');
                          }
                        };
                        reader.readAsText(file);
                      };
                      input.click();
                    }}
                    className="w-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Abrir Backup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Selecione a Forma de Pagamento</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setCurrentSale(prev => ({
                    ...prev,
                    paymentMethod: 'Dinheiro'
                  }));
                  handleMultipleSales('dinheiro');
                  setShowPaymentPopup(false);
                }}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Dinheiro
              </button>

              <button
                onClick={() => {
                  setCurrentSale(prev => ({
                    ...prev,
                    paymentMethod: 'Cartão'
                  }));
                  handleMultipleSales('cartao');
                  setShowPaymentPopup(false);
                }}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Cartão
              </button>

              <button
                onClick={() => {
                  setCurrentSale(prev => ({
                    ...prev,
                    paymentMethod: 'Pix'
                  }));
                  handleMultipleSales('pix');
                  setShowPaymentPopup(false);
                }}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                Pix
              </button>

              <button
                onClick={() => setShowPaymentPopup(false)}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relatório de Vendas */}
      {showSalesReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Relatório de Vendas</h2>
              <button
                onClick={() => setShowSalesReport(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Barra de busca */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Buscar por cliente ou produto..."
                value={reportSearchQuery}
                onChange={(e) => setReportSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {/* Filtros de período */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Relatório</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="day">Diário</option>
                  <option value="month">Mensal</option>
                  <option value="period">Por Período</option>
                </select>
              </div>

              {reportType === 'period' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Data Inicial</label>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Data Final</label>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {reportType === 'day' ? 'Data' : 'Mês'}
                  </label>
                  <input
                    type={reportType === 'day' ? 'date' : 'month'}
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              )}

              <div className="md:col-span-3">
                <button
                  onClick={() => setShowDashboard(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Dashboard
                </button>
              </div>
            </div>

            {/* Tabela de vendas */}
            <div ref={reportRef} className="overflow-x-auto bg-white p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-center">Relatório de Vendas</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">
                {reportType === 'day' ? `Data: ${reportStartDate}` : 
                 reportType === 'month' ? `Mês: ${reportStartDate}` : 
                 `Período: ${reportStartDate} a ${reportEndDate}`}
              </p>
              
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Data</th>
                    <th className="py-2 px-4 border-b">Cliente</th>
                    <th className="py-2 px-4 border-b">Doc. Cliente</th>
                    <th className="py-2 px-4 border-b">Vendedor</th>
                    <th className="py-2 px-4 border-b">Produto</th>
                    <th className="py-2 px-4 border-b">Quantidade</th>
                    <th className="py-2 px-4 border-b">Preço Unit.</th>
                    <th className="py-2 px-4 border-b">Total</th>
                    <th className="py-2 px-4 border-b">Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredSalesData().map((sale, index) => (
                    <tr key={`${sale.id}-${index}`}>
                      <td className="py-2 px-4 border-b">{sale.date}</td>
                      <td className="py-2 px-4 border-b">{sale.client}</td>
                      <td className="py-2 px-4 border-b">{sale.clientDoc}</td>
                      <td className="py-2 px-4 border-b">{sale.vendor}</td>
                      <td className="py-2 px-4 border-b">{sale.product}</td>
                      <td className="py-2 px-4 border-b text-center">{sale.quantity}</td>
                      <td className="py-2 px-4 border-b text-right">R$ {sale.price.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b text-right">R$ {sale.total.toFixed(2)}</td>
                      <td className="py-2 px-4 border-b">{sale.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="7" className="py-2 px-4 border-b text-right font-bold">Total:</td>
                    <td className="py-2 px-4 border-b text-right font-bold">
                      R$ {getFilteredSalesData().reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Botões de exportação */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <button
                  onClick={() => handleExport('photo', '')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Exportar como Foto
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExport('photo', 'whatsapp')}
                    className="flex items-center justify-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm.31 16.9c-1.33 0-2.58-.35-3.66-.95L5 19l1.06-3.69c-.68-1.15-1.06-2.48-1.06-3.9 0-4.28 3.47-7.75 7.75-7.75s7.75 3.47 7.75 7.75-3.47 7.75-7.75 7.75zm4.26-5.82c-.23-.12-1.37-.68-1.58-.76-.21-.08-.37-.12-.52.12-.15.23-.58.76-.71.91-.13.15-.27.17-.5.06-.23-.12-.98-.36-1.87-1.14-.69-.62-1.15-1.38-1.29-1.61-.13-.23-.01-.35.1-.47.1-.1.23-.27.35-.4.12-.13.16-.23.24-.38.08-.15.04-.29-.02-.4-.06-.12-.52-1.25-.71-1.71-.19-.46-.38-.39-.52-.4-.13 0-.29-.01-.44-.01-.15 0-.38.06-.58.29-.19.23-.74.72-.74 1.77s.76 2.06.87 2.21c.11.15 1.55 2.37 3.76 3.32.53.23.93.36 1.25.47.53.17 1 .14 1.38.09.42-.06 1.29-.53 1.48-1.04.19-.51.19-.94.13-1.04-.06-.09-.21-.15-.44-.27z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleExport('photo', 'email')}
                    className="flex items-center justify-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleExport('pdf', '')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Exportar como PDF
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExport('pdf', 'whatsapp')}
                    className="flex items-center justify-center px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm.31 16.9c-1.33 0-2.58-.35-3.66-.95L5 19l1.06-3.69c-.68-1.15-1.06-2.48-1.06-3.9 0-4.28 3.47-7.75 7.75-7.75s7.75 3.47 7.75 7.75-3.47 7.75-7.75 7.75zm4.26-5.82c-.23-.12-1.37-.68-1.58-.76-.21-.08-.37-.12-.52.12-.15.23-.58.76-.71.91-.13.15-.27.17-.5.06-.23-.12-.98-.36-1.87-1.14-.69-.62-1.15-1.38-1.29-1.61-.13-.23-.01-.35.1-.47.1-.1.23-.27.35-.4.12-.13.16-.23.24-.38.08-.15.04-.29-.02-.4-.06-.12-.52-1.25-.71-1.71-.19-.46-.38-.39-.52-.4-.13 0-.29-.01-.44-.01-.15 0-.38.06-.58.29-.19.23-.74.72-.74 1.77s.76 2.06.87 2.21c.11.15 1.55 2.37 3.76 3.32.53.23.93.36 1.25.47.53.17 1 .14 1.38.09.42-.06 1.29-.53 1.48-1.04.19-.51.19-.94.13-1.04-.06-.09-.21-.15-.44-.27z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleExport('pdf', 'email')}
                    className="flex items-center justify-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulário de contato */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingContact ? 'Editar Contato' : 'Adicionar Contato'}
              </h3>
              <button
                onClick={() => {
                  setShowContactForm(false);
                  setEditingContact(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {exportMethod === 'whatsapp' || exportMethod === '' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp</label>
                  <div className="flex">
                    <input
                      type="tel"
                      placeholder="Ex: 5511999999999"
                      value={contactInfo.whatsapp}
                      onChange={(e) => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    {contactInfo.whatsapp && (
                      <a 
                        href={`https://wa.me/${contactInfo.whatsapp}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
                        title="Testar número"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm.31 16.9c-1.33 0-2.58-.35-3.66-.95L5 19l1.06-3.69c-.68-1.15-1.06-2.48-1.06-3.9 0-4.28 3.47-7.75 7.75-7.75s7.75 3.47 7.75 7.75-3.47 7.75-7.75 7.75zm4.26-5.82c-.23-.12-1.37-.68-1.58-.76-.21-.08-.37-.12-.52.12-.15.23-.58.76-.71.91-.13.15-.27.17-.5.06-.23-.12-.98-.36-1.87-1.14-.69-.62-1.15-1.38-1.29-1.61-.13-.23-.01-.35.1-.47.1-.1.23-.27.35-.4.12-.13.16-.23.24-.38.08-.15.04-.29-.02-.4-.06-.12-.52-1.25-.71-1.71-.19-.46-.38-.39-.52-.4-.13 0-.29-.01-.44-.01-.15 0-.38.06-.58.29-.19.23-.74.72-.74 1.77s.76 2.06.87 2.21c.11.15 1.55 2.37 3.76 3.32.53.23.93.36 1.25.47.53.17 1 .14 1.38.09.42-.06 1.29-.53 1.48-1.04.19-.51.19-.94.13-1.04-.06-.09-.21-.15-.44-.27z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Inclua o código do país (Ex: 55 para Brasil)</p>
                </div>
              ) : null}
              
              {exportMethod === 'email' || exportMethod === '' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="exemplo@email.com"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    {contactInfo.email && (
                      <a 
                        href={`mailto:${contactInfo.email}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                        title="Testar email"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ) : null}
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowContactForm(false);
                    setEditingContact(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveContactInfo}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Dashboard */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Dashboard de Vendas</h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filtro de período para o gráfico de barras */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Agrupar por:</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="day"
                    checked={dashboardPeriod === 'day'}
                    onChange={() => setDashboardPeriod('day')}
                    className="mr-2"
                  />
                  Dia
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="week"
                    checked={dashboardPeriod === 'week'}
                    onChange={() => setDashboardPeriod('week')}
                    className="mr-2"
                  />
                  Semana
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="month"
                    checked={dashboardPeriod === 'month'}
                    onChange={() => setDashboardPeriod('month')}
                    className="mr-2"
                  />
                  Mês
                </label>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Produtos Mais Vendidos</h3>
                <div className="h-80">
                  <Pie data={getPieChartData()} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Vendas por Período</h3>
                <div className="h-80">
                  <Bar 
                    data={getBarChartData()} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
