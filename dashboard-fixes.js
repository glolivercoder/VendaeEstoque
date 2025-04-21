/**
 * Este arquivo contém implementações para corrigir problemas de loop e travamentos
 * no dashboard da aba "Relatório Completo".
 */

import { useMemo, useCallback, useState, useEffect } from 'react';

/**
 * Hook otimizado para filtrar dados de vendas
 * @param {Array} salesData - Dados de vendas
 * @param {String} reportType - Tipo de relatório (dia, mês, período)
 * @param {String} startDate - Data inicial
 * @param {String} endDate - Data final
 * @returns {Array} Dados filtrados
 */
export const useFilteredSalesData = (salesData, reportType, startDate, endDate) => {
  return useMemo(() => {
    console.log("Calculando dados filtrados...");
    
    if (!salesData || salesData.length === 0) {
      return [];
    }
    
    let filtered = [...salesData];
    
    // Filtrar por tipo de relatório
    if (reportType === 'day') {
      filtered = filtered.filter(sale => sale.date === startDate);
    } else if (reportType === 'month') {
      const [day, month, year] = startDate.split('/');
      filtered = filtered.filter(sale => {
        try {
          const [saleDay, saleMonth, saleYear] = (sale.date || '').split('/');
          return parseInt(saleYear) === parseInt(year) && parseInt(saleMonth) === parseInt(month);
        } catch (e) {
          console.error("Erro ao processar data:", sale.date, e);
          return false;
        }
      });
    } else if (reportType === 'period') {
      filtered = filtered.filter(sale => {
        try {
          // Converter datas para comparação
          const saleDate = convertBrazilianDateToDate(sale.date);
          const start = convertBrazilianDateToDate(startDate);
          const end = convertBrazilianDateToDate(endDate);
          
          return saleDate >= start && saleDate <= end;
        } catch (e) {
          console.error("Erro ao processar data para período:", sale.date, e);
          return false;
        }
      });
    }
    
    return filtered;
  }, [salesData, reportType, startDate, endDate]);
};

/**
 * Função auxiliar para converter data no formato brasileiro para objeto Date
 * @param {String} brazilianDate - Data no formato DD/MM/YYYY
 * @returns {Date} Objeto Date
 */
const convertBrazilianDateToDate = (brazilianDate) => {
  if (!brazilianDate) return new Date(0);
  
  const [day, month, year] = brazilianDate.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/**
 * Hook para calcular dados de gráficos de forma otimizada
 * @param {Array} filteredData - Dados filtrados
 * @param {Array} items - Itens do estoque
 * @returns {Object} Dados para gráficos
 */
export const useChartData = (filteredData, items) => {
  return useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        pieData: {
          labels: ['Sem dados'],
          datasets: [{
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderWidth: 1
          }]
        },
        barData: {
          labels: ['Sem dados'],
          datasets: [{
            label: 'Sem dados',
            data: [0],
            backgroundColor: '#e5e7eb',
            borderWidth: 1
          }]
        }
      };
    }
    
    // Calcular dados para gráfico de pizza (vendas por categoria)
    const categorySales = {};
    filteredData.forEach(sale => {
      const product = items.find(item => item.description === sale.product);
      const category = product?.category || 'Diversos';
      
      if (!categorySales[category]) {
        categorySales[category] = 0;
      }
      categorySales[category] += sale.total;
    });
    
    const pieData = {
      labels: Object.keys(categorySales),
      datasets: [{
        data: Object.values(categorySales),
        backgroundColor: Object.keys(categorySales).map((_, index) => 
          `hsl(${index * 137.5 % 360}, 70%, 60%)`
        ),
        borderWidth: 1
      }]
    };
    
    // Calcular dados para gráfico de barras (produtos mais vendidos)
    const productSales = {};
    filteredData.forEach(sale => {
      if (!productSales[sale.product]) {
        productSales[sale.product] = 0;
      }
      productSales[sale.product] += sale.quantity;
    });
    
    // Ordenar por quantidade vendida e pegar os 5 mais vendidos
    const topProducts = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    const barData = {
      labels: topProducts.map(([product]) => product),
      datasets: [{
        label: 'Quantidade Vendida',
        data: topProducts.map(([, quantity]) => quantity),
        backgroundColor: topProducts.map((_, index) => 
          `hsl(${index * 137.5 % 360}, 70%, 60%)`
        ),
        borderWidth: 1
      }]
    };
    
    return { pieData, barData };
  }, [filteredData, items]);
};

