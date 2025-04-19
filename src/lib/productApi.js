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

    // Se não encontrar pelo SKU exato, gerar um produto aleatório
    // (apenas para fins de demonstração)
    if (!product) {
      // Gerar um produto aleatório com base no SKU fornecido
      return {
        sku,
        name: `Produto ${sku.substring(0, 4)}`,
        weight: Math.random() * 5 + 0.1, // Peso entre 0.1 e 5.1 kg
        dimensions: {
          length: Math.floor(Math.random() * 50) + 10, // Entre 10 e 60 cm
          width: Math.floor(Math.random() * 30) + 5, // Entre 5 e 35 cm
          height: Math.floor(Math.random() * 20) + 1 // Entre 1 e 21 cm
        },
        ncm: Math.floor(Math.random() * 90000000 + 10000000).toString()
      };
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

/**
 * Busca produtos por nome
 * @param {string} query - Termo de busca
 * @returns {Promise<Array>} - Lista de produtos encontrados
 */
export const searchProducts = async (query) => {
  try {
    // Simular uma chamada de API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Buscar produtos que contenham o termo de busca no nome
    const products = productDatabase.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    return products;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};
