/**
 * Utilitários para manipulação e formatação de datas
 */

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param {Date|string|number} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formata uma data e hora para o formato brasileiro (DD/MM/YYYY HH:MM)
 * @param {Date|string|number} date - Data e hora a ser formatada
 * @param {boolean} withSeconds - Se deve incluir segundos (padrão: false)
 * @returns {string} Data e hora formatada
 */
export const formatDateTime = (date, withSeconds = false) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  if (withSeconds) {
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Converte uma data no formato brasileiro (DD/MM/YYYY) para um objeto Date
 * @param {string} dateString - Data no formato DD/MM/YYYY
 * @returns {Date} Objeto Date
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Mês começa em 0
  const year = parseInt(parts[2], 10);
  
  return new Date(year, month, day);
};

/**
 * Retorna a data de início do mês atual
 * @returns {Date} Data de início do mês atual
 */
export const getStartOfMonth = () => {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Retorna a data de fim do mês atual
 * @returns {Date} Data de fim do m��s atual
 */
export const getEndOfMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Retorna a data de início da semana atual (domingo)
 * @returns {Date} Data de início da semana atual
 */
export const getStartOfWeek = () => {
  const date = new Date();
  const day = date.getDay(); // 0 = domingo, 1 = segunda, ...
  
  // Subtrai o número de dias para voltar para domingo
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  
  return date;
};

/**
 * Retorna a data de fim da semana atual (sábado)
 * @returns {Date} Data de fim da semana atual
 */
export const getEndOfWeek = () => {
  const date = new Date();
  const day = date.getDay(); // 0 = domingo, 1 = segunda, ...
  
  // Adiciona o número de dias para chegar a sábado
  date.setDate(date.getDate() + (6 - day));
  date.setHours(23, 59, 59, 999);
  
  return date;
};

/**
 * Retorna a data de início do dia atual
 * @returns {Date} Data de início do dia atual
 */
export const getStartOfDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Retorna a data de fim do dia atual
 * @returns {Date} Data de fim do dia atual
 */
export const getEndOfDay = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Retorna a data de início do ano atual
 * @returns {Date} Data de início do ano atual
 */
export const getStartOfYear = () => {
  const date = new Date();
  date.setMonth(0);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Retorna a data de fim do ano atual
 * @returns {Date} Data de fim do ano atual
 */
export const getEndOfYear = () => {
  const date = new Date();
  date.setMonth(11);
  date.setDate(31);
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Adiciona dias a uma data
 * @param {Date} date - Data base
 * @param {number} days - Número de dias a adicionar
 * @returns {Date} Nova data
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Adiciona meses a uma data
 * @param {Date} date - Data base
 * @param {number} months - Número de meses a adicionar
 * @returns {Date} Nova data
 */
export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Formata uma data relativa (hoje, ontem, etc.)
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const startOfDay = (d) => {
    const result = new Date(d);
    result.setHours(0, 0, 0, 0);
    return result;
  };
  
  // Verificar se é hoje
  if (startOfDay(dateObj).getTime() === startOfDay(now).getTime()) {
    return `Hoje, ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Verificar se é ontem
  if (startOfDay(dateObj).getTime() === startOfDay(yesterday).getTime()) {
    return `Ontem, ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Retornar data formatada
  return formatDateTime(dateObj);
};