/**
 * Hook para verificar integridade dos dados de forma otimizada
 * @param {Array} salesData - Dados de vendas
 * @param {Array} items - Itens do estoque
 * @param {Function} setSalesData - Função para atualizar dados de vendas
 * @param {Function} setItems - Função para atualizar itens
 * @returns {Function} Função para verificar integridade
 */
export const useDataIntegrityCheck = (salesData, items, setSalesData, setItems) => {
  const [isChecking, setIsChecking] = useState(false);
  
  const checkIntegrity = useCallback(() => {
    if (isChecking) return { salesDataFixed: false, itemsFixed: false };
    
    setIsChecking(true);
    console.log("Verificando integridade dos dados...");
    
    // Verificar dados de vendas
    let salesDataFixed = false;
    const fixedSalesData = salesData.map(sale => {
      let needsFix = false;
      const fixedSale = { ...sale };
      
      // Verificar se a data existe
      if (!sale.date) {
        fixedSale.date = formatDateToBrazilian(new Date().toISOString().split('T')[0]);
        needsFix = true;
      }
      
      // Verificar se o total existe e é um número
      if (typeof sale.total !== 'number' || isNaN(sale.total)) {
        fixedSale.total = 0;
        needsFix = true;
      }
      
      // Verificar se a quantidade existe e é um número
      if (typeof sale.quantity !== 'number' || isNaN(sale.quantity)) {
        fixedSale.quantity = 0;
        needsFix = true;
      }
      
      if (needsFix) {
        salesDataFixed = true;
        return fixedSale;
      }
      
      return sale;
    });
    
    // Atualizar os dados de vendas se foram corrigidos
    if (salesDataFixed) {
      console.log("Dados de vendas corrigidos:", fixedSalesData.length, "registros");
      setSalesData(fixedSalesData);
    }
    
    // Verificar dados de produtos
    let itemsFixed = false;
    const fixedItems = items.map(item => {
      let needsFix = false;
      const fixedItem = { ...item };
      
      // Verificar se a quantidade existe e é um número
      if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
        fixedItem.quantity = 0;
        needsFix = true;
      }
      
      // Verificar se o preço existe e é um número
      if (typeof item.price !== 'number' || isNaN(item.price)) {
        fixedItem.price = 0;
        needsFix = true;
      }
      
      if (needsFix) {
        itemsFixed = true;
        return fixedItem;
      }
      
      return item;
    });
    
    // Atualizar os dados de produtos se foram corrigidos
    if (itemsFixed) {
      console.log("Dados de produtos corrigidos:", fixedItems.length, "registros");
      setItems(fixedItems);
    }
    
    setIsChecking(false);
    return { salesDataFixed, itemsFixed };
  }, [salesData, items, setSalesData, setItems, isChecking]);
  
  return checkIntegrity;
};

/**
 * Componente otimizado para o Dashboard
 */
export const OptimizedDashboard = React.memo(({ 
  showDashboard, 
  setShowDashboard, 
  items, 
  salesData 
}) => {
  // Implementação otimizada do Dashboard
  // ...
});

/**
 * Função auxiliar para formatar data no formato brasileiro
 * @param {String} isoDate - Data no formato ISO (YYYY-MM-DD)
 * @returns {String} Data no formato brasileiro (DD/MM/YYYY)
 */
const formatDateToBrazilian = (isoDate) => {
  if (!isoDate) return '';
  
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Hook para paginação de dados
 * @param {Array} data - Dados a serem paginados
 * @param {Number} itemsPerPage - Itens por página
 * @returns {Object} Dados paginados e funções de controle
 */
export const usePagination = (data, itemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  
  const paginatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);
  
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  return {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage
  };
};
