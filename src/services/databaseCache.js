// Cache para melhorar o desempenho do banco de dados
// Armazena dados em memória para reduzir o número de acessos ao IndexedDB

// Cache de dados
const cache = {
  products: null,
  vendors: null,
  clients: null,
  salesData: null,
  lastUpdated: {
    products: null,
    vendors: null,
    clients: null,
    salesData: null
  }
};

// Tempo de expiração do cache em milissegundos (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Verificar se o cache está válido
export const isCacheValid = (type) => {
  if (!cache.lastUpdated[type]) return false;
  
  const now = Date.now();
  const lastUpdated = cache.lastUpdated[type];
  return (now - lastUpdated) < CACHE_EXPIRATION;
};

// Obter dados do cache
export const getFromCache = (type) => {
  if (!isCacheValid(type)) return null;
  return cache[type];
};

// Armazenar dados no cache
export const setInCache = (type, data) => {
  cache[type] = data;
  cache.lastUpdated[type] = Date.now();
  return data;
};

// Invalidar o cache
export const invalidateCache = (type) => {
  if (type) {
    cache[type] = null;
    cache.lastUpdated[type] = null;
  } else {
    // Invalidar todo o cache
    cache.products = null;
    cache.vendors = null;
    cache.clients = null;
    cache.salesData = null;
    cache.lastUpdated.products = null;
    cache.lastUpdated.vendors = null;
    cache.lastUpdated.clients = null;
    cache.lastUpdated.salesData = null;
  }
};

// Funções de acesso ao cache para cada tipo de dado
export const getProductsFromCache = () => getFromCache('products');
export const setProductsInCache = (data) => setInCache('products', data);
export const invalidateProductsCache = () => invalidateCache('products');

export const getVendorsFromCache = () => getFromCache('vendors');
export const setVendorsInCache = (data) => setInCache('vendors', data);
export const invalidateVendorsCache = () => invalidateCache('vendors');

export const getClientsFromCache = () => getFromCache('clients');
export const setClientsInCache = (data) => setInCache('clients', data);
export const invalidateClientsCache = () => invalidateCache('clients');

export const getSalesDataFromCache = () => getFromCache('salesData');
export const setSalesDataInCache = (data) => setInCache('salesData', data);
export const invalidateSalesDataCache = () => invalidateCache('salesData');
