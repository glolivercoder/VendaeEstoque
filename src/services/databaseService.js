import db from '../database';
import { openDB } from 'idb';

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
  try {
    const initialized = await db.initialize();
    if (!initialized) {
      throw new Error('Falha ao inicializar o banco de dados');
    }
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
};

// Função para migrar dados do IndexedDB para o banco de dados relacional
export const migrateFromIndexedDB = async () => {
  try {
    // Abrir conexão com o IndexedDB
    const indexedDB = await openDB('estoqueDB', 4);
    
    // Obter dados do IndexedDB
    const products = await indexedDB.getAll('products');
    const clients = await indexedDB.getAll('clients');
    const vendors = await indexedDB.getAll('vendors');
    
    // Obter vendas do localStorage
    const salesData = localStorage.getItem('salesData');
    const sales = salesData ? JSON.parse(salesData) : [];
    
    // Migrar dados para o banco de dados relacional
    const migrated = await db.migrateFromIndexedDB({
      products,
      clients,
      vendors,
      sales
    });
    
    if (!migrated) {
      throw new Error('Falha ao migrar dados');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao migrar dados:', error);
    return false;
  }
};

// Funções para produtos
export const getProducts = async () => {
  try {
    return await db.Product.findAll({
      include: [db.Vendor]
    });
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    return await db.Product.findByPk(id, {
      include: [db.Vendor]
    });
  } catch (error) {
    console.error(`Erro ao obter produto com ID ${id}:`, error);
    return null;
  }
};

export const addProduct = async (product) => {
  try {
    return await db.Product.create(product);
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    throw error;
  }
};

export const updateProduct = async (product) => {
  try {
    const [updated] = await db.Product.update(product, {
      where: { id: product.id }
    });
    return updated > 0;
  } catch (error) {
    console.error(`Erro ao atualizar produto com ID ${product.id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const deleted = await db.Product.destroy({
      where: { id }
    });
    return deleted > 0;
  } catch (error) {
    console.error(`Erro ao excluir produto com ID ${id}:`, error);
    throw error;
  }
};

export const searchProducts = async (query) => {
  try {
    return await db.Product.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { description: { [db.Sequelize.Op.like]: `%${query}%` } },
          { itemDescription: { [db.Sequelize.Op.like]: `%${query}%` } },
          { sku: { [db.Sequelize.Op.like]: `%${query}%` } },
          { gtin: { [db.Sequelize.Op.like]: `%${query}%` } },
          { ncm: { [db.Sequelize.Op.like]: `%${query}%` } }
        ]
      },
      include: [db.Vendor]
    });
  } catch (error) {
    console.error(`Erro ao pesquisar produtos com query "${query}":`, error);
    return [];
  }
};

// Funções para clientes
export const getClients = async () => {
  try {
    return await db.Client.findAll();
  } catch (error) {
    console.error('Erro ao obter clientes:', error);
    return [];
  }
};

export const getClientById = async (id) => {
  try {
    return await db.Client.findByPk(id);
  } catch (error) {
    console.error(`Erro ao obter cliente com ID ${id}:`, error);
    return null;
  }
};

export const addClient = async (client) => {
  try {
    return await db.Client.create(client);
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    throw error;
  }
};

export const updateClient = async (client) => {
  try {
    const [updated] = await db.Client.update(client, {
      where: { id: client.id }
    });
    return updated > 0;
  } catch (error) {
    console.error(`Erro ao atualizar cliente com ID ${client.id}:`, error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const deleted = await db.Client.destroy({
      where: { id }
    });
    return deleted > 0;
  } catch (error) {
    console.error(`Erro ao excluir cliente com ID ${id}:`, error);
    throw error;
  }
};

export const searchClients = async (query) => {
  try {
    return await db.Client.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { name: { [db.Sequelize.Op.like]: `%${query}%` } },
          { rg: { [db.Sequelize.Op.like]: `%${query}%` } },
          { cpf: { [db.Sequelize.Op.like]: `%${query}%` } },
          { document: { [db.Sequelize.Op.like]: `%${query}%` } },
          { whatsapp: { [db.Sequelize.Op.like]: `%${query}%` } },
          { email: { [db.Sequelize.Op.like]: `%${query}%` } }
        ]
      }
    });
  } catch (error) {
    console.error(`Erro ao pesquisar clientes com query "${query}":`, error);
    return [];
  }
};

// Funções para fornecedores
export const getVendors = async () => {
  try {
    return await db.Vendor.findAll();
  } catch (error) {
    console.error('Erro ao obter fornecedores:', error);
    return [];
  }
};

export const getVendorById = async (id) => {
  try {
    return await db.Vendor.findByPk(id);
  } catch (error) {
    console.error(`Erro ao obter fornecedor com ID ${id}:`, error);
    return null;
  }
};

export const addVendor = async (vendor) => {
  try {
    return await db.Vendor.create(vendor);
  } catch (error) {
    console.error('Erro ao adicionar fornecedor:', error);
    throw error;
  }
};

export const updateVendor = async (vendor) => {
  try {
    const [updated] = await db.Vendor.update(vendor, {
      where: { id: vendor.id }
    });
    return updated > 0;
  } catch (error) {
    console.error(`Erro ao atualizar fornecedor com ID ${vendor.id}:`, error);
    throw error;
  }
};

export const deleteVendor = async (id) => {
  try {
    const deleted = await db.Vendor.destroy({
      where: { id }
    });
    return deleted > 0;
  } catch (error) {
    console.error(`Erro ao excluir fornecedor com ID ${id}:`, error);
    throw error;
  }
};

export const searchVendors = async (query) => {
  try {
    return await db.Vendor.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { name: { [db.Sequelize.Op.like]: `%${query}%` } },
          { document: { [db.Sequelize.Op.like]: `%${query}%` } },
          { cnpj: { [db.Sequelize.Op.like]: `%${query}%` } },
          { description: { [db.Sequelize.Op.like]: `%${query}%` } }
        ]
      }
    });
  } catch (error) {
    console.error(`Erro ao pesquisar fornecedores com query "${query}":`, error);
    return [];
  }
};

// Funções para vendas
export const getSales = async () => {
  try {
    return await db.Sale.findAll({
      include: [
        {
          model: db.SaleItem,
          include: [db.Product]
        },
        db.Client
      ],
      order: [['date', 'DESC']]
    });
  } catch (error) {
    console.error('Erro ao obter vendas:', error);
    return [];
  }
};

export const getSaleById = async (id) => {
  try {
    return await db.Sale.findByPk(id, {
      include: [
        {
          model: db.SaleItem,
          include: [db.Product]
        },
        db.Client
      ]
    });
  } catch (error) {
    console.error(`Erro ao obter venda com ID ${id}:`, error);
    return null;
  }
};

export const addSale = async (sale, items) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Criar venda
    const newSale = await db.Sale.create({
      date: sale.date,
      time: sale.time,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      clientId: sale.clientId,
      clientName: sale.clientName,
      clientDocument: sale.clientDocument
    }, { transaction });
    
    // Criar itens da venda
    for (const item of items) {
      await db.SaleItem.create({
        saleId: newSale.id,
        productId: item.id,
        description: item.description,
        price: item.price,
        quantity: item.quantity || 1,
        total: item.price * (item.quantity || 1)
      }, { transaction });
      
      // Atualizar estoque do produto
      if (item.id) {
        const product = await db.Product.findByPk(item.id, { transaction });
        if (product) {
          await product.update({
            quantity: Math.max(0, product.quantity - (item.quantity || 1)),
            sold: (product.sold || 0) + (item.quantity || 1)
          }, { transaction });
        }
      }
    }
    
    // Confirmar transação
    await transaction.commit();
    return newSale;
  } catch (error) {
    // Reverter transação em caso de erro
    await transaction.rollback();
    console.error('Erro ao adicionar venda:', error);
    throw error;
  }
};

export const getSalesByDateRange = async (startDate, endDate) => {
  try {
    return await db.Sale.findAll({
      where: {
        date: {
          [db.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: db.SaleItem,
          include: [db.Product]
        },
        db.Client
      ],
      order: [['date', 'DESC']]
    });
  } catch (error) {
    console.error(`Erro ao obter vendas no período de ${startDate} a ${endDate}:`, error);
    return [];
  }
};

export const getSalesByClient = async (clientId) => {
  try {
    return await db.Sale.findAll({
      where: { clientId },
      include: [
        {
          model: db.SaleItem,
          include: [db.Product]
        },
        db.Client
      ],
      order: [['date', 'DESC']]
    });
  } catch (error) {
    console.error(`Erro ao obter vendas do cliente com ID ${clientId}:`, error);
    return [];
  }
};

export const getSalesByPaymentMethod = async (paymentMethod) => {
  try {
    return await db.Sale.findAll({
      where: { paymentMethod },
      include: [
        {
          model: db.SaleItem,
          include: [db.Product]
        },
        db.Client
      ],
      order: [['date', 'DESC']]
    });
  } catch (error) {
    console.error(`Erro ao obter vendas com método de pagamento ${paymentMethod}:`, error);
    return [];
  }
};

export const searchSales = async (query) => {
  try {
    return await db.Sale.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { clientName: { [db.Sequelize.Op.like]: `%${query}%` } },
          { clientDocument: { [db.Sequelize.Op.like]: `%${query}%` } },
          { '$SaleItems.description$': { [db.Sequelize.Op.like]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: db.SaleItem,
          include: [db.Product]
        },
        db.Client
      ],
      order: [['date', 'DESC']]
    });
  } catch (error) {
    console.error(`Erro ao pesquisar vendas com query "${query}":`, error);
    return [];
  }
};

// Função para garantir que o banco de dados existe
export const ensureDB = async () => {
  try {
    const initialized = await initializeDatabase();
    if (!initialized) {
      throw new Error('Falha ao inicializar o banco de dados');
    }
    return db;
  } catch (error) {
    console.error('Erro ao garantir banco de dados:', error);
    return null;
  }
};

// Função para inicializar o fornecedor padrão
export const initializeDefaultVendor = async () => {
  try {
    const defaultVendor = await db.Vendor.findOne({
      where: { document: '0727887807' }
    });
    
    if (!defaultVendor) {
      await db.Vendor.create({
        name: 'Gleidison S. Oliveira',
        document: '0727887807'
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar fornecedor padrão:', error);
    return false;
  }
};

// Exportar todas as funções
export default {
  initializeDatabase,
  migrateFromIndexedDB,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  searchClients,
  getVendors,
  getVendorById,
  addVendor,
  updateVendor,
  deleteVendor,
  searchVendors,
  getSales,
  getSaleById,
  addSale,
  getSalesByDateRange,
  getSalesByClient,
  getSalesByPaymentMethod,
  searchSales,
  ensureDB,
  initializeDefaultVendor
};
