import { useState, useEffect } from 'react';
import { getVendors, getClients, searchVendors, searchClients, addVendor, addClient, getProducts, addProduct, updateProduct, deleteProduct } from './services/database';
import SearchableDropdown from './components/SearchableDropdown';

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

  const handleSale = async (item, index, paymentMethod) => {
    const updatedItems = [...items];
    const quantity = updatedItems[index].soldQuantity || 1;
    
    if (updatedItems[index].quantity < quantity) {
      alert('Quantidade insuficiente em estoque');
      return;
    }

    if (!window.confirm(`Confirmar venda de ${quantity} unidade(s) de ${item.description} via ${paymentMethod}?`)) {
      return;
    }

    try {
      const updatedItem = {
        ...updatedItems[index],
        quantity: updatedItems[index].quantity - quantity,
        sold: updatedItems[index].sold + quantity
      };

      await updateProduct(updatedItem);
      updatedItems[index] = updatedItem;
      setItems(updatedItems);

      // Update sales summary
      setSalesSummary(prev => ({
        totalCash: paymentMethod === 'dinheiro' ? prev.totalCash + (item.price * quantity) : prev.totalCash,
        totalCard: paymentMethod === 'cartao' ? prev.totalCard + (item.price * quantity) : prev.totalCard,
        totalPix: paymentMethod === 'pix' ? prev.totalPix + (item.price * quantity) : prev.totalPix
      }));
    } catch (error) {
      alert('Erro ao atualizar o produto');
      console.error('Error updating product:', error);
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
                          onClick={() => handleSale(item, index, 'dinheiro')}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Dinheiro
                        </button>
                        <button
                          onClick={() => handleSale(item, index, 'cartao')}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Cartão
                        </button>
                        <button
                          onClick={() => handleSale(item, index, 'pix')}
                          className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                        >
                          Pix
                        </button>
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
                  onClick={() => {
                    const totalSales = salesSummary.totalCash + salesSummary.totalCard + salesSummary.totalPix;
                    
                    let report = `Relatório de Vendas:\n\n`;
                    report += `Cliente: ${currentSale.client.name}\n`;
                    report += `Documento: ${currentSale.client.doc}\n\n`;
                    report += `Itens Vendidos:\n`;
                    
                    currentSale.items.forEach(item => {
                      report += `- ${item.description}: ${item.quantity} x R$ ${item.price.toFixed(2)} = R$ ${item.total.toFixed(2)}\n`;
                    });
                    
                    report += `\nTotal da Venda: R$ ${currentSale.total.toFixed(2)}\n`;
                    report += `Forma de Pagamento: ${currentSale.paymentMethod}\n\n`;
                    report += `Totais Gerais:\n`;
                    report += `Dinheiro: R$ ${salesSummary.totalCash.toFixed(2)}\n`;
                    report += `Cartão: R$ ${salesSummary.totalCard.toFixed(2)}\n`;
                    report += `Pix: R$ ${salesSummary.totalPix.toFixed(2)}\n`;
                    report += `Total Geral: R$ ${totalSales.toFixed(2)}`;

                    alert(report);
                  }}
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
    </div>
  );
}

export default App;
