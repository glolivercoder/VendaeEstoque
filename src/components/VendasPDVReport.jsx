import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDateToBrazilian, formatDateToISO, validateDateRange, fixDateFormat } from '../utils/dateUtils';

const VendasPDVReport = ({
  showReport,
  setShowReport,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery
}) => {
  const [salesData, setSalesData] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRangeError, setDateRangeError] = useState(null);
  const reportRef = useRef(null);

  // Validar intervalo de datas
  const validateDates = () => {
    const errorMessage = validateDateRange(startDate, endDate);
    setDateRangeError(errorMessage);
    return !errorMessage; // Retorna true se não houver erro
  };

  // Buscar dados de vendas do IndexedDB
  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Aqui seria implementada a lógica para buscar dados do IndexedDB
      // Por enquanto, vamos simular com dados de exemplo
      const mockSalesData = [
        {
          id: 1,
          date: '15/01/2024',
          client: 'Cliente 1',
          product: 'Produto A',
          quantity: 2,
          price: 50,
          total: 100,
          paymentMethod: 'dinheiro'
        },
        {
          id: 2,
          date: '20/02/2024',
          client: 'Cliente 2',
          product: 'Produto B',
          quantity: 1,
          price: 150,
          total: 150,
          paymentMethod: 'cartão'
        },
        {
          id: 3,
          date: '05/03/2024',
          client: 'Cliente 3',
          product: 'Produto C',
          quantity: 3,
          price: 75,
          total: 225,
          paymentMethod: 'pix'
        }
      ];

      // Simular um atraso de rede
      setTimeout(() => {
        setSalesData(mockSalesData);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Erro ao buscar dados de vendas:', err);
      setError('Erro ao carregar dados de vendas. Tente novamente.');
      setLoading(false);
    }
  };

  // Filtrar vendas por data e termo de busca
  const filterSales = () => {
    if (!salesData.length) return;

    try {
      let filtered = [...salesData];

      // Filtrar por intervalo de datas
      if (startDate && endDate && validateDates()) {
        const startDateObj = new Date(formatDateToISO(startDate));
        const endDateObj = new Date(formatDateToISO(endDate));
        endDateObj.setHours(23, 59, 59, 999); // Incluir todo o último dia

        filtered = filtered.filter(sale => {
          const [day, month, year] = sale.date.split('/');
          const saleDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return saleDate >= startDateObj && saleDate <= endDateObj;
        });
      }

      // Filtrar por termo de busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(sale =>
          sale.client.toLowerCase().includes(query) ||
          sale.product.toLowerCase().includes(query) ||
          sale.paymentMethod.toLowerCase().includes(query)
        );
      }

      setFilteredSales(filtered);
    } catch (err) {
      console.error('Erro ao filtrar vendas:', err);
      setError('Erro ao filtrar dados. Verifique o formato das datas.');
    }
  };

  // Exportar relatório para PDF
  const exportToPDF = async () => {
    if (!reportRef.current) return;

    try {
      setLoading(true);

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-vendas-${startDate}-${endDate}.pdf`);

      setLoading(false);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      setError('Erro ao gerar PDF. Tente novamente.');
      setLoading(false);
    }
  };

  // Carregar dados quando o componente for montado ou quando o relatório for exibido
  useEffect(() => {
    if (showReport) {
      fetchSalesData();
    }
  }, [showReport]);

  // Filtrar dados quando os filtros mudarem
  useEffect(() => {
    if (showReport && salesData.length) {
      filterSales();
    }
  }, [salesData, startDate, endDate, searchQuery]);

  if (!showReport) return null;

  return (
    <div className="vendas-pdv-report">
      <div className="report-header">
        <h2>Relatório de Vendas PDV</h2>
        <button className="close-btn" onClick={() => setShowReport(false)}>×</button>
      </div>

      <div className="report-filters">
        <div className="date-filters">
          <div className="filter-group">
            <label>Data Inicial:</label>
            <input
              type="text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="DD/MM/AAAA"
            />
          </div>

          <div className="filter-group">
            <label>Data Final:</label>
            <input
              type="text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="DD/MM/AAAA"
            />
          </div>
        </div>

        <div className="search-filter">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, produto ou método de pagamento"
          />
        </div>

        <button className="filter-btn" onClick={filterSales}>Filtrar</button>
        <button className="export-btn" onClick={exportToPDF} disabled={loading || !filteredSales.length}>
          {loading ? 'Gerando...' : 'Exportar PDF'}
        </button>
      </div>

      {dateRangeError && <div className="error-message">{dateRangeError}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="report-content" ref={reportRef}>
        {loading ? (
          <div className="loading">Carregando dados...</div>
        ) : filteredSales.length > 0 ? (
          <>
            <div className="report-summary">
              <div className="summary-item">
                <span className="summary-label">Total de Vendas:</span>
                <span className="summary-value">{filteredSales.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Valor Total:</span>
                <span className="summary-value">
                  R$ {filteredSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Ticket Médio:</span>
                <span className="summary-value">
                  R$ {(filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length).toFixed(2)}
                </span>
              </div>
            </div>

            <table className="sales-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Preço</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{fixDateFormat(sale.date)}</td>
                    <td>{sale.client}</td>
                    <td>{sale.product}</td>
                    <td>{sale.quantity}</td>
                    <td>R$ {sale.price.toFixed(2)}</td>
                    <td>R$ {sale.total.toFixed(2)}</td>
                    <td>{sale.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <div className="no-data">Nenhum dado encontrado para os filtros selecionados.</div>
        )}
      </div>
    </div>
  );
};

export default VendasPDVReport;
