const { Sequelize } = require('sequelize');
const config = require('./config');

// Importar modelos
const ProductModel = require('./models/Product');
const ClientModel = require('./models/Client');
const VendorModel = require('./models/Vendor');
const SaleModel = require('./models/Sale');
const SaleItemModel = require('./models/SaleItem');

// Determinar ambiente
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Inicializar Sequelize
const sequelize = new Sequelize(dbConfig);

// Inicializar modelos
const Product = ProductModel(sequelize);
const Client = ClientModel(sequelize);
const Vendor = VendorModel(sequelize);
const Sale = SaleModel(sequelize);
const SaleItem = SaleItemModel(sequelize);

// Definir associações
Vendor.hasMany(Product, { foreignKey: 'vendorId' });
Product.belongsTo(Vendor, { foreignKey: 'vendorId' });

Client.hasMany(Sale, { foreignKey: 'clientId' });
Sale.belongsTo(Client, { foreignKey: 'clientId' });

Sale.hasMany(SaleItem, { foreignKey: 'saleId' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });

Product.hasMany(SaleItem, { foreignKey: 'productId' });
SaleItem.belongsTo(Product, { foreignKey: 'productId' });

// Exportar modelos e conexão
const db = {
  sequelize,
  Sequelize,
  Product,
  Client,
  Vendor,
  Sale,
  SaleItem
};

// Função para inicializar o banco de dados
db.initialize = async () => {
  try {
    // Sincronizar modelos com o banco de dados
    await sequelize.sync();
    console.log('Banco de dados sincronizado com sucesso');

    // Verificar se existe o fornecedor padrão
    const defaultVendor = await Vendor.findOne({
      where: { document: '0727887807' }
    });

    // Se não existir, criar o fornecedor padrão
    if (!defaultVendor) {
      await Vendor.create({
        name: 'Gleidison S. Oliveira',
        document: '0727887807'
      });
      console.log('Fornecedor padrão criado com sucesso');
    }

    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
};

// Função para migrar dados do IndexedDB para o banco de dados relacional
db.migrateFromIndexedDB = async (indexedDBData) => {
  try {
    // Iniciar transação
    const transaction = await sequelize.transaction();

    try {
      // Migrar produtos
      if (indexedDBData.products && indexedDBData.products.length > 0) {
        for (const product of indexedDBData.products) {
          await Product.create({
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            sold: product.sold || 0,
            image: product.image,
            mediaType: product.mediaType || 'image',
            additionalImages: product.additionalImages || [],
            additionalMediaTypes: product.additionalMediaTypes || [],
            itemDescription: product.itemDescription,
            category: product.category || 'Todos',
            expirationDate: product.expirationDate,
            checked: product.checked || false,
            sku: product.sku,
            gtin: product.gtin,
            ncm: product.ncm,
            links: product.links || [],
            vendorId: product.vendor?.id
          }, { transaction });
        }
      }

      // Migrar clientes
      if (indexedDBData.clients && indexedDBData.clients.length > 0) {
        for (const client of indexedDBData.clients) {
          await Client.create({
            name: client.name,
            rg: client.rg,
            cpf: client.cpf,
            document: client.document,
            fatherName: client.fatherName,
            motherName: client.motherName,
            birthDate: client.birthDate,
            issueDate: client.issueDate,
            birthPlace: client.birthPlace,
            whatsapp: client.whatsapp,
            email: client.email,
            cep: client.cep,
            address: client.address,
            neighborhood: client.neighborhood,
            city: client.city,
            state: client.state
          }, { transaction });
        }
      }

      // Migrar fornecedores
      if (indexedDBData.vendors && indexedDBData.vendors.length > 0) {
        for (const vendor of indexedDBData.vendors) {
          await Vendor.create({
            name: vendor.name,
            document: vendor.document,
            description: vendor.description,
            cnpj: vendor.cnpj,
            url: vendor.url,
            email: vendor.email,
            whatsapp: vendor.whatsapp,
            telegram: vendor.telegram,
            instagram: vendor.instagram
          }, { transaction });
        }
      }

      // Migrar vendas
      if (indexedDBData.sales && indexedDBData.sales.length > 0) {
        for (const sale of indexedDBData.sales) {
          // Criar venda
          const newSale = await Sale.create({
            date: sale.date,
            time: sale.time,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            clientName: typeof sale.client === 'string' ? sale.client : sale.client?.name,
            clientDocument: typeof sale.client === 'object' ? sale.client?.document : null
          }, { transaction });

          // Criar itens da venda
          if (sale.items && Array.isArray(sale.items)) {
            for (const item of sale.items) {
              await SaleItem.create({
                saleId: newSale.id,
                productId: item.id,
                description: item.description,
                price: item.price,
                quantity: item.quantity || 1,
                total: item.price * (item.quantity || 1)
              }, { transaction });
            }
          } else if (sale.product) {
            // Para vendas antigas que têm apenas um produto
            await SaleItem.create({
              saleId: newSale.id,
              description: sale.product,
              price: sale.price || 0,
              quantity: sale.quantity || 1,
              total: sale.total
            }, { transaction });
          }
        }
      }

      // Confirmar transação
      await transaction.commit();
      return true;
    } catch (error) {
      // Reverter transação em caso de erro
      await transaction.rollback();
      console.error('Erro durante a migração de dados:', error);
      return false;
    }
  } catch (error) {
    console.error('Erro ao iniciar transação para migração:', error);
    return false;
  }
};

module.exports = db;
