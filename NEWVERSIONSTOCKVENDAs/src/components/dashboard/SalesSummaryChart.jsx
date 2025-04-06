import React, { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/format';

// Registrar componentes necessários do Chart.js
Chart.register(ArcElement, Tooltip, Legend);

const SalesSummaryChart = ({ salesByMethod }) => {
  const chartRef = useRef(null);
  
  // Dados para o gráfico
  const data = {
    labels: ['Dinheiro', 'Cartão', 'Pix'],
    datasets: [
      {
        data: [
          salesByMethod.dinheiro,
          salesByMethod.cartao,
          salesByMethod.pix
        ],
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',  // Verde para dinheiro
          'rgba(33, 150, 243, 0.7)', // Azul para cartão
          'rgba(255, 193, 7, 0.7)'   // Amarelo para PIX
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(255, 193, 7, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Configurações do gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          font: {
            size: 12
          },
          color: document.documentElement.classList.contains('dark') 
            ? 'rgba(255, 255, 255, 0.7)'
            : 'rgba(0, 0, 0, 0.7)'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
  };
  
  // Atualizar cores do gráfico quando o tema mudar
  useEffect(() => {
    const updateChartColors = () => {
      if (chartRef.current) {
        const isDark = document.documentElement.classList.contains('dark');
        
        // Atualizar cores de legenda
        chartRef.current.options.plugins.legend.labels.color = 
          isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
          
        chartRef.current.update();
      }
    };
    
    // Observar mudanças na classe 'dark' do elemento HTML
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          updateChartColors();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Se não há dados de vendas, exibir mensagem alternativa
  const total = Object.values(salesByMethod).reduce((sum, value) => sum + value, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-light-text-secondary dark:text-dark-text-secondary">
        <p>Sem dados de vendas para o período selecionado</p>
      </div>
    );
  }

  return (
    <div className="h-60">
      <Pie data={data} options={options} ref={chartRef} />
    </div>
  );
};

export default SalesSummaryChart;