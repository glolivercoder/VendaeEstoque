import { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { formatDateToBrazilian } from '../utils/dateUtils';

const Dashboard = ({ 
  showDashboard, 
  setShowDashboard, 
  items,
  salesData
}) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState({});
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    if (showDashboard) {
      // Find items with low stock (less than 5)
      const lowStock = items.filter(item => item.quantity < 5);
      setLowStockItems(lowStock);

      // Find top selling items
      const itemSales = {};
      salesData.forEach(sale => {
        sale.items.forEach(item => {
          if (!itemSales[item.id]) {
            itemSales[item.id] = {
              id: item.id,
              description: item.description,
              totalSold: 0,
              totalRevenue: 0
            };
          }
          itemSales[item.id].totalSold += item.quantity;
          itemSales[item.id].totalRevenue += item.total;
        });
      });

      const topItems = Object.values(itemSales)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);
      setTopSellingItems(topItems);

      // Calculate sales by category
      const categorySales = {};
      salesData.forEach(sale => {
        sale.items.forEach(saleItem => {
          const item = items.find(i => i.id === saleItem.id);
          if (item && item.category) {
            const category = item.category === 'Todos' ? 'Sem Categoria' : item.category;
            if (!categorySales[category]) {
              categorySales[category] = 0;
            }
            categorySales[category] += saleItem.total;
          }
        });
      });
      setSalesByCategory(categorySales);

      // Get recent sales (last 5)
      const recent = [...salesData]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentSales(recent);
    }
  }, [showDashboard, items, salesData]);

  const pieChartData = {
    labels: Object.keys(salesByCategory),
    datasets: [
      {
        data: Object.values(salesByCategory),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FFC107',
          '#E91E63',
          '#9C27B0',
          '#FF5722',
          '#607D8B'
        ],
        hoverBackgroundColor: [
          '#388E3C',
          '#1976D2',
          '#FFA000',
          '#C2185B',
          '#7B1FA2',
          '#E64A19',
          '#455A64'
        ]
      }
    ]
  };

  const barChartData = {
    labels: topSellingItems.map(item => item.description),
    datasets: [
      {
        label: 'Quantidade Vendida',
        data: topSellingItems.map(item => item.totalSold),
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
          text: 'Quantidade'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Produto'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Produtos Mais Vendidos'
      }
    }
  };

  if (!showDashboard) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="btn-close" onClick={() => setShowDashboard(false)}>
          Fechar
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-summary">
          <div className="summary-card">
            <h3>Total de Produtos</h3>
            <p>{items.length}</p>
          </div>
          <div className="summary-card">
            <h3>Total de Vendas</h3>
            <p>{salesData.length}</p>
          </div>
          <div className="summary-card">
            <h3>Receita Total</h3>
            <p>R$ {salesData.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}</p>
          </div>
          <div className="summary-card">
            <h3>Produtos com Baixo Estoque</h3>
            <p>{lowStockItems.length}</p>
          </div>
        </div>

        <div className="dashboard-charts">
          <div className="chart-container">
            <h3>Vendas por Categoria</h3>
            <div className="pie-chart">
              {Object.keys(salesByCategory).length > 0 ? (
                <Pie data={pieChartData} />
              ) : (
                <p className="no-data">Sem dados de vendas por categoria</p>
              )}
            </div>
          </div>

          <div className="chart-container">
            <h3>Produtos Mais Vendidos</h3>
            <div className="bar-chart">
              {topSellingItems.length > 0 ? (
                <Bar data={barChartData} options={barChartOptions} />
              ) : (
                <p className="no-data">Sem dados de produtos vendidos</p>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-tables">
          <div className="table-container">
            <h3>Produtos com Baixo Estoque</h3>
            {lowStockItems.length === 0 ? (
              <p className="no-data">Nenhum produto com baixo estoque</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Estoque</th>
                    <th>Preu00e7o</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className={item.quantity <= 0 ? 'out-of-stock' : ''}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>R$ {parseFloat(item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="table-container">
            <h3>Vendas Recentes</h3>
            {recentSales.length === 0 ? (
              <p className="no-data">Nenhuma venda registrada</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Itens</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.formattedDate || formatDateToBrazilian(sale.date.split('T')[0])}</td>
                      <td>{sale.client ? sale.client.name : 'N/A'}</td>
                      <td>{sale.items.length}</td>
                      <td>R$ {sale.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
