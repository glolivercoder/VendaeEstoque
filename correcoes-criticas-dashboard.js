/**
 * Este arquivo contém correções críticas para os problemas de loop e travamentos
 * no dashboard da aba "Relatório Completo".
 * 
 * Estas correções podem ser aplicadas imediatamente para resolver os problemas
 * mais urgentes, enquanto as otimizações completas são implementadas.
 */

// ============================================================================
// CORREÇÃO 1: Otimização da função getFilteredSalesData
// ============================================================================

// Substitua a implementação atual por esta versão otimizada:
const getFilteredSalesData = useCallback(() => {
  console.log("Filtrando vendas para:", reportType, reportStartDate, reportEndDate);
  
  // Verificar se há dados para filtrar
  if (!salesData || salesData.length === 0) {
    return [];
  }
  
  let filtered = [...salesData];
  
  try {
    // Filtrar por tipo de relatório
    if (reportType === 'day') {
      filtered = filtered.filter(sale => sale.date === reportStartDate);
    } else if (reportType === 'month') {
      const [day, month, year] = reportStartDate.split('/');
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
      // Converter datas para objetos Date para comparação
      const startParts = reportStartDate.split('/');
      const endParts = reportEndDate.split('/');
      
      if (startParts.length !== 3 || endParts.length !== 3) {
        console.error("Formato de data inválido:", reportStartDate, reportEndDate);
        return [];
      }
      
      const startDate = new Date(
        parseInt(startParts[2]), 
        parseInt(startParts[1]) - 1, 
        parseInt(startParts[0])
      );
      
      const endDate = new Date(
        parseInt(endParts[2]), 
        parseInt(endParts[1]) - 1, 
        parseInt(endParts[0])
      );
      
      filtered = filtered.filter(sale => {
        try {
          if (!sale.date) return false;
          
          const saleParts = sale.date.split('/');
          if (saleParts.length !== 3) return false;
          
          const saleDate = new Date(
            parseInt(saleParts[2]), 
            parseInt(saleParts[1]) - 1, 
            parseInt(saleParts[0])
          );
          
          return saleDate >= startDate && saleDate <= endDate;
        } catch (e) {
          console.error("Erro ao processar data para período:", sale.date, e);
          return false;
        }
      });
    }
    
    return filtered;
  } catch (error) {
    console.error("Erro ao filtrar vendas:", error);
    return [];
  }
}, [salesData, reportType, reportStartDate, reportEndDate]);

// ============================================================================
// CORREÇÃO 2: Remover o loop de atualização forçada do dashboard
// ============================================================================

// Remover este useEffect problemático:
/*
useEffect(() => {
  if (showDashboard) {
    console.log("Dados de vendas alterados, atualizando dashboards");
    // Forçar atualização dos gráficos
    setShowDashboard(false);
    setTimeout(() => setShowDashboard(true), 100);
  }
}, [salesData, items]);
*/

// Substituir pelo seguinte código:
const [dashboardKey, setDashboardKey] = useState(0);

useEffect(() => {
  if (showDashboard) {
    console.log("Dados de vendas alterados, atualizando dashboards");
    // Usar uma chave para forçar a recriação do componente sem loops
    setDashboardKey(prev => prev + 1);
  }
}, [salesData, items, showDashboard]);

// E na renderização do Dashboard:
{showDashboard && (
  <Dashboard
    key={dashboardKey}
    showDashboard={showDashboard}
    setShowDashboard={setShowDashboard}
    items={items}
    salesData={salesData}
  />
)}

// ============================================================================
// CORREÇÃO 3: Otimizar o botão de atualização manual
// ============================================================================

// Substituir o botão atual por:
<button
  onClick={() => {
    console.log("Atualizando dashboards manualmente");
    
    // Verificar a integridade dos dados
    const { salesDataFixed, itemsFixed } = checkDataIntegrity();
    
    // Atualizar a chave do dashboard para forçar a recriação
    setDashboardKey(prev => prev + 1);
    
    // Mostrar mensagem de sucesso
    if (salesDataFixed || itemsFixed) {
      alert("Dados corrigidos e dashboards atualizados com sucesso!");
    } else {
      alert("Dashboards atualizados com sucesso!");
    }
  }}
  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
>
  Atualizar Dashboard
</button>

// ============================================================================
// CORREÇÃO 4: Otimizar a função checkDataIntegrity
// ============================================================================

// Substituir a implementação atual por:
const checkDataIntegrity = useCallback(() => {
  console.log("Verificando integridade dos dados...");
  
  let salesDataFixed = false;
  let itemsFixed = false;
  
  try {
    // Verificar dados de vendas
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
    const fixedItems = items.map(item => {
      let needsFix = false;
      const fixedItem = { ...item };
      
      // Verificar se a quantidade existe e é um número
      if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
        fixedItem.quantity = 0;
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
    
    return { salesDataFixed, itemsFixed };
  } catch (error) {
    console.error("Erro ao verificar integridade dos dados:", error);
    return { salesDataFixed: false, itemsFixed: false };
  }
}, [salesData, items, setSalesData, setItems]);

// ============================================================================
// CORREÇÃO 5: Otimizar o componente Dashboard
// ============================================================================

// No arquivo Dashboard.jsx, adicionar tratamento de erros:
const Dashboard = ({ showDashboard, setShowDashboard, items, salesData }) => {
  // Estado para controlar erros
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Usar try/catch para evitar que erros travem o componente
  try {
    // Resto do código do componente...
    
    return (
      <div className="dashboard-container">
        {/* Conteúdo do dashboard */}
      </div>
    );
  } catch (error) {
    // Se ocorrer um erro, mostrar mensagem amigável
    console.error("Erro no dashboard:", error);
    return (
      <div className="dashboard-error">
        <h2>Erro ao carregar o dashboard</h2>
        <p>Ocorreu um erro ao processar os dados. Por favor, tente novamente.</p>
        <button 
          onClick={() => setShowDashboard(false)} 
          className="btn-close"
        >
          Fechar
        </button>
      </div>
    );
  }
};

// ============================================================================
// CORREÇÃO 6: Adicionar paginação à tabela de vendas
// ============================================================================

// No componente que renderiza a tabela de vendas:
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 20;

// Calcular dados paginados
const paginatedData = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredSalesData.slice(startIndex, startIndex + itemsPerPage);
}, [filteredSalesData, currentPage, itemsPerPage]);

// Calcular total de páginas
const totalPages = Math.ceil(filteredSalesData.length / itemsPerPage);

// Funções de navegação
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};

const nextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(prev => prev + 1);
  }
};

const prevPage = () => {
  if (currentPage > 1) {
    setCurrentPage(prev => prev - 1);
  }
};

// Na renderização da tabela:
<table className="min-w-full bg-white border border-gray-200">
  <thead>
    {/* Cabeçalho da tabela */}
  </thead>
  <tbody>
    {paginatedData.map((sale, index) => (
      <tr key={sale.id || index}>
        {/* Células da tabela */}
      </tr>
    ))}
  </tbody>
</table>

{/* Controles de paginação */}
<div className="pagination-controls mt-4 flex items-center justify-between">
  <button 
    onClick={prevPage} 
    disabled={currentPage === 1}
    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    Anterior
  </button>
  
  <span>
    Página {currentPage} de {totalPages}
  </span>
  
  <button 
    onClick={nextPage} 
    disabled={currentPage === totalPages}
    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    Próxima
  </button>
</div>
