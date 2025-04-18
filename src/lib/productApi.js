/**
 * API para busca de produtos por SKU
 */

// Banco de dados simulado de produtos
const productDatabase = [
  {
    sku: '123456789',
    name: 'Smartphone Galaxy S21',
    weight: 0.5,
    dimensions: {
      length: 15,
      width: 7,
      height: 2
    },
    ncm: '85171231'
  },
  {
    sku: '987654321',
    name: 'Notebook Dell Inspiron',
    weight: 2.5,
    dimensions: {
      length: 35,
      width: 25,
      height: 3
    },
    ncm: '84713012'
  },
  {
    sku: '456789123',
    name: 'Smart TV 4K 55"',
    weight: 15,
    dimensions: {
      length: 120,
      width: 70,
      height: 10
    },
    ncm: '85287200'
  },
  {
    sku: '789123456',
    name: 'Fone de Ouvido Bluetooth',
    weight: 0.2,
    dimensions: {
      length: 10,
      width: 5,
      height: 3
    },
    ncm: '85183000'
  },
  {
    sku: '321654987',
    name: 'Câmera DSLR Profissional',
    weight: 1.2,
    dimensions: {
      length: 15,
      width: 10,
      height: 8
    },
    ncm: '90066100'
  }
];

// Função para buscar produto por SKU
export const fetchProductBySku = async (sku) => {
  try {
    // Simular uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Buscar o produto no banco de dados simulado
    const product = productDatabase.find(p => p.sku === sku);
    
    // Se não encontrar, tentar buscar na base de dados real
    if (!product) {
      // Aqui seria implementada a busca na base de dados real
      // Por enquanto, retornamos null para indicar que o produto não foi encontrado
      return null;
    }
    
    return product;
  } catch (error) {
    console.error('Erro ao buscar produto por SKU:', error);
    throw error;
  }
};

// Função para buscar produtos do estoque
export const fetchProductsFromInventory = async () => {
  try {
    // Aqui seria implementada a busca na base de dados real
    // Por enquanto, retornamos o banco de dados simulado
    return productDatabase;
  } catch (error) {
    console.error('Erro ao buscar produtos do estoque:', error);
    throw error;
  }
};
