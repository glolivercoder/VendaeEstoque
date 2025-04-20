import { useState, useRef, useMemo } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatDateToISO, formatDateToBrazilian } from '../utils/dateUtils';

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

  // Função para filtrar vendas por data e termo de busca
  const filterSalesByDate = () => {
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

  const filteredSales = useMemo(() => filterSalesByDate(), [salesData, reportStartDate, reportEndDate, reportSearchQuery]);
  const groupedSales = useMemo(() => groupSalesByClientOrId(filteredSales), [filteredSales]);

  const calculateTotalsByPaymentMethod = () => {
    const totals = {
      dinheiro: 0,
      'cartu00e3o': 0,
      pix: 0
    };

    filteredSales.forEach(sale => {
      if (sale.paymentMethod && totals[sale.paymentMethod] !== undefined) {
        totals[sale.paymentMethod] += sale.total;
      }
    });

    return totals;
  };

  const totals = calculateTotalsByPaymentMethod();

  const pieChartData = {
    labels: ['Dinheiro', 'Cartu00e3o', 'PIX'],
    datasets: [
      {
        data: [totals.dinheiro, totals['cartu00e3o'], totals.pix],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
        hoverBackgroundColor: ['#388E3C', '#1976D2', '#FFA000']
      }
    ]
  };

  const barChartData = {
    labels: filteredSales.map(sale => sale.formattedDate || formatDateToBrazilian(sale.date.split('T')[0])),
    datasets: [
      {
        label: 'Valor da Venda',
        data: filteredSales.map(sale => sale.total),
        backgroundColor: '#3f51b5'
      }
    ]
  };

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
        <h2>Relatu00f3rio de Vendas</h2>
        <div className="report-actions">
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
          <label>Tipo de Relatu00f3rio:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="day">Diu00e1rio</option>
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
            <h3>Mu00e9dia por Venda</h3>
            <p>
              R$ {
                filteredSales.length > 0
                  ? (filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length).toFixed(2)
                  : '0.00'
              }
            </p>
          </div>
        </div>

        <div className="report-charts">
          <div className="chart-container">
            <h3>Vendas por Mu00e9todo de Pagamento</h3>
            <div className="pie-chart">
              <Pie data={pieChartData} />
            </div>
            <div className="payment-totals">
              <p><span className="color-box" style={{ backgroundColor: '#4CAF50' }}></span> Dinheiro: R$ {totals.dinheiro.toFixed(2)}</p>
              <p><span className="color-box" style={{ backgroundColor: '#2196F3' }}></span> Cartu00e3o: R$ {totals['cartu00e3o'].toFixed(2)}</p>
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

        <div className="sales-table">
          <h3>Detalhes das Vendas</h3>
          {filteredSales.length === 0 ? (
            <p className="no-sales">Nenhuma venda encontrada no peru00edodo selecionado.</p>
          ) : (
            <div className="grouped-sales">
              {Object.entries(groupedSales).map(([clientName, sales]) => (
                <div key={clientName} className="client-sales-group">
                  <h4 className="client-name">{clientName}</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Horu00e1rio</th>
                        <th>Itens</th>
                        <th>Mu00e9todo</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id}>
                          <td>{sale.formattedDate || formatDateToBrazilian(sale.date.split('T')[0])}</td>
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
                            {sale.paymentMethod === 'cartu00e3o' && 'Cartu00e3o'}
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
