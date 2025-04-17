// Utility functions for date formatting and conversion

// Get current date in ISO format (YYYY-MM-DD)
export const getCurrentDateISO = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Convert ISO date to Brazilian format (DD/MM/YYYY)
export const formatDateToBrazilian = (isoDate) => {
  if (!isoDate) return '';
  try {
    const parts = isoDate.split('-');
    if (parts.length !== 3) return '';

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Erro ao formatar data:", e);
    return '';
  }
};

// Convert Brazilian date format (DD/MM/YYYY) to ISO (YYYY-MM-DD)
export const formatDateToISO = (brDate) => {
  if (!brDate || !brDate.includes('/')) return getCurrentDateISO();
  try {
    const parts = brDate.split('/');
    if (parts.length !== 3) return getCurrentDateISO();

    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    // Verificar se os valores são números válidos
    if (isNaN(parseInt(day)) || isNaN(parseInt(month)) || isNaN(parseInt(year))) {
      return getCurrentDateISO();
    }

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch (e) {
    console.error("Erro ao converter data:", e);
    return getCurrentDateISO();
  }
};

// Fix date format to Brazilian format (DD/MM/YYYY)
export const fixDateFormat = (date) => {
  if (!date) return '';

  try {
    // Verificar se a data já está no formato brasileiro (DD/MM/YYYY)
    if (typeof date === 'string' && date.includes('/') && date.split('/').length === 3) {
      const [day, month, year] = date.split('/');
      // Validar se os componentes são números válidos
      if (!isNaN(parseInt(day)) && !isNaN(parseInt(month)) && !isNaN(parseInt(year))) {
        // Verificar se o dia e mês estão dentro dos limites válidos
        if (parseInt(day) >= 1 && parseInt(day) <= 31 && parseInt(month) >= 1 && parseInt(month) <= 12) {
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
      }
    }

    // Tentar converter a partir de um objeto Date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error("Data inválida:", date);
      return '';
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Erro ao corrigir formato de data:", e);
    return '';
  }
};

// Validate date range and return error message if invalid
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 'Ambas as datas devem ser fornecidas';
  }

  try {
    // Converter para objetos Date
    let startObj, endObj;

    // Verificar se as datas estão no formato brasileiro
    if (typeof startDate === 'string' && startDate.includes('/')) {
      const [startDay, startMonth, startYear] = startDate.split('/');
      startObj = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
    } else {
      startObj = new Date(startDate);
    }

    if (typeof endDate === 'string' && endDate.includes('/')) {
      const [endDay, endMonth, endYear] = endDate.split('/');
      endObj = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
    } else {
      endObj = new Date(endDate);
    }

    // Verificar se as datas são válidas
    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
      return 'Datas inválidas';
    }

    // Verificar se a data inicial é posterior à data final
    if (startObj > endObj) {
      return 'A data inicial não pode ser posterior à data final';
    }

    // Verificar se o intervalo é maior que 1 ano
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    if (endObj - startObj > oneYearInMs) {
      return 'O intervalo entre as datas não pode ser maior que 1 ano';
    }

    return null; // Sem erros
  } catch (e) {
    console.error("Erro ao validar intervalo de datas:", e);
    return 'Erro ao validar datas';
  }
};
