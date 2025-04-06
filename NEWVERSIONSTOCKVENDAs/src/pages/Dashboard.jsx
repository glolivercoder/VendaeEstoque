import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import SalesSummaryChart from '../components/dashboard/SalesSummaryChart';
import ProductStockChart from '../components/dashboard/ProductStockChart';
import RecentSalesList from '../components/dashboard/RecentSalesList';
import LowStockAlert from '../components/dashboard/LowStockAlert';
import DateRangePicker from '../components/common/DateRangePicker';

const Dashboard = () => {
  const { 
    items, 
    salesData, 
    minStockAlert,
  } = useAppContext();
  
  const [periodFilter, setPeriodFilter] = useState('today'); // 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [filteredSales, setFilteredSales] = useState([]);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageTicket: 0,
    salesByMethod: {
      dinheiro: 0,
      cartao: 0,
      pix: 0
    }
  });
  
  // Produtos com estoque baixo
  const lowStockProducts = items.filter(item => {
    const minStock = minStockAlert[item.id] || 5; // Valor padrão: 5
    return item.quantity <= minStock;
  });
  
  // Configurar datas com base no filtro de período
  useEffect(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (periodFilter) {
      case 'today':
        // Início do dia atual
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        // Início da semana (domingo)
        start.setDate(today.getDate() - today.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // Início do mês
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        // Usar as datas selecionadas
        break;
      default:
        break;
    }
    
    setStartDate(start);
    setEndDate(end);
  }, [periodFilter]);
  
  // Filtrar vendas com base no período
  useEffect(() => {
    const start = startDate.setHours(0, 0, 0, 0);
    const end = endDate.setHours(23, 59, 59, 999);
    
    // Filtrar vendas dentro do período
    const filtered = salesData.filter(sale => {
      // Converter data no formato DD/MM/YYYY para objeto Date
      const [day, month, year] = sale.date.split('/').map(part => parseInt(part, 10));
      const saleDate = new Date(year, month - 1, day);
      
      return saleDate >= start && saleDate <= end;
    });
    
    setFilteredSales(filtered);
    
    // Calcular estatísticas
    const total = filtered.length;
    const revenue = filtered.reduce((sum, sale) => sum + sale.total, 0);
    const average = total > 0 ? revenue / total : 0;
    
    // Calcular vendas por método de pagamento
    const byMethod = filtered.reduce((acc, sale) => {
      const method = sale.paymentMethod.toLowerCase();
      if (method.includes('dinheiro')) {
        acc.dinheiro += sale.total;
      } else if (method.includes('cartao') || method.includes('cartão')) {
        acc.cartao += sale.total;
      } else if (method.includes('pix')) {
        acc.pix += sale.total;
      }
      return acc;
    }, { dinheiro: 0, cartao: 0, pix: 0 });
    
    setSalesStats({
      totalSales: total,
      totalRevenue: revenue,
      averageTicket: average,
      salesByMethod: byMethod
    });
  }, [salesData, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Dashboard
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Acompanhe o desempenho do seu negócio
          </p>
        </div>
        
        {/* Seletor de período */}
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                periodFilter === 'today'
                  ? 'bg-primary text-white'
                  : 'bg-light-background dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary'
              }`}
              onClick={() => setPeriodFilter('today')}
            >
              Hoje
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                periodFilter === 'week'
                  ? 'bg-primary text-white'
                  : 'bg-light-background dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary'
              }`}
              onClick={() => setPeriodFilter('week')}
            >
              Semana
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                periodFilter === 'month'
                  ? 'bg-primary text-white'
                  : 'bg-light-background dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary'
              }`}
              onClick={() => setPeriodFilter('month')}
            >
              Mês
            </button>
          </div>
          
          {/* Seletor de datas personalizado */}
          <div>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                periodFilter === 'custom'
                  ? 'bg-primary text-white'
                  : 'bg-light-background dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary'
              }`}
              onClick={() => setPeriodFilter('custom')}
            >
              Personalizado
            </button>
            {periodFilter === 'custom' && (
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de vendas */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20 mr-4">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Vendas</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{salesStats.totalSales}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Comparado ao período anterior
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                +12.5%
              </span>
              <svg className="h-3 w-3 ml-1 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Receita total */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
              <svg className="h-6 w-6 text-green-700 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Receita</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(salesStats.totalRevenue)}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Comparado ao período anterior
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                +8.2%
              </span>
              <svg className="h-3 w-3 ml-1 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Ticket médio */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
              <svg className="h-6 w-6 text-blue-700 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Ticket Médio</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(salesStats.averageTicket)}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Comparado ao período anterior
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                -2.1%
              </span>
              <svg className="h-3 w-3 ml-1 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Produtos em estoque */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-4">
              <svg className="h-6 w-6 text-yellow-700 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Produtos</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{items.length}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Produtos com estoque baixo
            </div>
            <div className="flex items-center mt-1">
              <span className={`text-xs font-medium ${
                lowStockProducts.length > 5 ? 'text-red-600 dark:text-red-400' : 'text-light-text-secondary dark:text-dark-text-secondary'
              }`}>
                {lowStockProducts.length} produtos
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráficos e listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de vendas por método de pagamento */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-5 lg:col-span-1">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
            Vendas por Método
          </h3>
          <SalesSummaryChart salesByMethod={salesStats.salesByMethod} />
        </div>
        
        {/* Produtos mais vendidos */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
            Produtos mais vendidos
          </h3>
          <ProductStockChart items={items} />
        </div>
      </div>
      
      {/* Últimas vendas e alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas vendas */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              Últimas Vendas
            </h3>
            <button className="text-primary hover:text-primary-dark dark:hover:text-primary-light text-sm font-medium">
              Ver todas
            </button>
          </div>
          <RecentSalesList sales={filteredSales.slice(0, 5)} />
        </div>
        
        {/* Alertas de estoque baixo */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-5 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              Alertas de Estoque
            </h3>
            <button className="text-primary hover:text-primary-dark dark:hover:text-primary-light text-sm font-medium">
              Ver todos
            </button>
          </div>
          <LowStockAlert products={lowStockProducts.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;