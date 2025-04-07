const DB_NAME = 'estoqueDB';
const DB_VERSION = 5; // Incrementado para garantir a atualização

// Função para garantir que o banco de dados está inicializado
export const ensureDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      console.log(`Atualizando banco de dados da versão ${oldVersion} para ${DB_VERSION}`);

      // Criar ou atualizar as tabelas conforme necessário
      if (oldVersion < 1) {
        // Versão inicial - criar todas as tabelas
        console.log('Criando estrutura inicial do banco de dados');

        // Create products store
        const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        productsStore.createIndex('barcode', 'barcode', { unique: false });
        productsStore.createIndex('description', 'description', { unique: false });
        productsStore.createIndex('category', 'category', { unique: false });

        // Create clients store
        const clientsStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
        clientsStore.createIndex('cpf', 'cpf', { unique: true });
        clientsStore.createIndex('name', 'name', { unique: false });

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
      }

      if (oldVersion < 2) {
        // Atualização para versão 2 - adicionar novos campos ou índices
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
          productsStore.createIndex('barcode', 'barcode', { unique: false });
          productsStore.createIndex('description', 'description', { unique: false });
          productsStore.createIndex('category', 'category', { unique: false });
        }

        // Adicionar campo de imagem aos produtos se não existir
        const productsStore = request.transaction.objectStore('products');
        if (!productsStore.indexNames.contains('imageUrl')) {
          productsStore.createIndex('imageUrl', 'imageUrl', { unique: false });
        }
      }

      if (oldVersion < 3) {
        // Atualização para versão 3 - adicionar novos campos ou índices
        if (db.objectStoreNames.contains('products')) {
          const productsStore = request.transaction.objectStore('products');
          if (!productsStore.indexNames.contains('vendorId')) {
            productsStore.createIndex('vendorId', 'vendorId', { unique: false });
          }
        }
      }

      if (oldVersion < 4) {
        // Atualização para versão 4 - adicionar campos para fornecedores
        if (db.objectStoreNames.contains('vendors')) {
          const vendorsStore = request.transaction.objectStore('vendors');

          // Adicionar novos índices para fornecedores
          if (!vendorsStore.indexNames.contains('cnpj')) {
            vendorsStore.createIndex('cnpj', 'cnpj', { unique: false });
          }
          if (!vendorsStore.indexNames.contains('email')) {
            vendorsStore.createIndex('email', 'email', { unique: false });
          }
          if (!vendorsStore.indexNames.contains('whatsapp')) {
            vendorsStore.createIndex('whatsapp', 'whatsapp', { unique: false });
          }
          if (!vendorsStore.indexNames.contains('telegram')) {
            vendorsStore.createIndex('telegram', 'telegram', { unique: false });
          }
          if (!vendorsStore.indexNames.contains('instagram')) {
            vendorsStore.createIndex('instagram', 'instagram', { unique: false });
          }
          if (!vendorsStore.indexNames.contains('url')) {
            vendorsStore.createIndex('url', 'url', { unique: false });
          }
        }
      }

      if (oldVersion < 5) {
        // Atualização para versão 5 - corrigir problemas de consistência
        console.log('Aplicando correções de consistência na versão 5');

        // Verificar e criar object stores se não existirem
        if (!db.objectStoreNames.contains('products')) {
          console.log('Recriando object store products');
          const productsStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
          productsStore.createIndex('barcode', 'barcode', { unique: false });
          productsStore.createIndex('description', 'description', { unique: false });
          productsStore.createIndex('category', 'category', { unique: false });
          productsStore.createIndex('imageUrl', 'imageUrl', { unique: false });
          productsStore.createIndex('vendorId', 'vendorId', { unique: false });
        }

        if (!db.objectStoreNames.contains('clients')) {
          console.log('Recriando object store clients');
          const clientsStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
          clientsStore.createIndex('cpf', 'cpf', { unique: true });
          clientsStore.createIndex('name', 'name', { unique: false });
        }

        if (!db.objectStoreNames.contains('vendors')) {
          console.log('Recriando object store vendors');
          const vendorsStore = db.createObjectStore('vendors', { keyPath: 'id', autoIncrement: true });
          vendorsStore.createIndex('document', 'document', { unique: true });
          vendorsStore.createIndex('name', 'name', { unique: false });
          vendorsStore.createIndex('cnpj', 'cnpj', { unique: false });
          vendorsStore.createIndex('email', 'email', { unique: false });
          vendorsStore.createIndex('whatsapp', 'whatsapp', { unique: false });
          vendorsStore.createIndex('telegram', 'telegram', { unique: false });
          vendorsStore.createIndex('instagram', 'instagram', { unique: false });
          vendorsStore.createIndex('url', 'url', { unique: false });
        }
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log('Banco de dados aberto com sucesso');

      // Verificar se todas as object stores existem
      const storeNames = ['products', 'clients', 'vendors'];
      const missingStores = storeNames.filter(store => !db.objectStoreNames.contains(store));

      if (missingStores.length > 0) {
        console.warn(`Algumas object stores estão faltando: ${missingStores.join(', ')}`);
        console.warn('Fechando e reabrindo o banco de dados com uma versão maior');

        // Fechar o banco de dados atual
        db.close();

        // Incrementar a versão e reabrir
        const newVersion = DB_VERSION + 1;
        localStorage.setItem('dbVersion', newVersion);

        // Recarregar a página para forçar a atualização do banco de dados
        window.location.reload();
        return;
      }

      resolve(db);
    };

    request.onerror = (event) => {
      console.error('Erro ao abrir o banco de dados:', event.target.error);
      reject(event.target.error);
    };
  });
};

