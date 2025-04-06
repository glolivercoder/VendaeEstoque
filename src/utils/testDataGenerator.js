export const generateTestData = () => {
  const clients = [
    { id: 1, name: 'João Silva', cpf: '123.456.789-00', rg: '12.345.678-9' },
    { id: 2, name: 'Maria Santos', cpf: '987.654.321-00', rg: '98.765.432-1' },
    { id: 3, name: 'Pedro Oliveira', cpf: '456.789.123-00', rg: '45.678.912-3' },
    { id: 4, name: 'Ana Costa', cpf: '789.123.456-00', rg: '78.912.345-6' }
  ];

  const products = [
    { id: 1, description: 'Notebook Dell', price: 3500.00, cost: 2800.00, stock: 10 },
    { id: 2, description: 'iPhone 13', price: 4500.00, cost: 3600.00, stock: 15 },
    { id: 3, description: 'Smart TV 55"', price: 2800.00, cost: 2200.00, stock: 8 },
    { id: 4, description: 'PlayStation 5', price: 4000.00, cost: 3200.00, stock: 5 },
    { id: 5, description: 'AirPods Pro', price: 1200.00, cost: 900.00, stock: 20 }
  ];

  const vendors = [
    { id: 1, name: 'Carlos Vendas', document: '12345', commission: 5 },
    { id: 2, name: 'Amanda Comercial', document: '67890', commission: 5 },
    { id: 3, name: 'Roberto Negócios', document: '11223', commission: 5 }
  ];

  // Gerar vendas com datas diferentes
  const generateSales = () => {
    const sales = [];
    const dates = [
      '2024-01-15',
      '2024-02-20',
      '2024-03-01',
      '2024-03-15',
      '2024-03-30',
      '2024-04-01',
      '2024-04-05'
    ];

    dates.forEach((date, index) => {
      const client = clients[index % clients.length];
      const vendor = vendors[index % vendors.length];
      const product1 = products[index % products.length];
      const product2 = products[(index + 1) % products.length];

      const sale = {
        id: Date.now() + index,
        date: formatDateToBrazilian(date),
        timestamp: new Date(date).getTime(),
        client: client.name,
        clientDoc: client.rg,
        clientCpf: client.cpf,
        vendor: vendor.name,
        vendorDoc: vendor.document,
        products: [
          {
            ...product1,
            quantity: Math.floor(Math.random() * 3) + 1
          },
          {
            ...product2,
            quantity: Math.floor(Math.random() * 3) + 1
          }
        ],
        paymentMethod: ['dinheiro', 'cartão', 'pix'][Math.floor(Math.random() * 3)]
      };

      // Calcular total
      sale.total = sale.products.reduce((sum, prod) => sum + (prod.price * prod.quantity), 0);
      sales.push(sale);
    });

    return sales;
  };

  return {
    clients,
    products,
    vendors,
    sales: generateSales()
  };
};

// Função para formatar data
const formatDateToBrazilian = (isoDate) => {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};