const DB_NAME = 'estoqueDB';
const DB_VERSION = 4;

let db;
let dbInitPromise;

const initDB = () => {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Erro ao abrir banco de dados:', event.target.error);
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('Banco de dados aberto com sucesso');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('Atualizando estrutura do banco de dados...');

      // Delete existing object stores if they exist
      if (db.objectStoreNames.contains('products')) {
        db.deleteObjectStore('products');
      }
      if (db.objectStoreNames.contains('vendors')) {
        db.deleteObjectStore('vendors');
      }
      if (db.objectStoreNames.contains('clients')) {
        db.deleteObjectStore('clients');
      }
      if (db.objectStoreNames.contains('sales')) {
        db.deleteObjectStore('sales');
      }
      if (db.objectStoreNames.contains('saleItems')) {
        db.deleteObjectStore('saleItems');
      }

      // Create products store
      const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      productsStore.createIndex('description', 'description', { unique: true });
      productsStore.createIndex('sku', 'sku', { unique: false });

      // Create vendors store
      const vendorsStore = db.createObjectStore('vendors', { keyPath: 'id', autoIncrement: true });
      vendorsStore.createIndex('document', 'document', { unique: true });
      vendorsStore.createIndex('name', 'name', { unique: false });
      vendorsStore.createIndex('cnpj', 'cnpj', { unique: false });
      vendorsStore.createIndex('email', 'email', { unique: false });
      vendorsStore.createIndex('whatsapp', 'whatsapp', { unique: false });
      vendorsStore.createIndex('telegram', 'telegram', { unique: false });
      vendorsStore.createIndex('instagram', 'instagram', { unique: false });
      vendorsStore.createIndex('url', 'url', { unique: false });

      // Create clients store
      const clientsStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
      clientsStore.createIndex('document', 'document', { unique: true });
      clientsStore.createIndex('name', 'name', { unique: false });

      // Create sales store
      const salesStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
      salesStore.createIndex('vendorId', 'vendorId', { unique: false });
      salesStore.createIndex('clientId', 'clientId', { unique: false });
      salesStore.createIndex('saleDate', 'saleDate', { unique: false });

      // Create sale items store
      const saleItemsStore = db.createObjectStore('saleItems', { keyPath: 'id', autoIncrement: true });
      saleItemsStore.createIndex('saleId', 'saleId', { unique: false });

      console.log('Estrutura do banco de dados atualizada');
    };
  });

  return dbInitPromise;
};

// Define ensureDB before it's used by other functions
const ensureDB = async () => {
  if (!db) {
    try {
      await initDB();
    } catch (error) {
      console.error('Erro em ensureDB:', error);
      throw error;
    }
  }
  return db;
};

// Initialize database and add default vendor
const initializeDefaultVendor = async () => {
  try {
    // Primeiro garantimos que o banco de dados está inicializado
    const database = await ensureDB();
    if (!database) {
      console.error('Banco de dados não inicializado corretamente');
      return;
    }

    // Verificar se o fornecedor padrão já existe
    const defaultVendor = {
      name: 'Gleidison S. Oliveira',
      document: '0727887807',
      description: 'Fornecedor padrão do sistema',
      cnpj: '',
      email: '',
      whatsapp: '',
      telegram: '',
      instagram: '',
      url: '',
      createdAt: new Date()
    };

    // Verificar se o fornecedor já existe antes de tentar adicioná-lo
    const vendorExists = await checkVendorExists(defaultVendor.document);
    if (!vendorExists) {
      console.log('Adicionando fornecedor padrão...');
      try {
        await addVendor(defaultVendor);
        console.log('Fornecedor padrão adicionado com sucesso');
      } catch (error) {
        // Se o erro for porque o fornecedor já existe, ignoramos
        if (error.toString().includes('already exists')) {
          console.log('Fornecedor padrão já existe');
        } else {
          console.error('Erro ao adicionar fornecedor padrão:', error);
        }
      }
    } else {
      console.log('Fornecedor padrão já existe');
    }
  } catch (error) {
    console.error('Erro ao inicializar fornecedor padrão:', error);
    // Não lançamos o erro para não bloquear a inicialização do app
  }
};

// Função auxiliar para verificar se um fornecedor existe
const checkVendorExists = async (document) => {
  try {
    const vendors = await getVendors();
    return vendors.some(vendor => vendor.document === document);
  } catch (error) {
    console.error('Erro ao verificar fornecedor:', error);
    return false;
  }
};

export const getVendors = async () => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['vendors'], 'readonly');
    const store = transaction.objectStore('vendors');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const searchVendors = async (query) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['vendors'], 'readonly');
    const store = transaction.objectStore('vendors');
    const request = store.getAll();

    request.onsuccess = () => {
      const vendors = request.result;
      const filteredVendors = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(query.toLowerCase()) ||
        vendor.document.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filteredVendors.slice(0, 10));
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addVendor = async (vendor) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['vendors'], 'readwrite');
    const store = transaction.objectStore('vendors');

    const index = store.index('document');
    const checkRequest = index.get(vendor.document);

    checkRequest.onsuccess = () => {
      if (checkRequest.result) {
        reject(new Error('Document already exists'));
        return;
      }

      // Ensure all required fields exist
      const vendorData = {
        name: vendor.name || '',
        document: vendor.document || '',
        description: vendor.description || '',
        cnpj: vendor.cnpj || '',
        email: vendor.email || '',
        whatsapp: vendor.whatsapp || '',
        telegram: vendor.telegram || '',
        instagram: vendor.instagram || '',
        url: vendor.url || '',
        products: vendor.products || [],
        createdAt: new Date()
      };

      const addRequest = store.add(vendorData);

      addRequest.onsuccess = () => {
        resolve(addRequest.result);
      };

      addRequest.onerror = () => {
        reject(addRequest.error);
      };
    };

    checkRequest.onerror = () => {
      reject(checkRequest.error);
    };
  });
};

