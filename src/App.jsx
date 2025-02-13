import { useState } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
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

  const handleSale = (item, index, paymentMethod) => {
    const updatedItems = [...items];
    const quantity = updatedItems[index].soldQuantity || 1;
    
    if (updatedItems[index].quantity < quantity) {
      alert('Quantidade insuficiente em estoque');
      return;
    }

    if (!window.confirm(`Confirmar venda de ${quantity} unidade(s) de ${item.description} via ${paymentMethod}?`)) {
      return;
    }

    updatedItems[index].quantity -= quantity;
    updatedItems[index].sold += quantity;
    setItems(updatedItems);

    // Update sales summary
    setSalesSummary(prev => ({
      totalCash: paymentMethod === 'dinheiro' ? prev.totalCash + (item.price * quantity) : prev.totalCash,
      totalCard: paymentMethod === 'cartao' ? prev.totalCard + (item.price * quantity) : prev.totalCard,
      totalPix: paymentMethod === 'pix' ? prev.totalPix + (item.price * quantity) : prev.totalPix
    }));
  };

  const handleMultipleSales = (paymentMethod) => {
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

    // Processar vendas
    for (const index of selectedItems) {
      const item = updatedItems[index];
      const quantity = item.soldQuantity || 1;
      
      item.quantity -= quantity;
      item.sold += quantity;
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
  };
  const [showLinks, setShowLinks] = useState(false);

  const handleAddItem = () => {
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

    // Check for duplicate items (case insensitive)
    const existingItem = items.find(
      item => item.description.toLowerCase() === newItem.description.toLowerCase()
    );
    
    if (existingItem) {
      alert('Item já existe no estoque');
      return;
    }

    // Add new item with formatted values
    setItems([...items, {
      ...newItem,
      description: newItem.description.trim(),
      price: parseFloat(Number(newItem.price).toFixed(2)),
      quantity: Math.floor(Number(newItem.quantity)),
      sold: 0
    }]);
    
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
  };

  const confirmSale = (paymentMethod) => {
    const saleDate = new Date().toLocaleString();
    const updatedItems = items.map(item => {
      if (item.description === newItem.description) {
        const totalSale = item.price * newItem.saleQuantity;
        
        setSalesSummary(prev => ({
          totalCash: paymentMethod === 'cash' ? prev.totalCash + totalSale : prev.totalCash,
          totalCard: paymentMethod === 'card' ? prev.totalCard + totalSale : prev.totalCard
        }));

        return {
          ...item,
          quantity: item.quantity - newItem.saleQuantity,
          sold: item.sold + newItem.saleQuantity,
          saleDate,
          paymentMethod,
          vendor: newItem.vendor,
          client: newItem.client
        };
      }
      return item;
    });
    
    setItems(updatedItems);
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
      client: { name: '', doc: '' }
    });
    setShowPaymentPopup(false);
  };

  const generateReceipt = (item) => {
    const receiptContent = `Eu ${item.vendor.name}, identidade: ${item.vendor.doc}, vendi a ${item.client.name}, identidade: ${item.client.doc}, o item "${item.description}" pelo valor de R$ ${(item.price * item.saleQuantity).toFixed(2)}. Data da Venda: ${item.saleDate}`;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo_${item.description.replace(/ /g, '_')}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Controle de Estoque</h1>

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
              <label className="block text-sm font-medium mb-1">Quantidade a Vender</label>
              <input
                type="number"
                value={newItem.saleQuantity}
                onChange={(e) => setNewItem({...newItem, saleQuantity: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                min="1"
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

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendedor</label>
              <input
                type="text"
                value={newItem.vendor.name}
                onChange={(e) => setNewItem({...newItem, vendor: {...newItem.vendor, name: e.target.value}})}
                placeholder="Nome do Vendedor"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                value={newItem.vendor.doc}
                onChange={(e) => setNewItem({...newItem, vendor: {...newItem.vendor, doc: e.target.value}})}
                placeholder="Documento do Vendedor"
                className="w-full px-3 py-2 border rounded-md mt-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cliente</label>
              <input
                type="text"
                value={newItem.client.name}
                onChange={(e) => setNewItem({...newItem, client: {...newItem.client, name: e.target.value}})}
                placeholder="Nome do Cliente"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                value={newItem.client.doc}
                onChange={(e) => setNewItem({...newItem, client: {...newItem.client, doc: e.target.value}})}
                placeholder="Documento do Cliente"
                className="w-full px-3 py-2 border rounded-md mt-2"
              />
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
                <input
                  type="text"
                  value={newItem.links[newItem.links.length - 1] || ''}
                  onChange={(e) => {
                    const links = [...newItem.links];
                    links[links.length - 1] = e.target.value;
                    setNewItem({...newItem, links});
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const url = e.target.value.trim();
                      if (url) {
                        // Ensure URL starts with http/https
                        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                        setNewItem({...newItem, links: [...newItem.links, fullUrl]});
                        e.target.value = ''; // Clear input after adding
                      }
                    }
                  }}
                  placeholder="Digite um link e pressione Enter"
                  className="w-full px-3 py-2 border rounded-md"
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
                      {item.links.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Links:</p>
                          <ul className="list-disc list-inside">
                            {item.links.map((link, i) => (
                              <li key={i} className="text-sm text-blue-500 hover:text-blue-600">
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                  {link}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                                <button
                                  className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  Produto Vencido
                                </button>
                              </div>
                            );
                          } else if (diffDays === 0) {
                            return (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            );
                          } else if (diffDays > 0 && diffDays <= 7) {
                            return (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
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
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir este item?')) {
                          const updatedItems = items.filter((_, i) => i !== index);
                          setItems(updatedItems);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Excluir
                    </button>
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
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const updatedItems = [...items];
                              updatedItems[editingIndex].image = event.target.result;
                              setItems(updatedItems);
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
                      onClick={() => setEditingIndex(null)}
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

                  // Mostrar modal de seleção de pagamento
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
                        } catch (error) {
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