// Inicializar fornecedor padrão
export const initializeDefaultVendor = async () => {
  try {
    const db = await ensureDB();

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

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['vendors'], 'readwrite');
      const store = transaction.objectStore('vendors');

      // Verificar se já existe um fornecedor com este documento
      const index = store.index('document');
      const request = index.get(defaultVendor.document);

      request.onsuccess = () => {
        if (!request.result) {
          // Se não existir, adicionar
          const addRequest = store.add(defaultVendor);

          addRequest.onsuccess = () => {
            resolve(true);
          };

          addRequest.onerror = () => {
            reject(addRequest.error);
          };
        } else {
          // Se já existir, não fazer nada
          resolve(false);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error initializing default vendor:', error);
    throw error;
  }
};

// Obter todos os produtos
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

// Adicionar um novo produto
export const addProduct = async (product) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    const request = store.add({
      ...product,
      createdAt: new Date()
    });

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Atualizar um produto existente
export const updateProduct = async (product) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    const request = store.put({
      ...product,
      updatedAt: new Date()
    });

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Excluir um produto
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

// Obter todos os fornecedores
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

// Adicionar um novo fornecedor
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

export const updateVendor = async (id, updatedVendor) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['vendors'], 'readwrite');
    const store = transaction.objectStore('vendors');

    // First get the existing vendor
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existingVendor = getRequest.result;
      if (!existingVendor) {
        reject(new Error('Vendor not found'));
        return;
      }

      // Merge existing data with updates
      const updatedData = {
        ...existingVendor,
        name: updatedVendor.name !== undefined ? updatedVendor.name : existingVendor.name,
        description: updatedVendor.description !== undefined ? updatedVendor.description : existingVendor.description,
        cnpj: updatedVendor.cnpj !== undefined ? updatedVendor.cnpj : existingVendor.cnpj,
        email: updatedVendor.email !== undefined ? updatedVendor.email : existingVendor.email,
        whatsapp: updatedVendor.whatsapp !== undefined ? updatedVendor.whatsapp : existingVendor.whatsapp,
        telegram: updatedVendor.telegram !== undefined ? updatedVendor.telegram : existingVendor.telegram,
        instagram: updatedVendor.instagram !== undefined ? updatedVendor.instagram : existingVendor.instagram,
        url: updatedVendor.url !== undefined ? updatedVendor.url : existingVendor.url,
        products: updatedVendor.products !== undefined ? updatedVendor.products : existingVendor.products,
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

// Obter todos os clientes
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

// Adicionar um novo cliente
export const addClient = async (client) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');

    // Verificar se já existe um cliente com este CPF
    if (client.cpf) {
      const index = store.index('cpf');
      const checkRequest = index.get(client.cpf);

      checkRequest.onsuccess = () => {
        if (checkRequest.result) {
          reject(new Error('CPF already exists'));
          return;
        }

        // Se não existir, adicionar
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
    } else {
      // Se não tiver CPF, adicionar diretamente
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
    }
  });
};

// Atualizar um cliente existente
export const updateClient = async (client) => {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['clients'], 'readwrite');
    const store = transaction.objectStore('clients');

    // Verificar se o CPF foi alterado e se já existe outro cliente com este CPF
    if (client.cpf) {
      const index = store.index('cpf');
      const checkRequest = index.get(client.cpf);

      checkRequest.onsuccess = () => {
        const existingClient = checkRequest.result;

        if (existingClient && existingClient.id !== client.id) {
          reject(new Error('CPF already exists for another client'));
          return;
        }

        // Se não existir ou for o mesmo cliente, atualizar
        const updateRequest = store.put({
          ...client,
          updatedAt: new Date()
        });

        updateRequest.onsuccess = () => {
          resolve(updateRequest.result);
        };

        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      };

      checkRequest.onerror = () => {
        reject(checkRequest.error);
      };
    } else {
      // Se não tiver CPF, atualizar diretamente
      const updateRequest = store.put({
        ...client,
        updatedAt: new Date()
      });

      updateRequest.onsuccess = () => {
        resolve(updateRequest.result);
      };

      updateRequest.onerror = () => {
        reject(updateRequest.error);
      };
    }
  });
};

// Excluir um cliente
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
