import { useState, useRef, useMemo, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatDateToISO, formatDateToBrazilian } from '../utils/dateUtils';
import { getSalesByDateRange, searchSales } from '../services/databaseService';
import { migrateDatabase } from '../utils/migrateDatabase';

const SalesReport = ({
  salesData,
  showSalesReport,
  setShowSalesReport,
  reportType,
  setReportType,
  reportStartDate,
  setReportStartDate,
  reportEndDate,
  setReportEndDate,
  reportSearchQuery,
  setReportSearchQuery
}) => {
  const reportRef = useRef(null);
  // Dashboard inicialmente oculto
  const [showDashboard, setShowDashboard] = useState(false);

  // Função para migrar dados do IndexedDB para o banco de dados ORM
  const handleMigrateData = async () => {
    if (isMigrating) return;

    try {
      setIsMigrating(true);
      const result = await migrateDatabase();

      if (result) {
        setMigrationComplete(true);
        alert('Migração de dados concluída com sucesso! Os dados foram transferidos para o banco de dados ORM.');
        // Recarregar os dados
        const startDateISO = formatDateToISO(reportStartDate);
        const endDateISO = formatDateToISO(reportEndDate);
        const sales = await getSalesByDateRange(startDateISO, endDateISO);
        setDbSales(sales);
      } else {
        alert('Falha na migração de dados. Verifique o console para mais detalhes.');
      }
    } catch (error) {
      console.error('Erro durante a migração:', error);
      alert('Erro durante a migração. Verifique o console para mais detalhes.');
    } finally {
      setIsMigrating(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save('relatorio-vendas.pdf');
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      alert('Erro ao exportar para PDF. Por favor, tente novamente.');
    }
  };



  // Agrupar vendas por cliente ou ID de venda
  const groupSalesByClientOrId = (sales) => {
    const groupedSales = {};

    sales.forEach(sale => {
      const clientKey = sale.client && typeof sale.client === 'object' ? sale.client.name :
                      sale.client && typeof sale.client === 'string' ? sale.client :
                      `Venda #${sale.id}`;

      if (!groupedSales[clientKey]) {
        groupedSales[clientKey] = [];
      }

      groupedSales[clientKey].push(sale);
    });

    return groupedSales;
  };

  // Estado para armazenar as vendas filtradas do banco de dados
  const [dbSales, setDbSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Verificar se a migração já foi concluída anteriormente
  useEffect(() => {
    // Verificar se há dados no banco ORM
    const checkMigrationStatus = async () => {
      try {
        const startDateISO = formatDateToISO(reportStartDate);
        const endDateISO = formatDateToISO(reportEndDate);
        const sales = await getSalesByDateRange(startDateISO, endDateISO);

        // Se há dados no banco, considerar que a migração já foi feita
        if (sales && sales.length > 0) {
          setMigrationComplete(true);
        }
      } catch (error) {
        console.error('Erro ao verificar status da migração:', error);
      }
    };

    checkMigrationStatus();
  }, [reportStartDate, reportEndDate]);

  // Carregar vendas do banco de dados quando os filtros mudarem
  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        const startDateISO = formatDateToISO(reportStartDate);
        const endDateISO = formatDateToISO(reportEndDate);

        // Se houver uma busca, usar searchSales, caso contrário usar getSalesByDateRange
        let sales;
        if (reportSearchQuery && reportSearchQuery.trim() !== '') {
          sales = await searchSales(reportSearchQuery);
          // Filtrar por data após a busca
          sales = sales.filter(sale => {
            const saleDate = sale.date ? new Date(sale.date).toISOString().split('T')[0] : null;
            return saleDate && saleDate >= startDateISO && saleDate <= endDateISO;
          });
        } else {
          sales = await getSalesByDateRange(startDateISO, endDateISO);
        }

        setDbSales(sales);
      } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        setDbSales([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, [reportStartDate, reportEndDate, reportSearchQuery]);

  // Combinar vendas do banco de dados com as do localStorage (salesData)
  const filteredSales = useMemo(() => {
    // Se estiver usando o banco de dados ORM, priorizar os dados do banco
    if (dbSales.length > 0) {
      return dbSales;
    }

    // Caso contrário, usar os dados do localStorage (compatibilidade)
    if (!salesData) return [];
    const startDateISO = formatDateToISO(reportStartDate);
    const endDateISO = formatDateToISO(reportEndDate);

    return salesData.filter(sale => {
      const saleDate = sale.date ? sale.date.split('T')[0] : null;
      if (!saleDate) return false;

      const matchesDate = saleDate >= startDateISO && saleDate <= endDateISO;
      const matchesSearch = !reportSearchQuery ||
        (sale.client && typeof sale.client === 'object' && sale.client.name &&
          sale.client.name.toLowerCase().includes(reportSearchQuery.toLowerCase())) ||
        (sale.client && typeof sale.client === 'string' &&
          sale.client.toLowerCase().includes(reportSearchQuery.toLowerCase())) ||
        (sale.items && Array.isArray(sale.items) &&
          sale.items.some(item => item.description && item.description.toLowerCase().includes(reportSearchQuery.toLowerCase()))) ||
        (sale.product && typeof sale.product === 'string' &&
          sale.product.toLowerCase().includes(reportSearchQuery.toLowerCase()));

      return matchesDate && matchesSearch;
    });
  }, [salesData, dbSales, reportStartDate, reportEndDate, reportSearchQuery]);
  // Agrupar vendas apenas quando o dashboard estiver visível para economizar recursos
  const groupedSales = useMemo(() => {
    // Se o dashboard não estiver visível e não houver busca, limitar o agrupamento a 20 itens para melhorar desempenho
    if (!showDashboard && !reportSearchQuery && filteredSales.length > 20) {
      return groupSalesByClientOrId(filteredSales.slice(0, 20));
    }
    return groupSalesByClientOrId(filteredSales);
  }, [filteredSales, showDashboard, reportSearchQuery]);

  // Memoize payment method totals to avoid recalculation
  const totals = useMemo(() => {
    const totals = {
      dinheiro: 0,
      'cartão': 0,
      pix: 0
    };

    filteredSales.forEach(sale => {
      if (sale.paymentMethod && totals[sale.paymentMethod] !== undefined) {
        totals[sale.paymentMethod] += sale.total;
      }
    });

    return totals;
  }, [filteredSales]);

  // Memoize chart data to avoid recalculation
  const pieChartData = useMemo(() => ({
    labels: ['Dinheiro', 'Cartão', 'PIX'],
    datasets: [
      {
        data: [totals.dinheiro, totals['cartão'], totals.pix],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
        hoverBackgroundColor: ['#388E3C', '#1976D2', '#FFA000']
      }
    ]
  }), [totals]);

  // Memoize bar chart data - limitar a 10 barras para melhor desempenho
  const barChartData = useMemo(() => {
    // Group sales by date to reduce number of bars
    const salesByDate = {};
    filteredSales.forEach(sale => {
      const dateKey = sale.formattedDate || formatDateToBrazilian(sale.date.split('T')[0]);
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = 0;
      }
      salesByDate[dateKey] += sale.total;
    });

    // Limitar a 10 entradas para melhor desempenho
    const sortedDates = Object.keys(salesByDate).sort();
    const limitedDates = sortedDates.slice(Math.max(0, sortedDates.length - 10));

    const limitedSalesByDate = {};
    limitedDates.forEach(date => {
      limitedSalesByDate[date] = salesByDate[date];
    });

    return {
      labels: Object.keys(limitedSalesByDate),
      datasets: [
        {
          label: 'Valor da Venda',
          data: Object.values(limitedSalesByDate),
          backgroundColor: '#3f51b5'
        }
      ]
    };
  }, [filteredSales]);

  const barChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valor (R$)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Data'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Vendas por Data'
      }
    }
  };

  if (!showSalesReport) return null;

  return (
    <div className="sales-report-container">
      <div className="report-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>Relatório de Vendas</h2>
        </div>
        <div className="report-actions">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
            Dashboard
          </button>
          <button
            onClick={handleMigrateData}
            disabled={isMigrating}
            style={{
              marginRight: '10px',
              padding: '5px 10px',
              backgroundColor: migrationComplete ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isMigrating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              opacity: isMigrating ? 0.7 : 1
            }}
          >
            {isMigrating ? (
              <div className="spinner-small"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
            )}
            {isMigrating ? 'Migrando...' : migrationComplete ? 'Migração Concluída ✔' : 'Migrar para ORM'}
          </button>
          <button className="btn-close" onClick={() => setShowSalesReport(false)}>
            Fechar
          </button>
          <button className="btn-export" onClick={exportToPDF}>
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="report-filters">
        <div className="filter-group">
          <label>Tipo de Relatório:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="day">Diário</option>
            <option value="week">Semanal</option>
            <option value="month">Mensal</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        <div className="date-filters">
          <div className="filter-group">
            <label>Data Inicial:</label>
            <input
              type="text"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              placeholder="DD/MM/AAAA"
            />
          </div>
          <div className="filter-group">
            <label>Data Final:</label>
            <input
              type="text"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              placeholder="DD/MM/AAAA"
            />
          </div>
        </div>

        <div className="filter-group search-filter">
          <label>Buscar:</label>
          <input
            type="text"
            value={reportSearchQuery}
            onChange={(e) => setReportSearchQuery(e.target.value)}
            placeholder="Cliente ou produto..."
          />
        </div>
      </div>

      <div className="report-content" ref={reportRef}>
        <div className="report-summary">
          <div className="summary-item">
            <h3>Total de Vendas</h3>
            <p>{filteredSales.length}</p>
          </div>
          <div className="summary-item">
            <h3>Valor Total</h3>
            <p>R$ {filteredSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}</p>
          </div>
          <div className="summary-item">
            <h3>Média por Venda</h3>
            <p>
              R$ {
                filteredSales.length > 0
                  ? (filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length).toFixed(2)
                  : '0.00'
              }
            </p>
          </div>
        </div>

        {showDashboard && (
          <div className="report-charts">
            <div className="chart-container">
              <h3>Vendas por Método de Pagamento</h3>
              <div className="pie-chart">
                <Pie data={pieChartData} />
              </div>
              <div className="payment-totals">
                <p><span className="color-box" style={{ backgroundColor: '#4CAF50' }}></span> Dinheiro: R$ {totals.dinheiro.toFixed(2)}</p>
                <p><span className="color-box" style={{ backgroundColor: '#2196F3' }}></span> Cartão: R$ {totals['cartão'].toFixed(2)}</p>
                <p><span className="color-box" style={{ backgroundColor: '#FFC107' }}></span> PIX: R$ {totals.pix.toFixed(2)}</p>
              </div>
            </div>

            <div className="chart-container">
              <h3>Vendas por Data</h3>
              <div className="bar-chart">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        )}

        <div className="sales-table">
          <h3>Detalhes das Vendas</h3>
          {isLoading ? (
            <div className="loading-indicator">
              <p>Carregando dados...</p>
              <div className="spinner"></div>
            </div>
          ) : filteredSales.length === 0 ? (
            <p className="no-sales">Nenhuma venda encontrada no período selecionado.</p>
          ) : (
            <div className="grouped-sales">
              {Object.entries(groupedSales).map(([clientName, sales]) => (
                <div key={clientName} className="client-sales-group">
                  <h4 className="client-name">{clientName}</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Itens</th>
                        <th>Método</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id}>
                          <td>{sale.formattedDate || (sale.date ? formatDateToBrazilian(sale.date.split('T')[0]) : 'Data desconhecida')}</td>
                          <td>{sale.time || 'N/A'}</td>
                          <td>
                            {sale.items && Array.isArray(sale.items) ? (
                              sale.items.map((item, index) => (
                                <div key={index} className="sale-item">
                                  {item.description} (x{item.quantity})
                                </div>
                              ))
                            ) : sale.product ? (
                              <div className="sale-item">
                                {sale.product} (x{sale.quantity || 1})
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td>
                            {sale.paymentMethod === 'dinheiro' && 'Dinheiro'}
                            {sale.paymentMethod === 'cartão' && 'Cartão'}
                            {sale.paymentMethod === 'pix' && 'PIX'}
                          </td>
                          <td>R$ {sale.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="client-total-row">
                        <td colSpan="4" className="client-total-label">Total do Cliente:</td>
                        <td className="client-total-value">R$ {sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
