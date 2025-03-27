export const testItems = [
  {
    id: 1,
    description: 'Item 1',
    price: 10.0,
    quantity: 100
  },
  {
    id: 2,
    description: 'Item 2',
    price: 20.0,
    quantity: 50
  },
  {
    id: 3,
    description: 'Item 3',
    price: 30.0,
    quantity: 25
  },
  {
    id: 4,
    description: 'Item 4',
    price: 40.0,
    quantity: 10
  },
  {
    id: 5,
    description: 'Item 5',
    price: 50.0,
    quantity: 5
  },
  {
    id: 6,
    description: 'Item 6',
    price: 60.0,
    quantity: 2
  }
];

export const testSales = [
  {
    id: 1,
    date: '2025-03-19',
    paymentMethod: 'dinheiro',
    items: [testItems[0], testItems[1]],
    total: 30.0
  },
  {
    id: 2,
    date: '2025-03-19',
    paymentMethod: 'cartão',
    items: [testItems[2], testItems[3]],
    total: 70.0
  },
  {
    id: 3,
    date: '2025-03-20',
    paymentMethod: 'pix',
    items: [testItems[4], testItems[5]],
    total: 110.0
  },
  {
    id: 4,
    date: '2025-03-20',
    paymentMethod: 'dinheiro',
    items: [testItems[0], testItems[2]],
    total: 40.0
  },
  {
    id: 5,
    date: '2025-03-21',
    paymentMethod: 'cartão',
    items: [testItems[1], testItems[3]],
    total: 60.0
  },
  {
    id: 6,
    date: '2025-03-21',
    paymentMethod: 'pix',
    items: [testItems[4], testItems[5]],
    total: 110.0
  }
];
