import React from 'react';
import { formatCurrency } from '../../utils/format';

const SalesSummary = ({ salesSummary }) => {
  const totalSales = salesSummary.totalCash + salesSummary.totalCard + salesSummary.totalPix;
  
  // Calcular porcentagens para o gráfico
  const cashPercentage = totalSales > 0 ? (salesSummary.totalCash / totalSales) * 100 : 0;
  const cardPercentage = totalSales > 0 ? (salesSummary.totalCard / totalSales) * 100 : 0;
  const pixPercentage = totalSales > 0 ? (salesSummary.totalPix / totalSales) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total de vendas */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-4 flex items-center">
        <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20 mr-4">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Total de Vendas</p>
          <p className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{formatCurrency(totalSales)}</p>
        </div>
      </div>
      
      {/* Métodos de pagamento */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow dark:shadow-dark-md p-4 col-span-1 md:col-span-2">
        <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary mb-3">Vendas por Método de Pagamento</h3>
        
        <div className="flex flex-col space-y-2">
          {/* Barra de progresso dos métodos */}
          <div className="h-4 w-full bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-green-500" 
              style={{ width: `${cashPercentage}%` }}
              title={`Dinheiro: ${formatCurrency(salesSummary.totalCash)}`}
            ></div>
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${cardPercentage}%` }}
              title={`Cartão: ${formatCurrency(salesSummary.totalCard)}`}
            ></div>
            <div 
              className="h-full bg-yellow-500" 
              style={{ width: `${pixPercentage}%` }}
              title={`Pix: ${formatCurrency(salesSummary.totalPix)}`}
            ></div>
          </div>
          
          {/* Legenda */}
          <div className="flex flex-wrap justify-between text-sm">
            <div className="flex items-center mr-4">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
              <span className="text-light-text-secondary dark:text-dark-text-secondary">Dinheiro: {formatCurrency(salesSummary.totalCash)}</span>
            </div>
            <div className="flex items-center mr-4">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
              <span className="text-light-text-secondary dark:text-dark-text-secondary">Cartão: {formatCurrency(salesSummary.totalCard)}</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
              <span className="text-light-text-secondary dark:text-dark-text-secondary">Pix: {formatCurrency(salesSummary.totalPix)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSummary;