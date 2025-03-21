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
