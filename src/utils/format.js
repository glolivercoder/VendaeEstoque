/**
 * Utilitários para formatação de valores, números, strings, etc.
 */

/**
 * Formata um valor para o formato de moeda brasileira (R$)
 * @param {number} value - Valor a ser formatado
 * @param {boolean} withSymbol - Se deve incluir o símbolo da moeda (padrão: true)
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @returns {string} Valor formatado como moeda
 */
export const formatCurrency = (value, withSymbol = true, decimals = 2) => {
  if (value === null || value === undefined) return withSymbol ? 'R$ 0,00' : '0,00';
  
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: withSymbol ? 'currency' : 'decimal',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value);
};

/**
 * Formata um número com separador de milhares
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 0)
 * @returns {string} Número formatado com separador de milhares
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0';
  
  const formatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(value);
};

/**
 * Formata um número como porcentagem
 * @param {number} value - Valor a ser formatado (ex: 0.25 para 25%)
 * @param {number} decimals - Número de casas decimais (padrão: 1)
 * @param {boolean} withSymbol - Se deve incluir o símbolo de porcentagem (padrão: true)
 * @returns {string} Valor formatado como porcentagem
 */
export const formatPercent = (value, decimals = 1, withSymbol = true) => {
  if (value === null || value === undefined) return withSymbol ? '0%' : '0';
  
  // Multiplica por 100 para converter para porcentagem
  const percentValue = value * 100;
  
  const formatted = formatNumber(percentValue, decimals);
  return withSymbol ? `${formatted}%` : formatted;
};

/**
 * Trunca um texto longo e adiciona reticências
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo (padrão: 50)
 * @returns {string} Texto truncado com reticências, se necessário
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Formata um CPF/CNPJ
 * @param {string} value - CPF ou CNPJ a ser formatado
 * @returns {string} CPF/CNPJ formatado
 */
export const formatDocument = (value) => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    // CPF: 000.000.000-00
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

/**
 * Formata um número de telefone brasileiro
 * @param {string} value - Número de telefone a ser formatado
 * @returns {string} Telefone formatado
 */
export const formatPhone = (value) => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

/**
 * Formata um CEP
 * @param {string} value - CEP a ser formatado
 * @returns {string} CEP formatado
 */
export const formatZipCode = (value) => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // CEP: 00000-000
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formata valor decimal com 2 casas, aceitando vírgula ou ponto como separador
 * @param {string} value - Valor a ser formatado
 * @returns {string} Valor formatado com 2 casas decimais
 */
export const formatDecimal = (value) => {
  if (!value) return '';
  
  // Converte para string, substitui vírgula por ponto e remove caracteres não numéricos exceto ponto
  const normalizedValue = String(value).replace(',', '.').replace(/[^\d.]/g, '');
  
  // Se não for um número válido, retorna vazio
  if (isNaN(parseFloat(normalizedValue))) return '';
  
  // Formata o número com 2 casas decimais e substitui ponto por vírgula
  return parseFloat(normalizedValue).toFixed(2).replace('.', ',');
};

/**
 * Transforma um valor formatado com vírgula em número decimal
 * @param {string} formattedValue - Valor formatado (ex: "1.234,56")
 * @returns {number} Valor numérico (ex: 1234.56)
 */
export const parseDecimal = (formattedValue) => {
  if (!formattedValue) return 0;
  
  // Remove separadores de milhar e substitui vírgula por ponto
  const normalizedValue = String(formattedValue)
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(normalizedValue) || 0;
};