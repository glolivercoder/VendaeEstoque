import React from 'react';
import SalesReport from './SalesReport';
import Dashboard from './Dashboard';

const SalesReportPopup = ({
  showSalesReport,
  setShowSalesReport,
  showDashboard,
  setShowDashboard,
  toggleDashboard,
  isReportLoading,
  reportRef,
  reportType,
  setReportType,
  reportStartDate,
  setReportStartDate,
  reportEndDate,
  setReportEndDate,
  reportSearchQuery,
  setReportSearchQuery,
  filteredSalesData,
  salesSummary,
  formatDateToISO,
  formatDateToBrazilian,
  items,
  salesData,
  getPieChartData,
  getBarChartData
}) => {
  if (!showSalesReport) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-6xl w-full h-[90vh] overflow-y-auto relative">
        {isReportLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Carregando dados...</p>
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {showDashboard ? 'Dashboard' : 'Relatório de Vendas'}
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDashboard}
              className={`px-4 py-2 rounded-lg ${
                showDashboard ? 'bg-blue-600' : 'bg-blue-500'
              } text-white hover:bg-blue-600 transition-colors`}
            >
              {showDashboard ? 'Voltar ao Relatório' : 'Ver Dashboard'}
            </button>
            <button
              onClick={() => setShowSalesReport(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {showDashboard ? (
          <Dashboard
            showDashboard={showDashboard}
            setShowDashboard={setShowDashboard}
            items={items}
            salesData={filteredSalesData}
          />
        ) : (
          <SalesReport
            showSalesReport={showSalesReport}
            setShowSalesReport={setShowSalesReport}
            reportType={reportType}
            setReportType={setReportType}
            reportStartDate={reportStartDate}
            setReportStartDate={setReportStartDate}
            reportEndDate={reportEndDate}
            setReportEndDate={setReportEndDate}
            reportSearchQuery={reportSearchQuery}
            setReportSearchQuery={setReportSearchQuery}
            salesData={filteredSalesData}
            isReportLoading={isReportLoading}
          />
        )}
      </div>
    </div>
  );
};

export default SalesReportPopup;
