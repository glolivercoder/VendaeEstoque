// Cache para dados de vendas
// Armazena dados em memória para reduzir o número de acessos ao IndexedDB

// Cache de dados
const salesCache = {
  data: null,
  lastUpdated: null
};

// Tempo de expiração do cache em milissegundos (2 minutos)
const CACHE_EXPIRATION = 2 * 60 * 1000;

// Verificar se o cache está válido
export const isSalesCacheValid = () => {
  if (!salesCache.lastUpdated) return false;
  
  const now = Date.now();
  return (now - salesCache.lastUpdated) < CACHE_EXPIRATION;
};

// Obter dados do cache
export const getSalesFromCache = () => {
  if (!isSalesCacheValid()) return null;
  return salesCache.data;
};

// Armazenar dados no cache
export const setSalesInCache = (data) => {
  salesCache.data = data;
  salesCache.lastUpdated = Date.now();
  return data;
};

// Invalidar o cache
export const invalidateSalesCache = () => {
  salesCache.data = null;
  salesCache.lastUpdated = null;
};