export const updateVendor = async (vendor) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['vendors'], 'readwrite');
    const store = transaction.objectStore('vendors');

    // First get the existing vendor
    const getRequest = store.get(vendor.id);

    getRequest.onsuccess = () => {
      const existingVendor = getRequest.result;
      if (!existingVendor) {
        reject(new Error('Vendor not found'));
        return;
      }

      // Check if document is being changed and if it already exists
      if (vendor.document && vendor.document !== existingVendor.document) {
        const index = store.index('document');
        const checkRequest = index.get(vendor.document);

        checkRequest.onsuccess = () => {
          if (checkRequest.result && checkRequest.result.id !== vendor.id) {
            reject(new Error('Document already exists for another vendor'));
            return;
          }

          // Continue with update after document check
          continueUpdate();
        };

        checkRequest.onerror = () => {
          reject(checkRequest.error);
        };
      } else {
        // No document change, proceed with update
        continueUpdate();
      }

      function continueUpdate() {
        // Merge existing data with updates
        const updatedData = {
          ...existingVendor,
          name: vendor.name !== undefined ? vendor.name : existingVendor.name,
          document: vendor.document !== undefined ? vendor.document : existingVendor.document,
          description: vendor.description !== undefined ? vendor.description : existingVendor.description,
          cnpj: vendor.cnpj !== undefined ? vendor.cnpj : existingVendor.cnpj,
          email: vendor.email !== undefined ? vendor.email : existingVendor.email,
          whatsapp: vendor.whatsapp !== undefined ? vendor.whatsapp : existingVendor.whatsapp,
          telegram: vendor.telegram !== undefined ? vendor.telegram : existingVendor.telegram,
          instagram: vendor.instagram !== undefined ? vendor.instagram : existingVendor.instagram,
          url: vendor.url !== undefined ? vendor.url : existingVendor.url,
          products: vendor.products !== undefined ? vendor.products : existingVendor.products,
          updatedAt: new Date()
        };

        // Update the vendor
        const updateRequest = store.put(updatedData);

        updateRequest.onsuccess = () => {
          resolve(updateRequest.result);
        };

        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      }
    };

    getRequest.onerror = () => {
      reject(getRequest.error);
    };
  });
};

export const deleteVendor = async (id) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['vendors'], 'readwrite');
    const store = transaction.objectStore('vendors');

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getClients = async () => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readonly');
    const store = transaction.objectStore('clients');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const searchClients = async (query) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readonly');
    const store = transaction.objectStore('clients');
    const request = store.getAll();

    request.onsuccess = () => {
      const clients = request.result;
      const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.document.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filteredClients.slice(0, 10));
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addClient = async (client) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');

    const index = store.index('document');
    const checkRequest = index.get(client.document);

    checkRequest.onsuccess = () => {
      if (checkRequest.result) {
        reject(new Error('Document already exists'));
        return;
      }

      const addRequest = store.add({
        ...client,
        createdAt: new Date()
      });

      addRequest.onsuccess = () => {
        resolve(addRequest.result);
      };

      addRequest.onerror = () => {
        reject(addRequest.error);
      };
    };

    checkRequest.onerror = () => {
      reject(checkRequest.error);
    };
  });
};

export const addSale = async (sale) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sales', 'saleItems'], 'readwrite');
    const salesStore = transaction.objectStore('sales');
    const saleItemsStore = transaction.objectStore('saleItems');

    try {
      const saleData = {
        vendorId: sale.vendorId,
        clientId: sale.clientId,
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        saleDate: new Date()
      };

      const saleRequest = salesStore.add(saleData);

      saleRequest.onsuccess = () => {
        const saleId = saleRequest.result;

        const itemPromises = sale.items.map(item => {
          return new Promise((resolveItem, rejectItem) => {
            const itemRequest = saleItemsStore.add({
              saleId,
              description: item.description,
              quantity: item.quantity,
              price: item.price
            });

            itemRequest.onsuccess = () => resolveItem();
            itemRequest.onerror = () => rejectItem(itemRequest.error);
          });
        });

        Promise.all(itemPromises)
          .then(() => resolve(saleId))
          .catch(error => reject(error));
      };

      saleRequest.onerror = () => {
        reject(saleRequest.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getProducts = async () => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const addProduct = async (product) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    const index = store.index('description');
    const checkRequest = index.get(product.description);

    checkRequest.onsuccess = () => {
      if (checkRequest.result) {
        reject(new Error('Product already exists'));
        return;
      }

      const addRequest = store.add({
        ...product,
        createdAt: new Date()
      });

      addRequest.onsuccess = () => {
        resolve(addRequest.result);
      };

      addRequest.onerror = () => {
        reject(addRequest.error);
      };
    };

    checkRequest.onerror = () => {
      reject(checkRequest.error);
    };
  });
};

export const updateProduct = async (product) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    const request = store.put(product);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteProduct = async (productId) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    const request = store.delete(productId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const deleteClient = async (clientId) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');
    const request = store.delete(clientId);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const updateClient = async (client) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');
    const request = store.put(client);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export {
  ensureDB,
  initializeDefaultVendor
};